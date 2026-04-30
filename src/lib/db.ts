// Generic data-access layer over Supabase.
// Usage: db.getAll('tasks'), db.getById('tasks', id), db.create('tasks', data), etc.
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type TableName = keyof Database["public"]["Tables"];

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

// Cast through `any` to keep a flexible runtime API while preserving call sites.
// Strongly-typed helpers (listTasks, etc.) are exported below for typed use.
/* eslint-disable @typescript-eslint/no-explicit-any */
export const db = {
  async getAll(table: TableName, opts: ListOptions = {}): Promise<any[]> {
    let q: any = supabase.from(table).select(opts.select ?? "*");
    if (opts.filters) {
      for (const [k, v] of Object.entries(opts.filters)) {
        q = v === null ? q.is(k, null) : q.eq(k, v);
      }
    }
    if (opts.orderBy) q = q.order(opts.orderBy.column, { ascending: opts.orderBy.ascending ?? false });
    if (opts.limit != null) {
      const from = opts.offset ?? 0;
      q = q.range(from, from + opts.limit - 1);
    }
    const { data, error } = await q;
    if (error) { log(table, "getAll error", error); throw error; }
    return data ?? [];
  },

  async getById(table: TableName, id: string): Promise<any | null> {
    const { data, error } = await (supabase.from(table) as any).select("*").eq("id", id).maybeSingle();
    if (error) { log(table, "getById error", error); throw error; }
    return data ?? null;
  },

  async create(table: TableName, values: Record<string, unknown>): Promise<any> {
    const { data, error } = await (supabase.from(table) as any).insert(values).select().single();
    if (error) { log(table, "create error", error); throw error; }
    return data;
  },

  async update(table: TableName, id: string, values: Record<string, unknown>): Promise<any> {
    const { data, error } = await (supabase.from(table) as any).update(values).eq("id", id).select().single();
    if (error) { log(table, "update error", error); throw error; }
    return data;
  },

  async remove(table: TableName, id: string): Promise<void> {
    const { error } = await (supabase.from(table) as any).delete().eq("id", id);
    if (error) { log(table, "remove error", error); throw error; }
  },
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export const CATEGORIES = [
  "Plumbing", "Electrical", "Tutoring", "Moving",
  "Cleaning", "Handyman", "Tech Help", "Other",
] as const;

type Row<T extends TableName> = Database["public"]["Tables"][T]["Row"];
export type Task = Row<"tasks">;
export type Profile = Row<"profiles">;
export type TaskResponse = Row<"task_responses">;
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
