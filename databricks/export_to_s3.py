# Databricks notebook source
# Export gold tables to S3 - clean single JSON files
from datetime import datetime
import json

S3_EXPORT_PATH = os.getenv("EXPORT_BUCKET", "s3://your-bucket/exports/")


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