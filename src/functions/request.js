/* eslint-disable no-param-reassign */
import axios from 'axios';
import parse from './parse.js';

const request = (url, state, onSuccess) => {
  axios
    .get(
      `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`,
    )
    .then((response) => {
      const contents = parse(response.data.contents);
      onSuccess(contents);
    })
    .catch(({ message }) => {
      state.form.valid = false;
      if (message === 'Network Error') {
        state.form.errors = { key: 'errors.validation.network' };
      }
    });
};
export default request;
