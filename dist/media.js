// Add screenshots in display order; paths are relative to index.html.
// Set video src to a local MP4/WebM path or direct video URL when available.
// An empty src shows a placeholder instead of a broken player.
window.MECHFIST_MEDIA = {
  // Use the release archive URL, not an author profile or repository page.
  // Empty until the actual distributable is published; no fake download link.
  download: { url: '', filename: '' },
  images: [
    {
      src: 'assets/boxing.png',
      label: { en: 'Face to face', zh: '近距离交锋' },
      caption: { en: 'MECHFIST · IN-ENGINE IMAGE', zh: 'MECHFIST · 游戏引擎画面' },
      alt: { en: 'Two robots wearing red and blue boxing gloves face off in the arena.', zh: '戴着红蓝拳套的两个机器人在拳台上近距离交锋。' }
    },
    {
      src: 'assets/arena.png',
      label: { en: 'The octagon', zh: '八角笼全景' },
      caption: { en: 'THE OCTAGON · IN-ENGINE IMAGE', zh: '八角笼 · 游戏引擎画面' },
      alt: { en: 'An overhead view of the octagonal arena with two robots in the center.', zh: '八角笼的俯视全景，两名机器人位于场地中央。' }
    }
  ],
  videos: {
    spectate: { src: '', poster: 'assets/boxing.png', title: { en: 'AI vs AI gameplay', zh: 'AI 对 AI 实机演示' } },
    player: { src: '', poster: '', title: { en: 'Player vs AI gameplay', zh: '玩家对 AI 实机演示' } }
  }
};
