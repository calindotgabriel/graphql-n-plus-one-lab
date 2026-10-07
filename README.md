# graphql-n-plus-one-lab

A GraphQL list of 6 posts, each with an author. Without batching it takes 7 database
queries and fetches the same author again and again. With DataLoader it takes 2.

This is the runnable half of **[calingabriel.com/lab/graphql](https://calingabriel.com/lab/graphql)**.
The page runs a small model of it in your browser; this repo runs the real `graphql-js` and `dataloader`.

```
npm install
npm run before   # 7 queries: users 1 and 3 are fetched more than once
npm run after    # 2 queries: SELECT * FROM users WHERE id IN (1, 2, 3)
```

The "database" is an in-memory array that logs every query, so there is nothing to set up.

## What is in it

- `before.ts`: `Post.author` calls `getUserById` once per post. 1 + N queries.
- `after.ts`: a batch function, a loader created per request, and the resolver calling `loader.load()`.
- `db.ts`, `schema.ts`: the fake data and the schema both files share.

## Things worth knowing

- The batch function must return one result per key, in the same order as the keys. A key with no row gets `null`, not a shorter array.
- Make the loader per request. A module-level loader caches across requests, so it serves stale data and can show one user's rows to another.
- This lab only fixes the first level. `author -> posts -> comments` brings the N+1 back one level down.

MIT licensed.
