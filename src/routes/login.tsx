import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { store, type User } from "@/lib/store";
import { toast } from "sonner";
import { z } from "zod";

type Search = { mode?: "login" | "signup" };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    mode: s.mode === "signup" ? "signup" : "login",
  }),
  head: () => ({
    meta: [
      { title: "Log in or sign up — LocalFixr" },
      { name: "description", content: "Sign up or log in to post and browse local tasks on LocalFixr." },
    ],
  }),
  component: LoginPage,
});

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(60),
  email: z.string().trim().email("Invalid email").max(120),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

function LoginPage() {
  const { mode: initial } = Route.useSearch();
  const [mode, setMode] = useState<"login" | "signup">(initial ?? "login");
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = store.getUsers();
    if (mode === "signup") {
      const parsed = signupSchema.safeParse({ name, email, password });
      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message);
        return;
      }
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        toast.error("An account with this email already exists");
        return;
      }
      const user: User = { id: crypto.randomUUID(), name: parsed.data.name, email: parsed.data.email, password };
      store.saveUsers([...users, user]);
      store.setCurrentUser(user);
      toast.success(`Welcome, ${user.name}!`);
      navigate({ to: "/dashboard" });
    } else {
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!user) {
        toast.error("Invalid email or password");
        return;
      }
      store.setCurrentUser(user);
      toast.success(`Welcome back, ${user.name}!`);
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md border-border/60 p-8 shadow-glow">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signup" ? "Start posting and finding local help." : "Log in to continue."}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full bg-gradient-brand shadow-soft hover:opacity-90">
              {mode === "signup" ? "Create account" : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account? " : "Don't have one? "}
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
            >
              {mode === "signup" ? "Log in" : "Sign up"}
            </button>
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:underline">← Back home</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
