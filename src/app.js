import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import resources from './locales/index.js';
import watch from './functions/view.js';
import parse from './functions/parse.js';
import updatePosts from './functions/updatePosts.js';

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
      loading: false,
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
  i18n.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  }).then(() => {
    const watchedState = watch(elements, i18n, state);
    watchedState.form.status = 'filling';
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
          watchedState.form.loading = true;
          watchedState.form.loaded = false;
          axios
            .get(
              `https://allorigins.hexlet.app/get?disableCache=true&url=${url}`,
            )
            .then(({ data: { contents } }) => {
              const { feed, posts } = parse(contents);
              watchedState.feeds.unshift({ ...feed, link: url });
              watchedState.posts.unshift(...posts);
              watchedState.form.loading = false;
              watchedState.form.loaded = true;
            })
            .catch(({ message }) => {
              watchedState.form.valid = false;
              watchedState.form.loaded = false;
              watchedState.form.loading = false;
              if (message === 'Network Error') {
                watchedState.form.errors = { key: 'errors.validation.network' };
              }
            });
        })
        .catch((error) => {
          watchedState.form.valid = false;
          const { message } = error;
          watchedState.form.errors = message;
          watchedState.form.loading = false;
          watchedState.form.loaded = false;
        });
    });
    updatePosts(watchedState);
    elements.postsContainer.addEventListener('click', ({ target }) => {
      const { tagName, dataset: { id } } = target;
      if (tagName === 'A' || tagName === 'BUTTON') {
        watchedState.viewedPosts.add(id);
      }
    });
  });
};
