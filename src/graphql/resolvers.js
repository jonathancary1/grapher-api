import Utilities from '../utilities';
import { User, Crawl, Page } from '../database/schema';

export default {
  Query: {
    user(parent, args, { username }) {
      if (username == null) {
        return null;
      }
      return User.findOneOrCreate(username);
    },
  },
  Mutation: {
    async crawl(_, { url }, { username }) {
      if (username == null) {
        return null;
      }
      const user = await User.findOneOrCreate(username);
      const result = await Utilities.crawl(url, 3, 3);
      if (result == null) {
        return null;
      }
      // construct each page document of the crawl
      const pages = Object.keys(result).map((key) => new Page({ url: key }));
      // link together the page documents
      for (const a of pages) {
        for (const b of pages) {
          if (result[a.url].includes(b.url)) {
            a.links.push(b.id);
          }
        }
      }
      const crawl = new Crawl({ pages: pages.map((page) => page.id) });
      user.crawls.push(crawl.id);
      await user.save();
      await crawl.save();
      await Promise.all(pages.map((page) => page.save()));
      return crawl;
    },
  },
  User: {
    crawl(parent, { id }) {
      if (parent == null || !parent.crawls.includes(id)) {
        return null;
      }
      return Crawl.findById(id);
    },
    crawls(parent) {
      if (parent == null) {
        return null;
      }
      return Promise.all(parent.crawls.map((id) => Crawl.findById(id)));
    },
  },
  Crawl: {
    pages(parent) {
      if (parent == null) {
        return null;
      }
      return Promise.all(parent.pages.map((id) => Page.findById(id)));
    },
  },
};
