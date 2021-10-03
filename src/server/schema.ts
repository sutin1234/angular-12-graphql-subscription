import { buildSchema } from "graphql";

export const schema = buildSchema(`
  type Profile {
    id: String
    firstName: String
    lastName: String
    position: String
  }

  type Query {
    profiles(): Profile
  }
`);
