import { gql } from 'apollo-server-express';

const Query = gql`
  type Query {
    user: User
  }
`;

const Mutation = gql`
  type Mutation {
    crawl(url: String!): Crawl
  }
`;

const User = gql`
  type User {
    crawl(id: String!): Crawl
    crawls: [Crawl!]!
  }
`;

const Crawl = gql`
  type Crawl {
    id: String!
    pages: [Page!]!
  }
`;

const Page = gql`
  type Page {
    id: String!
    url: String!
    links: [String!]!
  }
`;

export default [Query, Mutation, User, Crawl, Page];
