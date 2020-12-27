import axios from 'axios';
import cheerio from 'cheerio';

// convert an href to be absolute if relative
function absolute(relative, base) {
  try {
    return new URL(relative, base).href;
  } catch {
    return null;
  }
}

// normalize an href, removing protocols, query parameters, etc.
function normalized(href) {
  try {
    const url = new URL(href);
    return url.hostname + url.pathname;
  } catch {
    return null;
  }
}

// return a list of all hrefs contained in links from the given url
async function fetch(href) {
  try {
    const response = await axios(href);
    if (response.status !== 200) {
      return null;
    }
    const $ = cheerio.load(response.data);
    return $('a')
      .toArray()
      .map((element) => $(element).attr('href'))
      .map((relative) => absolute(relative, href))
      .filter((value) => value);
  } catch {
    return null;
  }
}

// remove a random selection of values of given length from an array
function pull(array, length) {
  const result = [];
  while (array.length > 0 && result.length < length) {
    const index = Math.floor(Math.random() * array.length);
    const [value] = array.splice(index, 1);
    result.push(value);
  }
  return result;
}

// a convenience constructor for a node
async function construct(href, depth) {
  const hrefs = await fetch(href);
  if (hrefs === null) {
    return null;
  }
  return {
    href,
    hrefs,
    depth,
    children: [],
  };
}

// perform a breadth first search starting from root
// cycles will result in non-termination
function* breadth(root) {
  const frontier = [root];
  while (frontier.length > 0) {
    const node = frontier.pop();
    yield node;
    frontier.push(...node.children);
  }
}

// construct the adjacency list of a tree
// nodes for which normalized(node.href) is the same are considered equal
// the resulting output may contain cycles
function flatten(root) {
  const dictionary = {};
  for (const node of breadth(root)) {
    const key = normalized(node.href);
    if (!(key in dictionary)) {
      dictionary[key] = [];
    }
    node.children.forEach((child) => {
      const link = normalized(child.href);
      if (!dictionary[key].includes(link)) {
        dictionary[key].push(link);
      }
    });
  }
  return dictionary;
}

// perform a crawl starting from the given url
// depth is the maximum distance any given page can be from url
// degree is the maximum number of child links to navigate to from a given page
async function crawl(url, depth, degree) {
  const root = await construct(url, 0);
  if (root === null || normalized(url) === null) {
    return null;
  }

  let nodes = [];
  do {
    // find all nodes not satifying either the depth or degree constraints
    nodes = Array.from(breadth(root)).filter((node) => (
      node.hrefs.length > 0 && node.children.length < degree && node.depth < depth
    ));
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(nodes.flatMap((node) => {
      // take a random selection of hrefs enough to satify the degree constraint
      const hrefs = pull(node.hrefs, degree - node.children.length);
      return hrefs.map(async (href) => {
        const child = await construct(href, node.depth + 1);
        if (child) {
          node.children.push(child);
        }
      });
    }));
  } while (nodes.length > 0);

  return flatten(root);
}

export default { crawl };
