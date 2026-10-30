const languageButton = document.querySelector('#language');
const media = window.MECHFIST_MEDIA || { images: [], videos: {} };
const gallery = document.querySelector('#gallery');
const galleryImage = document.querySelector('#gallery-image');
const thumbnails = document.querySelector('#gallery-thumbnails');
const galleryDots = document.querySelector('#gallery-dots');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const images = media.images || [];
const modes = [...document.querySelectorAll('details.mode')];
const modeRows = modes.map(details => details.querySelector('summary'));
const modeCopies = modeRows.map(row => row.querySelector('.mode-copy'));
const downloadButton = document.querySelector('#download-demo');
const download = media.download || {};
const downloadUrl = download.url?.trim();
if (downloadUrl) {
  downloadButton.href = downloadUrl;
  downloadButton.setAttribute('download', download.filename || '');
  downloadButton.removeAttribute('aria-disabled');
} else {
  downloadButton.removeAttribute('href');
  downloadButton.removeAttribute('download');
  downloadButton.setAttribute('aria-disabled', 'true');
}
document.querySelector('#download-label').textContent = download.version ? `Demo ${download.version}` : 'Demo';
document.querySelector('#download-memory').textContent = download.memory || '—';
document.querySelector('#download-size').textContent = download.size || '—';
let language = 'en';
let selectedImage = 0;
let rowLayoutFrame;

function equalizeModeRows() {
  cancelAnimationFrame(rowLayoutFrame);
  rowLayoutFrame = requestAnimationFrame(() => {
    modeRows.forEach(row => { row.style.minHeight = '0px'; });
    modeCopies.forEach(copy => { copy.style.minHeight = '0px'; });
    // Center equal-height copy blocks; shorter text starts at the same top edge.
    // CSS heights are unscaled; visual rectangles already include page zoom.
    const copyHeight = Math.max(...modeCopies.map(copy => parseFloat(getComputedStyle(copy).height)));
    modeCopies.forEach(copy => { copy.style.minHeight = `${Math.ceil(copyHeight)}px`; });
    const height = Math.max(...modeRows.map(row => parseFloat(getComputedStyle(row).height)));
    modeRows.forEach(row => { row.style.minHeight = `${Math.ceil(height)}px`; });
  });
}
const rowObserver = new ResizeObserver(equalizeModeRows);
document.querySelectorAll('.mode-copy,.mode-label,.mode-control').forEach(element => rowObserver.observe(element));
function updatePageScale() {
  const width = window.innerWidth;
  // Fit both available axes; compact laptops bottom out at the preferred 72%.
  const scale = width <= 800 ? 1 : Math.max(.72, Math.min(1, width / 1680, window.innerHeight / 900));
  document.documentElement.style.setProperty('--page-scale', scale.toFixed(4));
  equalizeModeRows();
}
window.addEventListener('resize', updatePageScale);
updatePageScale();
document.fonts.ready.then(equalizeModeRows);

function localized(value) {
  return typeof value === 'string' ? value : value?.[language] || value?.en || '';
}

function revealThumbnail(behavior = 'smooth') {
  const button = thumbnails.children[selectedImage];
  if (!button) return;
  const strip = thumbnails.getBoundingClientRect();
  const item = button.getBoundingClientRect();
  // Pointer/viewport coordinates include the page's CSS zoom; scrollLeft does not.
  const scale = strip.width / thumbnails.offsetWidth || 1;
  if (item.left < strip.left + 3 * scale || item.right > strip.right - 3 * scale) {
    thumbnails.scrollTo({
      left: thumbnails.scrollLeft + (item.left + item.width / 2 - strip.left - strip.width / 2) / scale,
      behavior: reducedMotion.matches ? 'instant' : behavior
    });
  }
}

function showImage(index, behavior = 'smooth') {
  if (!images.length) return;
  selectedImage = (index + images.length) % images.length;
  const entry = images[selectedImage];
  if (galleryImage.getAttribute('src') !== entry.src) galleryImage.src = entry.src;
  galleryImage.alt = localized(entry.alt);
  [...thumbnails.children].forEach((button, i) => {
    button.setAttribute('aria-pressed', String(i === selectedImage));
    button.setAttribute('aria-label', `${i + 1}. ${localized(images[i].caption)}`);
    galleryDots.children[i].setAttribute('aria-pressed', String(i === selectedImage));
    galleryDots.children[i].setAttribute('aria-label', `${i + 1}. ${localized(images[i].caption)}`);
  });
  revealThumbnail(behavior);
}

images.forEach((entry, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'gallery-thumbnail';
  button.setAttribute('aria-controls', 'gallery-image');
  const image = document.createElement('img');
  image.src = entry.src;
  image.alt = '';
  image.loading = 'lazy';
  image.width = 160;
  image.height = 90;
  image.draggable = false;
  button.append(image);
  button.addEventListener('click', () => showImage(index));
  thumbnails.append(button);
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.className = 'gallery-dot';
  dot.setAttribute('aria-controls', 'gallery-image');
  dot.addEventListener('click', () => showImage(index));
  galleryDots.append(dot);
});

// Touch keeps the browser's native swipe and momentum. Mouse/pen can grab the strip.
let thumbnailDrag = null;
let suppressThumbnailClick = false;
thumbnails.addEventListener('dragstart', event => event.preventDefault());
thumbnails.addEventListener('pointerdown', event => {
  suppressThumbnailClick = false;
  if (event.pointerType === 'touch' || !event.isPrimary || event.button !== 0) return;
  thumbnails.scrollTo({ left: thumbnails.scrollLeft, behavior: 'instant' });
  thumbnailDrag = {
    id: event.pointerId,
    x: event.clientX,
    left: thumbnails.scrollLeft,
    scale: thumbnails.getBoundingClientRect().width / thumbnails.offsetWidth || 1,
    moved: false
  };
});
window.addEventListener('pointermove', event => {
  if (!thumbnailDrag || event.pointerId !== thumbnailDrag.id) return;
  const delta = event.clientX - thumbnailDrag.x;
  if (!thumbnailDrag.moved) {
    if (Math.abs(delta) < 5) return;
    thumbnailDrag.moved = true;
    suppressThumbnailClick = true;
    thumbnails.setPointerCapture(event.pointerId);
    thumbnails.classList.add('is-dragging');
  }
  event.preventDefault();
  thumbnails.scrollLeft = thumbnailDrag.left - delta / thumbnailDrag.scale;
});
function finishThumbnailDrag(event) {
  if (!thumbnailDrag || (event.pointerId !== undefined && event.pointerId !== thumbnailDrag.id)) return;
  const id = thumbnailDrag.id;
  thumbnailDrag = null;
  thumbnails.classList.remove('is-dragging');
  if (thumbnails.hasPointerCapture(id)) thumbnails.releasePointerCapture(id);
}
window.addEventListener('pointerup', finishThumbnailDrag);
window.addEventListener('pointercancel', finishThumbnailDrag);
window.addEventListener('blur', finishThumbnailDrag);
thumbnails.addEventListener('lostpointercapture', finishThumbnailDrag);
thumbnails.addEventListener('click', event => {
  if (!suppressThumbnailClick || event.detail === 0) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  suppressThumbnailClick = false;
}, true);
new ResizeObserver(() => revealThumbnail('instant')).observe(thumbnails);
for (const [id, offset] of [['gallery-prev', -1], ['gallery-next', 1]]) {
  const button = document.getElementById(id);
  button.disabled = images.length < 2;
  button.addEventListener('click', () => {
    showImage(selectedImage + offset);
    button.classList.remove('is-pulsing');
    // Restart the halo even when the user clicks repeatedly before it fades out.
    void button.offsetWidth;
    button.classList.add('is-pulsing');
  });
  button.addEventListener('animationend', event => {
    if (event.animationName === 'gallery-arrow-glow' || event.animationName === 'gallery-arrow-fade') {
      button.classList.remove('is-pulsing');
    }
  });
}
gallery.addEventListener('keydown', event => {
  const offset = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
  if (offset) { event.preventDefault(); showImage(selectedImage + offset); }
});

function pauseVideo(details) {
  details.querySelector('video')?.pause();
}

function prepareVideo(details) {
  const entry = media.videos?.[details.dataset.mode];
  if (!entry?.src || details.querySelector('.video-player')) return;
  const slot = details.querySelector('.mode-media');
  const player = document.createElement('div');
  player.className = 'video-player';
  const video = slot.querySelector('video') || document.createElement('video');
  video.controls = true;
  video.playsInline = true;
  video.preload = 'metadata';
  if (entry.poster) video.poster = entry.poster;
  video.setAttribute('aria-label', localized(entry.title));
  video.src = entry.src;
  video.textContent = language === 'en' ? 'Your browser does not support embedded video.' : '你的浏览器不支持内嵌视频。';
  const error = document.createElement('p');
  error.className = 'video-error';
  error.hidden = true;
  error.dataset.en = 'This video could not be loaded. Please try again later.';
  error.dataset.zh = '视频暂时无法加载，请稍后再试。';
  error.textContent = error.dataset[language];
  error.setAttribute('role', 'status');
  video.addEventListener('error', () => { error.hidden = false; });
  player.append(video);
  // Firefox already supplies the large central play button. Browsers with
  // WebKit-style media controls need an explicit one for this same affordance.
  if (CSS.supports('selector(video::-webkit-media-controls)')) {
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'video-play';
    play.dataset.enAria = 'Play video';
    play.dataset.zhAria = '播放视频';
    play.setAttribute('aria-label', play.dataset[`${language}Aria`]);
    play.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M9 7Q9 4 12 6L26 14Q29 16 26 18L12 26Q9 28 9 25Z"/></svg>';
    const updatePlay = () => { play.hidden = !video.paused || !!video.error; };
    play.addEventListener('click', async () => {
      try {
        await video.play();
        video.focus({ preventScroll: true });
      } catch {
        updatePlay();
      }
    });
    ['play', 'pause', 'ended', 'error'].forEach(event => video.addEventListener(event, updatePlay));
    player.append(play);
  }
  slot.replaceChildren(player, error);
}

modes.forEach(details => {
  if (details.open) prepareVideo(details);
  details.addEventListener('toggle', () => {
    if (!details.open) { pauseVideo(details); return; }
    prepareVideo(details);
  });
});

languageButton.addEventListener('click', () => {
  language = language === 'en' ? 'zh' : 'en';
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-en][data-zh]').forEach(element => {
    element.textContent = element.dataset[language];
  });
  document.querySelectorAll('[data-en-aria][data-zh-aria]').forEach(element => {
    element.setAttribute('aria-label', element.dataset[`${language}Aria`]);
  });
  modes.forEach(details => {
    const video = details.querySelector('video');
    if (video) video.setAttribute('aria-label', localized(media.videos[details.dataset.mode].title));
  });
  languageButton.textContent = language === 'en' ? '中文' : 'English';
  languageButton.setAttribute('aria-label', language === 'en' ? '切换为中文' : 'Switch to English');
  showImage(selectedImage);
  equalizeModeRows();
});
showImage(0, 'instant');
equalizeModeRows();
