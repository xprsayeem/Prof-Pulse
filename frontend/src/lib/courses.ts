// TMU Course Code Mappings
// Source: TMU Course Codes and Faculty (2025-2026)
// 
// This maps course code PREFIXES (e.g. "CPS") to their official subject name
// and faculty. For specific course TITLES (e.g. "Philosophy and Death"),
// see liberals.ts which covers liberal studies courses only.

export interface CourseSubject {
  prefix: string;
  subject: string;
  faculty: string;
}

// Authoritative prefix → subject + faculty mapping
const COURSE_SUBJECTS: CourseSubject[] = [
  // Faculty of Arts
  { prefix: "ACS", subject: "Arts and Contemporary Studies", faculty: "Faculty of Arts" },
  { prefix: "ANT", subject: "Anthropology", faculty: "Faculty of Arts" },
  { prefix: "ARB", subject: "Arabic", faculty: "Faculty of Arts" },
  { prefix: "ASL", subject: "American Sign Language", faculty: "Faculty of Arts" },
  { prefix: "CAF", subject: "Writing Skills", faculty: "Faculty of Arts" },
  { prefix: "CHN", subject: "Chinese", faculty: "Faculty of Arts" },
  { prefix: "CHS", subject: "Chinese Studies", faculty: "Faculty of Arts" },
  { prefix: "CRB", subject: "Caribbean Studies", faculty: "Faculty of Arts" },
  { prefix: "CRM", subject: "Criminology", faculty: "Faculty of Arts" },
  { prefix: "ECN", subject: "Economics", faculty: "Faculty of Arts" },
  { prefix: "ENG", subject: "English", faculty: "Faculty of Arts" },
  { prefix: "EUS", subject: "Environment and Urban Sustainability", faculty: "Faculty of Arts" },
  { prefix: "FRE", subject: "French", faculty: "Faculty of Arts" },
  { prefix: "FRS", subject: "French Studies", faculty: "Faculty of Arts" },
  { prefix: "GEO", subject: "Geography", faculty: "Faculty of Arts" },
  { prefix: "GRK", subject: "Greek", faculty: "Faculty of Arts" },
  { prefix: "HAU", subject: "Haudenosaunee", faculty: "Faculty of Arts" },
  { prefix: "HIS", subject: "History", faculty: "Faculty of Arts" },
  { prefix: "HST", subject: "History", faculty: "Faculty of Arts" },
  { prefix: "INP", subject: "Nonprofit", faculty: "Faculty of Arts" },
  { prefix: "INT", subject: "Interdisciplinary Studies", faculty: "Faculty of Arts" },
  { prefix: "LAT", subject: "Latin", faculty: "Faculty of Arts" },
  { prefix: "LIR", subject: "Language and Intercultural Relations", faculty: "Faculty of Arts" },
  { prefix: "LNG", subject: "Language", faculty: "Faculty of Arts" },
  { prefix: "MHK", subject: "Mohawk", faculty: "Faculty of Arts" },
  { prefix: "MUS", subject: "Music", faculty: "Faculty of Arts" },
  { prefix: "PAI", subject: "Public Administration and Indigenous Governance", faculty: "Faculty of Arts" },
  { prefix: "PHL", subject: "Philosophy", faculty: "Faculty of Arts" },
  { prefix: "POG", subject: "Politics and Public Administration", faculty: "Faculty of Arts" },
  { prefix: "POL", subject: "Politics and Public Administration", faculty: "Faculty of Arts" },
  { prefix: "PPA", subject: "Politics and Public Administration", faculty: "Faculty of Arts" },
  { prefix: "PSY", subject: "Psychology", faculty: "Faculty of Arts" },
  { prefix: "REL", subject: "Religious Studies", faculty: "Faculty of Arts" },
  { prefix: "SEM", subject: "Semiotics", faculty: "Faculty of Arts" },
  { prefix: "SOC", subject: "Sociology", faculty: "Faculty of Arts" },
  { prefix: "SPN", subject: "Spanish", faculty: "Faculty of Arts" },
  { prefix: "SPS", subject: "Spanish Studies", faculty: "Faculty of Arts" },
  { prefix: "SSH", subject: "Social Science and Humanities", faculty: "Faculty of Arts" },

  // Faculty of Community Services
  { prefix: "CLD", subject: "Early Childhood Studies", faculty: "Faculty of Community Services" },
  { prefix: "CYC", subject: "Child and Youth Care", faculty: "Faculty of Community Services" },
  { prefix: "DST", subject: "Disability Studies", faculty: "Faculty of Community Services" },
  { prefix: "ENH", subject: "Environmental Health", faculty: "Faculty of Community Services" },
  { prefix: "FCS", subject: "Fundamentals of Community Service", faculty: "Faculty of Community Services" },
  { prefix: "FND", subject: "Nutrition and Food", faculty: "Faculty of Community Services" },
  { prefix: "FNF", subject: "Family Studies", faculty: "Faculty of Community Services" },
  { prefix: "FNN", subject: "Nutrition and Food", faculty: "Faculty of Community Services" },
  { prefix: "FNP", subject: "Nutrition and Food", faculty: "Faculty of Community Services" },
  { prefix: "FNR", subject: "Nutrition and Food", faculty: "Faculty of Community Services" },
  { prefix: "FNS", subject: "Nutrition and Food", faculty: "Faculty of Community Services" },
  { prefix: "FNU", subject: "Nutrition and Food", faculty: "Faculty of Community Services" },
  { prefix: "FNY", subject: "Food Security", faculty: "Faculty of Community Services" },
  { prefix: "GER", subject: "Gerontology", faculty: "Faculty of Community Services" },
  { prefix: "MWF", subject: "Midwifery", faculty: "Faculty of Community Services" },
  { prefix: "NCL", subject: "Nursing", faculty: "Faculty of Community Services" },
  { prefix: "NSE", subject: "Nursing", faculty: "Faculty of Community Services" },
  { prefix: "NUC", subject: "Nursing", faculty: "Faculty of Community Services" },
  { prefix: "NUR", subject: "Nursing", faculty: "Faculty of Community Services" },
  { prefix: "OHS", subject: "Occupational Health", faculty: "Faculty of Community Services" },
  { prefix: "PAT", subject: "Pathotherapeutics", faculty: "Faculty of Community Services" },
  { prefix: "PLE", subject: "Planning", faculty: "Faculty of Community Services" },
  { prefix: "PLG", subject: "Planning", faculty: "Faculty of Community Services" },
  { prefix: "PLX", subject: "Planning", faculty: "Faculty of Community Services" },
  { prefix: "POH", subject: "Public Health and Occupational Health", faculty: "Faculty of Community Services" },
  { prefix: "PPN", subject: "Professional Practice - Nursing", faculty: "Faculty of Community Services" },
  { prefix: "PUB", subject: "Public Health", faculty: "Faculty of Community Services" },
  { prefix: "SWP", subject: "Social Work", faculty: "Faculty of Community Services" },

  // Faculty of Engineering and Architectural Science
  { prefix: "AER", subject: "Aerospace", faculty: "Faculty of Engineering and Architectural Science" },
  { prefix: "ARC", subject: "Architectural Science", faculty: "Faculty of Engineering and Architectural Science" },
  { prefix: "ASC", subject: "Architectural Science", faculty: "Faculty of Engineering and Architectural Science" },
  { prefix: "BME", subject: "Biomedical Engineering", faculty: "Faculty of Engineering and Architectural Science" },
  { prefix: "BSC", subject: "Building Science", faculty: "Faculty of Engineering and Architectural Science" },
  { prefix: "CEN", subject: "Common Engineering", faculty: "Faculty of Engineering and Architectural Science" },
  { prefix: "CHE", subject: "Chemical Engineering", faculty: "Faculty of Engineering and Architectural Science" },
  { prefix: "COE", subject: "Computer Engineering", faculty: "Faculty of Engineering and Architectural Science" },
  { prefix: "CVL", subject: "Civil Engineering", faculty: "Faculty of Engineering and Architectural Science" },
  { prefix: "EES", subject: "Electrical Engineering", faculty: "Faculty of Engineering and Architectural Science" },
  { prefix: "EIE", subject: "Engineering Innovation and Entrepreneurship", faculty: "Faculty of Engineering and Architectural Science" },
  { prefix: "ELE", subject: "Electrical Engineering", faculty: "Faculty of Engineering and Architectural Science" },
  { prefix: "EMS", subject: "Engineering Management Science", faculty: "Faculty of Engineering and Architectural Science" },
  { prefix: "IND", subject: "Industrial Engineering", faculty: "Faculty of Engineering and Architectural Science" },
  { prefix: "MEC", subject: "Mechanical Engineering", faculty: "Faculty of Engineering and Architectural Science" },
  { prefix: "MTE", subject: "Mechatronics", faculty: "Faculty of Engineering and Architectural Science" },
  { prefix: "MTL", subject: "Mechanical Engineering", faculty: "Faculty of Engineering and Architectural Science" },
  { prefix: "PMT", subject: "Project Management", faculty: "Faculty of Engineering and Architectural Science" },
  { prefix: "TEC", subject: "Technology Studies", faculty: "Faculty of Engineering and Architectural Science" },

  // Faculty of Science
  { prefix: "BCH", subject: "Biochemistry", faculty: "Faculty of Science" },
  { prefix: "BLG", subject: "Biology", faculty: "Faculty of Science" },
  { prefix: "BMS", subject: "Biomedical Science", faculty: "Faculty of Science" },
  { prefix: "CHY", subject: "Chemistry", faculty: "Faculty of Science" },
  { prefix: "CPS", subject: "Computer Science", faculty: "Faculty of Science" },
  { prefix: "MTH", subject: "Mathematics", faculty: "Faculty of Science" },
  { prefix: "PCS", subject: "Physics", faculty: "Faculty of Science" },
  { prefix: "PLN", subject: "Physiology", faculty: "Faculty of Science" },
  { prefix: "SCI", subject: "Science", faculty: "Faculty of Science" },

  // Ted Rogers School of Management
  { prefix: "ACC", subject: "Accounting", faculty: "Ted Rogers School of Management" },
  { prefix: "AFA", subject: "Accounting", faculty: "Ted Rogers School of Management" },
  { prefix: "AFF", subject: "Finance", faculty: "Ted Rogers School of Management" },
  { prefix: "BSM", subject: "Business Essentials", faculty: "Ted Rogers School of Management" },
  { prefix: "BUS", subject: "Business", faculty: "Ted Rogers School of Management" },
  { prefix: "ENT", subject: "Entrepreneurship and Strategy", faculty: "Ted Rogers School of Management" },
  { prefix: "FIN", subject: "Finance", faculty: "Ted Rogers School of Management" },
  { prefix: "FMG", subject: "Foundations of Management", faculty: "Ted Rogers School of Management" },
  { prefix: "GMS", subject: "Global Management Studies", faculty: "Ted Rogers School of Management" },
  { prefix: "HIM", subject: "Health Information Management", faculty: "Ted Rogers School of Management" },
  { prefix: "HSM", subject: "Health Services Management", faculty: "Ted Rogers School of Management" },
  { prefix: "HTA", subject: "Hospitality and Tourism Management", faculty: "Ted Rogers School of Management" },
  { prefix: "HTD", subject: "Hospitality and Tourism Management", faculty: "Ted Rogers School of Management" },
  { prefix: "HTF", subject: "Hospitality and Tourism Management", faculty: "Ted Rogers School of Management" },
  { prefix: "HTH", subject: "Hospitality and Tourism Management", faculty: "Ted Rogers School of Management" },
  { prefix: "HTI", subject: "Hospitality and Tourism Management", faculty: "Ted Rogers School of Management" },
  { prefix: "HTM", subject: "Hospitality and Tourism Management", faculty: "Ted Rogers School of Management" },
  { prefix: "HTR", subject: "Hospitality and Tourism Management", faculty: "Ted Rogers School of Management" },
  { prefix: "HTT", subject: "Hospitality and Tourism Management", faculty: "Ted Rogers School of Management" },
  { prefix: "ITM", subject: "Information Technology Management", faculty: "Ted Rogers School of Management" },
  { prefix: "LAW", subject: "Law", faculty: "Ted Rogers School of Management" },
  { prefix: "MHR", subject: "Human Resources", faculty: "Ted Rogers School of Management" },
  { prefix: "MKT", subject: "Marketing", faculty: "Ted Rogers School of Management" },
  { prefix: "QMS", subject: "Quantitative Methods", faculty: "Ted Rogers School of Management" },
  { prefix: "REM", subject: "Real Estate Management", faculty: "Ted Rogers School of Management" },
  { prefix: "RMG", subject: "Retail Management", faculty: "Ted Rogers School of Management" },

  // The Creative School
  { prefix: "BPM", subject: "Professional Music", faculty: "The Creative School" },
  { prefix: "CMN", subject: "Communication", faculty: "The Creative School" },
  { prefix: "CRI", subject: "Creative Industries", faculty: "The Creative School" },
  { prefix: "CSE", subject: "Creative School Experience", faculty: "The Creative School" },
  { prefix: "EID", subject: "Digital Entrepreneurship and Innovation", faculty: "The Creative School" },
  { prefix: "FCD", subject: "Communication and Design", faculty: "The Creative School" },
  { prefix: "FDL", subject: "Fashion - Design Leadership", faculty: "The Creative School" },
  { prefix: "FFC", subject: "Fashion", faculty: "The Creative School" },
  { prefix: "FFD", subject: "Fashion", faculty: "The Creative School" },
  { prefix: "FFS", subject: "Fashion - Fashion Studies", faculty: "The Creative School" },
  { prefix: "FMF", subject: "Fashion - Material and Fabrication", faculty: "The Creative School" },
  { prefix: "FPN", subject: "Media Studies", faculty: "The Creative School" },
  { prefix: "FSN", subject: "Fashion", faculty: "The Creative School" },
  { prefix: "GCM", subject: "Graphic Communication", faculty: "The Creative School" },
  { prefix: "IDE", subject: "Interior Design", faculty: "The Creative School" },
  { prefix: "IDF", subject: "Interior Design", faculty: "The Creative School" },
  { prefix: "IRC", subject: "Interior Design", faculty: "The Creative School" },
  { prefix: "IRD", subject: "Interior Design", faculty: "The Creative School" },
  { prefix: "IRH", subject: "Interior Design", faculty: "The Creative School" },
  { prefix: "IRL", subject: "Interior Design", faculty: "The Creative School" },
  { prefix: "IRN", subject: "Interior Design", faculty: "The Creative School" },
  { prefix: "IRP", subject: "Interior Design", faculty: "The Creative School" },
  { prefix: "IRT", subject: "Interior Design", faculty: "The Creative School" },
  { prefix: "JRN", subject: "Journalism", faculty: "The Creative School" },
  { prefix: "MPC", subject: "Combined Media", faculty: "The Creative School" },
  { prefix: "MPF", subject: "Film Studies", faculty: "The Creative School" },
  { prefix: "MPI", subject: "Interactive Media Arts", faculty: "The Creative School" },
  { prefix: "MPS", subject: "Photography", faculty: "The Creative School" },
  { prefix: "NMA", subject: "New Media", faculty: "The Creative School" },
  { prefix: "NNS", subject: "Journalism", faculty: "The Creative School" },
  { prefix: "NPF", subject: "Media Studies", faculty: "The Creative School" },
  { prefix: "PFA", subject: "Performance", faculty: "The Creative School" },
  { prefix: "PFC", subject: "Performance", faculty: "The Creative School" },
  { prefix: "PFD", subject: "Performance", faculty: "The Creative School" },
  { prefix: "PFZ", subject: "Performance", faculty: "The Creative School" },
  { prefix: "RTA", subject: "Media", faculty: "The Creative School" },
  { prefix: "THA", subject: "Theatre", faculty: "The Creative School" },
  { prefix: "THD", subject: "Theatre", faculty: "The Creative School" },
  { prefix: "THF", subject: "Theatre", faculty: "The Creative School" },
  { prefix: "THG", subject: "Theatre", faculty: "The Creative School" },
  { prefix: "THL", subject: "Theatre", faculty: "The Creative School" },
  { prefix: "THM", subject: "Theatre", faculty: "The Creative School" },
  { prefix: "THP", subject: "Theatre", faculty: "The Creative School" },
  { prefix: "THT", subject: "Theatre", faculty: "The Creative School" },
  { prefix: "ZON", subject: "Zone", faculty: "The Creative School" },
];

// Build lookup maps
const subjectMap = new Map<string, CourseSubject>(
  COURSE_SUBJECTS.map((s) => [s.prefix, s])
);

/** Extract the letter prefix from a course code (e.g., "CPS412" → "CPS") */
export function getCoursePrefix(courseCode: string): string {
  const match = courseCode.match(/^([A-Z]{2,4})/);
  return match ? match[1] : courseCode;
}

/** Get subject name for a course code (e.g., "CPS412" → "Computer Science") */
export function getSubjectName(courseCode: string): string {
  const prefix = getCoursePrefix(courseCode);
  return subjectMap.get(prefix)?.subject ?? prefix;
}

/** Get faculty for a course code (e.g., "CPS412" → "Faculty of Science") */
export function getFaculty(courseCode: string): string {
  const prefix = getCoursePrefix(courseCode);
  return subjectMap.get(prefix)?.faculty ?? "Unknown";
}

/** Get both subject and faculty */
export function getCourseInfo(courseCode: string): { subject: string; faculty: string } {
  const prefix = getCoursePrefix(courseCode);
  const entry = subjectMap.get(prefix);
  return {
    subject: entry?.subject ?? prefix,
    faculty: entry?.faculty ?? "Unknown",
  };
}

/** Get all unique faculty names */
export function getAllFaculties(): string[] {
  return [...new Set(COURSE_SUBJECTS.map((s) => s.faculty))].sort();
}

/** Get all unique subject names */
export function getAllSubjects(): string[] {
  return [...new Set(COURSE_SUBJECTS.map((s) => s.subject))].sort();
}