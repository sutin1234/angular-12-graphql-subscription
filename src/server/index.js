// @ts-check
const { createServer } = require("http");
const express = require("express");
const { execute, subscribe } = require("graphql");
const { ApolloServer, gql } = require("apollo-server-express");
const { PubSub } = require("graphql-subscriptions");
const {SubscriptionServer} = require("subscriptions-transport-ws");
const {makeExecutableSchema} = require("@graphql-tools/schema");
const bodyParser = require("body-parser");

(async () => {
  const PORT = 4000;
  const pubsub = new PubSub();
  const app = express();
  const httpServer = createServer(app);

  let profiles = [];

  app.use(bodyParser.json());
  app.post("/api/profile", (req, res) => {
    const body = {
      firstName: "Test Rest Client",
      lastName: " test Rest",
      position: " Rest Client",
    };
    addProfile(body);
    res.json(profiles);
  });

  // Schema definition
  const typeDefs = gql`
    type Profile {
      firstName: String
      id: Int
      lastName: String
      position: String
    }

    type Query {
      profile: [Profile]
    }

    type Subscription {
      profiles: [Profile]
    }
  `;

  // Resolver map
  const resolvers = {
    Query: {
      profile() {
        return profiles;
      },
    },
    Subscription: {
      profiles: {
        subscribe: () => pubsub.asyncIterator(["PROFILE"]),
      },
    },
  };

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({
    schema,
  });
  await server.start();
  server.applyMiddleware({ app });

  SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer, path: server.graphqlPath }
  );

  httpServer.listen(PORT, () => {
    console.log(
      `🚀 Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(
      `🚀 Subscription endpoint ready at ws://localhost:${PORT}${server.graphqlPath}`
    );
  });

  function addProfile(profile) {
    profiles.push(profile);
    pubsub.publish("PROFILE", { profiles: profiles });
  }
})();
