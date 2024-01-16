/* eslint-disable no-param-reassign */
import onChange from 'on-change';

export default (elements, i18n, state) => {
  const renderForm = () => {
    const { feedback } = elements;
    feedback.textContent = '';
    if (state.form.valid === false) {
      feedback.textContent = i18n.t(state.form.errors.key);
      feedback.classList.add('text-danger');
    }
    if (state.form.valid === true) {
      feedback.classList.replace('text-danger', 'text-success');
    }
    if (state.form.loaded === true) {
      feedback.textContent = i18n.t('success');
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
        linkText, description, link, id,
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
      a.textContent = linkText;
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
        modalTitle.textContent = linkText;
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
      h3.textContent = feed.feedHeader;
      const p = document.createElement('p');
      p.classList = 'm-0 small text-black-50';
      p.textContent = feed.feedText;
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
  const watchedState = onChange(state, (path) => {
    if (path === 'form.valid'
        || path === 'form.errors'
        || path === 'form.loaded') {
      renderForm();
    }
    if (path === 'posts' || path === 'viewedPosts') {
      renderPosts();
    }
    if (path === 'feeds') {
      renderFeeds();
    }
  });
  return watchedState;
};
