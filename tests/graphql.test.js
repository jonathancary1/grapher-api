import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { ApolloServer, gql } from 'apollo-server-express';
import { createTestClient } from 'apollo-server-testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import typeDefs from '../src/graphql/typeDefs';
import resolvers from '../src/graphql/resolvers';

const graph = {
  'www.a.com/': ['www.b.com/'],
  'www.b.com/': ['www.c.com/'],
  'www.c.com/': ['www.a.com/'],
};

jest.mock('../src/utilities', () => ({
  async crawl() {
    return graph;
  },
}));

const mongod = new MongoMemoryServer();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: {
    username: 'username',
  },
});

beforeAll(async () => {
  await mongoose.connect(await mongod.getUri(), {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

describe('graphql', () => {
  it('should update the database for the crawl mutation', async () => {
    const client = createTestClient(server);
    const mutation = await client.mutate({
      mutation: gql`
        mutation {
          crawl(url: "https://www.a.com/") { id pages { url links } }
        }
      `,
    });
    const query = await client.query({
      query: gql`
        query ($id: String!) {
          user { crawl(id: $id) { id pages { url links } } }
        }
      `,
      variables: {
        id: mutation.data.crawl.id
      },
    });
    expect(mutation.data.crawl).toStrictEqual(query.data.user.crawl);
  });
});
