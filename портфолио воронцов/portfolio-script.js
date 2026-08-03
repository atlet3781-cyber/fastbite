const revealElements = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealElements.forEach((el) => {
  if (reduceMotion) {
    el.classList.add('visible');
  } else {
    revealObserver.observe(el);
  }
});

const modal = document.getElementById('projectModal');
const modalFrame = document.getElementById('modalFrame');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalLink = document.getElementById('modalLink');
const closeModal = document.getElementById('modalClose');

const projectData = {
  north: {
    title: 'NØRTH — premium fitness club',
    description: 'Сайт для премиального фитнес-клуба с сильной визуальной подачей и понятным путём к записи.',
    href: 'projects/north/index.html'
  },
  lusso: {
    title: 'LUSSO — contemporary cucina',
    description: 'Ресторанный проект с акцентом на атмосферу, бренд и преобразование посетителя в клиента.',
    href: 'projects/lusso/index.html'
  },
  neura: {
    title: 'NEURA — AI studio',
    description: 'Сайт для технологичной студии с впечатляющей подачей услуг и быстрым контактом.',
    href: 'projects/neura/index.html'
  },
  morrow: {
    title: 'MORROW — wealth intelligence',
    description: 'Продуктовая площадка с понятной структурой, сильным позиционированием и акцентом на доверие.',
    href: 'projects/morrow/index.html'
  }
};

document.querySelectorAll('[data-project]').forEach((card) => {
  card.addEventListener('click', () => {
    const slug = card.dataset.project;
    const data = projectData[slug];
    if (!data) return;

    modalFrame.src = data.href;
    modalTitle.textContent = data.title;
    modalDescription.textContent = data.description;
    modalLink.href = data.href;
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  });
});

function close() {
  modal.classList.remove('active');
  document.body.classList.remove('modal-open');
  modalFrame.src = '';
}

closeModal.addEventListener('click', close);
modal.addEventListener('click', (event) => {
  if (event.target.classList.contains('modal-backdrop')) close();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') close();
});

const links = document.querySelectorAll('a[href^="#"]');
links.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
