import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, db, type Task } from "@/lib/db";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

export function PostTaskDialog({
  open, onOpenChange, user, onCreated, editing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  user: User;
  onCreated: (t: Task) => void;
  editing?: Task | null;
}) {
  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [category, setCategory] = useState<string>(editing?.category ?? CATEGORIES[0]);
  const [location, setLocation] = useState(editing?.location ?? "");
  const [contact, setContact] = useState(editing?.contact ?? user.email ?? "");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim() || !contact.trim()) {
      toast.error("Please fill in all fields"); return;
    }
    setBusy(true);
    try {
      const payload = {
        title: title.trim(), description: description.trim(),
        category, location: location.trim(), contact: contact.trim(),
      };
      const result = editing
        ? await db.update("tasks", editing.id, payload)
        : await db.create("tasks", { ...payload, user_id: user.id });
      onCreated(result as Task);
      toast.success(editing ? "Task updated" : "Task posted!");
      if (!editing) { setTitle(""); setDescription(""); setLocation(""); setCategory(CATEGORIES[0]); }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit task" : "Post a task"}</DialogTitle>
          <DialogDescription>Share what you need help with — local helpers will reach out.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Fix a leaky faucet" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details that help someone respond quickly" rows={3} maxLength={500} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Brooklyn, NY" maxLength={80} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Contact info</Label>
            <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="email or phone" maxLength={120} />
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-gradient-brand shadow-soft hover:opacity-90">
            {busy ? "Saving…" : editing ? "Save changes" : "Post task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
