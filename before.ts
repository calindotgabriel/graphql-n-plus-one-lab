// BEFORE — no batching. Post.author queries the DB once per post.
//
//   npm run before
//
// Expect: 1 (posts) + 6 (one per post) = 7 queries, and
// "SELECT * FROM users WHERE id = 1" appears 3 times, id = 3 twice.
// Same user, refetched. That is the N+1.

import { graphql } from "graphql";
import { makeSchema, QUERY } from "./schema.ts";
import { getAllPosts, getUserById, printLog } from "./db.ts";

const resolvers = {
  Query: {
    posts: () => getAllPosts(),
  },
  Post: {
    // Runs once per post in the list. The resolver has no idea it is being
    // called 6 times in the same tick — it just sees one authorId.
    author: (post: { authorId: number }) => getUserById(post.authorId),
  },
};

const schema = makeSchema(resolvers);

const result = await graphql({ schema, source: QUERY });

printLog("before");
console.log("\nresult:", JSON.stringify(result.data, null, 2));
if (result.errors) console.error("\nerrors:", result.errors);
