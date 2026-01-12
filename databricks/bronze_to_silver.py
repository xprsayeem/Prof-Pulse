# Databricks notebook source
# DBTITLE 1,Professors
# This cell processes raw professor data from the ratemyprofessor.com JSON file:
# 1. Loads and explodes professor records, extracting relevant fields.
# 2. Deduplicates professors, prioritizing most complete entries.
# 3. Cleans and validates professor data, including rating and review count checks.
# 4. Previews and saves the cleaned professors as a Delta table for analytics.
# 5. Summarizes data quality, including missing fields and invalid values.

from pyspark.sql import functions as F # uses F as an alias so we can use F.explode instead of pyspark.sql.functions.explode
from pyspark.sql.window import Window

# Read the raw json file
S3_RAW_PATH = os.getenv("RAW_BUCKET_PATH", "s3://your-bucket/raw/")
raw_files = dbutils.fs.ls(S3_RAW_PATH)
json_files = [f for f in raw_files if f.name.endswith('.json') and f.name.startswith('tmu_professors_')]

if not json_files:
    raise ValueError(f"No raw JSON files found in {S3_RAW_PATH}")

# Sort by name (timestamp in filename) and get latest
latest_file = sorted(json_files, key=lambda x: x.name, reverse=True)[0]
file_path = latest_file.path

print(f"Processing latest file: {file_path}")
print(f"File size: {latest_file.size / 1024 / 1024:.2f} MB")
print(f"Modified: {latest_file.modificationTime}")

# Read the raw json file
df = spark.read.option("multiLine", "true").json(file_path)
print("✓ File successfully loaded")

# Separate each professor from original array to rows
df_professors_raw = df.select(F.explode("professors").alias("prof")).select(
    F.col("prof.id").alias("professor_id"),
    F.col("prof.legacyId").alias("legacy_id"),
    F.col("prof.firstName").alias("first_name"),
    F.col("prof.lastName").alias("last_name"),
    F.concat(F.col("prof.firstName"), F.lit(" "), F.col("prof.lastName")).alias("full_name"),
    F.col("prof.department").alias("department"),
    F.col("prof.avgRating").alias("avg_rating"),
    F.col("prof.numRatings").alias("num_ratings"),
    F.col("prof.wouldTakeAgainPercent").alias("would_take_again_percent"),
    F.col("prof.avgDifficulty").alias("avg_difficulty")
)
print("✓ Flattened structure")

# DATA QUALITY CHECKS
print("=" * 60)
print("DEDUPLICATION - PROFESSORS")
print("=" * 60)

total_profs = df_professors_raw.count()
unique_prof_ids = df_professors_raw.select("professor_id").distinct().count()

print(f"Total rows: {total_profs}")
print(f"Unique professor_ids: {unique_prof_ids}")
print(f"Duplicates found: {total_profs - unique_prof_ids}")

# Show examples if duplicates exist
if total_profs > unique_prof_ids:
    print("\n⚠️ Duplicate examples:")
    duplicate_ids = df_professors_raw.groupBy("professor_id").count().filter("count > 1")
    sample_dup_id = duplicate_ids.first()["professor_id"]
    display(df_professors_raw.filter(F.col("professor_id") == sample_dup_id))
else:
    print("✓ No duplicates found!")

# Define deduplication window
# Priority: Keep record with most complete data
window_prof = Window.partitionBy("professor_id").orderBy(
    F.desc(F.when(F.col("department").isNotNull(), 1).otherwise(0)),  # Has department
    F.desc(F.when(F.col("avg_rating").isNotNull(), 1).otherwise(0)),  # Has rating
    F.desc("num_ratings")  # Most reviews (tiebreaker)
)

# Smart deduplication
df_professors = df_professors_raw \
    .withColumn("row_num", F.row_number().over(window_prof)) \
    .filter(F.col("row_num") == 1) \
    .drop("row_num")

print(f"After deduplication: {df_professors.count()} professors")

# DATA QUALITY CHECKS
print("\n" + "=" * 60)
print("DATA QUALITY CHECKS - PROFESSORS")
print("=" * 60)

# Check 1: Missing critical fields
null_checks = df_professors.select(
    F.sum(F.when(F.col("professor_id").isNull(), 1).otherwise(0)).alias("null_ids"),
    F.sum(F.when(F.col("first_name").isNull(), 1).otherwise(0)).alias("null_first_names"),
    F.sum(F.when(F.col("last_name").isNull(), 1).otherwise(0)).alias("null_last_names"),
    F.sum(F.when(F.col("department").isNull(), 1).otherwise(0)).alias("null_departments")
).collect()[0]

print(f"Missing IDs: {null_checks.null_ids}")
print(f"Missing first names: {null_checks.null_first_names}")
print(f"Missing last names: {null_checks.null_last_names}")
print(f"Missing departments: {null_checks.null_departments}")

invalid_ratings = df_professors.filter(
    F.col("avg_rating").isNotNull() & 
    ((F.col("avg_rating") < 0) | (F.col("avg_rating") > 5))
).count()
print(f"Invalid ratings (not 0-5): {invalid_ratings}")

# Check for negative review counts
negative_reviews = df_professors.filter(F.col("num_ratings") < 0).count()
print(f"Negative review counts: {negative_reviews}")

# Apply validation rules
df_professors_clean = df_professors \
    .filter(F.col("professor_id").isNotNull()) \
    .filter(F.col("first_name").isNotNull()) \
    .filter(F.col("last_name").isNotNull()) \
    .withColumn("department", F.coalesce(F.col("department"), F.lit("Unknown"))) \
    .filter(
        F.col("avg_rating").isNull() | 
        ((F.col("avg_rating") >= 0) & (F.col("avg_rating") <= 5))
    ) \
    .filter(F.col("num_ratings") >= 0) \
    .withColumn("full_name", F.concat(F.col("first_name"), F.lit(" "), F.col("last_name")))

print(f"✓ Clean professors: {df_professors_clean.count()}")

# Preview
display(df_professors_clean.limit(10))

# Save as Delta table
df_professors_clean.write \
    .format("delta") \
    .mode("overwrite") \
    .saveAsTable("prof_pulse.default.professors_silver")
print("✓ Saved professors table!")


# COMMAND ----------

# DBTITLE 1,Reviews
# This cell processes raw review data from the ratemyprofessor.com JSON file:
# 1. Loads and explodes professor and review records, extracting relevant fields.
# 2. Deduplicates reviews, prioritizing most recent and complete entries.
# 3. Cleans and validates review data, including rating ranges and course code extraction.
# 4. Previews and saves the cleaned reviews as a partitioned Delta table for analytics.
# 5. Summarizes data quality, course code extraction, and review date range.

# Fresh read of the raw data
df = spark.read.option("multiLine", "true").json(file_path)

# Explode professors again
df_reviews_raw = df.select(
    F.explode("professors").alias("prof")
).select(
    F.col("prof.id").alias("professor_id"),
    F.concat(F.col("prof.firstName"), F.lit(" "), F.col("prof.lastName")).alias("professor_name"),
    F.col("prof.department").alias("department"),
    F.explode("prof.reviews").alias("review")
).select(
    F.col("review.id").alias("review_id"),
    F.col("professor_id"),
    F.col("professor_name"),
    F.col("department"),
    F.col("review.date").alias("date_raw"),
    F.col("review.class").alias("class"),
    F.col("review.comment").alias("comment"),
    F.col("review.clarityRating").alias("clarity_rating"),
    F.col("review.helpfulRating").alias("helpful_rating"),
    F.col("review.difficultyRating").alias("difficulty_rating"),
    F.col("review.wouldTakeAgain").alias("would_take_again"),
    F.col("review.grade").alias("grade"),
    F.col("review.isForOnlineClass").alias("is_online"),
    F.col("review.ratingTags").alias("rating_tags")
)

print("=" * 60)
print("DUPLICATE INVESTIGATION - REVIEWS")
print("=" * 60)

total_reviews = df_reviews_raw.count()
unique_review_ids = df_reviews_raw.select("review_id").distinct().count()

print(f"Total rows: {total_reviews}")
print(f"Unique review_ids: {unique_review_ids}")
print(f"Duplicates found: {total_reviews - unique_review_ids}")

# Show examples if duplicates exist
if total_reviews > unique_review_ids:
    print("\n⚠️ Duplicate examples:")
    duplicate_review_ids = df_reviews_raw.groupBy("review_id").count().filter("count > 1")
    if duplicate_review_ids.count() > 0:
        sample_dup_review_id = duplicate_review_ids.first()["review_id"]
        display(df_reviews_raw.filter(F.col("review_id") == sample_dup_review_id))
else:
    print("✓ No duplicates found!")

df_reviews_with_date = df_reviews_raw.withColumn(
    "date",
    F.to_timestamp(
        F.regexp_replace(F.col("date_raw"), " UTC$", ""),
        "yyyy-MM-dd HH:mm:ss Z"
    )
)

# Define deduplication window
# Priority: Keep most recent review with complete data
window_review = Window.partitionBy("review_id").orderBy(
    F.desc("date"),  # Most recent
    F.desc(F.when(F.col("comment").isNotNull(), 1).otherwise(0)),  # Has comment
    F.desc(F.when(F.col("clarity_rating").isNotNull(), 1).otherwise(0))  # Has rating
)

# Smart deduplication
df_reviews = df_reviews_with_date \
    .withColumn("row_num", F.row_number().over(window_review)) \
    .filter(F.col("row_num") == 1) \
    .drop("row_num", "date_raw")

print(f"After deduplication: {df_reviews.count()} reviews")

# Add time columns
df_reviews = df_reviews \
    .withColumn("year", F.year("date")) \
    .withColumn("month", F.month("date"))

# DATA QUALITY CHECKS
print("\n" + "=" * 60)
print("DATA QUALITY CHECKS - REVIEWS")
print("=" * 60)

# Check for missing critical fields
review_null_checks = df_reviews.select(
    F.sum(F.when(F.col("review_id").isNull(), 1).otherwise(0)).alias("null_review_ids"),
    F.sum(F.when(F.col("professor_id").isNull(), 1).otherwise(0)).alias("null_prof_ids"),
    F.sum(F.when(F.col("date").isNull(), 1).otherwise(0)).alias("null_dates"),
    F.sum(F.when(F.col("class").isNull(), 1).otherwise(0)).alias("null_classes"),
    F.sum(F.when(F.col("comment").isNull(), 1).otherwise(0)).alias("null_comments")
).collect()[0]

print(f"Missing review IDs: {review_null_checks.null_review_ids}")
print(f"Missing professor IDs: {review_null_checks.null_prof_ids}")
print(f"Missing dates: {review_null_checks.null_dates}")
print(f"Missing classes: {review_null_checks.null_classes}")
print(f"Missing comments: {review_null_checks.null_comments}")

# Check for invalid ratings
invalid_clarity = df_reviews.filter(
    F.col("clarity_rating").isNotNull() & 
    ((F.col("clarity_rating") < 1) | (F.col("clarity_rating") > 5))
).count()
invalid_difficulty = df_reviews.filter(
    F.col("difficulty_rating").isNotNull() & 
    ((F.col("difficulty_rating") < 1) | (F.col("difficulty_rating") > 5))
).count()

print(f"Invalid clarity ratings: {invalid_clarity}")
print(f"Invalid difficulty ratings: {invalid_difficulty}")

# Apply validation rules
df_reviews_clean = df_reviews \
    .filter(F.col("review_id").isNotNull()) \
    .filter(F.col("professor_id").isNotNull()) \
    .filter(F.col("date").isNotNull()) \
    .filter(
        F.col("clarity_rating").isNull() | 
        ((F.col("clarity_rating") >= 1) & (F.col("clarity_rating") <= 5))
    ) \
    .filter(
        F.col("difficulty_rating").isNull() | 
        ((F.col("difficulty_rating") >= 1) & (F.col("difficulty_rating") <= 5))
    ) \
    .filter(
        F.col("helpful_rating").isNull() | 
        ((F.col("helpful_rating") >= 1) & (F.col("helpful_rating") <= 5))
    )

# STANDARDIZE COURSE CODES
# Extract clean course code (e.g. "CPS510", "MTH314", "ENG 103")
df_reviews_clean = df_reviews_clean.withColumn(
    "course_code_raw",
    F.upper(F.regexp_extract(F.col("class"), r"([A-Z]{2,4}\s*\d{3,4}[A-Z]?)", 1))
).withColumn(
    "course_code",
    F.when(
        F.col("course_code_raw") != "",
        F.regexp_replace(F.col("course_code_raw"), r"\s+", "")
    ).otherwise(None)
).drop("course_code_raw")

print(f"✓ Clean reviews: {df_reviews_clean.count()}")

# Show sample course code extraction
print("\nSample course codes (original → standardized):")
display(
    df_reviews_clean
    .filter(F.col("course_code").isNotNull())
    .select("class", "course_code")
    .distinct()
    .limit(20)
)

# Preview cleaned data
display(df_reviews_clean.limit(10))

# Save to Silver
df_reviews_clean.write \
    .format("delta") \
    .mode("overwrite") \
    .partitionBy("year") \
    .saveAsTable("prof_pulse.default.reviews_silver")

print("✓ Saved reviews_silver table")

# Get final counts
prof_count = spark.table("prof_pulse.default.professors_silver").count()
review_count = spark.table("prof_pulse.default.reviews_silver").count()

print(f"\nProfessors (validated): {prof_count:,}")
print(f"Reviews (validated): {review_count:,}")

# Course code extraction stats
course_stats = spark.table("prof_pulse.default.reviews_silver").select(
    F.sum(F.when(F.col("course_code").isNotNull(), 1).otherwise(0)).alias("with_course"),
    F.sum(F.when(F.col("course_code").isNull(), 1).otherwise(0)).alias("without_course"),
    F.countDistinct("course_code").alias("unique_courses")
).collect()[0]

print(f"\nCourse Code Extraction:")
print(f"  Reviews with course code: {course_stats.with_course:,}")
print(f"  Reviews without course code: {course_stats.without_course:,}")
print(f"  Unique courses identified: {course_stats.unique_courses:,}")

# Date range
date_stats = spark.table("prof_pulse.default.reviews_silver").select(
    F.min("date").alias("oldest"),
    F.max("date").alias("newest")
).collect()[0]

print(f"\nDate Range:")
print(f"  Oldest review: {date_stats.oldest}")
print(f"  Newest review: {date_stats.newest}")