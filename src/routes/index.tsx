import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  Code2,
  GraduationCap,
  Linkedin,
  LogIn,
  LogOut,
  Menu,
  MonitorPlay,
  NotebookTabs,
  Play,
  Sparkles,
  Video,
  Youtube,
  ExternalLink,
  Eye,
  IndianRupee,
  Settings,
  Search,
  X,
  Check,
  BookMarked,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getCourses, type CourseData } from "@/lib/courseData";
import { isAuthenticated as isAdminAuthenticated } from "@/lib/adminAuth";
import { getCurrentUser, logoutUser, enrollCourse, isEnrolled, type User } from "@/lib/userAuth";
import { AuthModal } from "@/components/AuthModal";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CodeFront Academy | Learn. Build. Ship." },
      { name: "description", content: "Explore practical courses in web development, AI/ML, video editing, AKTU notes, and other curated tracks." },
      { property: "og:title", content: "CodeFront Academy | Learn. Build. Ship." },
      { property: "og:description", content: "Practical courses with free demo content in every subject." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const nav = ["Home", "Courses", "Demos", "Community"];

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2 font-bold">
      <span className="flex size-8 items-center justify-center rounded-md bg-primary">
        <Code2 className="size-5" />
      </span>
      <span>CodeFront<span className="text-primary">.</span></span>
    </a>
  );
}

function NavLinks({
  mobile = false,
  onSelectCategory,
}: {
  mobile?: boolean;
  onSelectCategory?: (cat: Category) => void;
}) {
  const user = getCurrentUser();

  const handleNavClick = (e: React.MouseEvent, item: string) => {
    if (item === "My Courses" && onSelectCategory) {
      e.preventDefault();
      onSelectCategory("My Courses");
      const el = document.getElementById("courses");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = user ? [...nav, "My Courses"] : nav;

  return (
    <nav className={mobile ? "flex flex-col gap-3 pt-6" : "hidden items-center gap-1 rounded-full border border-border bg-secondary/70 p-1 md:flex"}>
      {navItems.map((item, i) => (
        <a
          key={item}
          href={
            item === "Home"
              ? "#top"
              : item === "Courses"
              ? "#courses"
              : item === "Demos"
              ? "#demos"
              : item === "Community"
              ? "#community"
              : "#courses"
          }
          onClick={(e) => handleNavClick(e, item)}
          className={`${
            mobile ? "rounded-md px-4 py-3 text-lg" : "rounded-full px-5 py-2 text-sm"
          } font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${
            i === 0 ? "bg-primary text-primary-foreground" : ""
          } ${item === "My Courses" ? "text-primary font-bold" : ""}`}
        >
          {item}
        </a>
      ))}
    </nav>
  );
}

function AdminButton() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(isAdminAuthenticated());
  }, []);

  if (!isAdmin) return null;

  return (
    <Link to="/admin">
      <Button variant="outline" size="sm" className="gap-2">
        <Settings className="size-4" />
        Admin
      </Button>
    </Link>
  );
}

function UserProfileHeader({ onMyCoursesClick }: { onMyCoursesClick?: () => void }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    logoutUser();
    toast.success("Logged out successfully");
    setUser(null);
    window.location.reload();
  };

  if (!user) {
    return (
      <AuthModal
        trigger={
          <Button variant="hero" className="rounded-full gap-2">
            <LogIn className="size-4" /> Login
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onMyCoursesClick}
        className="hidden sm:flex items-center gap-2 rounded-full border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
      >
        <BookMarked className="size-4" />
        <span>My Courses</span>
        <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
          {user.enrolledCourses.length}
        </span>
      </Button>

      <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/60 p-1 pl-2.5">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="size-7 rounded-full object-cover border border-border shrink-0"
          />
        ) : (
          <div className="size-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden md:inline text-xs font-semibold text-foreground max-w-[100px] truncate">
          {user.name}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="size-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title="Logout"
        >
          <LogOut className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function Terminal() {
  return (
    <div className="terminal-glow overflow-hidden rounded-[1.3rem] border-4 border-muted bg-secondary p-2">
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <div className="flex h-12 items-center border-b border-border px-4">
          <span className="mr-2 size-3 rounded-full bg-danger" />
          <span className="mr-2 size-3 rounded-full bg-yellow-400" />
          <span className="size-3 rounded-full bg-lime" />
          <span className="ml-5 text-sm">community.cpp</span>
          <span className="ml-auto flex items-center gap-2 text-xs text-lime">
            <span className="size-2 rounded-full bg-lime" /> Live coding
          </span>
        </div>
        <pre className="h-[370px] overflow-hidden p-5 font-mono text-[12px] leading-8 text-cyan sm:text-sm">
          <code>
            <span className="text-muted-foreground">01</span>   chooseYourPath();
            <br />
            <span className="text-muted-foreground">02</span>   previewDemoLesson();
            <br />
            <br />
            <span className="text-muted-foreground">04</span>   <span className="text-primary">const</span> learningLibrary = &#123;
            <br />
            <span className="text-muted-foreground">05</span>     tracks: <span className="text-foreground">6</span>,
            <br />
            <span className="text-muted-foreground">06</span>     courses: <span className="text-foreground">30+</span>,
            <br />
            <span className="text-muted-foreground">07</span>     demoAccess: <span className="text-lime">true</span>,
            <br />
            <span className="text-muted-foreground">08</span>   &#125;;
            <br />
            <br />
            <span className="text-lime">// learn one skill at a time.</span>
            <span className="caret-blink ml-1 inline-block h-4 w-2 bg-primary" />
          </code>
        </pre>
      </div>
    </div>
  );
}

const stats = [
  ["6", "Learning tracks", GraduationCap],
  ["30+", "Courses", BookOpen],
  ["100%", "Demo access", MonitorPlay],
] as const;

type Category = "My Courses" | "Web Development" | "AI & ML" | "Video Editing" | "AKTU Notes" | "Other Courses";

const categoryMeta: Record<Category, { icon: typeof Code2; label: string; copy: string }> = {
  "My Courses": {
    icon: BookMarked,
    label: "Enrolled courses",
    copy: "Access all the courses and study materials you have enrolled in.",
  },
  "Web Development": {
    icon: Code2,
    label: "Frontend & backend",
    copy: "Frontend, backend, tools, and complete production projects.",
  },
  "AI & ML": {
    icon: BrainCircuit,
    label: "AI & Machine Learning",
    copy: "Python, machine learning, generative AI, and practical labs.",
  },
  "Video Editing": {
    icon: Video,
    label: "Video Editing",
    copy: "Editing, motion, color, sound, and creator workflows.",
  },
  "AKTU Notes": {
    icon: NotebookTabs,
    label: "AKTU Prep & Notes",
    copy: "Unit-wise notes, revision material, and exam preparation.",
  },
  "Other Courses": {
    icon: Sparkles,
    label: "Special & Other Tracks",
    copy: "Additional curated courses, special masterclasses, and community content.",
  },
};

function formatExternalUrl(url?: string): string {
  if (!url) return "#";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function GlobalSearch({ onSelectCourse }: { onSelectCourse?: (course: CourseData) => void }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [allCourses, setAllCourses] = useState<CourseData[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rawData = getCourses();
    const list: CourseData[] = [];
    Object.values(rawData).forEach((courses) => {
      list.push(...courses);
    });
    setAllCourses(list);
  }, []);

  // Filter and rank search results
  const results =
    query.trim().length > 0
      ? allCourses
          .filter((course) => {
            const q = query.toLowerCase().trim();
            const title = course.title.toLowerCase();
            const cat = course.category.toLowerCase();
            const desc = (course.description || "").toLowerCase();

            // Exact or phrase match
            if (title.includes(q) || cat.includes(q) || desc.includes(q)) return true;

            // Word token match
            const tokens = q.split(/\s+/).filter((t) => t.length > 1);
            return tokens.some((t) => title.includes(t) || cat.includes(t) || desc.includes(t));
          })
          .slice(0, 6)
      : [];

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (course: CourseData) => {
    setIsFocused(false);
    setQuery("");
    if (onSelectCourse) {
      onSelectCourse(course);
    } else {
      const el = document.getElementById(`course-${course.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-primary");
        setTimeout(() => el.classList.remove("ring-2", "ring-primary"), 2000);
      } else {
        const coursesSection = document.getElementById("courses");
        coursesSection?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative flex items-center">
        <Search className="absolute left-4 size-5 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search courses, e.g. 'video editing', 'python', 'aktu'..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="h-13 pl-12 pr-10 rounded-full border-2 border-border bg-card/90 backdrop-blur text-base shadow-lg focus-visible:ring-primary focus-visible:border-primary"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-4 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Live Suggestions Dropdown */}
      {isFocused && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-border bg-popover/95 backdrop-blur-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2 border-b border-border bg-muted/40 flex items-center justify-between text-xs text-muted-foreground px-3">
            <span>Matching courses ({results.length})</span>
            <span>Click to view</span>
          </div>

          {results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {results.map((course) => (
                <div
                  key={course.id}
                  onClick={() => handleSelect(course)}
                  className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors"
                >
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="size-12 rounded object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="size-12 rounded bg-muted flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                      <Code2 className="size-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground truncate">{course.title}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                        {course.category}
                      </span>
                      {course.price ? (
                        <span className="font-bold text-primary flex items-center">
                          <IndianRupee className="size-3" />
                          {course.price}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  {course.demoLink && (
                    <a
                      href={formatExternalUrl(course.demoLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 p-2 rounded-md hover:bg-primary/20 text-primary text-xs font-semibold flex items-center gap-1"
                    >
                      <Play className="size-3 fill-current" /> Demo
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No courses found for <span className="font-semibold text-foreground">"{query}"</span>.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CourseCard({
  course,
  index,
  category,
  onEnrollSuccess,
}: {
  course: CourseData;
  index: number;
  category: Category;
  onEnrollSuccess?: () => void;
}) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const isNotes = category === "AKTU Notes";
  const desc =
    course.description ||
    (isNotes
      ? "Concise notes, important questions, and revision resources."
      : "Concept lessons, guided practice, and a practical assignment.");

  useEffect(() => {
    setEnrolled(isEnrolled(course.id));
  }, [course.id]);

  const [isPaying, setIsPaying] = useState(false);

  // For locking body scroll when modal is open
  useEffect(() => {
    if (isDetailOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDetailOpen]);

  const handleEnrollClick = async () => {
    const user = getCurrentUser();
    if (!user) {
      toast.error("Please login first to enroll in courses!");
      return;
    }

    if (isPaying) return;
    setIsPaying(true);

    try {
      const success = await enrollCourse(course.id);
      if (success) {
        setEnrolled(true);
        if (onEnrollSuccess) onEnrollSuccess();
      }
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <>
      <article
        id={`course-${course.id}`}
        className="flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-colors hover:border-primary/50 shadow-sm"
      >
        {/* Course Card Top: Mobile Layout vs Desktop Layout */}
        <div className="flex md:flex-col items-stretch gap-3 md:gap-0 p-3 md:p-0">
          {/* Thumbnail */}
          {course.thumbnail ? (
            <div className="shrink-0 w-24 md:w-full min-h-[92px] md:h-44 rounded-lg md:rounded-none md:border-b overflow-hidden bg-muted border border-border/50 md:border-none">
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="shrink-0 w-24 md:w-full min-h-[92px] md:h-44 rounded-lg md:rounded-none md:border-b bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center border border-primary/20 md:border-none">
              <span className="text-2xl md:text-3xl font-extrabold text-primary">{String(index + 1).padStart(2, "0")}</span>
            </div>
          )}

          {/* Content area */}
          <div className="flex flex-col flex-1 min-w-0 py-0.5 md:p-5">
            <div className="hidden md:flex items-start justify-between gap-4 mb-3">
              <span className="font-mono text-xs font-bold text-primary">{String(index + 1).padStart(2, "0")}</span>
              <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                {enrolled ? "Enrolled ✓" : isNotes ? "Semester ready" : "Self paced"}
              </span>
            </div>

            <div className="md:hidden flex items-center gap-1.5 flex-wrap mb-1">
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wide">
                {course.category}
              </span>
              {enrolled ? (
                <span className="text-[10px] text-emerald-500 font-bold">Enrolled ✓</span>
              ) : isNotes ? (
                <span className="text-[10px] text-muted-foreground font-medium">Semester ready</span>
              ) : null}
            </div>

            <h3 className="text-sm md:text-lg font-bold leading-snug md:leading-6 line-clamp-2 text-foreground mb-1">
              {course.title}
            </h3>
            <p className="text-[11px] md:text-sm leading-tight md:leading-6 text-muted-foreground line-clamp-2 md:line-clamp-3 overflow-hidden text-ellipsis">
              {desc}
            </p>
          </div>
        </div>

        {/* 3 Buttons Area */}
        <div className="p-3 pt-0 md:p-5 md:pt-0 mt-auto flex flex-col gap-2">
          {/* 1. Buy Course / Enrolled button */}
          {enrolled ? (
            <Button
              onClick={() => setIsDetailOpen(true)}
              className="w-full font-bold shadow-sm bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 justify-center h-9 md:h-11 md:text-base text-sm"
            >
              <Check className="size-4 stroke-[3]" /> Enrolled • View Content
            </Button>
          ) : getCurrentUser() ? (
            <Button
              onClick={handleEnrollClick}
              disabled={isPaying}
              className="w-full font-bold shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground gap-1 justify-center h-9 md:h-11 md:text-base text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {course.price !== undefined && course.price !== null ? (
                <>
                  Buy Course <IndianRupee className="size-3 md:size-4" />
                  {course.price}
                </>
              ) : (
                "Enroll Now"
              )}
            </Button>
          ) : (
            <AuthModal
              trigger={
                <Button className="w-full font-bold shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground gap-1 justify-center h-9 md:h-11 md:text-base text-sm">
                  {course.price !== undefined && course.price !== null ? (
                    <>
                      Buy Course <IndianRupee className="size-3 md:size-4" />
                      {course.price}
                    </>
                  ) : (
                    "Enroll Now"
                  )}
                </Button>
              }
            />
          )}

          <div className="grid grid-cols-2 gap-2">
            {/* 2. View Details */}
            <Button
              variant="outline"
              onClick={() => setIsDetailOpen(true)}
              className="w-full font-semibold border-border bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center gap-1 h-8 md:h-10 md:text-sm text-xs"
            >
              <Eye className="size-3.5 md:size-4 shrink-0 text-primary" />
              <span>View Details</span>
            </Button>

            {/* 3. Demo Content */}
            {course.demoLink ? (
              <a href={formatExternalUrl(course.demoLink)} target="_blank" rel="noopener noreferrer" className="w-full h-full block">
                <Button
                  variant="outline"
                  className="w-full font-semibold border-primary/30 text-primary hover:bg-primary/10 flex items-center justify-center gap-1 h-8 md:h-10 md:text-sm text-xs w-full"
                >
                  <Play className="size-3 shrink-0 fill-current" />
                  <span>Demo Content</span>
                </Button>
              </a>
            ) : (
              <Button
                variant="outline"
                className="w-full font-semibold opacity-50 cursor-not-allowed h-8 md:h-10 md:text-sm text-xs"
                disabled
              >
                <Play className="size-3 shrink-0" />
                <span>Demo Content</span>
              </Button>
            )}
          </div>
        </div>
      </article>

      {/* Full Screen Course Details Modal / Overlay */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          {/* Sticky Top Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 sm:px-8 backdrop-blur-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDetailOpen(false)}
              className="flex items-center gap-2 text-sm font-semibold hover:bg-secondary"
            >
              <ArrowRight className="size-4 rotate-180" />
              <span className="hidden sm:inline">Back to Courses</span>
              <span className="sm:hidden">Back</span>
            </Button>

            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary uppercase tracking-wide">
                {course.category}
              </span>
              {enrolled && (
                <span className="rounded bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-500">
                  Enrolled ✓
                </span>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDetailOpen(false)}
              className="rounded-full size-9 hover:bg-secondary text-muted-foreground hover:text-foreground"
              aria-label="Close modal"
            >
              <X className="size-5" />
            </Button>
          </header>

          {/* Main Content Container */}
          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left / Main Column */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      {course.category}
                    </span>
                    <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {isNotes ? "Semester Ready" : "Self-Paced Learning"}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                    {course.title}
                  </h1>

                  {/* Instructor / Owner Info */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/70 w-max pr-8 mt-4">
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                      👨‍🏫
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Instructor / Owner</p>
                      <p className="text-sm font-bold text-foreground">
                        {course.instructor || "CodeFront Academy"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="space-y-3 pt-4">
                  <h2 className="text-xl font-bold text-foreground">Course Overview</h2>
                  <div className="rounded-xl border border-border bg-card p-5 sm:p-6 text-sm sm:text-base leading-relaxed text-foreground/90 whitespace-pre-line break-words shadow-sm">
                    {course.description || desc}
                  </div>
                </div>

                {/* What's Included / Highlights */}
                <div className="space-y-3 pb-8">
                  <h2 className="text-xl font-bold text-foreground">What's Included</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 rounded-lg border border-border/80 bg-card p-4 shadow-sm">
                      <div className="mt-0.5 size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Check className="size-3.5 stroke-[3]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Affordable Courses</p>
                        <p className="text-xs text-muted-foreground">Learn premium skills at lower prices.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-border/80 bg-card p-4 shadow-sm">
                      <div className="mt-0.5 size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Check className="size-3.5 stroke-[3]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Easy Access</p>
                        <p className="text-xs text-muted-foreground">Study anytime, on any device.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-border/80 bg-card p-4 shadow-sm">
                      <div className="mt-0.5 size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Check className="size-3.5 stroke-[3]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Lifetime Access</p>
                        <p className="text-xs text-muted-foreground">Keep access to your purchased materials.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-border/80 bg-card p-4 shadow-sm">
                      <div className="mt-0.5 size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Check className="size-3.5 stroke-[3]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Multiple Learning Formats</p>
                        <p className="text-xs text-muted-foreground">Videos, PDFs, resources & more.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right / Pricing Sidebar */}
              <div className="lg:col-span-5 relative">
                <div className="lg:sticky lg:top-24 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xl space-y-5 sm:space-y-6">
                  {/* Thumbnail Preview */}
                  {course.thumbnail ? (
                    <div className="w-full h-52 sm:h-64 overflow-hidden rounded-xl bg-muted border border-border">
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-52 sm:h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-xl flex items-center justify-center border border-primary/20">
                      <span className="text-5xl font-black text-primary">#{String(index + 1).padStart(2, "0")}</span>
                    </div>
                  )}

                  {/* Price section */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Price</p>
                    <div className="flex flex-wrap items-baseline gap-2">
                      {course.price !== undefined && course.price !== null ? (
                        <span className="text-3xl sm:text-4xl font-extrabold text-foreground flex items-center">
                          <IndianRupee className="size-6 sm:size-7" />
                          {course.price}
                        </span>
                      ) : (
                        <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
                          Free Enrollment
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground font-medium block w-full sm:w-auto mt-1 sm:mt-0">
                        • One-time payment
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-2">
                    {enrolled ? (
                      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center">
                        <p className="text-sm font-bold text-emerald-500 flex items-center justify-center gap-2">
                          <Check className="size-5 stroke-[3]" /> You are enrolled in this course
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          You have full lifetime access to all learning materials.
                        </p>
                      </div>
                    ) : getCurrentUser() ? (
                      <Button
                        onClick={handleEnrollClick}
                        className="w-full h-12 sm:h-14 sm:text-lg text-base font-bold shadow-md rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-1.5"
                      >
                        {isPaying
                          ? "Processing..."
                          : course.price !== undefined && course.price !== null
                            ? (
                                <>
                                  Buy Course Now <IndianRupee className="size-4 sm:size-5" />
                                  {course.price}
                                </>
                              )
                            : "Enroll Now"}
                      </Button>
                    ) : (
                      <AuthModal
                        trigger={
                          <Button className="w-full h-12 sm:h-14 sm:text-lg text-base font-bold shadow-md rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-1.5">
                            {course.price !== undefined && course.price !== null ? (
                              <>
                                Buy Course Now <IndianRupee className="size-4 sm:size-5" />
                                {course.price}
                              </>
                            ) : (
                              "Enroll Now"
                            )}
                          </Button>
                        }
                      />
                    )}

                    {course.demoLink ? (
                      <a href={formatExternalUrl(course.demoLink)} target="_blank" rel="noopener noreferrer" className="block w-full">
                        <Button
                          variant="outline"
                          className="w-full h-12 sm:h-14 sm:text-base text-sm font-bold rounded-xl border-primary/30 text-primary hover:bg-primary/10 flex items-center justify-center gap-2"
                        >
                          <Play className="size-4 sm:size-5 fill-current" />
                          <span>Watch Demo Content</span>
                          <ExternalLink className="size-3.5 sm:size-4 ml-1 opacity-70" />
                        </Button>
                      </a>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full h-12 sm:h-14 text-sm sm:text-base font-semibold rounded-xl opacity-50 cursor-not-allowed"
                        disabled
                      >
                        <Play className="size-4 sm:size-5 mr-2" />
                        Demo Content Unavailable
                      </Button>
                    )}
                  </div>

                  <p className="text-center text-[10px] sm:text-xs text-muted-foreground pt-1 pb-1">
                    ⚡ Instant access upon purchase • 100% verified authentic content
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CourseCatalog({
  activeCategory,
  onSelectCategory,
}: {
  activeCategory?: Category;
  onSelectCategory?: (category: Category) => void;
}) {
  const [coursesData, setCoursesData] = useState(getCourses());
  const [active, setActive] = useState<Category>(activeCategory || "Web Development");
  const [user, setUser] = useState<User | null>(null);

  const categories: Category[] = [
    "My Courses",
    "Web Development",
    "AI & ML",
    "Video Editing",
    "AKTU Notes",
    "Other Courses",
  ];

  const refreshData = () => {
    setCoursesData(getCourses());
    setUser(getCurrentUser());
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (activeCategory) {
      setActive(activeCategory);
    }
  }, [activeCategory]);

  const handleCategoryChange = (cat: Category) => {
    setActive(cat);
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
  };

  const meta = categoryMeta[active] || {
    icon: Code2,
    label: "Courses",
    copy: "Explore comprehensive learning modules.",
  };
  const ActiveIcon = meta.icon;

  // Get enrolled courses if in "My Courses" tab
  const getEnrolledList = (): CourseData[] => {
    if (!user) return [];
    const allList: CourseData[] = [];
    Object.values(coursesData).forEach((list) => {
      allList.push(...list);
    });
    return allList.filter((c) => user.enrolledCourses.includes(c.id));
  };

  const currentCourses = active === "My Courses" ? getEnrolledList() : coursesData[active] || [];

  return (
    <div>
      {/* Category Tabs */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => {
          const currentMeta = categoryMeta[category] || { icon: Code2, label: category };
          const Icon = currentMeta.icon;
          const count =
            category === "My Courses"
              ? user
                ? user.enrolledCourses.length
                : 0
              : coursesData[category]?.length || 0;

          return (
            <Button
              key={category}
              variant={active === category ? "hero" : "dark"}
              size="xl"
              className={`h-auto min-h-20 justify-start whitespace-normal px-4 text-left transition-all ${
                category === "My Courses" && active !== category ? "border-primary/40 text-primary" : ""
              }`}
              onClick={() => handleCategoryChange(category)}
            >
              <Icon className="size-5 shrink-0" />
              <span className="truncate">
                <strong className="block truncate">{category}</strong>
                <small className="font-normal opacity-70 block">
                  {count} {category === "AKTU Notes" ? "subjects" : "courses"}
                </small>
              </span>
            </Button>
          );
        })}
      </div>

      {/* Header for current selected category */}
      <div className="mb-8 mt-12 flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ActiveIcon className="size-6" />
        </span>
        <div>
          <h3 className="text-3xl font-bold">{active}</h3>
          <p className="mt-1 text-muted-foreground">{meta.copy}</p>
        </div>
      </div>

      {/* Course List or Empty States */}
      {active === "My Courses" && !user ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card/50">
          <BookMarked className="size-12 mx-auto text-primary mb-3 opacity-80" />
          <h4 className="text-xl font-bold">Please sign in to view your courses</h4>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Log in with your account or Google to access your purchased tracks, notes, and demo resources.
          </p>
          <div className="mt-6">
            <AuthModal
              trigger={
                <Button variant="hero" size="lg" className="rounded-full">
                  <LogIn className="size-4 mr-2" /> Sign In / Sign Up
                </Button>
              }
            />
          </div>
        </div>
      ) : active === "My Courses" && currentCourses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card/50">
          <BookMarked className="size-12 mx-auto text-muted-foreground mb-3" />
          <h4 className="text-xl font-bold">No enrolled courses yet</h4>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            You haven't enrolled in any courses yet. Browse the catalog below and click "Buy Course" or "Enroll Now" to get started!
          </p>
          <Button
            variant="hero"
            className="mt-6"
            onClick={() => handleCategoryChange("Web Development")}
          >
            Browse Web Development Courses
          </Button>
        </div>
      ) : currentCourses.length > 0 ? (
        <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {currentCourses.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              index={index}
              category={active}
              onEnrollSuccess={refreshData}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">No courses added in this category yet.</p>
          <p className="text-sm mt-1">Admin can create new courses in this category from the Admin dashboard.</p>
        </div>
      )}
    </div>
  );
}

function Index() {
  const [activeCategory, setActiveCategory] = useState<Category>("Web Development");

  const handleSelectFromSearch = (course: CourseData) => {
    setActiveCategory(course.category as Category);
    const catalogEl = document.getElementById("courses");
    catalogEl?.scrollIntoView({ behavior: "smooth" });

    setTimeout(() => {
      const el = document.getElementById(`course-${course.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-primary");
        setTimeout(() => el.classList.remove("ring-2", "ring-primary"), 2500);
      }
    }, 400);
  };

  const handleMyCoursesHeaderClick = () => {
    setActiveCategory("My Courses");
    const catalogEl = document.getElementById("courses");
    catalogEl?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main id="top" className="min-h-screen overflow-hidden bg-background">
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-8">
        <Logo />
        <NavLinks onSelectCategory={setActiveCategory} />
        <div className="flex items-center gap-3">
          <AdminButton />
          <UserProfileHeader onMyCoursesClick={handleMyCoursesHeaderClick} />

          {/* Mobile Sheet Nav */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="dark" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent className="border-border bg-background">
              <SheetTitle>
                <Logo />
              </SheetTitle>
              <SheetDescription className="sr-only">Main navigation</SheetDescription>
              <NavLinks mobile onSelectCategory={setActiveCategory} />
              <div className="mt-6 pt-4 border-t border-border">
                <UserProfileHeader onMyCoursesClick={handleMyCoursesHeaderClick} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <section className="dot-grid relative mx-auto grid min-h-[700px] max-w-7xl items-center gap-16 px-5 pb-20 pt-12 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pt-6">
        <div className="relative z-10">
          <p className="mb-5 font-mono text-sm font-bold uppercase text-primary">&lt; learn without limits /&gt;</p>
          <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.03] sm:text-6xl lg:text-7xl">
            Build skills that move your <span className="text-primary">career forward.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Choose your track, preview free demo classes, and learn with a clear path from fundamentals to practical work.
          </p>

          {/* Global Search Bar in Hero */}
          <div className="mt-8">
            <GlobalSearch onSelectCourse={handleSelectFromSearch} />
          </div>

          <div className="mt-7 flex gap-3">
            <a
              href="https://linkedin.com"
              aria-label="LinkedIn"
              className="flex size-11 items-center justify-center rounded-full border border-border text-cyan transition-colors hover:border-primary hover:text-foreground"
            >
              <Linkedin />
            </a>
            <a
              href="https://youtube.com"
              aria-label="YouTube"
              className="flex size-11 items-center justify-center rounded-full border border-border text-danger transition-colors hover:border-primary hover:text-foreground"
            >
              <Youtube />
            </a>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="hero" size="xl" asChild>
              <a href="#courses">
                Start learning <ArrowRight />
              </a>
            </Button>
            <Button variant="dark" size="xl" asChild>
              <a href="https://youtube.com">
                <Play className="fill-current" /> Watch on YouTube
              </a>
            </Button>
          </div>

          <div id="community" className="mt-10 grid max-w-2xl grid-cols-3 gap-4 border-t border-border pt-7">
            {stats.map(([value, label, Icon]) => (
              <div key={label}>
                <Icon className="mb-2 size-6 text-primary" />
                <strong className="block text-2xl sm:text-3xl">{value}</strong>
                <span className="text-xs text-muted-foreground sm:text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <Terminal />
      </section>

      <section id="courses" className="border-t border-border bg-secondary/30 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-sm font-bold uppercase text-primary">Course library</p>
              <h2 className="mt-3 text-4xl font-bold sm:text-5xl">Choose your learning track.</h2>
            </div>
            <p className="max-w-md text-muted-foreground">
              Every individual course includes free demo material, so students can explore before starting.
            </p>
          </div>
          <CourseCatalog activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
        </div>
      </section>

      <section id="demos" className="border-t border-border py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
          <div>
            <p className="font-mono text-sm font-bold uppercase text-primary">Free demos</p>
            <h2 className="mt-3 text-4xl font-bold">Preview every course.</h2>
            <p className="mt-5 max-w-lg leading-7 text-muted-foreground">
              Open any course above to access its introduction and sample material. Direct access to all demo lectures and notes.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <Play className="size-7 text-primary" />
              <h3 className="mt-5 text-xl font-bold">Demo content</h3>
              <p className="mt-2 text-muted-foreground">Direct video and lecture previews for each course.</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <Sparkles className="size-7 text-primary" />
              <h3 className="mt-5 text-xl font-bold">Sample material</h3>
              <p className="mt-2 text-muted-foreground">A project, resource, or note preview.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p>© 2026 CodeFront Academy. Build what matters.</p>
        </div>
      </footer>
    </main>
  );
}
