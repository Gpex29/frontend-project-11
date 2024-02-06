import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import resources from './locales/index.js';
import watch from './functions/view.js';
import parse from './functions/parse.js';
import proxyUrl from './functions/proxyUrl.js';

export default async () => {
  const elements = {
    modal: document.getElementById('modal'),
    form: document.querySelector('form'),
    input: document.getElementById('url-input'),
    feedback: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
  };

  const defaultLanguage = 'ru';

  const initState = {
    form: {
      validationForm: null, // valid, unvalid
      loadingProcess: null, // loading, loaded
      error: {},
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
    const watchedState = watch(elements, i18n, initState);
    elements.form.addEventListener('submit', (e) => {
      const visitedURL = watchedState.feeds.map(({ link }) => link);
      const schema = yup.string().required().url().notOneOf(visitedURL);
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');
      schema
        .validate(url)
        .then(() => {
          watchedState.form.loadingProcess = 'loading';
          axios
            .get(
              proxyUrl(url),
            )
            .then(({ data: { contents } }) => {
              const { title, description, posts } = parse(contents);
              const postsWithId = posts.map((post) => ({ ...post, id: uniqueId() }));
              const feed = { title, description, link: url };
              watchedState.feeds.unshift(feed);
              watchedState.posts.unshift(...postsWithId);
              watchedState.form.loadingProcess = 'loaded';
              watchedState.form.validationForm = 'valid';
            })
            .catch((error) => {
              watchedState.form.loadingProcess = 'loaded';
              watchedState.form.validationForm = 'unvalid';
              const message = error.message === 'Network Error' ? 'network' : 'unvalidRSS';
              watchedState.form.error = { key: `errors.validation.${message}` };
            });
        })
        .catch((error) => {
          watchedState.form.loadingProcess = 'loaded';
          watchedState.form.validationForm = 'unvalid';
          const { message } = error;
          watchedState.form.error = message;
        });
    });

    const updatePosts = (state) => {
      const { feeds, posts } = state;
      const stateTitles = posts.map((post) => post.title);
      const links = feeds.map(({ link }) => link);
      const promises = links.map((link) => axios
        .get(
          proxyUrl(link),
        )
        .then(({ data: { contents } }) => {
          const updateData = parse(contents);
          const updateTitles = updateData.posts
            .filter((post) => !stateTitles.includes(post.title))
            .map((post) => ({ ...post, id: uniqueId() }));
          posts.unshift(...updateTitles);
        }));
      Promise.all(promises).finally(() => setTimeout(updatePosts, 5000, state));
    };

    updatePosts(watchedState);

    elements.postsContainer.addEventListener('click', ({ target }) => {
      const { tagName, dataset: { id } } = target;
      if (tagName === 'A' || tagName === 'BUTTON') {
        watchedState.viewedPosts.add(id);
      }
    });
  });
};
