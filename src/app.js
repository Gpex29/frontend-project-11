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
    validationForm: {
      status: 'filling',
      error: {},
    },
    loadingProcess: {
      status: 'idle',
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
      e.preventDefault();
      watchedState.validationForm.status = 'processed';
      const visitedURL = watchedState.feeds.map(({ link }) => link);
      const schema = yup.string().required().url().notOneOf(visitedURL);
      const formData = new FormData(e.target);
      const url = formData.get('url');
      schema
        .validate(url)
        .then(() => {
          watchedState.validationForm.status = 'valid';
          watchedState.loadingProcess.status = 'loading';
          axios
            .get(
              proxyUrl(url),
            )
            .then(({ data: { contents } }) => {
              const { title, description, items } = parse(contents);
              const posts = items.map((item) => ({ ...item, id: uniqueId() }));
              const feed = { title, description, link: url };
              watchedState.feeds.unshift(feed);
              watchedState.posts.unshift(...posts);
              watchedState.loadingProcess.status = 'loaded';
            })
            .catch((error) => {
              watchedState.loadingProcess.status = 'failed';
              const message = error.isParsingError ? 'unvalidRSS' : 'network';
              watchedState.loadingProcess.error = { key: `errors.validation.${message}` };
            });
        })
        .catch((error) => {
          watchedState.validationForm.status = 'invalid ';
          const { message } = error;
          watchedState.validationForm.error = message;
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
          const { items } = parse(contents);
          const newPosts = items
            .filter((item) => !stateTitles.includes(item.title))
            .map((item) => ({ ...item, id: uniqueId() }));
          posts.unshift(...newPosts);
        })
        .catch((error) => console.log(error.message)));
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
