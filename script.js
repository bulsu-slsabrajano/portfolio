const header      = document.querySelector('.site-header');
const navMenu     = document.getElementById('site-nav');
const menuToggle  = document.getElementById('menu-toggle');
const themeToggle = document.getElementById('theme-toggle');
const navLinks    = document.querySelectorAll('.nav-link');
const anchorLinks = document.querySelectorAll('a[href^="#"]');
const sections    = document.querySelectorAll('#home, #about, #projects, #contact');

const THEME_KEY = 'portfolio-theme';
let scrollLockUntil = 0;

function applyTheme(isDark) {
  document.body.classList.toggle('dark', isDark);
  themeToggle.setAttribute('aria-checked', String(isDark));
}

function loadSavedTheme() {
  try {
    applyTheme(localStorage.getItem(THEME_KEY) === 'dark');
  } catch (error) {
    applyTheme(false);
  }
}

function toggleTheme() {
  const isDark = !document.body.classList.contains('dark');
  applyTheme(isDark);
  try {
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  } catch (error) {
  }
}

themeToggle.addEventListener('click', toggleTheme);
loadSavedTheme();

function setMenuOpen(isOpen) {
  navMenu.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
}

menuToggle.addEventListener('click', () => {
  setMenuOpen(!navMenu.classList.contains('open'));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenuOpen(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 860) setMenuOpen(false);
});

function setActiveLink(sectionId) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === '#' + sectionId;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function scrollToSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (!target) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

function handleAnchorClick(event) {
  const sectionId = this.getAttribute('href').slice(1);
  if (!sectionId || !document.getElementById(sectionId)) return;

  event.preventDefault();
  scrollLockUntil = Date.now() + 900;
  scrollToSection(sectionId);
  setActiveLink(sectionId);
  history.replaceState(null, '', '#' + sectionId);
  setMenuOpen(false);

  setTimeout(updateActiveOnScroll, 950);
}

anchorLinks.forEach((link) => link.addEventListener('click', handleAnchorClick));

function updateActiveOnScroll() {
  if (Date.now() < scrollLockUntil) return;

  const offset = header.offsetHeight + 120;
  let currentId = sections[0].id;

  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= offset) currentId = section.id;
  });

  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atBottom) currentId = sections[sections.length - 1].id;

  setActiveLink(currentId);
}

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(() => {
    updateActiveOnScroll();
    scrollTicking = false;
  });
});

updateActiveOnScroll();

const revealItems = document.querySelectorAll('[data-reveal]');

function setupRevealAnimations() {
  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio >= 0.15) {
        entry.target.classList.add('visible');
      } else if (!entry.isIntersecting) {
        entry.target.classList.remove('visible');
      }
    });
  }, { threshold: [0, 0.15] });

  revealItems.forEach((item) => observer.observe(item));
}

setupRevealAnimations();

const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();