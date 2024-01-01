export default (string) => {
  const parser = new DOMParser();
  return parser.parseFromString(string, 'application/xml');
};
