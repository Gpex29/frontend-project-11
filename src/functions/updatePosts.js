/* import fetchRSS from './fetch.js'; */
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import parse from './parse.js';

const updatePosts = (state) => {
  const { feeds, posts } = state;
  feeds.map(({ link }) => axios
    .get(
      `https://allorigins.hexlet.app/get?disableCache=true&url=${link}`,
    )
    .then(({ data: { contents } }) => {
      const updateData = parse(contents);
      const stateTitles = posts.map((post) => post.title);
      const updateTitles = updateData.posts
        .filter((post) => !stateTitles.includes(post.title))
        .map((post) => ({ ...post, id: uniqueId() }));
      posts.unshift(...updateTitles);
    }));
  setTimeout(updatePosts, 5000, state);
};

export default updatePosts;
