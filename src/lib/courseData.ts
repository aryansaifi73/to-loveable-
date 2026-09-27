// Course data management
export interface CourseData {
  id: string;
  title: string;
  category: string;
  thumbnail?: string | undefined;
  demoLink?: string | undefined;
  price?: number | undefined;
  description?: string | undefined;
  instructor?: string | undefined;
}

// Default course data structure
export const defaultCourses: Record<string, CourseData[]> = {
  "Web Development": [
    { id: "web-1", title: "HTML & CSS Foundations", category: "Web Development" },
    { id: "web-2", title: "JavaScript from Zero", category: "Web Development" },
    { id: "web-3", title: "Responsive Web Design", category: "Web Development" },
    { id: "web-4", title: "Git & GitHub", category: "Web Development" },
    { id: "web-5", title: "React Essentials", category: "Web Development" },
    { id: "web-6", title: "Advanced React", category: "Web Development" },
    { id: "web-7", title: "TypeScript", category: "Web Development" },
    { id: "web-8", title: "Next.js Full Stack", category: "Web Development" },
    { id: "web-9", title: "Node.js & Express", category: "Web Development" },
    { id: "web-10", title: "MongoDB", category: "Web Development" },
    { id: "web-11", title: "SQL for Developers", category: "Web Development" },
    { id: "web-12", title: "REST API Development", category: "Web Development" },
    { id: "web-13", title: "Authentication & Security", category: "Web Development" },
    { id: "web-14", title: "Web Performance", category: "Web Development" },
    { id: "web-15", title: "Full Stack Capstone", category: "Web Development" },
  ],
  "AI & ML": [
    { id: "ai-1", title: "Python for AI", category: "AI & ML" },
    { id: "ai-2", title: "Machine Learning Basics", category: "AI & ML" },
    { id: "ai-3", title: "Data Analysis with Pandas", category: "AI & ML" },
    { id: "ai-4", title: "Deep Learning", category: "AI & ML" },
    { id: "ai-5", title: "Natural Language Processing", category: "AI & ML" },
    { id: "ai-6", title: "Generative AI", category: "AI & ML" },
    { id: "ai-7", title: "Computer Vision", category: "AI & ML" },
    { id: "ai-8", title: "AI Project Lab", category: "AI & ML" },
  ],
  "Video Editing": [
    { id: "vid-1", title: "Editing Fundamentals", category: "Video Editing" },
    { id: "vid-2", title: "Premiere Pro", category: "Video Editing" },
    { id: "vid-3", title: "After Effects", category: "Video Editing" },
    { id: "vid-4", title: "DaVinci Resolve", category: "Video Editing" },
    { id: "vid-5", title: "Motion Graphics", category: "Video Editing" },
    { id: "vid-6", title: "Color Grading", category: "Video Editing" },
    { id: "vid-7", title: "Audio for Video", category: "Video Editing" },
    { id: "vid-8", title: "YouTube Editing Workflow", category: "Video Editing" },
  ],
  "AKTU Notes": [
    { id: "aktu-1", title: "Engineering Mathematics", category: "AKTU Notes" },
    { id: "aktu-2", title: "Engineering Physics", category: "AKTU Notes" },
    { id: "aktu-3", title: "Programming for Problem Solving", category: "AKTU Notes" },
    { id: "aktu-4", title: "Data Structures", category: "AKTU Notes" },
    { id: "aktu-5", title: "DBMS", category: "AKTU Notes" },
    { id: "aktu-6", title: "Operating Systems", category: "AKTU Notes" },
    { id: "aktu-7", title: "Computer Networks", category: "AKTU Notes" },
    { id: "aktu-8", title: "Software Engineering", category: "AKTU Notes" },
  ],
  "Other Courses": [],
};

const STORAGE_KEY = 'codefront_courses';

export function getCourses(): Record<string, CourseData[]> {
  if (typeof window === 'undefined') return defaultCourses;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Ensure all default categories exist
      for (const cat in defaultCourses) {
        if (!parsed[cat]) {
          parsed[cat] = defaultCourses[cat];
        }
      }
      return parsed;
    } catch {
      return defaultCourses;
    }
  }

  // Initialize with default data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCourses));
  return defaultCourses;
}

export function saveCourses(courses: Record<string, CourseData[]>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

export function updateCourse(courseId: string, updates: Partial<CourseData>): void {
  const courses = getCourses();

  for (const category in courses) {
    const list = courses[category];
    if (!list) continue;
    const courseIndex = list.findIndex(c => c.id === courseId);
    if (courseIndex !== -1 && list[courseIndex]) {
      list[courseIndex] = {
        ...list[courseIndex],
        ...updates,
      };
      saveCourses(courses);
      return;
    }
  }
}

export function getCourseById(courseId: string): CourseData | null {
  const courses = getCourses();

  for (const category in courses) {
    const list = courses[category];
    if (!list) continue;
    const course = list.find(c => c.id === courseId);
    if (course) return course;
  }

  return null;
}

export function addCourse(category: string, courseData: Omit<CourseData, 'id'>): string {
  const courses = getCourses();

  if (!courses[category]) {
    courses[category] = [];
  }

  // Generate unique ID
  const categoryPrefix = category.toLowerCase().replace(/[^a-z]+/g, '-').substring(0, 10);
  const timestamp = Date.now();
  const newId = `${categoryPrefix}-${timestamp}`;

  const newCourse: CourseData = {
    id: newId,
    ...courseData,
    category,
  };

  courses[category]?.push(newCourse);
  saveCourses(courses);

  return newId;
}

export function deleteCourse(courseId: string): boolean {
  const courses = getCourses();

  for (const category in courses) {
    const list = courses[category];
    if (!list) continue;
    const courseIndex = list.findIndex(c => c.id === courseId);
    if (courseIndex !== -1) {
      list.splice(courseIndex, 1);
      saveCourses(courses);
      return true;
    }
  }

  return false;
}
