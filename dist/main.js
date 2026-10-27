const languageButton = document.querySelector('#language');
const media = window.MECHFIST_MEDIA || { images: [], videos: {} };
const gallery = document.querySelector('#gallery');
const galleryImage = document.querySelector('#gallery-image');
const galleryCaption = document.querySelector('#gallery-caption');
const galleryCounter = document.querySelector('#gallery-counter');
const thumbnails = document.querySelector('#gallery-thumbnails');
const images = media.images || [];
const modes = [...document.querySelectorAll('details.mode')];
const modeRows = modes.map(details => details.querySelector('summary'));
const downloadButton = document.querySelector('#download-demo');
const downloadStatus = document.querySelector('#download-status');
if (media.download?.url) {
  downloadButton.href = media.download.url;
  downloadButton.setAttribute('download', media.download.filename || '');
  downloadButton.removeAttribute('aria-disabled');
  downloadButton.removeAttribute('tabindex');
  downloadStatus.hidden = true;
}
downloadButton.addEventListener('click', event => {
  if (downloadButton.getAttribute('aria-disabled') === 'true') event.preventDefault();
});
let language = 'en';
let selectedImage = 0;
let rowLayoutFrame;

function equalizeModeRows() {
  cancelAnimationFrame(rowLayoutFrame);
  rowLayoutFrame = requestAnimationFrame(() => {
    modeRows.forEach(row => { row.style.minHeight = '0px'; });
    const height = Math.max(...modeRows.map(row => row.getBoundingClientRect().height));
    modeRows.forEach(row => { row.style.minHeight = `${Math.ceil(height)}px`; });
  });
}
const rowObserver = new ResizeObserver(equalizeModeRows);
document.querySelectorAll('.mode-copy,.mode-label,.mode-control').forEach(element => rowObserver.observe(element));
window.addEventListener('resize', equalizeModeRows);
document.fonts.ready.then(equalizeModeRows);

function localized(value) {
  return typeof value === 'string' ? value : value?.[language] || value?.en || '';
}

function showImage(index) {
  if (!images.length) return;
  selectedImage = (index + images.length) % images.length;
  const entry = images[selectedImage];
  if (galleryImage.getAttribute('src') !== entry.src) galleryImage.src = entry.src;
  galleryImage.alt = localized(entry.alt);
  galleryCaption.textContent = localized(entry.caption);
  galleryCounter.textContent = `${String(selectedImage + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}`;
  [...thumbnails.children].forEach((button, i) => {
    button.setAttribute('aria-pressed', String(i === selectedImage));
    button.setAttribute('aria-label', `${i + 1}. ${localized(images[i].label)}`);
    button.querySelector('span').textContent = localized(images[i].label);
  });
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
  button.append(image, document.createElement('span'));
  button.addEventListener('click', () => showImage(index));
  thumbnails.append(button);
});
for (const [id, offset] of [['gallery-prev', -1], ['gallery-next', 1]]) {
  const button = document.getElementById(id);
  button.disabled = images.length < 2;
  button.addEventListener('click', () => showImage(selectedImage + offset));
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
  if (!entry?.src || details.querySelector('video')) return;
  const slot = details.querySelector('.mode-media');
  const video = document.createElement('video');
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
  slot.replaceChildren(video, error);
}

modes.forEach(details => {
  details.addEventListener('toggle', () => {
    if (!details.open) { pauseVideo(details); return; }
    modes.forEach(other => {
      if (other !== details && other.open) { other.open = false; pauseVideo(other); }
    });
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
showImage(0);
equalizeModeRows();
