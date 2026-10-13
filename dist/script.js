const slides = Array.from(document.querySelectorAll('.hero-slide'));
const currentSlide = document.querySelector('.current-slide');
const nextButton = document.querySelector('.slider-next');
const previousButton = document.querySelector('.slider-prev');
const slideTrack = document.querySelector('.hero-track');
const hero = document.querySelector('.hero');
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

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
menuToggle.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('is-open');
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
  formMessage.textContent = `Спасибо, ${name}. В рабочей версии здесь будет отправка заявки.`;
  form.reset();
});
document.querySelector('.current-year').textContent = new Date().getFullYear();

document.body.classList.add('is-ready');
const revealElements = document.querySelectorAll(
  '.intro-grid > *, .section-heading > *, .direction-card, .process-top, .process-list li, .gallery-heading > *, .gallery figure, .contact > *'
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
