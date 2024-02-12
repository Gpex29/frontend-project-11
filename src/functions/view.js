/* eslint-disable no-param-reassign */
import onChange from 'on-change';

export default (elements, i18n, state) => {
  const renderValidationForm = () => {
    const { feedback, form, input } = elements;
    const { status, error } = state.validationForm;
    const button = form.querySelector('button');
    if (status === 'processed') {
      button.setAttribute('disabled', '');
      input.setAttribute('readonly', 'true');
      feedback.textContent = '';
    }
    if (status === 'invalid ') {
      feedback.textContent = i18n.t(error.key);
      input.removeAttribute('readonly');
      feedback.classList = 'feedback m-0 position-absolute small text-danger';
      input.focus();
      button.removeAttribute('disabled');
    }
  };
  const renderLoadingForm = () => {
    const { feedback, form, input } = elements;
    const { status, error } = state.loadingProcess;
    const button = form.querySelector('button');
    if (status === 'loaded') {
      button.removeAttribute('disabled');
      input.removeAttribute('readonly');
      feedback.textContent = i18n.t('success');
      feedback.classList = 'feedback m-0 position-absolute small text-success';
      input.focus();
      input.value = '';
    }
    if (status === 'failed') {
      button.removeAttribute('disabled');
      input.removeAttribute('readonly');
      feedback.textContent = i18n.t(error.key);
      feedback.classList = 'feedback m-0 position-absolute small text-danger';
      input.focus();
    }
  };
  const renderPosts = () => {
    const divCard = document.createElement('div');
    divCard.classList = 'card border-0';
    const divCardTitle = document.createElement('div');
    divCardTitle.classList = 'card-body';
    const h2 = document.createElement('h2');
    h2.classList = 'card-title h4';
    h2.textContent = i18n.t('posts');
    const ul = document.createElement('ul');
    ul.classList = 'list-group border-0 rounded-0';
    state.posts.forEach((post) => {
      const {
        title, description, link, id,
      } = post;
      const li = document.createElement('li');
      li.classList = 'post list-group-item d-flex justify-content-between align-items-start border-0 border-end-0';
      li.setAttribute('id', id);
      const a = document.createElement('a');
      a.setAttribute('href', link);
      a.setAttribute('data-id', id);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      if (state.viewedPosts.has(id)) {
        a.className = 'fw-normal';
      } else {
        a.className = 'fw-bold';
      }
      a.textContent = title;
      const button = document.createElement('button');
      button.setAttribute('type', 'button');
      button.setAttribute('data-id', id);
      button.setAttribute('data-bs-toggle', 'modal');
      button.setAttribute('data-bs-target', '#modal');
      button.classList = 'btn btn-outline-primary btn-sm';
      button.textContent = i18n.t('button');
      button.addEventListener('click', () => {
        const modalTitle = document.querySelector('.modal-title');
        const modalBody = document.querySelector('.modal-body');
        const modalLink = document.querySelector('.modal-footer > a');
        modalTitle.textContent = title;
        modalBody.textContent = description;
        modalLink.setAttribute('href', link);
      });
      li.appendChild(a);
      li.appendChild(button);
      ul.appendChild(li);
    });
    elements.postsContainer.textContent = '';
    divCardTitle.appendChild(h2);
    divCard.appendChild(divCardTitle);
    divCard.appendChild(ul);
    elements.postsContainer.appendChild(divCard);
  };
  const renderFeeds = () => {
    const divCard = document.createElement('div');
    divCard.classList = 'card border-0';
    const divCardTitle = document.createElement('div');
    divCardTitle.classList = 'card-body';
    const h2 = document.createElement('h2');
    h2.classList = 'card-title h4';
    h2.textContent = i18n.t('feeds');
    const ul = document.createElement('ul');
    ul.classList = 'list-group border-0 rounded-0';
    state.feeds.forEach((feed) => {
      const li = document.createElement('li');
      li.classList = 'list-group-item border-0 border-end-0';
      const h3 = document.createElement('h3');
      h3.classList = 'h6 m-0';
      h3.textContent = feed.title;
      const p = document.createElement('p');
      p.classList = 'm-0 small text-black-50';
      p.textContent = feed.description;
      li.appendChild(h3);
      li.appendChild(p);
      ul.appendChild(li);
    });
    elements.feedsContainer.textContent = '';
    divCardTitle.appendChild(h2);
    divCard.appendChild(divCardTitle);
    divCard.appendChild(ul);
    elements.feedsContainer.appendChild(divCard);
  };
  const pathToRenderMap = {
    'validationForm.status': renderValidationForm,
    'loadingProcess.status': renderLoadingForm,
    'validationForm.error': renderValidationForm,
    'loadingProcess.error': renderLoadingForm,
    posts: renderPosts,
    viewedPosts: renderPosts,
    feeds: renderFeeds,
  };
  const watchedState = onChange(state, (path) => {
    const renderFunction = pathToRenderMap[path];
    if (renderFunction) {
      renderFunction();
    }
  });
  return watchedState;
};
