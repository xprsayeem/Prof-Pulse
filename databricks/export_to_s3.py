# Databricks notebook source
# Export gold tables to S3 - clean single JSON files
from datetime import datetime
import json

S3_EXPORT_PATH = "s3://prof-pulse/exports"


GOLD_TABLES = [
    "course_metrics_gold",
    "course_professor_comparison_gold", 
    "department_overview_gold",
    "course_trends_gold",
    "bird_courses_gold"
]

export_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
print(f"Exporting to {S3_EXPORT_PATH}")
print("=" * 50)

table_stats = {}

for table in GOLD_TABLES:
    df = spark.table(f"prof_pulse.default.{table}")
    row_count = df.count()
    table_stats[table] = row_count
    
    # Write to temp folder
    temp_path = f"{S3_EXPORT_PATH}/_temp/{table}"
    df.coalesce(1).write.mode("overwrite").json(temp_path)
    
    # Find the part file and copy to clean name
    files = dbutils.fs.ls(temp_path)
    part_file = [f.path for f in files if f.name.startswith("part-") and f.name.endswith(".json")][0]
    
    # Copy to clean path
    clean_path = f"{S3_EXPORT_PATH}/{table}.json"
    dbutils.fs.cp(part_file, clean_path)
    
    print(f"[OK] {table}: {row_count:,} rows")

# Cleanup temp folder
dbutils.fs.rm(f"{S3_EXPORT_PATH}/_temp", recurse=True)

# Write metadata file with row counts
metadata = {
    "exported_at": export_time,
    "tables": GOLD_TABLES,
    "row_counts": table_stats,
    "total_rows": sum(table_stats.values())
}
dbutils.fs.put(
    f"{S3_EXPORT_PATH}/metadata.json",
    json.dumps(metadata, indent=2),
    overwrite=True
)

# Verify exports
print("=" * 50)
print("Verifying exports...")
exported_files = dbutils.fs.ls(S3_EXPORT_PATH)
json_files = [f.name for f in exported_files if f.name.endswith('.json')]
print(f"Files in S3: {json_files}")

print("=" * 50)
print(f"[OK] Export complete: {export_time}")
print(f"Total rows exported: {sum(table_stats.values()):,}")

# COMMAND ----------

from pyspark.sql import functions as F

# Export reviews (filtered to those with meaningful comments)
print("Exporting reviews...")

reviews = spark.table("prof_pulse.default.reviews_silver").select(
    "review_id",
    "professor_id",
    "professor_name", 
    "course_code",
    "comment",
    "clarity_rating",
    "helpful_rating",
    "difficulty_rating",
    "would_take_again",
    "grade",
    "date",
    "year"
).filter(
    F.col("comment").isNotNull()
)

row_count = reviews.count()

# Write to temp
temp_path = f"{S3_EXPORT_PATH}/_temp/reviews"
reviews.coalesce(1).write.mode("overwrite").json(temp_path)

# Copy to clean path
files = dbutils.fs.ls(temp_path)
part_file = [f.path for f in files if f.name.startswith("part-") and f.name.endswith(".json")][0]
dbutils.fs.cp(part_file, f"{S3_EXPORT_PATH}/reviews.json")

print(f"✓ reviews: {row_count:,} rows → reviews.json")

# COMMAND ----------

# Run 4a: sharded export (Option A) — one small file per entity ALONGSIDE the
# monolithic exports above (additive; the frontend switches over in Run 4b).
#
# Layout written under S3_EXPORT_PATH:
#   reviews/{professor_id}.json           professors/{professor_id}.json
#   professors_by_course/{course_code}.json
#   courses/{course_code}.json            trends/{course_code}.json
#   courses_index.json  professors_index.json  stats.json
#   departments.json    bird_courses.json
#
# S3 access: a dedicated IAM user's long-lived key, stored in the "prof-pulse"
# Databricks secret scope. (Databricks blocks the cluster metadata service, so
# boto3 can't auto-discover credentials.) Rotate the key periodically.

import re
import boto3
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor

_p = urlparse(S3_EXPORT_PATH if "://" in S3_EXPORT_PATH else "s3://" + S3_EXPORT_PATH)
BUCKET = _p.netloc
PREFIX = _p.path.strip("/")
CATALOG = "prof_pulse.default"
SAFE_KEY = re.compile(r"^[A-Za-z0-9=_-]+$")  # safe as an S3 key AND a URL path segment

s3 = boto3.Session(
    aws_access_key_id=dbutils.secrets.get("prof-pulse", "aws_access_key_id"),
    aws_secret_access_key=dbutils.secrets.get("prof-pulse", "aws_secret_access_key"),
    region_name="us-east-1",
).client("s3")  # low-level client is thread-safe; shared across the pool below
print(f"Sharded export -> s3://{BUCKET}/{PREFIX}/")


def _json_col(cols):
    # Serialize each row exactly like df.write.json() (nulls omitted).
    return F.to_json(F.struct(*[F.col(c) for c in cols]), {"ignoreNullFields": "true"})


def _put(key, body):
    s3.put_object(Bucket=BUCKET, Key=f"{PREFIX}/{key}", Body=(body + "\n").encode("utf-8"))


def export_shards(df, key_col, subfolder):
    cols = df.columns
    df = df.filter(F.col(key_col).isNotNull() & (F.col(key_col).cast("string") != ""))
    grouped = (
        df.withColumn("_json", _json_col(cols))
          .groupBy(F.col(key_col).cast("string").alias("_k"))
          .agg(F.concat_ws("\n", F.collect_list("_json")).alias("_body"))
    )
    rows = grouped.collect()

    bad = [r["_k"] for r in rows if not r["_k"] or not SAFE_KEY.match(r["_k"])]
    if bad:
        raise ValueError(f"{subfolder}: {len(bad)} unsafe keys, e.g. {bad[:5]}")

    def put_row(r):
        s3.put_object(
            Bucket=BUCKET,
            Key=f"{PREFIX}/{subfolder}/{r['_k']}.json",
            Body=(r["_body"] + "\n").encode("utf-8"),
        )

    with ThreadPoolExecutor(max_workers=32) as ex:
        list(ex.map(put_row, rows))
    print(f"  [OK] {subfolder}/: {len(rows):,} files")


def export_single(df, filename):
    cols = df.columns
    lines = [r["_json"] for r in df.withColumn("_json", _json_col(cols)).select("_json").collect()]
    _put(filename, "\n".join(lines))
    print(f"  [OK] {filename}: {len(lines):,} rows")


cpc = spark.table(f"{CATALOG}.course_professor_comparison_gold")
cm = spark.table(f"{CATALOG}.course_metrics_gold")
ct = spark.table(f"{CATALOG}.course_trends_gold")
dept = spark.table(f"{CATALOG}.department_overview_gold")
birds = spark.table(f"{CATALOG}.bird_courses_gold")

print("Sharding...")
export_shards(reviews, "professor_id", "reviews")  # `reviews` DataFrame from the cell above
export_shards(cpc, "professor_id", "professors")
export_shards(cpc, "course_code", "professors_by_course")
export_shards(cm, "course_code", "courses")
export_shards(ct, "course_code", "trends")

print("Indexes...")
export_single(cm.select("course_code", "total_reviews", "avg_quality", "avg_difficulty"),
              "courses_index.json")
export_single(cpc.select("professor_id", "professor_name", "department").dropDuplicates(["professor_id"]),
              "professors_index.json")
export_single(dept, "departments.json")
export_single(birds, "bird_courses.json")

stats = {
    "total_reviews": int(cm.agg(F.sum("total_reviews")).first()[0] or 0),
    "total_professors": int(cpc.select("professor_id").distinct().count()),
    "total_courses": int(cm.count()),
    "total_departments": int(dept.count()),
}
_put("stats.json", json.dumps(stats))
print(f"  [OK] stats.json: {stats}")

print("\nVerifying a few keys on S3...")
for _key in ["reviews/VGVhY2hlci0yNzc1OA==.json", "courses/ECN204.json",
             "professors_by_course/ECN204.json", "trends/ECN204.json"]:
    _h = s3.head_object(Bucket=BUCKET, Key=f"{PREFIX}/{_key}")
    print(f"  {_key}: {_h['ContentLength']:,} bytes")
print("Sharded export complete.")