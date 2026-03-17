document.addEventListener('DOMContentLoaded', () => {
  /* ========================================
     Theme toggle
     ======================================== */
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  /* ========================================
     Content renderer
     ======================================== */
  async function renderContent() {
    let data;

    const previewData = sessionStorage.getItem('preview_content');
    if (previewData) {
      data = JSON.parse(previewData);
      sessionStorage.removeItem('preview_content');
    } else {
      const res = await fetch('content.json');
      data = await res.json();
    }

    // Hero
    const heroName = document.getElementById('hero-name');
    const heroNameJa = document.getElementById('hero-name-ja');
    const heroTitle = document.getElementById('hero-title');

    if (heroName) heroName.textContent = data.hero.name_en;
    if (heroNameJa) heroNameJa.textContent = data.hero.name_ja;
    if (heroTitle) heroTitle.textContent = data.hero.title_en;

    // About - Japanese
    const aboutJa = document.getElementById('about-ja');
    if (aboutJa) {
      aboutJa.innerHTML = '';
      data.about.ja.forEach(text => {
        const p = document.createElement('p');
        p.textContent = text;
        aboutJa.appendChild(p);
      });
    }

    // About - English
    const aboutEn = document.getElementById('about-en');
    if (aboutEn) {
      aboutEn.innerHTML = '';
      data.about.en.forEach(text => {
        const p = document.createElement('p');
        p.textContent = text;
        aboutEn.appendChild(p);
      });
    }

    // Works
    const worksList = document.getElementById('works-list');
    if (worksList) {
      worksList.innerHTML = '';
      data.works.forEach(work => {
        const li = document.createElement('li');
        li.className = 'works__item';

        const thumb = document.createElement('div');
        thumb.className = 'works__thumb';
        if (work.image) {
          thumb.style.backgroundImage = `url(images/${work.image})`;
          thumb.style.backgroundSize = 'cover';
          thumb.style.backgroundPosition = 'center';
        }

        const title = document.createElement('h3');
        title.className = 'works__title';
        title.textContent = work.title;

        const cat = document.createElement('p');
        cat.className = 'works__cat';
        cat.textContent = work.category;

        const desc = document.createElement('p');
        desc.className = 'works__desc';
        desc.textContent = work.description;

        li.appendChild(thumb);
        li.appendChild(title);
        li.appendChild(cat);
        li.appendChild(desc);
        worksList.appendChild(li);
      });
    }

    // Career
    const careerList = document.getElementById('career-list');
    if (careerList) {
      careerList.innerHTML = '';
      data.career.forEach(entry => {
        const row = document.createElement('div');
        row.className = 'career__row';

        const dt = document.createElement('dt');
        dt.className = 'career__year';
        dt.textContent = entry.year;

        const dd = document.createElement('dd');
        dd.className = 'career__text';
        dd.textContent = entry.text;

        row.appendChild(dt);
        row.appendChild(dd);
        careerList.appendChild(row);
      });
    }

    // Note
    const noteLink = document.getElementById('note-link');
    if (noteLink) {
      noteLink.href = data.note.url;
      noteLink.textContent = data.note.label + ' \u2192';
    }

    // Contact
    const contactList = document.getElementById('contact-list');
    if (contactList) {
      contactList.innerHTML = '';

      // Email
      const emailLi = document.createElement('li');
      const emailA = document.createElement('a');
      emailA.className = 'text-link';
      emailA.href = 'mailto:' + data.contact.email;
      emailA.textContent = data.contact.email;
      emailLi.appendChild(emailA);
      contactList.appendChild(emailLi);

      // Links
      data.contact.links.forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'text-link';
        a.href = link.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = link.label;
        li.appendChild(a);
        contactList.appendChild(li);
      });
    }
  }

  renderContent();
});
