// AFTER — batching with DataLoader.
//
//   npm run after
//
// Goal: 1 (posts) + 1 (one batched user query) = 2 queries.

import { graphql } from "graphql";
import DataLoader from "dataloader";
import { makeSchema, QUERY } from "./schema.ts";
import { getAllPosts, getUsersByIds, printLog, type User } from "./db.ts";

// ===========================================================================
//  the batch function
// ---------------------------------------------------------------------------
//  DataLoader collects every key passed to .load(...) during one tick of the
//  event loop, then calls this ONCE with all of them. Contract:
//    - return an array the SAME LENGTH as `ids`
//    - result[i] must correspond to ids[i]  (same order)
//    - a key with no row -> null in that slot, NOT a shorter array
// ===========================================================================
async function batchUsers(ids: readonly number[]): Promise<(User | null)[]> {
  const rows = await getUsersByIds(ids);
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id) ?? null);
}

// ===========================================================================
//  a fresh loader per request  (wiring shown, understand why)
// ---------------------------------------------------------------------------
//  Never a module-level singleton. A global loader would cache across requests
//  -> stale data, and user A could read user B's cached rows.
// ===========================================================================
function createLoaders() {
  return {
    user: new DataLoader<number, User | null>(batchUsers),
  };
}
type Loaders = ReturnType<typeof createLoaders>;

// ===========================================================================
//  call the loader from the resolver instead of the DB
// ===========================================================================
const resolvers = {
  Query: {
    posts: () => getAllPosts(),
  },
  Post: {
    author: (
      post: { authorId: number },
      _args: unknown,
      ctx: { loaders: Loaders },
    ) => {
      return ctx.loaders.user.load(post.authorId);
    },
  },
};

const schema = makeSchema(resolvers);

// ===========================================================================
//  build the context per execution  (wiring shown)
// ===========================================================================
const result = await graphql({
  schema,
  source: QUERY,
  contextValue: { loaders: createLoaders() }, // one set of loaders per request
});

printLog("after");
console.log("\nresult:", JSON.stringify(result.data, null, 2));
if (result.errors) console.error("\nerrors:", result.errors);
