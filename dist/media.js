// Add screenshots in display order; paths are relative to index.html.
// Local videos are included below; keep assets/videos with this preview.
// An empty src shows a placeholder instead of a broken player.
window.MECHFIST_MEDIA = {
  // Leave url empty to disable downloading; set the game release asset URL to enable it.
  download: { url: 'https://github.com/ycjinyi/mechfist/releases/latest/download/MECHFIST.zip', filename: 'MECHFIST.zip', version: '0.2.0', size: '295 MB', memory: '8 GB RAM' },
  images: [
    {
      src: 'assets/boxing.png',
      caption: { en: 'Close-range combat', zh: '近距离交锋' },
      alt: { en: 'Two robots wearing red and blue boxing gloves face off in the arena.', zh: '戴着红蓝拳套的两个机器人在八角笼内近距离交锋。' }
    },
    {
      src: 'assets/MECHFIST-002.png',
      caption: { en: 'Combat from above', zh: '俯视交锋' },
      alt: { en: 'An overhead view of the red and blue robots exchanging punches in the octagonal arena.', zh: '俯视八角笼内正在交锋的红蓝机器人。' }
    },
    {
      src: 'assets/MECHFIST-004.png',
      caption: { en: 'Trading punches', zh: '贴身对攻' },
      alt: { en: 'The red and blue robots trade punches at close range inside the cage.', zh: '红蓝机器人在八角笼内贴身对攻。' }
    },
    {
      src: 'assets/MECHFIST-005.png',
      caption: { en: 'Behind the gloves', zh: '拳套后的视角' },
      alt: { en: 'A first-person view past red boxing gloves toward the blue robot at close range.', zh: '从红色拳套后方的第一人称视角，近距离面对蓝方机器人。' }
    },
    {
      src: 'assets/MECHFIST-006.png',
      caption: { en: 'Duck and counter', zh: '俯身闪避' },
      alt: { en: 'The red robot bends low with its gloves raised as the blue robot extends a punch.', zh: '蓝方机器人挥拳时，红方机器人举起拳套并俯下身。' }
    },
    {
      src: 'assets/MECHFIST-007.png',
      caption: { en: 'Opponent down', zh: '对手倒地' },
      alt: { en: 'A first-person view past blue gloves toward the red robot down on the canvas.', zh: '从蓝色拳套后方的第一人称视角，看向倒地的红方机器人。' }
    },
    {
      src: 'assets/MECHFIST-003.png',
      caption: { en: 'On the canvas', zh: '倒地瞬间' },
      alt: { en: 'An overhead view of both robots down on the arena floor.', zh: '俯视八角笼内倒在地面的两名机器人。' }
    }
  ],
  videos: {
    spectate: { src: 'assets/videos/AI-vs-AI.mp4', poster: 'assets/videos/AI-vs-AI-poster.png', title: { en: 'AI vs AI gameplay', zh: 'AI 对 AI 实机演示' } },
    player: { src: 'assets/videos/YOU-vs-AI-promo.mp4?v=nose-guard-3', poster: 'assets/videos/YOU-vs-AI-poster.png?v=nose-guard-3', title: { en: 'YOU vs AI — from motion to the ring', zh: '你 VS AI：从动作到擂台' } }
  }
};
