/* WINX CITY: JavaScript puro. Sem React, servidor de API ou dependências externas. */
(() => {
  'use strict';
  const portal = document.querySelector('.portal');
  const sidebar = portal.querySelector('.sidebar');
  const pages = window.WINX_PAGES || [];
  let activeModal = null;
  let templatePromise;
  let indexPromise;

  const normalize = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const node = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };

  function templates() {
    if (!templatePromise) {
      templatePromise = fetch('./templates.json').then(response => {
        if (!response.ok) throw new Error('Não foi possível carregar as janelas do site.');
        return response.json();
      }).catch(error => { templatePromise = null; throw error; });
    }
    return templatePromise;
  }

  function closeMenu() {
    sidebar.classList.remove('open');
    document.querySelector('.sidebar-scrim')?.remove();
    document.querySelector('.mobile-menu')?.setAttribute('aria-expanded', 'false');
  }
  function openMenu() {
    sidebar.classList.add('open');
    document.querySelector('.mobile-menu')?.setAttribute('aria-expanded', 'true');
    const scrim = node('button', 'sidebar-scrim');
    scrim.setAttribute('aria-label', 'Fechar menu');
    scrim.addEventListener('click', closeMenu);
    portal.append(scrim);
  }

  function closeModal() {
    if (!activeModal) return;
    const previous = activeModal;
    activeModal = null;
    previous.backdrop.remove();
    document.body.style.overflow = previous.overflow;
    previous.focus?.focus();
  }
  function showModal(html) {
    closeMenu();
    closeModal();
    const template = document.createElement('template');
    template.innerHTML = html.trim(); // Trusted local template, never user search input.
    const dialog = template.content.firstElementChild;
    const backdrop = node('div', 'modal-backdrop');
    backdrop.append(dialog);
    activeModal = { backdrop, dialog, overflow: document.body.style.overflow, focus: document.activeElement };
    document.body.style.overflow = 'hidden';
    portal.append(backdrop);
    backdrop.addEventListener('click', event => { if (event.target === backdrop) closeModal(); });
    dialog.querySelector('button[aria-label^="Fechar"]')?.addEventListener('click', closeModal);
    dialog.querySelector('input,button[aria-label^="Fechar"],button,a')?.focus();
    return dialog;
  }

  async function openPdf() {
    try {
      showModal((await templates()).pdf);
    } catch {
      location.href = './documents/protocolos-original.pdf';
    }
  }

  function searchIndex() {
    if (!indexPromise) {
      indexPromise = Promise.all(pages.map(async page => {
        const response = await fetch('./' + page.file);
        if (!response.ok) throw new Error('Falha ao carregar ' + page.file);
        const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
        const content = doc.querySelector('.markdown');
        if (!content) throw new Error('Conteúdo ausente em ' + page.file);
        // Index the real published HTML so edits do not leave a stale search snapshot.
        const text = content.textContent.replace(/\s+/g, ' ').trim();
        const title = doc.querySelector('article h1')?.textContent.trim() || page.title;
        return { ...page, title, text, normalized: normalize(text) };
      })).catch(error => { indexPromise = null; throw error; });
    }
    return indexPromise;
  }

  async function openSearch() {
    let dialog;
    try { dialog = showModal((await templates()).search); }
    catch {
      const message = node('p', 'error-message', 'Não foi possível abrir a pesquisa. Sirva estes arquivos por HTTP/HTTPS, como no GitHub Pages.');
      document.querySelector('.document-article').prepend(message);
      return;
    }
    const input = dialog.querySelector('input');
    const container = dialog.querySelector('.search-results');
    const initialMarkup = container.innerHTML;
    let results = [];
    let selected = 0;
    let sequence = 0;

    const openResult = result => {
      const url = new URL('./' + result.file, location.href);
      url.searchParams.set('q', input.value.trim());
      location.href = url.href;
    };
    const selectResult = index => {
      selected = Math.max(0, Math.min(results.length - 1, index));
      container.querySelectorAll('.search-result').forEach((button, i) => {
        button.classList.toggle('selected', i === selected);
        button.setAttribute('aria-selected', String(i === selected));
      });
      container.querySelector('.search-result.selected')?.scrollIntoView({ block: 'nearest' });
    };

    async function renderResults() {
      const ownSequence = ++sequence;
      const query = input.value.trim();
      if (!query) {
        results = [];
        container.innerHTML = initialMarkup;
        return;
      }
      container.replaceChildren(node('div', 'loading-inline', 'Pesquisando…'));
      try {
        const index = await searchIndex();
        if (ownSequence !== sequence || !dialog.isConnected) return;
        const normalizedQuery = normalize(query);
        results = index.filter(page => page.normalized.includes(normalizedQuery) || normalize(page.title + ' ' + page.category).includes(normalizedQuery));
        results.sort((a, b) => Number(normalize(b.title).includes(normalizedQuery)) - Number(normalize(a.title).includes(normalizedQuery)));
        selected = 0;
        container.replaceChildren(node('div', 'results-caption', results.length + (results.length === 1 ? ' resultado encontrado' : ' resultados encontrados')));
        results.forEach((result, i) => {
          const button = node('button', 'search-result' + (i === 0 ? ' selected' : ''));
          button.type = 'button';
          const icon = document.querySelector('.nav-item svg')?.cloneNode(true);
          if (icon) button.append(icon);
          const details = node('div');
          details.append(node('small', '', 'PROTOCOLOS STAFF / ' + result.category));
          details.append(node('h3', '', result.title));
          const hit = result.normalized.indexOf(normalizedQuery);
          const start = Math.max(0, hit - 65);
          details.append(node('p', '', (start ? '…' : '') + result.text.slice(start, start + 210) + (start + 210 < result.text.length ? '…' : '')));
          button.append(details);
          button.addEventListener('mouseenter', () => selectResult(i));
          button.addEventListener('click', () => openResult(result));
          container.append(button);
        });
        if (!results.length) container.append(node('div', 'search-empty', 'Nenhum resultado para “' + query + '”. Tente outra palavra ou expressão.'));
      } catch {
        if (ownSequence === sequence) container.replaceChildren(node('p', 'error-message', 'Não foi possível pesquisar os arquivos locais. Verifique a conexão e tente novamente.'));
      }
    }

    input.addEventListener('input', renderResults);
    input.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        selectResult(selected + (event.key === 'ArrowDown' ? 1 : -1));
      }
      if (event.key === 'Enter' && results[selected]) {
        event.preventDefault();
        openResult(results[selected]);
      }
    });
    container.addEventListener('click', event => {
      const suggestion = event.target.closest('.search-suggestions button');
      if (suggestion) { input.value = suggestion.textContent; renderResults(); input.focus(); }
    });
    input.focus();
  }

  document.querySelectorAll('.sidebar-search,.mobile-search').forEach(button => button.addEventListener('click', openSearch));
  document.querySelectorAll('.original-link,.topbar-actions .text-button').forEach(button => button.addEventListener('click', openPdf));
  document.querySelector('.mobile-menu')?.addEventListener('click', () => sidebar.classList.contains('open') ? closeMenu() : openMenu());
  sidebar.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

  document.querySelectorAll('.nav-group-heading').forEach(button => {
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      const items = button.nextElementSibling;
      if (items) items.hidden = expanded;
      button.querySelector('.lucide-chevron-down')?.classList.toggle('rotate-closed', expanded);
    });
  });

  const tocButton = document.querySelector('.mobile-toc-button');
  tocButton?.setAttribute('aria-expanded', 'false');
  tocButton?.addEventListener('click', () => {
    const existing = document.querySelector('.mobile-toc');
    if (existing) { existing.remove(); tocButton.setAttribute('aria-expanded', 'false'); return; }
    const toc = node('div', 'mobile-toc');
    const headings = document.querySelectorAll('article h1[id],.markdown h2[id],.markdown h3[id],.markdown .pillar[id]');
    headings.forEach(heading => {
      const title = heading.matches('.pillar') ? heading.textContent.split(':')[0].trim() : heading.textContent.replace(/#$/, '').trim();
      const link = node('a', '', title);
      link.href = '#' + heading.id;
      link.addEventListener('click', () => { toc.remove(); tocButton.setAttribute('aria-expanded', 'false'); });
      toc.append(link);
    });
    tocButton.insertAdjacentElement('afterend', toc);
    tocButton.setAttribute('aria-expanded', 'true');
  });

  document.querySelector('.copy-page')?.addEventListener('click', async event => {
    const button = event.currentTarget;
    const url = new URL(location.href);
    url.searchParams.delete('q');
    url.hash = '';
    try {
      await navigator.clipboard.writeText(url.href);
      button.querySelector('span').textContent = 'Link copiado';
    } catch {
      let fallback = document.querySelector('.copy-link-fallback');
      if (!fallback) { fallback = node('input', 'copy-link-fallback'); fallback.setAttribute('aria-label', 'Link desta página para copiar'); button.insertAdjacentElement('afterend', fallback); }
      fallback.value = url.href;
      fallback.focus();
      fallback.select();
    }
  });

  document.querySelectorAll('.doc-image').forEach(button => button.addEventListener('click', () => {
    const source = button.querySelector('img');
    if (!source) return;
    const dialog = showModal('<dialog open class="zoom-dialog" aria-modal="true" aria-label="Imagem ampliada"><button class="icon-button" aria-label="Fechar imagem">×</button></dialog>');
    activeModal.backdrop.classList.add('zoom-backdrop');
    dialog.append(source.cloneNode(true));
    if (source.alt) dialog.append(node('p', '', source.alt));
  }));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeModal(); closeMenu(); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); activeModal ? closeModal() : openSearch(); }
    if (event.key === 'Tab' && activeModal) {
      const focusable = [...activeModal.dialog.querySelectorAll('button:not(:disabled),input,a[href],iframe')];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });

  const query = new URL(location.href).searchParams.get('q');
  if (query) {
    const hit = [...document.querySelectorAll('.markdown p,.markdown li,.markdown h2,.markdown h3')].find(el => normalize(el.textContent).includes(normalize(query)));
    if (hit) { hit.classList.add('search-hit'); requestAnimationFrame(() => hit.scrollIntoView({ block: 'center' })); }
  }
})();