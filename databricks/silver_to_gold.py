# Databricks notebook source
# DBTITLE 1,Course Metrics
# Primary course-level aggregations
# "Is this course worth taking?"

from pyspark.sql import functions as F
from pyspark.sql.window import Window

# Load silver data
reviews = spark.table("prof_pulse.default.reviews_silver")

# Filter to reviews with valid course codes
reviews_with_course = reviews.filter(F.col("course_code").isNotNull())

# Calculate quality score (average of clarity and helpful)
reviews_scored = reviews_with_course.withColumn(
    "quality_score",
    (F.col("clarity_rating") + F.col("helpful_rating")) / 2
)

# Main aggregation
course_metrics = reviews_scored.groupBy("course_code").agg(
    # Volume metrics
    F.count("review_id").alias("total_reviews"),
    F.countDistinct("professor_id").alias("total_professors"),
    
    # Quality metrics
    F.round(F.avg("quality_score"), 2).alias("avg_quality"),
    F.round(F.avg("difficulty_rating"), 2).alias("avg_difficulty"),
    
    # Would take again (handle nulls and convert to percentage)
    F.round(
        F.avg(F.when(F.col("would_take_again") == 1, 1.0)
               .when(F.col("would_take_again") == 0, 0.0)) * 100, 1
    ).alias("would_take_again_pct"),
    
    # Grade distribution as JSON
    F.to_json(
        F.map_from_entries(
            F.collect_list(
                F.struct(F.col("grade"), F.lit(1))
            )
        )
    ).alias("grade_distribution_raw"),
    
    # Recency
    F.max("date").alias("last_reviewed"),
    F.min("date").alias("first_reviewed")
)

# Better grade distribution - count each grade
grade_counts = reviews_scored.filter(F.col("grade").isNotNull()) \
    .groupBy("course_code", "grade") \
    .agg(F.count("*").alias("count"))

grade_distribution = grade_counts.groupBy("course_code").agg(
    F.to_json(F.map_from_entries(F.collect_list(F.struct("grade", "count")))).alias("grade_distribution")
)

# Recent trend: compare last 2 years vs all-time
from datetime import datetime
current_year = datetime.now().year

recent_stats = reviews_scored.filter(F.col("year") >= current_year - 2) \
    .groupBy("course_code") \
    .agg(
        F.round(F.avg("quality_score"), 2).alias("recent_avg_quality"),
        F.count("review_id").alias("recent_reviews")
    )

# Join everything together
course_metrics_gold = course_metrics \
    .join(grade_distribution, "course_code", "left") \
    .join(recent_stats, "course_code", "left") \
    .withColumn(
        "trend",
        F.when(F.col("recent_avg_quality") > F.col("avg_quality") + 0.2, "improving")
         .when(F.col("recent_avg_quality") < F.col("avg_quality") - 0.2, "declining")
         .otherwise("stable")
    ) \
    .drop("grade_distribution_raw")

# Final column selection
course_metrics_gold = course_metrics_gold.select(
    "course_code",
    "total_reviews",
    "total_professors",
    "avg_quality",
    "avg_difficulty",
    "would_take_again_pct",
    "grade_distribution",
    "trend",
    "recent_avg_quality",
    "recent_reviews",
    "first_reviewed",
    "last_reviewed"
)

# Preview
print(f"Courses with metrics: {course_metrics_gold.count()}")
display(course_metrics_gold.orderBy(F.desc("total_reviews")).limit(20))

# Save
course_metrics_gold.write \
    .format("delta") \
    .mode("overwrite") \
    .saveAsTable("prof_pulse.default.course_metrics_gold")

print("✓ Saved course_metrics_gold")

# COMMAND ----------

# DBTITLE 1,Course & Professor Comparisons
# Compare professors teaching the same course
# "Who should I take for CPS510?"

from pyspark.sql import functions as F
from pyspark.sql.window import Window

# Load silver data
reviews = spark.table("prof_pulse.default.reviews_silver")

# Filter to reviews with valid course codes
reviews_with_course = reviews.filter(F.col("course_code").isNotNull())

# Calculate quality score
reviews_scored = reviews_with_course.withColumn(
    "quality_score",
    (F.col("clarity_rating") + F.col("helpful_rating")) / 2
)

# Aggregate by course + professor combination
course_prof = reviews_scored.groupBy("course_code", "professor_id", "professor_name", "department").agg(
    F.count("review_id").alias("section_reviews"),
    F.round(F.avg("quality_score"), 2).alias("prof_avg_quality"),
    F.round(F.avg("difficulty_rating"), 2).alias("prof_avg_difficulty"),
    F.round(
        F.avg(F.when(F.col("would_take_again") == 1, 1.0)
               .when(F.col("would_take_again") == 0, 0.0)) * 100, 1
    ).alias("prof_would_take_again_pct"),
    F.max("date").alias("most_recent_review"),
    F.max("year").alias("most_recent_year")
)

# Rank professors within each course
window_quality = Window.partitionBy("course_code").orderBy(F.desc("prof_avg_quality"))
window_reviews = Window.partitionBy("course_code").orderBy(F.desc("section_reviews"))

course_professor_comparison_gold = course_prof \
    .withColumn("quality_rank", F.rank().over(window_quality)) \
    .withColumn("popularity_rank", F.rank().over(window_reviews)) \
    .withColumn(
        "professors_teaching_course",
        F.count("professor_id").over(Window.partitionBy("course_code"))
    )

# Final column selection
course_professor_comparison_gold = course_professor_comparison_gold.select(
    "course_code",
    "professor_id",
    "professor_name",
    "department",
    "section_reviews",
    "prof_avg_quality",
    "prof_avg_difficulty",
    "prof_would_take_again_pct",
    "quality_rank",
    "popularity_rank",
    "professors_teaching_course",
    "most_recent_year",
    "most_recent_review"
)

# Preview - show a course with multiple profs
print(f"Course-professor combinations: {course_professor_comparison_gold.count()}")

# Find a course with multiple professors to demo
multi_prof_course = course_professor_comparison_gold \
    .filter(F.col("professors_teaching_course") > 1) \
    .select("course_code") \
    .first()

if multi_prof_course:
    print(f"\nExample comparison for {multi_prof_course.course_code}:")
    display(
        course_professor_comparison_gold
        .filter(F.col("course_code") == multi_prof_course.course_code)
        .orderBy("quality_rank")
    )

# Save
course_professor_comparison_gold.write \
    .format("delta") \
    .mode("overwrite") \
    .saveAsTable("prof_pulse.default.course_professor_comparison_gold")

print("✓ Saved course_professor_comparison_gold")

# COMMAND ----------

# DBTITLE 1,Department Metrics
# Department-level statistics (by course prefix)

from pyspark.sql import functions as F
from pyspark.sql.window import Window

# Load silver data
reviews = spark.table("prof_pulse.default.reviews_silver")

# Filter to reviews with valid course codes and extract prefix
reviews_with_prefix = reviews.filter(F.col("course_code").isNotNull()).withColumn(
    "course_prefix",
    F.regexp_extract(F.col("course_code"), r"^([A-Z]{2,4})", 1)
).filter(F.col("course_prefix") != "")

# ============================================================
# MAPPINGS AS SPARK MAPS
# ============================================================

TYPO_CORRECTIONS = {
    "MATH": "MTH", "MT": "MTH", "HIST": "HST",
    "PSYC": "PSY", "SYCH": "PSY", "PSSY": "PSY", "PHSY": "PSY",
    "ECON": "ECN", "ACCT": "ACC", "ACCO": "ACC", "PHIL": "PHL",
    "CRIM": "CRM", "CRI": "CRM", "SOCL": "SOC",
    "BIOL": "BLG", "BLY": "BLG", "SPAN": "SPN", "GEEO": "GEO",
    "MKET": "MKT", "EMKT": "MKT", "MHRM": "MHR", "HMR": "MHR",
    "BUSN": "BUS", "BADM": "BUS",
    "EE": "ELE", "ME": "MEC", "CV": "CVL", "CN": "COE", 
    "CH": "CHE", "ECE": "ELE", "AE": "AER", "QM": "QMS",
    "SOWK": "SWP", "NURS": "NUR",
    "MB": "BUS", "CC": "CMN", "DS": "DST", "MN": "MGT", "PA": "PPA", "SK": "SWP",
}

CHANG_TO_PARENT = {
    "CPSY": "PSY", "CACC": "ACC", "CECN": "ECN", "CMHR": "MHR", "CQMS": "QMS",
    "CCMN": "CMN", "CCPS": "CPS", "CSOC": "SOC", "CPHL": "PHL", "CFIN": "FIN",
    "CGEO": "GEO", "CMKT": "MKT", "CHST": "HST", "CENG": "ENG", "CLAW": "LAW",
    "CMTH": "MTH", "CPOL": "POL", "CCHY": "CHY", "CBLG": "BLG", "CSPN": "SPN",
    "CMUS": "MUS", "CNUR": "NUR", "COHS": "OHS", "CCLD": "CLD", "CCRM": "CRM",
    "CSWP": "SWP", "CRTA": "RTA", "CGMS": "GMS", "CPCS": "PCS", "CPPA": "PPA",
    "CFRE": "FRE", "CMGT": "MGT", "CINT": "INT", "CRMG": "RMG", "CCRB": "CRB",
    "CSSH": "SSH", "CITM": "ITM", "CASL": "ASL", "CHMR": "MHR", "CMEC": "MEC",
    "CIND": "IND", "CKCH": "CHY", "CKHS": "HST", "CKDA": "DST", "CKPM": "MGT",
    "CFNY": "FIN", "CNCL": "NUR", "CODG": "GRA", "CPOG": "POG", "CDMP": "GCM",
    "HMHR": "MHR", "CEID": "EID", "CFNF": "FNF",
}

PREFIX_TO_DEPARTMENT = {
    "CPS": "Computer Science", "COE": "Computer Engineering", "ELE": "Electrical Engineering",
    "MEC": "Mechanical Engineering", "CVL": "Civil Engineering", "CHE": "Chemical Engineering",
    "AER": "Aerospace Engineering", "BME": "Biomedical Engineering", "IND": "Industrial Engineering",
    "EES": "Electrical Engineering", "CEN": "Computer Engineering", "ARC": "Architecture",
    "MTH": "Mathematics", "PCS": "Physics", "CHY": "Chemistry", "BLG": "Biology", "BIO": "Biology",
    "BCH": "Biochemistry", "BMS": "Biomedical Sciences", "SCI": "Science",
    "ACC": "Accounting", "FIN": "Finance", "MKT": "Marketing", "MHR": "Human Resources Management",
    "ITM": "Information Technology Management", "GMS": "Global Management Studies",
    "QMS": "Quantitative Methods", "ENT": "Entrepreneurship", "RMG": "Retail Management",
    "LAW": "Business Law", "BUS": "Business", "MGT": "Management", "IBS": "International Business",
    "BSM": "Business Management", "REM": "Real Estate Management",
    "HTM": "Hospitality & Tourism Management", "HTT": "Hospitality & Tourism", "HTH": "Hospitality",
    "HTA": "Hospitality Administration", "HTF": "Hospitality Food Services",
    "HTL": "Hospitality Leadership", "HTI": "Hospitality International",
    "HTR": "Hospitality Revenue Management", "HTD": "Hospitality Design",
    "RTA": "Media Production", "CMN": "Communication", "JRN": "Journalism",
    "GCM": "Graphic Communications Management", "GRA": "Graphic Design",
    "BDC": "Broadcasting & Digital Media", "MPC": "Media Production", "MPF": "Film Production",
    "MPM": "Media Production Management", "FFC": "Film & Photography", "FFD": "Fashion Design",
    "FSN": "Fashion", "INT": "Interior Design", "FCD": "Fashion Communication",
    "FPN": "Fashion Production", "BRD": "Broadcasting",
    "ENG": "English", "ENH": "English & Humanities", "HST": "History", "HIS": "History",
    "PHL": "Philosophy", "POL": "Politics & Public Administration", "SOC": "Sociology",
    "GEO": "Geography", "PSY": "Psychology", "ECN": "Economics", "CRM": "Criminology",
    "SSH": "Social Sciences & Humanities", "POG": "Politics & Governance",
    "ACS": "Arts & Contemporary Studies", "ASC": "Arts & Science", "AFF": "Accounting & Finance",
    "MUS": "Music", "THF": "Theatre", "PPA": "Public Policy & Administration",
    "CRB": "Creative Writing", "REL": "Religion", "ANT": "Anthropology", "EUS": "European Studies",
    "SWP": "Social Work", "CYC": "Child & Youth Care", "CLD": "Child Development",
    "NSE": "Nursing", "NUR": "Nursing", "NNS": "Nursing", "OHS": "Occupational Health & Safety",
    "PLG": "Urban & Regional Planning", "DST": "Disability Studies", "FNN": "Food & Nutrition",
    "FNS": "Food Science", "FNP": "Food & Nutrition Practice", "FNR": "Food & Nutrition Research",
    "FNU": "Food & Nutrition", "PLN": "Planning",
    "FRE": "French", "SPN": "Spanish", "CHN": "Chinese", "ARB": "Arabic",
    "ASL": "American Sign Language", "LNG": "Languages",
    "IRN": "Industrial Relations", "IRL": "Industrial Relations", "IRH": "Industrial Relations",
    "IRC": "Industrial Relations", "IRT": "Industrial Relations", "IRD": "Industrial Relations",
    "PPN": "Public Policy", "PLE": "Professional Legal Education", "NPF": "Non-Profit Management",
    "MTL": "Medical Laboratory Science", "ASF": "Arts Foundation", "FND": "Foundation Studies",
    "AFA": "Fine Arts", "CHSM": "Health Services Management", "POH": "Public Health",
    "PUB": "Public Health", "MPS": "Media Production Studies", "PLX": "Professional Studies",
    "EID": "Entrepreneurship & Innovation", "LIR": "Labour Relations",
    "PAT": "Professional Arts Training", "CENT": "Continuing Education",
    "AIM": "Arts Innovation & Management", "IDE": "Interior Design", "FNF": "Food & Nutrition",
    "EMS": "Emergency Management", "THP": "Theatre Production", "ENC": "English Communication",
    "PSC": "Political Science", "EF": "English Foundation",
}

# Convert to Spark map literals
typo_map = F.create_map([F.lit(x) for item in TYPO_CORRECTIONS.items() for x in item])
chang_map = F.create_map([F.lit(x) for item in CHANG_TO_PARENT.items() for x in item])
dept_map = F.create_map([F.lit(x) for item in PREFIX_TO_DEPARTMENT.items() for x in item])

# Apply all transformations in one pass
reviews_scored = reviews_with_prefix.withColumn(
    "prefix_step1",
    F.coalesce(typo_map[F.col("course_prefix")], F.col("course_prefix"))
).withColumn(
    "prefix_normalized", 
    F.coalesce(chang_map[F.col("prefix_step1")], F.col("prefix_step1"))
).withColumn(
    "course_department",
    F.coalesce(dept_map[F.col("prefix_normalized")], F.col("prefix_normalized"))
).withColumn(
    "quality_score",
    (F.col("clarity_rating") + F.col("helpful_rating")) / 2
).drop("prefix_step1")

# Filter courses with minimum reviews
MIN_REVIEWS_THRESHOLD = 15
reviews_filtered = reviews_scored.join(
    reviews_scored.groupBy("course_code").count().filter(F.col("count") >= MIN_REVIEWS_THRESHOLD).select("course_code"),
    "course_code"
)

# Main department aggregation
dept_stats = reviews_filtered.groupBy("course_department").agg(
    F.countDistinct("course_code").alias("total_courses"),
    F.countDistinct("professor_id").alias("total_professors"),
    F.count("review_id").alias("total_reviews"),
    F.round(F.avg("quality_score"), 2).alias("dept_avg_quality"),
    F.round(F.avg("difficulty_rating"), 2).alias("dept_avg_difficulty"),
    F.round(
        F.avg(F.when(F.col("would_take_again") == 1, 1.0)
               .when(F.col("would_take_again") == 0, 0.0)) * 100, 1
    ).alias("dept_would_take_again_pct"),
    F.min("date").alias("oldest_review"),
    F.max("date").alias("newest_review")
)

# Course-level stats for rankings
course_stats = reviews_filtered.groupBy("course_department", "course_code").agg(
    F.count("review_id").alias("reviews"),
    F.round(F.avg("quality_score"), 2).alias("avg_quality"),
    F.round(F.avg("difficulty_rating"), 2).alias("avg_difficulty")
)

# Rank courses within department
window_difficulty = Window.partitionBy("course_department").orderBy(F.desc("avg_difficulty"))
window_easiest = Window.partitionBy("course_department").orderBy(F.asc("avg_difficulty"))
window_quality = Window.partitionBy("course_department").orderBy(F.desc("avg_quality"))

course_ranked = course_stats \
    .withColumn("difficulty_rank", F.row_number().over(window_difficulty)) \
    .withColumn("easiest_rank", F.row_number().over(window_easiest)) \
    .withColumn("quality_rank", F.row_number().over(window_quality))

# Get top 5 for each category
hardest = course_ranked.filter(F.col("difficulty_rank") <= 5) \
    .groupBy("course_department") \
    .agg(F.to_json(F.collect_list(F.struct("course_code", "avg_difficulty"))).alias("hardest_courses"))

easiest = course_ranked.filter(F.col("easiest_rank") <= 5) \
    .groupBy("course_department") \
    .agg(F.to_json(F.collect_list(F.struct("course_code", "avg_difficulty"))).alias("easiest_courses"))

best_rated = course_ranked.filter(F.col("quality_rank") <= 5) \
    .groupBy("course_department") \
    .agg(F.to_json(F.collect_list(F.struct("course_code", "avg_quality"))).alias("best_rated_courses"))

# Join and save
department_overview_gold = dept_stats \
    .join(hardest, "course_department", "left") \
    .join(easiest, "course_department", "left") \
    .join(best_rated, "course_department", "left") \
    .orderBy(F.desc("total_reviews"))

department_overview_gold.write \
    .format("delta") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .saveAsTable("prof_pulse.default.department_overview_gold")

print("✓ Saved department_overview_gold")

# COMMAND ----------

# MAGIC %skip
# MAGIC # Display from saved table
# MAGIC display(spark.table("prof_pulse.default.department_overview_gold"))

# COMMAND ----------

# DBTITLE 1,Course Trends
# course_trends_gold - Course metrics over time
# "Has CPS510 gotten harder over time?"

from pyspark.sql import functions as F
from pyspark.sql.window import Window

# Load silver data
reviews = spark.table("prof_pulse.default.reviews_silver")

# Filter to reviews with valid course codes and year
reviews_filtered = reviews.filter(
    (F.col("course_code").isNotNull()) & 
    (F.col("year").isNotNull())
)

# Calculate quality score
reviews_scored = reviews_filtered.withColumn(
    "quality_score",
    (F.col("clarity_rating") + F.col("helpful_rating")) / 2
)

# Aggregate by course and year
course_year_stats = reviews_scored.groupBy("course_code", "year").agg(
    F.count("review_id").alias("review_count"),
    F.round(F.avg("quality_score"), 2).alias("avg_quality"),
    F.round(F.avg("difficulty_rating"), 2).alias("avg_difficulty"),
    F.round(
        F.avg(F.when(F.col("would_take_again") == 1, 1.0)
               .when(F.col("would_take_again") == 0, 0.0)) * 100, 1
    ).alias("would_take_again_pct")
)

# Calculate year-over-year changes using lag
window_by_course = Window.partitionBy("course_code").orderBy("year")

course_trends_gold = course_year_stats \
    .withColumn("prev_quality", F.lag("avg_quality").over(window_by_course)) \
    .withColumn("prev_difficulty", F.lag("avg_difficulty").over(window_by_course)) \
    .withColumn(
        "quality_delta",
        F.round(F.col("avg_quality") - F.col("prev_quality"), 2)
    ) \
    .withColumn(
        "difficulty_delta", 
        F.round(F.col("avg_difficulty") - F.col("prev_difficulty"), 2)
    ) \
    .withColumn(
        "quality_trend",
        F.when(F.col("quality_delta") > 0.3, "improving")
         .when(F.col("quality_delta") < -0.3, "declining")
         .otherwise("stable")
    ) \
    .withColumn(
        "difficulty_trend",
        F.when(F.col("difficulty_delta") > 0.3, "harder")
         .when(F.col("difficulty_delta") < -0.3, "easier")
         .otherwise("stable")
    ) \
    .drop("prev_quality", "prev_difficulty")

# Filter to courses with meaningful data (at least 2 years of reviews)
courses_with_history = course_trends_gold.groupBy("course_code").count().filter(F.col("count") >= 2).select("course_code")
course_trends_gold = course_trends_gold.join(courses_with_history, "course_code")

# Order for output
course_trends_gold = course_trends_gold.orderBy("course_code", "year")

# Save
course_trends_gold.write \
    .format("delta") \
    .mode("overwrite") \
    .saveAsTable("prof_pulse.default.course_trends_gold")

print("✓ Saved course_trends_gold")

# COMMAND ----------

# DBTITLE 1,Bird Courses
# ============================================================
# BIRD COURSES GOLD
# Which courses give easy A's?
# ============================================================

from pyspark.sql import functions as F
from pyspark.sql.window import Window

# ------------------------------------------------------------
# Load base data
# ------------------------------------------------------------

reviews = spark.table("prof_pulse.default.reviews_silver")

# ------------------------------------------------------------
# TAG WEIGHTS
# ------------------------------------------------------------

TAG_WEIGHTS = {
    # Strong bird signals
    "graded by few things": 3.0,
    "extra credit": 2.5,
    "tests? not many": 2.5,
    "clear grading criteria": 2.0,
    "online savvy": 1.5,
    "gives good feedback": 1.0,
    "accessible outside class": 1.0,
    "would take again": 1.0,
    
    # Neutral/positive
    "amazing lectures": 0.5,
    "inspirational": 0.5,
    "caring": 0.5,
    "hilarious": 0.5,
    "respected": 0.5,
    "cares about students": 0.5,
    "respected by students": 0.5,
    
    # Bird negative signals
    "tough grader": -3.0,
    "tests are tough": -2.5,
    "get ready to read": -2.0,
    "lots of homework": -2.0,
    "so many papers": -2.0,
    "skip class? you won't pass.": -2.0,
    "beware of pop quizzes": -1.5,
    "participation matters": -1.0,
    "test heavy": -1.0,
    "lecture heavy": -0.5,
    "group projects": -0.5,
}

tag_weight_map = F.create_map([F.lit(x) for kv in TAG_WEIGHTS.items() for x in kv])

# ------------------------------------------------------------
# DEPARTMENT NORMALIZATION MAPS
# ------------------------------------------------------------

TYPO_CORRECTIONS = {
    "MATH": "MTH", "MT": "MTH", "HIST": "HST",
    "PSYC": "PSY", "SYCH": "PSY", "PSSY": "PSY", "PHSY": "PSY",
    "ECON": "ECN", "ACCT": "ACC", "ACCO": "ACC", "PHIL": "PHL",
    "CRIM": "CRM", "CRI": "CRM", "SOCL": "SOC",
    "BIOL": "BLG", "BLY": "BLG", "SPAN": "SPN", "GEEO": "GEO",
    "MKET": "MKT", "EMKT": "MKT", "MHRM": "MHR", "HMR": "MHR",
    "BUSN": "BUS", "BADM": "BUS",
    "EE": "ELE", "ME": "MEC", "CV": "CVL", "CN": "COE", 
    "CH": "CHE", "ECE": "ELE", "AE": "AER", "QM": "QMS",
    "SOWK": "SWP", "NURS": "NUR",
    "MB": "BUS", "CC": "CMN", "DS": "DST", "MN": "MGT", "PA": "PPA", "SK": "SWP",
}

CHANG_TO_PARENT = {
    "CPSY": "PSY", "CACC": "ACC", "CECN": "ECN", "CMHR": "MHR", "CQMS": "QMS",
    "CCMN": "CMN", "CCPS": "CPS", "CSOC": "SOC", "CPHL": "PHL", "CFIN": "FIN",
    "CGEO": "GEO", "CMKT": "MKT", "CHST": "HST", "CENG": "ENG", "CLAW": "LAW",
    "CMTH": "MTH", "CPOL": "POL", "CCHY": "CHY", "CBLG": "BLG", "CSPN": "SPN",
    "CMUS": "MUS", "CNUR": "NUR", "COHS": "OHS", "CCLD": "CLD", "CCRM": "CRM",
    "CSWP": "SWP", "CRTA": "RTA", "CGMS": "GMS", "CPCS": "PCS", "CPPA": "PPA",
    "CFRE": "FRE", "CMGT": "MGT", "CINT": "INT", "CRMG": "RMG", "CCRB": "CRB",
    "CSSH": "SSH", "CITM": "ITM", "CASL": "ASL", "CHMR": "MHR", "CMEC": "MEC",
    "CIND": "IND", "CKCH": "CHY", "CKHS": "HST", "CKDA": "DST", "CKPM": "MGT",
    "CFNY": "FIN", "CNCL": "NUR", "CODG": "GRA", "CPOG": "POG", "CDMP": "GCM",
    "HMHR": "MHR", "CEID": "EID", "CFNF": "FNF",
}

PREFIX_TO_DEPARTMENT = {
    "CPS": "Computer Science", "COE": "Computer Engineering", "ELE": "Electrical Engineering",
    "MEC": "Mechanical Engineering", "CVL": "Civil Engineering", "CHE": "Chemical Engineering",
    "AER": "Aerospace Engineering", "BME": "Biomedical Engineering", "IND": "Industrial Engineering",
    "EES": "Electrical Engineering", "CEN": "Computer Engineering", "ARC": "Architecture",
    "MTH": "Mathematics", "PCS": "Physics", "CHY": "Chemistry", "BLG": "Biology", "BIO": "Biology",
    "BCH": "Biochemistry", "BMS": "Biomedical Sciences", "SCI": "Science",
    "ACC": "Accounting", "FIN": "Finance", "MKT": "Marketing", "MHR": "Human Resources Management",
    "ITM": "Information Technology Management", "GMS": "Global Management Studies",
    "QMS": "Quantitative Methods", "ENT": "Entrepreneurship", "RMG": "Retail Management",
    "LAW": "Business Law", "BUS": "Business", "MGT": "Management", "IBS": "International Business",
    "BSM": "Business Management", "REM": "Real Estate Management",
    "HTM": "Hospitality & Tourism Management", "HTT": "Hospitality & Tourism", "HTH": "Hospitality",
    "HTA": "Hospitality Administration", "HTF": "Hospitality Food Services",
    "HTL": "Hospitality Leadership", "HTI": "Hospitality International",
    "HTR": "Hospitality Revenue Management", "HTD": "Hospitality Design",
    "RTA": "Media Production", "CMN": "Communication", "JRN": "Journalism",
    "GCM": "Graphic Communications Management", "GRA": "Graphic Design",
    "BDC": "Broadcasting & Digital Media", "MPC": "Media Production", "MPF": "Film Production",
    "MPM": "Media Production Management", "FFC": "Film & Photography", "FFD": "Fashion Design",
    "FSN": "Fashion", "INT": "Interior Design", "FCD": "Fashion Communication",
    "FPN": "Fashion Production", "BRD": "Broadcasting",
    "ENG": "English", "ENH": "English & Humanities", "HST": "History", "HIS": "History",
    "PHL": "Philosophy", "POL": "Politics & Public Administration", "SOC": "Sociology",
    "GEO": "Geography", "PSY": "Psychology", "ECN": "Economics", "CRM": "Criminology",
    "SSH": "Social Sciences & Humanities", "POG": "Politics & Governance",
    "ACS": "Arts & Contemporary Studies", "ASC": "Arts & Science", "AFF": "Accounting & Finance",
    "MUS": "Music", "THF": "Theatre", "PPA": "Public Policy & Administration",
    "CRB": "Creative Writing", "REL": "Religion", "ANT": "Anthropology", "EUS": "European Studies",
    "SWP": "Social Work", "CYC": "Child & Youth Care", "CLD": "Child Development",
    "NSE": "Nursing", "NUR": "Nursing", "NNS": "Nursing", "OHS": "Occupational Health & Safety",
    "PLG": "Urban & Regional Planning", "DST": "Disability Studies", "FNN": "Food & Nutrition",
    "FNS": "Food Science", "FNP": "Food & Nutrition Practice", "FNR": "Food & Nutrition Research",
    "FNU": "Food & Nutrition", "PLN": "Planning",
    "FRE": "French", "SPN": "Spanish", "CHN": "Chinese", "ARB": "Arabic",
    "ASL": "American Sign Language", "LNG": "Languages",
    "IRN": "Industrial Relations", "IRL": "Industrial Relations", "IRH": "Industrial Relations",
    "IRC": "Industrial Relations", "IRT": "Industrial Relations", "IRD": "Industrial Relations",
    "PPN": "Public Policy", "PLE": "Professional Legal Education", "NPF": "Non-Profit Management",
    "MTL": "Medical Laboratory Science", "ASF": "Arts Foundation", "FND": "Foundation Studies",
    "AFA": "Fine Arts", "CHSM": "Health Services Management", "POH": "Public Health",
    "PUB": "Public Health", "MPS": "Media Production Studies", "PLX": "Professional Studies",
    "EID": "Entrepreneurship & Innovation", "LIR": "Labour Relations",
    "PAT": "Professional Arts Training", "CENT": "Continuing Education",
    "AIM": "Arts Innovation & Management", "IDE": "Interior Design", "FNF": "Food & Nutrition",
    "EMS": "Emergency Management", "THP": "Theatre Production", "ENC": "English Communication",
    "PSC": "Political Science", "EF": "English Foundation",
}

typo_map = F.create_map([F.lit(x) for kv in TYPO_CORRECTIONS.items() for x in kv])
chang_map = F.create_map([F.lit(x) for kv in CHANG_TO_PARENT.items() for x in kv])
dept_map = F.create_map([F.lit(x) for kv in PREFIX_TO_DEPARTMENT.items() for x in kv])

# ------------------------------------------------------------
# EXPLODE TAGS (shared for scores + top tags)
# ------------------------------------------------------------

tags_exploded = reviews.filter(
    F.col("course_code").isNotNull() &
    F.col("rating_tags").isNotNull() &
    (F.col("rating_tags") != "")
).select(
    "review_id",
    "course_code",
    F.explode(F.split("rating_tags", "--")).alias("tag")
).withColumn(
    "tag", F.lower(F.trim("tag"))
).filter(
    F.col("tag") != ""
)

# ------------------------------------------------------------
# TAG SCORE PER COURSE
# ------------------------------------------------------------

course_tag_scores = tags_exploded.withColumn(
    "tag_weight",
    F.coalesce(tag_weight_map[F.col("tag")], F.lit(0.0))
).groupBy("course_code").agg(
    F.avg("tag_weight").alias("avg_tag_weight")
)

# ------------------------------------------------------------
# TOP 3 TAGS PER COURSE
# ------------------------------------------------------------

tag_window = Window.partitionBy("course_code").orderBy(F.desc("tag_count"))

top_tags = tags_exploded.groupBy("course_code", "tag").agg(
    F.count("*").alias("tag_count")
).withColumn(
    "rank", F.row_number().over(tag_window)
).filter(
    F.col("rank") <= 3
).groupBy("course_code").agg(
    F.max(F.when(F.col("rank") == 1, F.col("tag"))).alias("top_tag_1"),
    F.max(F.when(F.col("rank") == 2, F.col("tag"))).alias("top_tag_2"),
    F.max(F.when(F.col("rank") == 3, F.col("tag"))).alias("top_tag_3"),
)

# ------------------------------------------------------------
# TOP PROFESSOR PER COURSE
# Uses same scoring as frontend: recency (40%) + quality (35%) + sample size (25%)
# ------------------------------------------------------------

CURRENT_YEAR = 2026

course_profs = spark.table("prof_pulse.default.course_professor_comparison_gold")

profs_scored = course_profs.withColumn(
    # Recency score (0-100): Full points if taught this year, -10 per year ago
    "recency_score",
    F.greatest(
        F.lit(0.0),
        F.lit(100.0) - (F.lit(CURRENT_YEAR) - F.coalesce(F.col("most_recent_year"), F.lit(CURRENT_YEAR - 20))) * 10
    )
).withColumn(
    # Quality score (0-100): Rating on 1-5 scale converted to 0-100
    "quality_score",
    F.coalesce(F.col("prof_avg_quality") / 5 * 100, F.lit(50.0))
).withColumn(
    # Sample size score (0-100): Logarithmic scale, 10 reviews ≈ 60, 50+ ≈ 90
    "sample_score",
    F.least(
        F.lit(100.0),
        F.lit(20.0) + F.log10(F.col("section_reviews") + 1) * 40
    )
).withColumn(
    # Combined score with weights
    "prof_pick_score",
    F.col("recency_score") * 0.40 +
    F.col("quality_score") * 0.35 +
    F.col("sample_score") * 0.25
)

# Rank professors within each course and pick top
prof_window = Window.partitionBy("course_code").orderBy(F.desc("prof_pick_score"))

top_profs = profs_scored.withColumn(
    "prof_rank", F.row_number().over(prof_window)
).filter(
    F.col("prof_rank") == 1
).select(
    "course_code",
    F.col("professor_name").alias("top_professor_name"),
    F.col("professor_id").alias("top_professor_id"),
    F.col("prof_avg_quality").alias("top_professor_quality"),
    F.col("section_reviews").alias("top_professor_reviews"),
    F.col("most_recent_year").alias("top_professor_last_year")
)

# ------------------------------------------------------------
# ADD DEPARTMENT TO REVIEWS WITH GRADES
# ------------------------------------------------------------

reviews_with_dept = reviews.filter(
    F.col("course_code").isNotNull() &
    F.col("grade").isNotNull() &
    (F.col("grade") != "")
).withColumn(
    "course_prefix",
    F.regexp_extract("course_code", r"^([A-Z]{2,4})", 1)
).withColumn(
    "prefix_norm",
    F.coalesce(
        chang_map[F.coalesce(typo_map[F.col("course_prefix")], F.col("course_prefix"))],
        typo_map[F.col("course_prefix")],
        F.col("course_prefix")
    )
).withColumn(
    "department",
    F.coalesce(dept_map[F.col("prefix_norm")], F.col("prefix_norm"))
)

# ------------------------------------------------------------
# GRADE METRICS PER COURSE
# ------------------------------------------------------------

graded = reviews_with_dept.withColumn(
    "grade_clean", F.upper(F.trim("grade"))
).withColumn(
    "is_A", F.col("grade_clean").isin(["A+", "A", "A-"]).cast("int")
).withColumn(
    "is_B_or_higher", F.col("grade_clean").isin(
        ["A+", "A", "A-", "B+", "B", "B-"]
    ).cast("int")
)

course_stats = graded.groupBy("course_code").agg(
    F.count("*").alias("total_reviews"),
    F.sum("is_A").alias("a_count"),
    F.sum("is_B_or_higher").alias("b_or_higher_count"),
    F.round(F.avg("difficulty_rating"), 2).alias("avg_difficulty"),
    F.round(F.avg((F.col("clarity_rating") + F.col("helpful_rating")) / 2), 2).alias("avg_quality"),
    F.round(
        F.avg(F.when(F.col("would_take_again") == 1, 1.0)
               .when(F.col("would_take_again") == 0, 0.0)) * 100, 1
    ).alias("would_take_again_pct"),
    F.first("department").alias("department")
).withColumn(
    "a_rate", F.round(F.col("a_count") / F.col("total_reviews") * 100, 1)
).withColumn(
    "b_or_higher_rate", F.round(F.col("b_or_higher_count") / F.col("total_reviews") * 100, 1)
)

# ------------------------------------------------------------
# CALCULATE BIRD SCORE
# ------------------------------------------------------------

bird_courses = course_stats.join(
    course_tag_scores, "course_code", "left"
).withColumn(
    # Normalize tag score to 0-100 (assuming range -5 to +5)
    "tag_score",
    F.round(
        F.least(
            F.lit(100.0),
            F.greatest(
                F.lit(0.0),
                ((F.coalesce(F.col("avg_tag_weight"), F.lit(0.0)) + 5) / 10) * 100
            )
        ), 1
    )
).withColumn(
    # Grade success score (A's weighted more, B's still count)
    "grade_score",
    F.round(F.col("a_rate") * 0.7 + F.col("b_or_higher_rate") * 0.3, 1)
).withColumn(
    # Easiness score (0-100)
    "easiness",
    F.round(((5 - F.col("avg_difficulty")) / 4) * 100, 1)
).withColumn(
    # Confidence multiplier based on review count (0.6 to 1.0)
    "confidence",
    F.least(F.lit(1.0), F.lit(0.6) + (F.log10(F.col("total_reviews") + 1) / 5))
).withColumn(
    # Final bird score
    "bird_score",
    F.round(
        (
            F.col("grade_score") * 0.30 +
            F.col("easiness") * 0.30 +
            F.coalesce(F.col("would_take_again_pct"), F.lit(50.0)) * 0.25 +
            F.col("tag_score") * 0.15
        ) * F.col("confidence"), 1
    )
)

# ------------------------------------------------------------
# FILTER, RANK, JOIN TAGS AND TOP PROF
# ------------------------------------------------------------

MIN_REVIEWS = 10

bird_filtered = bird_courses.filter(
    (F.col("total_reviews") >= MIN_REVIEWS) &
    (F.col("avg_difficulty").isNotNull()) &
    (F.col("avg_difficulty") > 0)
)

# Add overall rank
bird_ranked = bird_filtered.withColumn(
    "bird_rank", F.row_number().over(Window.orderBy(F.desc("bird_score")))
)

# Add department rank
bird_ranked = bird_ranked.withColumn(
    "dept_bird_rank", F.row_number().over(
        Window.partitionBy("department").orderBy(F.desc("bird_score"))
    )
)

# Join with top tags and top professor
bird_courses_final = bird_ranked.join(
    top_tags, "course_code", "left"
).join(
    top_profs, "course_code", "left"
)

# Final column selection
bird_courses_final = bird_courses_final.select(
    "bird_rank",
    "dept_bird_rank",
    "course_code",
    "department",
    "bird_score",
    "a_rate",
    "b_or_higher_rate",
    "avg_difficulty",
    "would_take_again_pct",
    "avg_quality",
    "total_reviews",
    "tag_score",
    "confidence",
    "top_tag_1",
    "top_tag_2",
    "top_tag_3",
    "top_professor_name",
    "top_professor_id",
    "top_professor_quality",
)

# ------------------------------------------------------------
# SAVE
# ------------------------------------------------------------

bird_courses_final.write \
    .format("delta") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .saveAsTable("prof_pulse.default.bird_courses_gold")

row_count = bird_courses_final.count()
print(f"✓ Saved bird_courses_gold: {row_count:,} courses")

# Preview top 20
print("\nTop 20 Bird Courses:")
bird_courses_final.orderBy("bird_rank").show(20, truncate=False)

# COMMAND ----------

from pyspark.sql.functions import count

bird_courses_final.groupBy("course_code") \
    .agg(count("*").alias("cnt")) \
    .filter("cnt > 1") \
    .show(truncate=False)


# COMMAND ----------

# MAGIC %skip
# MAGIC # Top 30 bird courses
# MAGIC display(spark.table("prof_pulse.default.bird_courses_gold").limit(30))

# COMMAND ----------

# DBTITLE 1,Gold Tables Validation
# Validate all gold tables exist and have data
print("=" * 60)
print("GOLD TABLE VALIDATION")
print("=" * 60)

gold_tables = [
    "course_metrics_gold",
    "course_professor_comparison_gold",
    "department_overview_gold",
    "course_trends_gold",
    "bird_courses_gold"
]

for table in gold_tables:
    try:
        count = spark.table(f"prof_pulse.default.{table}").count()
        if count == 0:
            print(f"{table}: EMPTY!")
        else:
            print(f"✓ {table}: {count:,} rows")
    except Exception as e:
        print(f"{table}: MISSING - {e}")

print("=" * 60)