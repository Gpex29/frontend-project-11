import i18next from 'i18next';
import * as yup from 'yup';
import resources from './locales/index.js';
import watch from './functions/view.js';
import getPosts from './functions/getPosts.js';
import request from './functions/request.js';

const isRSSLink = (url) => /(\.rss|\.xml|\/rss\/|\/feed)/i.test(url);

export default async () => {
  const elements = {
    modal: document.getElementById('modal'),
    form: document.querySelector('form'),
    feedback: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
  };

  const defaultLanguage = 'ru';

  const state = {
    form: {
      status: null,
      valid: false,
      visitedURL: [],
      errors: {},
      loaded: false,
    },
    posts: [],
    viewedPosts: new Set(),
    feeds: [],
  };

  yup.setLocale({
    string: {
      url: () => ({ key: 'errors.validation.unvalidURL' }),
    },
    mixed: {
      required: () => ({ key: 'errors.validation.requirerd' }),
      notOneOf: () => ({ key: 'errors.validation.duplicate' }),
    },
  });

  const i18n = i18next.createInstance();
  await i18n.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  const watchedState = watch(elements, i18n, state);
  watchedState.form.status = 'filling';

  // 1
  elements.form.addEventListener('submit', (e) => {
    const schema = yup.string().required().url().notOneOf(watchedState.form.visitedURL);
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    schema
      .validate(url)
      .then(() => {
        if (!isRSSLink(url)) {
          watchedState.form.valid = false;
          watchedState.form.errors = { key: 'errors.validation.unvalidRSS' };
          return;
        }
        watchedState.form.valid = true;
        watchedState.form.visitedURL.push(url);
        const requestPosts = () => {
          request(url, watchedState, (contents) => {
            const posts = getPosts(watchedState, contents);
            watchedState.posts.push(...posts);
            setTimeout(() => requestPosts(), 5000);
          });
        };
        requestPosts();
        const requestFeed = () => {
          request(url, watchedState, (contents) => {
            const feedHeader = contents.querySelector('title').textContent;
            const feedText = contents.querySelector('description').textContent;
            const feed = { feedHeader, feedText };
            watchedState.feeds.push(feed);
            watchedState.form.loaded = true;
          });
        };
        requestFeed();
      })
      .catch((error) => {
        watchedState.form.valid = false;
        const { message } = error;
        watchedState.form.errors = message;
        watchedState.form.loaded = false;
      });
  });
  elements.postsContainer.addEventListener('click', ({ target }) => {
    const { tagName, dataset: { id } } = target;
    if (tagName === 'A' || tagName === 'BUTTON') {
      watchedState.viewedPosts.add(id);
    }
  });
};
