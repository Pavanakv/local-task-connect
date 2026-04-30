// Lightweight localStorage store — placeholder for Supabase integration.
export type User = { id: string; name: string; email: string; password: string };
export type Task = {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  category: string;
  location: string;
  contact: string;
  createdAt: number;
};

export const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Tutoring",
  "Moving",
  "Cleaning",
  "Handyman",
  "Tech Help",
  "Other",
] as const;

const isBrowser = typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  getUsers: () => read<User[]>("lf_users", []),
  saveUsers: (u: User[]) => write("lf_users", u),
  getTasks: () => read<Task[]>("lf_tasks", seedTasks),
  saveTasks: (t: Task[]) => write("lf_tasks", t),
  getCurrentUser: () => read<User | null>("lf_current_user", null),
  setCurrentUser: (u: User | null) => write("lf_current_user", u),
};

const seedTasks: Task[] = [
  {
    id: "seed-1",
    userId: "seed",
    userName: "Maya R.",
    title: "Leaky kitchen faucet needs fixing",
    description: "Constant drip under the sink. Need someone with basic plumbing tools this weekend.",
    category: "Plumbing",
    location: "Brooklyn, NY",
    contact: "maya@example.com",
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: "seed-2",
    userId: "seed",
    userName: "Daniel K.",
    title: "Help moving a sofa to 3rd floor",
    description: "Need an extra pair of hands Saturday morning. Sofa is bulky but not too heavy.",
    category: "Moving",
    location: "Austin, TX",
    contact: "(512) 555-0142",
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: "seed-3",
    userId: "seed",
    userName: "Priya S.",
    title: "Calculus tutor for high schooler",
    description: "Looking for weekly 1-hour sessions. Online or in-person near downtown.",
    category: "Tutoring",
    location: "Seattle, WA",
    contact: "priya@example.com",
    createdAt: Date.now() - 1000 * 60 * 60 * 50,
  },
  {
    id: "seed-4",
    userId: "seed",
    userName: "Jordan T.",
    title: "Wi-Fi router setup help",
    description: "New mesh router, can't get it past setup. Should take under an hour.",
    category: "Tech Help",
    location: "Chicago, IL",
    contact: "jordan@example.com",
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
];
