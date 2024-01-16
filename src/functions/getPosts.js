import uniqueId from 'lodash/uniqueId.js';

export default (state, contents) => {
  const items = contents.querySelectorAll('item');
  const posts = [];
  items.forEach((item) => {
    const link = item.querySelector('link').textContent;
    const postExists = state.posts.some((post) => post.link === link);
    if (postExists) {
      return;
    }
    const linkText = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const post = {
      id: uniqueId(),
      link,
      linkText,
      description,
    };
    posts.push(post);
  });
  return posts;
};
