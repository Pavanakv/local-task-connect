import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, User, Mail } from "lucide-react";
import type { Task } from "@/lib/store";

export function TaskDetailDialog({ task, onClose }: { task: Task | null; onClose: () => void }) {
  return (
    <Dialog open={!!task} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {task && (
          <>
            <DialogHeader>
              <Badge className="mb-2 w-fit bg-accent text-accent-foreground hover:bg-accent">{task.category}</Badge>
              <DialogTitle className="text-2xl">{task.title}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{task.description}</p>
            <div className="space-y-2 rounded-lg border border-border/60 bg-muted/40 p-4 text-sm">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {task.location}</div>
              <div className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Posted by {task.userName}</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> {task.contact}</div>
            </div>
            <Button asChild className="w-full bg-gradient-brand hover:opacity-90">
              <a href={task.contact.includes("@") ? `mailto:${task.contact}` : `tel:${task.contact}`}>
                Contact poster
              </a>
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
