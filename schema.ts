import { makeExecutableSchema } from "@graphql-tools/schema";
import type { IResolvers } from "@graphql-tools/utils";

export const typeDefs = /* GraphQL */ `
  type User {
    id: Int!
    name: String!
  }
  type Post {
    id: Int!
    title: String!
    author: User
  }
  type Query {
    posts: [Post!]!
  }
`;

// The client query used by both before.ts and after.ts.
// It asks for author.name on every post -> triggers Post.author N times.
export const QUERY = /* GraphQL */ `
  {
    posts {
      id
      title
      author {
        name
      }
    }
  }
`;

export function makeSchema(resolvers: IResolvers) {
  return makeExecutableSchema({ typeDefs, resolvers });
}
