import { MapPin, Tag, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { TaskWithProfile } from "@/lib/db";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function TaskCard({ task, onClick }: { task: TaskWithProfile; onClick: () => void }) {
  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer overflow-hidden border-border/60 p-5 shadow-card transition-smooth hover:-translate-y-0.5 hover:shadow-glow"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <Badge className="bg-accent text-accent-foreground hover:bg-accent">
          <Tag className="mr-1 h-3 w-3" />
          {task.category}
        </Badge>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {timeAgo(task.created_at)}
        </span>
      </div>

      <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-snug group-hover:text-primary transition-smooth">
        {task.title}
      </h3>
      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {task.location}
        </span>
        <span className="flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          {task.profiles?.full_name ?? "Unknown"}
        </span>
      </div>
    </Card>
  );
}
