// Generic data-access layer over Supabase.
// Usage: db.getAll('tasks'), db.getById('tasks', id), db.create('tasks', data), etc.
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type TableName = keyof Database["public"]["Tables"];

type Row<T extends TableName> = Database["public"]["Tables"][T]["Row"];
type Insert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];
type Update<T extends TableName> = Database["public"]["Tables"][T]["Update"];

export type ListOptions = {
  filters?: Record<string, string | number | boolean | null>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
  select?: string;
};

function log(scope: string, ...args: unknown[]) {
  if (typeof window !== "undefined") console.log(`[db:${scope}]`, ...args);
}

export const db = {
  async getAll<T extends TableName>(table: T, opts: ListOptions = {}): Promise<Row<T>[]> {
    let q = supabase.from(table).select(opts.select ?? "*");
    if (opts.filters) {
      for (const [k, v] of Object.entries(opts.filters)) {
        if (v === null) q = q.is(k, null);
        else q = q.eq(k, v as never);
      }
    }
    if (opts.orderBy) q = q.order(opts.orderBy.column, { ascending: opts.orderBy.ascending ?? false });
    if (opts.limit != null) {
      const from = opts.offset ?? 0;
      q = q.range(from, from + opts.limit - 1);
    }
    const { data, error } = await q;
    if (error) { log(table, "getAll error", error); throw error; }
    return (data ?? []) as unknown as Row<T>[];
  },

  async getById<T extends TableName>(table: T, id: string): Promise<Row<T> | null> {
    const { data, error } = await supabase.from(table).select("*").eq("id", id as never).maybeSingle();
    if (error) { log(table, "getById error", error); throw error; }
    return (data ?? null) as Row<T> | null;
  },

  async create<T extends TableName>(table: T, values: Insert<T>): Promise<Row<T>> {
    const { data, error } = await supabase.from(table).insert(values as never).select().single();
    if (error) { log(table, "create error", error); throw error; }
    return data as unknown as Row<T>;
  },

  async update<T extends TableName>(table: T, id: string, values: Update<T>): Promise<Row<T>> {
    const { data, error } = await supabase.from(table).update(values as never).eq("id", id as never).select().single();
    if (error) { log(table, "update error", error); throw error; }
    return data as unknown as Row<T>;
  },

  async remove<T extends TableName>(table: T, id: string): Promise<void> {
    const { error } = await supabase.from(table).delete().eq("id", id as never);
    if (error) { log(table, "remove error", error); throw error; }
  },
};

export const CATEGORIES = [
  "Plumbing", "Electrical", "Tutoring", "Moving",
  "Cleaning", "Handyman", "Tech Help", "Other",
] as const;

export type Task = Row<"tasks">;
export type Profile = Row<"profiles">;
export type TaskResponse = Row<"task_responses">;

// Joined task with poster's profile name
export type TaskWithProfile = Task & { profiles: { full_name: string } | null };

export async function listTasks(opts: { category?: string; search?: string } = {}): Promise<TaskWithProfile[]> {
  let q = supabase
    .from("tasks")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false });
  if (opts.category && opts.category !== "All") q = q.eq("category", opts.category);
  const { data, error } = await q;
  if (error) throw error;
  let rows = (data ?? []) as unknown as TaskWithProfile[];
  if (opts.search) {
    const s = opts.search.toLowerCase();
    rows = rows.filter(r => r.title.toLowerCase().includes(s) || r.location.toLowerCase().includes(s));
  }
  return rows;
}
