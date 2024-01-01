import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import resources from './locales/index.js';
import watch from './view.js';
import parse from './parse.js';

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
      currentUrl: '',
      errors: {},
    },
    posts: [],
    feeds: [],
  };

  yup.setLocale({
    string: {
      url: () => ({ key: 'errors.validation.unvalidURL' }),
    },
    mixed: {
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
    const schema = yup.string().url().notOneOf([watchedState.form.currentUrl]);
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
        watchedState.form.currentUrl = url;
        axios
          .get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`)
          .then((response) => {
            const contents = parse(response.data.contents);
            const items = contents.querySelectorAll('item');
            const currentPosts = [];
            items.forEach((item) => {
              const linkText = item.querySelector('title').textContent;
              const link = item.querySelector('link').textContent;
              const description = item.querySelector('description').textContent;
              const post = {
                id: uniqueId(), link, linkText, description,
              };
              currentPosts.push(post);
            });
            watchedState.posts.push(...currentPosts);
            const feedHeader = contents.querySelector('title').textContent;
            const feedText = contents.querySelector('description').textContent;
            const feed = { id: uniqueId(), feedHeader, feedText };
            watchedState.feeds.push(feed);
          });
      })
      .catch((error) => {
        watchedState.form.valid = false;
        const { message } = error;
        watchedState.form.errors = message;
      });
  });
};
