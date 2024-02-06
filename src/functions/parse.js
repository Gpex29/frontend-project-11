export default (contents) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(contents, 'application/xml');
  const rss = document.querySelector('rss');
  if (!rss) {
    throw new Error();
  }
  const title = document.querySelector('title').textContent;
  const description = document.querySelector('description').textContent;
  const items = document.querySelectorAll('item');
  const posts = Array.from(items).map((item) => {
    const link = item.querySelector('link').textContent;
    const postTitle = item.querySelector('title').textContent;
    const itemDescription = item.querySelector('description').textContent;
    const post = {
      link,
      title: postTitle,
      description: itemDescription,
    };
    return post;
  });
  return { title, description, posts };
};
