export default (contents) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(contents, 'application/xml');
  const parseError = document.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParsingError = true;
    throw error;
  }
  const title = document.querySelector('title').textContent;
  const description = document.querySelector('description').textContent;
  const domItems = document.querySelectorAll('item');
  const items = Array.from(domItems).map((domItem) => {
    const link = domItem.querySelector('link').textContent;
    const itemTitle = domItem.querySelector('title').textContent;
    const itemDescription = domItem.querySelector('description').textContent;
    const item = {
      link,
      title: itemTitle,
      description: itemDescription,
    };
    return item;
  });
  return { title, description, items };
};
