import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Inbox, Loader2 } from "lucide-react";
import { CATEGORIES, listTasks, type TaskWithProfile, type Task } from "@/lib/db";
import { TaskCard } from "@/components/TaskCard";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { PostTaskDialog } from "@/components/PostTaskDialog";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — LocalFixr" },
      { name: "description", content: "Browse local tasks, filter by category, and post your own request." },
    ],
  }),
  component: Dashboard,
});

const PAGE_SIZE = 12;

function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<TaskWithProfile[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<TaskWithProfile | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [profileName, setProfileName] = useState<string>("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    (async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      setProfileName(data?.full_name ?? user.email?.split("@")[0] ?? "there");
    })();
  }, [user, authLoading, navigate]);

  const refresh = async () => {
    setLoading(true);
    try {
      const rows = await listTasks({ category: filter });
      setTasks(rows);
      setPage(1);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (user) refresh(); /* eslint-disable-next-line */ }, [user, filter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) => t.title.toLowerCase().includes(q) || t.location.toLowerCase().includes(q));
  }, [tasks, query]);

  const visible = filtered.slice(0, page * PAGE_SIZE);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toaster />

      <main className="container mx-auto px-4 py-10">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hi, {profileName.split(" ")[0]} 👋</h1>
            <p className="mt-1 text-muted-foreground">Browse what's happening nearby or post a new task.</p>
          </div>
          <Button onClick={() => { setEditing(null); setPosting(true); }} className="bg-gradient-brand shadow-glow hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" /> Post a Task
          </Button>
        </div>

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

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading tasks…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center">
            <Inbox className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium">No tasks match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different category — or be the first to post one.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((t) => (
                <TaskCard key={t.id} task={t} onClick={() => setSelected(t)} />
              ))}
            </div>
            {visible.length < filtered.length && (
              <div className="mt-8 flex justify-center">
                <Button variant="outline" onClick={() => setPage((p) => p + 1)}>Load more</Button>
              </div>
            )}
          </>
        )}
      </main>

      <TaskDetailDialog
        task={selected}
        currentUserId={user.id}
        onClose={() => setSelected(null)}
        onEdit={(t) => { setSelected(null); setEditing(t); setPosting(true); }}
        onDeleted={(id) => setTasks((p) => p.filter((t) => t.id !== id))}
      />
      <PostTaskDialog
        open={posting}
        onOpenChange={(o) => { setPosting(o); if (!o) setEditing(null); }}
        user={user}
        editing={editing}
        onCreated={() => refresh()}
      />
    </div>
  );
}
