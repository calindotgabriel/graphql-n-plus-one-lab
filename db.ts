// Fake in-memory "database" with call logging, so you can SEE the N+1.
// Every function that touches data pushes a line to queryLog.

export interface User {
  id: number;
  name: string;
}
export interface Post {
  id: number;
  title: string;
  authorId: number;
}

const users: User[] = [
  { id: 1, name: "Ada" },
  { id: 2, name: "Alan" },
  { id: 3, name: "Grace" },
];

// authorId 1 appears 3x, authorId 3 appears 2x, authorId 2 once.
const posts: Post[] = [
  { id: 1, title: "On compilers", authorId: 1 },
  { id: 2, title: "Notes on the Bombe", authorId: 2 },
  { id: 3, title: "The Analytical Engine", authorId: 1 },
  { id: 4, title: "Nanoseconds", authorId: 3 },
  { id: 5, title: "Loop unrolling", authorId: 1 },
  { id: 6, title: "On subroutines", authorId: 3 },
];

export const queryLog: string[] = [];

export function printLog(label: string): void {
  console.log(`\n[${label}]  ${queryLog.length} DB queries:`);
  for (const q of queryLog) console.log("  " + q);
}

const wait = () => new Promise((r) => setTimeout(r, 1)); // simulate async I/O

export async function getAllPosts(): Promise<Post[]> {
  queryLog.push("SELECT * FROM posts");
  await wait();
  return posts;
}

// one-row lookup — this is what the naive resolver calls, once per post
export async function getUserById(id: number): Promise<User | null> {
  queryLog.push(`SELECT * FROM users WHERE id = ${id}`);
  await wait();
  return users.find((u) => u.id === id) ?? null;
}

// batched lookup — this is what the DataLoader batch function will call, once
export async function getUsersByIds(
  ids: readonly number[],
): Promise<User[]> {
  queryLog.push(`SELECT * FROM users WHERE id IN (${ids.join(", ")})`);
  await wait();
  return users.filter((u) => ids.includes(u.id));
}
