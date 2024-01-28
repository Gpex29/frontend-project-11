import uniqueId from 'lodash/uniqueId.js';

export default (contents) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(contents, 'application/xml');
  const title = document.querySelector('title').textContent;
  const description = document.querySelector('description').textContent;
  const items = document.querySelectorAll('item');
  const feed = { title, description };
  const posts = [];
  items.forEach((item) => {
    const link = item.querySelector('link').textContent;
    const postTitle = item.querySelector('title').textContent;
    const itemDescription = item.querySelector('description').textContent;
    const post = {
      id: uniqueId(),
      link,
      title: postTitle,
      description: itemDescription,
    };
    posts.push(post);
  });
  return { feed, posts };
};
