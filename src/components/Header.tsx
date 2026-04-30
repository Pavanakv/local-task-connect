import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useEffect, useState } from "react";
import { store, type User } from "@/lib/store";

export function Header() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(store.getCurrentUser());
  }, [path]);

  const logout = () => {
    store.setCurrentUser(null);
    setUser(null);
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand shadow-soft">
            <Wrench className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">LocalFixr</span>
        </Link>

        <nav className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" onClick={logout}>Log out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild className="bg-gradient-brand shadow-soft hover:opacity-90">
                <Link to="/login" search={{ mode: "signup" }}>Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
