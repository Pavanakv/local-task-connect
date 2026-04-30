import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, User, Mail, Pencil, Trash2, MessageCircle } from "lucide-react";
import { db, type TaskWithProfile, type TaskResponse } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ResponseWithProfile = TaskResponse & { profiles: { full_name: string } | null };

export function TaskDetailDialog({
  task, currentUserId, onClose, onEdit, onDeleted,
}: {
  task: TaskWithProfile | null;
  currentUserId: string | null;
  onClose: () => void;
  onEdit: (t: TaskWithProfile) => void;
  onDeleted: (id: string) => void;
}) {
  const [responses, setResponses] = useState<ResponseWithProfile[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!task) { setResponses([]); return; }
    (async () => {
      const { data, error } = await supabase
        .from("task_responses")
        .select("*, profiles(full_name)")
        .eq("task_id", task.id)
        .order("created_at", { ascending: true });
      if (error) toast.error(error.message);
      else setResponses((data ?? []) as unknown as ResponseWithProfile[]);
    })();
  }, [task]);

  if (!task) return null;
  const isOwner = currentUserId === task.user_id;

  const sendResponse = async () => {
    if (!msg.trim() || !currentUserId) return;
    setBusy(true);
    try {
      const created = await db.create("task_responses", {
        task_id: task.id, user_id: currentUserId, message: msg.trim(),
      });
      // fetch with profile name
      const { data } = await supabase
        .from("task_responses").select("*, profiles(full_name)").eq("id", created.id).single();
      setResponses((p) => [...p, data as unknown as ResponseWithProfile]);
      setMsg("");
      toast.success("Response sent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task? This can't be undone.")) return;
    try {
      await db.remove("tasks", task.id);
      onDeleted(task.id);
      toast.success("Task deleted");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <Dialog open={!!task} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <Badge className="mb-2 w-fit bg-accent text-accent-foreground hover:bg-accent">{task.category}</Badge>
          <DialogTitle className="text-2xl">{task.title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{task.description}</p>
        <div className="space-y-2 rounded-lg border border-border/60 bg-muted/40 p-4 text-sm">
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {task.location}</div>
          <div className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Posted by {task.profiles?.full_name ?? "Unknown"}</div>
          <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> {task.contact}</div>
        </div>

        {isOwner ? (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onEdit(task)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        ) : (
          <Button asChild className="w-full bg-gradient-brand hover:opacity-90">
            <a href={task.contact.includes("@") ? `mailto:${task.contact}` : `tel:${task.contact}`}>
              Contact poster
            </a>
          </Button>
        )}

        {/* Responses thread */}
        <div className="space-y-3 border-t border-border/60 pt-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <MessageCircle className="h-4 w-4" /> Responses ({responses.length})
          </div>
          <div className="max-h-40 space-y-2 overflow-auto">
            {responses.length === 0 ? (
              <p className="text-xs text-muted-foreground">No responses yet.</p>
            ) : responses.map((r) => (
              <div key={r.id} className="rounded-md bg-muted/40 p-2 text-sm">
                <div className="text-xs font-medium text-primary">{r.profiles?.full_name ?? "Helper"}</div>
                <div>{r.message}</div>
              </div>
            ))}
          </div>
          {currentUserId && !isOwner && (
            <div className="space-y-2">
              <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Offer to help…" rows={2} maxLength={300} />
              <Button size="sm" onClick={sendResponse} disabled={busy || !msg.trim()} className="bg-gradient-brand hover:opacity-90">
                Send response
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
