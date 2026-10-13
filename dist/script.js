const slides = Array.from(document.querySelectorAll('.hero-slide'));
const currentSlide = document.querySelector('.current-slide');
const nextButton = document.querySelector('.slider-next');
const previousButton = document.querySelector('.slider-prev');
const slideTrack = document.querySelector('.hero-track');
const hero = document.querySelector('.hero');
if (slides.length) {
const firstClone = slides[0].cloneNode(true);
const lastClone = slides[slides.length - 1].cloneNode(true);

firstClone.setAttribute('aria-hidden', 'true');
lastClone.setAttribute('aria-hidden', 'true');
slideTrack.append(firstClone);
slideTrack.prepend(lastClone);
slideTrack.style.setProperty('--slides', slides.length + 2);

let activeIndex = 0;
let renderedIndex = 1;
let isMoving = false;
let timer;
let swipeStart = null;

function updateSlideState() {
  slides.forEach((slide, i) => slide.classList.toggle('is-active', i === activeIndex));
  currentSlide.textContent = String(activeIndex + 1).padStart(2, '0');
}

function setTrackPosition(index, animated = true) {
  slideTrack.style.transition = animated ? '' : 'none';
  slideTrack.style.transform = `translateX(-${index * (100 / (slides.length + 2))}%)`;
}

function moveSlide(direction) {
  if (isMoving) return;
  isMoving = true;
  activeIndex = (activeIndex + direction + slides.length) % slides.length;
  renderedIndex += direction;
  updateSlideState();
  setTrackPosition(renderedIndex);
}

function resetTrackPosition(index) {
  setTrackPosition(index, false);
  void slideTrack.offsetHeight;
  slideTrack.style.transition = '';
}

slideTrack.addEventListener('transitionend', (event) => {
  if (event.propertyName !== 'transform') return;
  isMoving = false;
  if (renderedIndex === 0) {
    renderedIndex = slides.length;
    resetTrackPosition(renderedIndex);
  } else if (renderedIndex === slides.length + 1) {
    renderedIndex = 1;
    resetTrackPosition(renderedIndex);
  }
});

function startAutoplay() {
  window.clearInterval(timer);
  timer = window.setInterval(() => moveSlide(1), 6000);
}

setTrackPosition(renderedIndex, false);
updateSlideState();
nextButton.addEventListener('click', () => { moveSlide(1); startAutoplay(); });
previousButton.addEventListener('click', () => { moveSlide(-1); startAutoplay(); });
hero.addEventListener('mouseenter', () => window.clearInterval(timer));
hero.addEventListener('mouseleave', startAutoplay);
hero.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'mouse' || event.target.closest('a, button')) return;
  swipeStart = { x: event.clientX, y: event.clientY };
}, { passive: true });
hero.addEventListener('pointerup', (event) => {
  if (!swipeStart) return;
  const distanceX = event.clientX - swipeStart.x;
  const distanceY = event.clientY - swipeStart.y;
  swipeStart = null;
  if (Math.abs(distanceX) < 48 || Math.abs(distanceX) <= Math.abs(distanceY)) return;
  moveSlide(distanceX < 0 ? 1 : -1);
  startAutoplay();
});
hero.addEventListener('pointercancel', () => { swipeStart = null; });
startAutoplay();
}

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
const siteHeader = document.querySelector('.site-header');
menuToggle.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('is-open');
  siteHeader.classList.toggle('menu-is-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('is-open');
  siteHeader.classList.remove('menu-is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

const form = document.querySelector('.contact-form');
const formMessage = document.querySelector('.form-message');
form.addEventListener('submit', event => {
  event.preventDefault();
  const name = form.elements.name.value.trim();
  const contact = form.elements.contact.value.trim();
  if (!name || !contact) {
    formMessage.textContent = 'Пожалуйста, укажите имя и способ связи.';
    return;
  }
  formMessage.textContent = `Спасибо, ${name}! Мы с вами свяжемся.`;
  form.reset();
});
document.querySelector('.current-year').textContent = new Date().getFullYear();

function playPageEntrance() {
  document.body.classList.remove('is-ready');
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => document.body.classList.add('is-ready'));
  });
}

playPageEntrance();
window.addEventListener('pageshow', event => {
  if (event.persisted) playPageEntrance();
});
const revealElements = document.querySelectorAll(
  '.intro-grid > *, .section-heading > *, .direction-card, .process-top, .process-list li, .gallery-heading > *, .gallery figure, .contact > *, .page-intro > *, .works-layout > *, .work-item, .about-story > *, .about-portrait, .values-list > *'
);
revealElements.forEach(element => element.classList.add('reveal'));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12, rootMargin: '0px 0px -28px' });

revealElements.forEach(element => revealObserver.observe(element));

const workItems = Array.from(document.querySelectorAll('.work-item'));
const workImage = document.querySelector('.work-image img');
const workIndex = document.querySelector('.work-index');
const workPrevious = document.querySelector('.work-prev');
const workNext = document.querySelector('.work-next');

if (workItems.length && workImage && workIndex) {
  let activeWork = 0;
  const selectWork = index => {
    activeWork = (index + workItems.length) % workItems.length;
    const item = workItems[activeWork];
    workItems.forEach((work, position) => {
      const isActive = position === activeWork;
      work.classList.toggle('is-active', isActive);
      work.setAttribute('aria-expanded', String(isActive));
    });
    workImage.classList.add('is-changing');
    window.setTimeout(() => {
      workImage.src = item.dataset.image;
      workImage.alt = item.dataset.alt;
      workIndex.textContent = String(activeWork + 1).padStart(2, '0');
      workImage.classList.remove('is-changing');
    }, 160);
  };

  workItems.forEach((item, index) => item.addEventListener('click', () => selectWork(index)));
  workPrevious.addEventListener('click', () => selectWork(activeWork - 1));
  workNext.addEventListener('click', () => selectWork(activeWork + 1));
}
