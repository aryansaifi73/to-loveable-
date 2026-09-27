import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithCredentials, loginWithGoogle, register } from "@/lib/userAuth";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export function AuthModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [googleStep, setGoogleStep] = useState<"idle" | "continue" | "create">("idle");
  const [googleName, setGoogleName] = useState("Alex Dev");
  const [googleEmail, setGoogleEmail] = useState("alex@example.com");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (activeTab === "signin") {
        const result = await loginWithCredentials(email, password);
        if (result.success) {
          toast.success(result.message);
          setOpen(false);
          window.location.reload();
        } else {
          toast.error(result.message);
        }
      } else {
        const result = await register(name, email, password);
        if (result.success) {
          toast.success(result.message);
          setOpen(false);
          window.location.reload();
        } else {
          toast.error(result.message);
        }
      }
    } catch (err: any) {
      const msg = err?.message || "Authentication failed";
      console.error("[AuthModal] submit failed", err);
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    setErrorMsg(null);
    setGoogleStep("continue");
  };

  const handleGoogleContinue = () => {
    setGoogleStep("create");
  };

  const handleGoogleCreate = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const result = await loginWithGoogle({
        name: googleName.trim(),
        email: googleEmail.trim(),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(googleName.trim())}`,
      });

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (err: any) {
      const msg = err?.message || "Google login failed";
      console.error("[AuthModal] google login failed", err);
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setGoogleStep("idle");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setErrorMsg(null);
          setGoogleStep("idle");
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {errorMsg && (
          <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {errorMsg}
          </div>
        )}

        <DialogHeader>
          <DialogTitle>Welcome to CodeFront Academy</DialogTitle>
          <DialogDescription>
            {activeTab === "signin" ? "Sign in to your account to enroll in courses." : "Create an account to start learning."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleClick}
          disabled={loading || googleStep !== "idle"}
        >
          <Mail className="mr-2 size-4" /> Continue with Google
        </Button>

        {googleStep === "continue" && (
          <div className="mt-3 rounded-lg border border-border bg-card p-3">
            <div className="text-sm font-semibold">Continue with Google</div>
            <div className="mt-2 text-xs text-muted-foreground">
              We’ll use Google to sign you in and unlock your courses.
            </div>

            <div className="mt-3 flex gap-2">
              <Button type="button" className="flex-1" onClick={handleGoogleContinue} disabled={loading}>
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setGoogleStep("idle")}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {googleStep === "create" && (
          <div className="mt-3 rounded-lg border border-border bg-card p-3">
            <div className="text-sm font-semibold">Create your account</div>
            <div className="mt-2 text-xs text-muted-foreground">Just set your name. Email comes from Google.</div>

            <div className="mt-3 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="google-name">Name</Label>
                <Input
                  id="google-name"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="google-email">Email</Label>
                <Input id="google-email" value={googleEmail} disabled />
              </div>

              <div className="flex gap-2">
                <Button type="button" className="flex-1" onClick={handleGoogleCreate} disabled={loading}>
                  Create your account
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setGoogleStep("continue")}
                  disabled={loading}
                >
                  Back
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
