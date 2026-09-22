// Reveal project sheets on scroll.
const sheets = document.querySelectorAll('.sheet');
if ('IntersectionObserver' in window){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  sheets.forEach(s => io.observe(s));
} else {
  sheets.forEach(s => s.classList.add('is-visible'));
}

// Lightbox — full-size view opened by clicking any carousel photo.
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
  <button type="button" class="lightbox-close" aria-label="Close">&times;</button>
  <button type="button" class="lightbox-btn prev" aria-label="Previous image">&lsaquo;</button>
  <img alt="">
  <button type="button" class="lightbox-btn next" aria-label="Next image">&rsaquo;</button>
`;
document.body.appendChild(lightbox);
const lightboxImg = lightbox.querySelector('img');
const lightboxPrev = lightbox.querySelector('.lightbox-btn.prev');
const lightboxNext = lightbox.querySelector('.lightbox-btn.next');
let lightboxImages = [];
let lightboxIndex = 0;

const updateLightbox = () => {
  const item = lightboxImages[lightboxIndex];
  lightboxImg.src = item.src;
  lightboxImg.alt = item.alt;
  const multi = lightboxImages.length > 1;
  lightboxPrev.style.display = multi ? 'flex' : 'none';
  lightboxNext.style.display = multi ? 'flex' : 'none';
};
const openLightbox = (images, startIndex) => {
  lightboxImages = images;
  lightboxIndex = startIndex;
  updateLightbox();
  lightbox.classList.add('is-open');
};
const closeLightbox = () => lightbox.classList.remove('is-open');

lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
lightboxPrev.addEventListener('click', () => {
  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  updateLightbox();
});
lightboxNext.addEventListener('click', () => {
  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
  updateLightbox();
});
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('is-open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxPrev.click();
  if (e.key === 'ArrowRight') lightboxNext.click();
});

// Image carousel per .sheet-media — arrows/dots only when >1 slide.
document.querySelectorAll('.sheet-media.carousel').forEach(container => {
  const slides = Array.from(container.querySelectorAll('.carousel-slide'));
  if (slides.length === 0) return;
  slides[0].classList.add('is-active');

  const images = slides
    .map(slide => slide.querySelector('img'))
    .filter(Boolean)
    .map(img => ({ src: img.src, alt: img.alt }));

  slides.forEach((slide) => {
    const img = slide.querySelector('img');
    if (img) {
      img.addEventListener('click', () => {
        const i = images.findIndex(im => im.src === img.src);
        openLightbox(images, i === -1 ? 0 : i);
      });
      slide.style.backgroundImage = `url("${img.src}")`;
      slide.classList.add('has-img-bg');
    }
  });

  if (slides.length < 2) return;

  container.classList.add('has-multiple');
  let index = 0;
  let dots = [];

  const show = (i) => {
    slides[index].classList.remove('is-active');
    dots[index].classList.remove('is-active');
    index = (i + slides.length) % slides.length;
    slides[index].classList.add('is-active');
    dots[index].classList.add('is-active');
  };

  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-btn prev';
  prevBtn.type = 'button';
  prevBtn.setAttribute('aria-label', 'Previous image');
  prevBtn.textContent = '‹';
  prevBtn.addEventListener('click', () => show(index - 1));

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-btn next';
  nextBtn.type = 'button';
  nextBtn.setAttribute('aria-label', 'Next image');
  nextBtn.textContent = '›';
  nextBtn.addEventListener('click', () => show(index + 1));

  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'carousel-dots';
  dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', `Go to image ${i + 1}`);
    dot.addEventListener('click', () => show(i));
    dotsWrap.appendChild(dot);
    return dot;
  });

  container.append(prevBtn, nextBtn, dotsWrap);
});
