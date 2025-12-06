import requests
import json
import time
from datetime import datetime

class TMUProfessorScraper:
    """GraphQL Scraper for TMU professors"""
    
    def __init__(self, school_id="U2Nob29sLTE0NzE="):
        self.school_id = school_id
        self.school_name = "Toronto Metropolitan University"
        self.headers = {
            'content-type': 'application/json',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
        self.base_url = 'https://www.ratemyprofessors.com/graphql'
    
    def get_all_professors(self):
        """Get all TMU professors"""
        all_professors = []
        has_next = True
        cursor = ""
        
        print("Fetching TMU professors...")
        
        while has_next:
            query = f"""
            query TeacherSearchQuery {{
              search: newSearch {{
                teachers(query: {{text: "", schoolID: "{self.school_id}", fallback: true}}, first: 100, after: "{cursor}") {{
                  edges {{
                    node {{
                      id
                      legacyId
                      firstName
                      lastName
                      avgRating
                      numRatings
                      wouldTakeAgainPercent
                      avgDifficulty
                      department
                    }}
                  }}
                  pageInfo {{
                    hasNextPage
                    endCursor
                  }}
                  resultCount
                }}
              }}
            }}
            """
            
            response = requests.post(self.base_url, headers=self.headers, json={'query': query})
            data = response.json()
            
            teachers = data['data']['search']['teachers']
            for edge in teachers['edges']:
                all_professors.append(edge['node'])
            
            page_info = teachers['pageInfo']
            has_next = page_info['hasNextPage']
            cursor = page_info['endCursor']
            
            result_count = teachers.get('resultCount', 0)
            print(f"  → {len(all_professors)}/{result_count} professors")
            
            time.sleep(1)
        
        print(f"  ✓ Found {len(all_professors)} professors\n")
        return all_professors
    
    def get_professor_reviews(self, teacher_id):
        """Get all reviews for a professor"""
        all_reviews = []
        has_next = True
        cursor = ""
        
        while has_next:
            query = f"""
            query RatingsQuery {{
              node(id: "{teacher_id}") {{
                ... on Teacher {{
                  ratings(first: 100, after: "{cursor}") {{
                    edges {{
                      node {{
                        id
                        comment
                        date
                        class
                        helpfulRating
                        clarityRating
                        difficultyRating
                        wouldTakeAgain
                        grade
                        isForOnlineClass
                        ratingTags
                      }}
                    }}
                    pageInfo {{
                      hasNextPage
                      endCursor
                    }}
                  }}
                }}
              }}
            }}
            """
            
            response = requests.post(self.base_url, headers=self.headers, json={'query': query})
            data = response.json()
            
            if not data.get('data') or not data['data'].get('node'):
                break
            
            ratings = data['data']['node']['ratings']
            for edge in ratings['edges']:
                all_reviews.append(edge['node'])
            
            page_info = ratings['pageInfo']
            has_next = page_info['hasNextPage']
            cursor = page_info['endCursor']
            
            time.sleep(0.5)
        
        return all_reviews
    
    def scrape_all(self, sample_size=None):
        """Scrape all professors and their reviews"""
        
        # Get professors
        professors = self.get_all_professors()
        
        if sample_size:
            professors = professors[:sample_size]
            print(f"Testing with {sample_size} professors\n")
        
        # Get reviews for each professor
        print("Fetching reviews...")
        for i, prof in enumerate(professors, 1):
            name = f"{prof['firstName']} {prof['lastName']}"
            num_ratings = prof['numRatings']
            dept = prof.get('department', 'Unknown')
            
            print(f"[{i}/{len(professors)}] {name} - {dept} ({num_ratings} reviews)")
            
            if num_ratings > 0:
                prof['reviews'] = self.get_professor_reviews(prof['id'])
                print(f"  ✓ Got {len(prof['reviews'])} reviews")
            else:
                prof['reviews'] = []
            
            time.sleep(1)
        
        # Build result
        result = {
            'metadata': {
                'school': self.school_name,
                'school_id': self.school_id,
                'scraped_at': datetime.now().isoformat(),
                'total_professors': len(professors),
                'total_reviews': sum(len(p['reviews']) for p in professors)
            },
            'professors': professors
        }
        
        return result


if __name__ == "__main__":
    print("=" * 60)
    print("TMU Professor Rating Scraper")
    print("=" * 60)
    print()
    
    scraper = TMUProfessorScraper()
    
    # There are 3951 Professors at TMU
    data = scraper.scrape_all(sample_size=3951)
    
    # Save
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"tmu_professors_{timestamp}.json"
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    # Summary
    print(f"\n{'=' * 60}")
    print("SCRAPE COMPLETE")
    print(f"{'=' * 60}")
    print(f"Professors: {data['metadata']['total_professors']}")
    print(f"Total Reviews: {data['metadata']['total_reviews']}")
    
    # Show department breakdown
    dept_counts = {}
    for prof in data['professors']:
        dept = prof.get('department', 'Unknown')
        dept_counts[dept] = dept_counts.get(dept, 0) + 1
    
    print(f"\nDepartment Breakdown:")
    for dept, count in sorted(dept_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {dept}: {count} professors")
    
    print(f"\nSaved to: {filename}")
