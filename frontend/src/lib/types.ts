export interface Course {
  course_code: string;
  total_reviews: number;
  total_professors: number;
  avg_quality: number;
  avg_difficulty: number;
  would_take_again_pct: number;
  grade_distribution: string;
  trend: string;
  recent_avg_quality: number;
  recent_reviews: number;
  first_reviewed: string;
  last_reviewed: string;
}

export interface BirdCourse {
  bird_rank: number;
  dept_bird_rank: number;
  course_code: string;
  department: string;
  bird_score: number;
  a_rate: number;
  avg_difficulty: number;
  would_take_again_pct: number;
  avg_quality: number;
  b_or_higher_rate: number;
  total_reviews: number;
}

export interface CourseProfessor {
  course_code: string;
  professor_id: string;
  professor_name: string;
  department: string;
  section_reviews: number;
  prof_avg_quality: number;
  prof_avg_difficulty: number;
  prof_would_take_again_pct: number;
  quality_rank: number;
  popularity_rank: number;
  professors_teaching_course: number;
  most_recent_year: number;
  most_recent_review: string;
}

export interface Department {
  course_department: string;
  total_courses: number;
  total_professors: number;
  total_reviews: number;
  dept_avg_quality: number;
  dept_avg_difficulty: number;
  dept_would_take_again_pct: number;
  hardest_courses: string;
  easiest_courses: string;
  best_rated_courses: string;
}

export interface CourseTrend {
  course_code: string;
  year: number;
  review_count: number;
  avg_quality: number;
  avg_difficulty: number;
  would_take_again_pct: number;
  quality_delta: number;
  difficulty_delta: number;
  quality_trend: string;
  difficulty_trend: string;
}

export interface Review {
  review_id: string;
  professor_id: string;
  professor_name: string;
  course_code: string;
  comment: string;
  clarity_rating: number;
  helpful_rating: number;
  difficulty_rating: number;
  would_take_again: number | null;
  grade: string | null;
  date: string;
  year: number;
}

export interface BirdCourse {
  bird_rank: number;
  dept_bird_rank: number;
  course_code: string;
  department: string;
  bird_score: number;
  a_rate: number;
  b_or_higher_rate: number;
  avg_difficulty: number;
  would_take_again_pct: number;
  avg_quality: number;
  total_reviews: number;
  tag_score: number;
  confidence: number;
  top_tag_1: string | null;
  top_tag_2: string | null;
  top_tag_3: string | null;
  top_professor_name: string | null;
  top_professor_id: string | null;
  top_professor_quality: number | null;
}