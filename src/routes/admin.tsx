import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Lock, LogOut, Upload, Link as LinkIcon, DollarSign, Save, Eye, EyeOff, Key, Edit2, Trash2, ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { isAuthenticated, login, logout, changePassword, getAdminUsername } from "@/lib/adminAuth";
import { getCourses, updateCourse, CourseData, addCourse, deleteCourse } from "@/lib/courseData";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | CodeFront Academy" },
      { name: "robots", content: "noindex, nofollow" },
    ]
  }),
  component: AdminPage,
});

function LoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const success = login(username, password);
      if (success) {
        toast.success("Login successful!");
        onLoginSuccess();
      } else {
        toast.error("Invalid credentials. Default is admin/admin123");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex size-12 items-center justify-center rounded-md bg-primary">
              <Lock className="size-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Default credentials: admin / admin123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function CourseEditor({ course, onSave, onDelete }: { course: CourseData; onSave: () => void; onDelete: () => void }) {
  const [editedCourse, setEditedCourse] = useState(course);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    if (!editedCourse.title.trim()) {
      toast.error("Course title cannot be empty!");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      updateCourse(course.id, editedCourse);
      toast.success(`Course "${editedCourse.title}" updated successfully!`);
      setSaving(false);
      onSave();
    }, 300);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedCourse({ ...editedCourse, thumbnail: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setEditedCourse({ ...editedCourse, thumbnail: undefined });
  };

  const handleDelete = () => {
    deleteCourse(course.id);
    toast.success(`Course "${course.title}" deleted!`);
    setShowDeleteConfirm(false);
    onDelete();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <Edit2 className="size-5 shrink-0" />
                <span className="truncate">{editedCourse.title}</span>
              </CardTitle>
              <CardDescription>{course.category}</CardDescription>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Editable Title */}
          <div className="space-y-2">
            <Label htmlFor={`title-${course.id}`}>Course Title</Label>
            <Input
              id={`title-${course.id}`}
              type="text"
              placeholder="Course title"
              value={editedCourse.title}
              onChange={(e) => setEditedCourse({ ...editedCourse, title: e.target.value })}
            />
          </div>

          {/* Thumbnail */}
          <div className="space-y-2">
            <Label htmlFor={`thumbnail-${course.id}`}>Course Thumbnail</Label>
            <div className="flex flex-col gap-2">
              {editedCourse.thumbnail ? (
                <div className="relative group">
                  <img
                    src={editedCourse.thumbnail}
                    alt="Course thumbnail"
                    className="w-full h-48 object-cover rounded-md border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={removeThumbnail}
                  >
                    <Trash2 className="size-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-md bg-secondary/30">
                  <ImageIcon className="size-12 text-muted-foreground" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input
                  id={`thumbnail-${course.id}`}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
                <Upload className="size-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Demo Link */}
          <div className="space-y-2">
            <Label htmlFor={`demo-${course.id}`}>Demo Link (Drive/Telegram)</Label>
            <div className="relative">
              <Input
                id={`demo-${course.id}`}
                type="url"
                placeholder="https://drive.google.com/... or https://t.me/..."
                value={editedCourse.demoLink || ""}
                onChange={(e) => setEditedCourse({ ...editedCourse, demoLink: e.target.value })}
              />
              <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor={`price-${course.id}`}>Price (₹)</Label>
            <div className="relative">
              <Input
                id={`price-${course.id}`}
                type="number"
                min="0"
                step="1"
                placeholder="e.g., 999"
                value={editedCourse.price || ""}
                onChange={(e) => setEditedCourse({ ...editedCourse, price: e.target.value ? Number(e.target.value) : undefined })}
              />
              <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            </div>
          </div>

          {/* Instructor / Owner */}
          <div className="space-y-2">
            <Label htmlFor={`instructor-${course.id}`}>Instructor / Owner</Label>
            <Input
              id={`instructor-${course.id}`}
              type="text"
              placeholder="e.g., CodeFront Academy / John Doe"
              value={editedCourse.instructor || ""}
              onChange={(e) => setEditedCourse({ ...editedCourse, instructor: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor={`desc-${course.id}`}>Description (Optional)</Label>
            <textarea
              id={`desc-${course.id}`}
              className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
              placeholder="Additional course description..."
              value={editedCourse.description || ""}
              onChange={(e) => setEditedCourse({ ...editedCourse, description: e.target.value })}
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="size-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{course.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CreateCourseDialog({ open, onClose, category, onCreated }: { open: boolean; onClose: () => void; category: string; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [demoLink, setDemoLink] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [instructor, setInstructor] = useState("");
  const [thumbnail, setThumbnail] = useState<string | undefined>();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Course title is required!");
      return;
    }

    addCourse(category, {
      title: title.trim(),
      category,
      thumbnail,
      demoLink: demoLink || undefined,
      price: price ? Number(price) : undefined,
      description: description || undefined,
      instructor: instructor.trim() || undefined,
    });

    toast.success(`Course "${title}" created in ${category}!`);

    // Reset form
    setTitle("");
    setDemoLink("");
    setPrice("");
    setDescription("");
    setInstructor("");
    setThumbnail(undefined);
    onClose();
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Add a new course to "{category}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-title">Course Title *</Label>
            <Input
              id="new-title"
              type="text"
              placeholder="e.g., Advanced Node.js"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-thumbnail">Thumbnail</Label>
            {thumbnail && (
              <div className="relative group">
                <img src={thumbnail} alt="Preview" className="w-full h-40 object-cover rounded-md border border-border" />
                <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setThumbnail(undefined)}>
                  <Trash2 className="size-4 mr-1" /> Remove
                </Button>
              </div>
            )}
            <Input id="new-thumbnail" type="file" accept="image/*" onChange={handleImageUpload} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-demo">Demo Link (Drive/Telegram)</Label>
            <Input
              id="new-demo"
              type="url"
              placeholder="https://drive.google.com/... or https://t.me/..."
              value={demoLink}
              onChange={(e) => setDemoLink(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-price">Price (₹)</Label>
            <Input
              id="new-price"
              type="number"
              min="0"
              step="1"
              placeholder="e.g., 999"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-instructor">Instructor / Owner</Label>
            <Input
              id="new-instructor"
              type="text"
              placeholder="e.g., CodeFront Academy / John Doe"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-desc">Description (Optional)</Label>
            <textarea
              id="new-desc"
              className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
              placeholder="Course description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="size-4 mr-2" />
              Create Course
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PasswordChangeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    const success = changePassword(currentPassword, newPassword);
    if (success) {
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } else {
      toast.error("Current password is incorrect!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current">Current Password</Label>
            <Input
              id="current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">New Password</Label>
            <Input
              id="new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm New Password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Change Password</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState(getCourses());
  const [activeCategory, setActiveCategory] = useState<string>("Web Development");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const username = getAdminUsername();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate({ to: "/" });
  };

  const refreshCourses = () => {
    setCourses(getCourses());
  };

  const categories = Object.keys(courses);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-secondary/30 px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Logged in as <span className="font-medium">{username}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
              <Key className="size-4 mr-2" />
              Change Password
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="size-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 py-8">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="mb-8 grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto p-1 gap-1">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="py-2.5 text-xs sm:text-sm">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{category}</h2>
                  <p className="text-sm text-muted-foreground">
                    {courses[category]?.length || 0} courses
                  </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="size-4 mr-2" />
                  Add New Course
                </Button>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {(courses[category] || []).map((course) => (
                  <CourseEditor key={course.id} course={course} onSave={refreshCourses} onDelete={refreshCourses} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <PasswordChangeDialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} />
      <CreateCourseDialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} category={activeCategory} onCreated={refreshCourses} />
    </div>
  );
}

function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Lock className="size-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginForm onLoginSuccess={() => setAuthenticated(true)} />;
  }

  return <AdminDashboard />;
}
