import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Inbox } from "lucide-react";
import { CATEGORIES, store, type Task, type User } from "@/lib/store";
import { TaskCard } from "@/components/TaskCard";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { PostTaskDialog } from "@/components/PostTaskDialog";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — LocalFixr" },
      { name: "description", content: "Browse local tasks, filter by category, and post your own request." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Task | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const u = store.getCurrentUser();
    if (!u) {
      navigate({ to: "/login" });
      return;
    }
    setUser(u);
    setTasks(store.getTasks());
  }, [navigate]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchesCat = filter === "All" || t.category === filter;
      const q = query.trim().toLowerCase();
      const matchesQ = !q || t.title.toLowerCase().includes(q) || t.location.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [tasks, filter, query]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toaster />

      <main className="container mx-auto px-4 py-10">
        {/* Greeting + CTA */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hi, {user.name.split(" ")[0]} 👋</h1>
            <p className="mt-1 text-muted-foreground">Browse what's happening nearby or post a new task.</p>
          </div>
          <Button onClick={() => setPosting(true)} className="bg-gradient-brand shadow-glow hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" /> Post a Task
          </Button>
        </div>

        {/* Search + Filters */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title or location…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {(["All", ...CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-smooth ${
                filter === cat
                  ? "border-transparent bg-gradient-brand text-primary-foreground shadow-soft"
                  : "border-border/60 bg-background hover:border-primary/40 hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tasks */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center">
            <Inbox className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium">No tasks match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different category — or be the first to post one.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <TaskCard key={t.id} task={t} onClick={() => setSelected(t)} />
            ))}
          </div>
        )}
      </main>

      <TaskDetailDialog task={selected} onClose={() => setSelected(null)} />
      <PostTaskDialog
        open={posting}
        onOpenChange={setPosting}
        user={user}
        onCreated={(t) => setTasks((prev) => [t, ...prev])}
      />
    </div>
  );
}
