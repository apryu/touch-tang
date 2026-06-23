/* ============================================
   Touch Tang 🐾 — 交互脚本
   功能：多语言切换 / 图片预加载 / 鼠标跟踪 / 双击互动
   ============================================ */

/* ==========================================
   第一部分：多语言支持 (Phase 3)
   ========================================== */

// 翻译数据：中文 / English / 한국어
const translations = {
  zh: {
    title: '摸摸 糖 🐾',
    subtitle: '移动鼠标，看 糖 的眼神跟着你！',
    hint: '双击 糖 摸摸他！💕',
    'music-label': '🎵 背景音乐',
    loading: '加载中...',
    'timer-label': '和 糖 一起专注吧！',
    'timer-countdown': '⏳ 倒计时',
    'timer-countup': '⏱ 正计时',
    'timer-hours': '小时',
    'timer-minutes': '分钟',
    'timer-start': '▶ 开始',
    'timer-resume': '▶ 继续',
    'timer-restart': '⟳ 重新开始',
    'timer-pause': '⏸ 暂停',
    'timer-reset': '↺ 重置',
    'timer-alert': '请输入有效时间',
    'food-label': '🍽 喂 糖',
    'feed-count': '{n} / 5',
    'food-full': '吃饱啦~ 等会儿再喂哦',
    'food-hint': '↕ 拖拽到 糖 嘴边试试吧',
  },
  en: {
    title: 'Touch Tang 🐾',
    subtitle: "Move your mouse and watch Tang's eyes follow you!",
    hint: 'Double-click Tang to pet him! 💕',
    'music-label': '🎵 BGM',
    loading: 'Loading...',
    'timer-label': 'Focus with Tang!',
    'timer-countdown': '⏳ Countdown',
    'timer-countup': '⏱ Count Up',
    'timer-hours': 'hr',
    'timer-minutes': 'min',
    'timer-start': '▶ Start',
    'timer-resume': '▶ Resume',
    'timer-restart': '⟳ Restart',
    'timer-pause': '⏸ Pause',
    'timer-reset': '↺ Reset',
    'timer-alert': 'Please enter a valid time',
    'food-label': '🍽 Feed Tang',
    'feed-count': '{n} / 5',
    'food-full': 'So full~ Wait a bit!',
    'food-hint': '↕ Drag to Tang\'s mouth!',
  },
  ko: {
    title: '탕을 만져보세요 🐾',
    subtitle: '마우스를 움직이면 탕의 눈이 따라와요!',
    hint: '탕을 두 번 클릭해서 쓰다듬어 주세요! 💕',
    'music-label': '🎵 배경음악',
    loading: '로딩 중...',
    'timer-label': '탕이와 함께 집중해요!',
    'timer-countdown': '⏳ 카운트다운',
    'timer-countup': '⏱ 카운트업',
    'timer-hours': '시간',
    'timer-minutes': '분',
    'timer-start': '▶ 시작',
    'timer-resume': '▶ 계속',
    'timer-restart': '⟳ 다시시작',
    'timer-pause': '⏸ 일시정지',
    'timer-reset': '↺ 초기화',
    'timer-alert': '유효한 시간을 입력하세요',
    'food-label': '🍽 탕에게 먹이',
    'feed-count': '{n} / 5',
    'food-full': '배불러요~ 조금 이따 주세요!',
    'food-hint': '↕ 탕의 입으로 드래그하세요!',
  },
};

/** 当前语言 */
let currentLang = 'en';

/**
 * 切换页面语言
 * 遍历所有带 data-i18n 属性的元素，更新其文字
 * @param {string} lang - 语言代码：'zh' | 'en' | 'ko'
 */
function switchLanguage(lang) {
  if (!translations[lang]) return;  // 不支持的语言，忽略
  currentLang = lang;

  // 更新所有带 data-i18n 标记的元素
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // 更新语言按钮的激活状态
  const buttons = document.querySelectorAll('.lang-btn');
  buttons.forEach((btn) => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 更新 HTML lang 属性
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang === 'ko' ? 'ko' : 'en';

  // 保存到 localStorage，下次打开页面时记住
  localStorage.setItem('tang-lang', lang);

  // 刷新计时器 & 食物面板的动态文字
  refreshTimerI18n();
  updateFeedCountDisplay();

  // 刷新食物面板静态 i18n
  if (foodPanel) {
    foodPanel.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });
  }
}

/**
 * 检测用户浏览器的语言
 * 返回我们支持的最近语言代码
 */
function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage || 'en';
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('ko')) return 'ko';
  return 'en';  // 默认英文
}

// 页面加载时初始化语言
function initLanguage() {
  // 优先使用已保存的语言，其次检测浏览器语言
  const savedLang = localStorage.getItem('tang-lang');
  const lang = savedLang || detectBrowserLanguage();
  switchLanguage(lang);
}

// 绑定语言按钮点击事件
function bindLanguageButtons() {
  const buttons = document.querySelectorAll('.lang-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      switchLanguage(lang);
    });
  });
}

/* ==========================================
   第二部分：图片预加载 (Phase 4)
   ========================================== */

// 所有需要预加载的猫咪图片文件名（不含路径）
const CAT_IMAGES = [
  'x.png',
  '00.png', '01.png', '02.png', '03.png',
  '04.png', '05.png', '06.png', '07.png',
  '08.png', '09.png', '10.png', '11.png',
  '12.png', '13.png', '14.png', '15.png',
  'touch.png',
];

// 存放预加载好的 Image 对象
const preloadedImages = {};
let imagesLoaded = 0;
let allImagesReady = false;

/**
 * 预加载一张图片
 * @param {string} filename - 图片文件名（例如 "x.png"）
 * @returns {Promise} - 加载完成时 resolve
 */
function preloadImage(filename) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      preloadedImages[filename] = img;
      imagesLoaded++;
      updateLoadingProgress();
      resolve();
    };
    img.onerror = () => {
      // 即使加载失败也不阻塞，显示错误并继续
      console.warn('图片加载失败：' + filename);
      imagesLoaded++;
      updateLoadingProgress();
      resolve();
    };
    img.src = 'tang_pic/' + filename;
  });
}

/**
 * 更新加载进度提示
 */
function updateLoadingProgress() {
  const msgEl = document.getElementById('loading-msg');
  if (!msgEl) return;

  if (imagesLoaded < CAT_IMAGES.length) {
    msgEl.classList.add('show');
    msgEl.textContent = translations[currentLang].loading + ' (' + imagesLoaded + '/' + CAT_IMAGES.length + ')';
  } else {
    // 全部加载完毕
    allImagesReady = true;
    msgEl.classList.remove('show');
    console.log('🐾 所有 ' + CAT_IMAGES.length + ' 张图片预加载完毕！');
  }
}

/**
 * 预加载所有猫咪图片
 */
async function preloadAllImages() {
  console.log('🐾 开始预加载 ' + CAT_IMAGES.length + ' 张图片...');
  const promises = CAT_IMAGES.map((filename) => preloadImage(filename));
  await Promise.all(promises);
}


/* ==========================================
   第三部分：鼠标跟踪 — 眼神跟随 (Phase 5)
   ========================================== */

// DOM 元素引用（在 init 中赋值）
let catImg = null;
let catContainer = null;

/** 猫咪中心死区半径（像素），鼠标在此范围内显示 x.png */
const DEAD_ZONE_RADIUS = 80;

/** 当前显示的图片文件名 */
let currentImage = 'x.png';

/**
 * 根据鼠标位置计算应该显示哪张方向图
 * @param {number} mouseX - 鼠标 X 坐标（相对于视口）
 * @param {number} mouseY - 鼠标 Y 坐标（相对于视口）
 * @param {DOMRect} catRect - 猫咪图片的边界矩形
 * @returns {string} 图片文件名（如 "05.png" 或 "x"）
 */
function getDirectionImage(mouseX, mouseY, catRect) {
  // 计算猫咪中心点
  const catCenterX = catRect.left + catRect.width / 2;
  const catCenterY = catRect.top + catRect.height / 2;

  // 鼠标相对于猫咪中心的偏移
  const dx = mouseX - catCenterX;
  const dy = mouseY - catCenterY;

  // 计算鼠标距离猫咪中心的距离
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 如果鼠标在死区范围内 → 显示 x.png（看中间）
  if (distance < DEAD_ZONE_RADIUS) {
    return 'x.png';
  }

  // ----- 角度计算 -----
  // Math.atan2(-dx, dy) 得到从"正下方"顺时针旋转的角度
  // 0 = 正下方, π/2 = 正左, π = 正上方, 3π/2 = 正右
  let angle = Math.atan2(-dx, dy);

  // 归一化到 [0, 2π)
  if (angle < 0) {
    angle += 2 * Math.PI;
  }

  // 16 个方向，每个方向 22.5°（π/8 弧度）
  const sliceAngle = Math.PI / 8;
  let index = Math.round(angle / sliceAngle) % 16;

  // 格式化为两位数文件名（如 "00", "05", "12"）
  const filename = String(index).padStart(2, '0') + '.png';
  return filename;
}

/**
 * 更新猫咪图片（只在方向改变时才切换，避免不必要的重绘）
 * @param {string} filename - 图片文件名
 */
function updateCatImage(filename) {
  if (filename === currentImage) return;  // 没变化，不切换
  currentImage = filename;
  catImg.src = 'tang_pic/' + filename;
}

/** requestAnimationFrame 的 ID，用于节流 */
let rafId = null;
/** 暂存最新的鼠标位置 */
let pendingMouseX = 0;
let pendingMouseY = 0;

/**
 * 鼠标移动时的处理函数
 * 使用 requestAnimationFrame 节流，保证流畅但不浪费性能
 */
function onMouseMove(event) {
  pendingMouseX = event.clientX;
  pendingMouseY = event.clientY;

  // 如果已经有一个待处理的帧，不重复请求
  if (rafId) return;

  rafId = requestAnimationFrame(() => {
    rafId = null;
    if (!allImagesReady) return;  // 图片还没加载完，不处理
    if (isSpecialScreen) return;  // 特殊画面中，不打断

    // 获取猫咪图片的当前位置（可能随滚动/缩放变化）
    const rect = catImg.getBoundingClientRect();
    const filename = getDirectionImage(pendingMouseX, pendingMouseY, rect);
    updateCatImage(filename);
  });
}

/**
 * 鼠标离开页面时 → 恢复 x.png
 */
function onMouseLeave() {
  if (allImagesReady) {
    updateCatImage('x.png');
  }
}


/* ==========================================
   第四部分：双击互动 — 摸摸猫咪 (Phase 6)
   ========================================== */

/** 是否正在显示摸摸状态（防止连续双击） */
let isPetting = false;
/** 是否正在显示特殊画面（防止鼠标跟踪打断） */
let isSpecialScreen = false;
/** 摸摸状态持续时间（毫秒） */
const PET_DURATION = 1200;
/** 猫叫声播放器 */
let meowAudio = null;

/**
 * 双击猫咪时触发摸摸互动
 */
function onCatDoubleClick(event) {
  event.preventDefault();

  // 清除浏览器文字选中（防止双击出现蓝色高亮）
  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  }

  if (isPetting) return;   // 还在摸摸中，不重复触发
  if (!allImagesReady) return;  // 图片没加载完

  isPetting = true;

  // 显示摸摸图片
  updateCatImage('touch.png');

  // 播放猫叫声
  if (meowAudio) {
    meowAudio.currentTime = 0;  // 从头播放
    meowAudio.play().catch((err) => {
      // 浏览器可能会阻止自动播放，忽略错误
      console.warn('猫叫声播放失败：', err.message);
    });
  }

  // 定时恢复
  setTimeout(() => {
    isPetting = false;
    // 根据最后一次记录的鼠标位置恢复眼神方向
    if (allImagesReady) {
      const rect = catImg.getBoundingClientRect();
      const filename = getDirectionImage(pendingMouseX, pendingMouseY, rect);
      updateCatImage(filename);
    }
  }, PET_DURATION);
}


/* ==========================================
   第五部分：音乐播放器 (Phase 8)
   ========================================== */

// 播放列表 — 使用 background music 文件夹中的歌曲
const PLAYLIST = [
  {
    title: 'Blueberry Eyes — Max (Feat. SUGA)',
    file: 'background music/Blueberry Eyes—Max（Feat.SUGA）.m4a',
  },
  {
    title: 'Song Request — Lee Sora (Feat. SUGA)',
    file: 'background music/Song Request—Lee Sora（Feat.SUGA）.m4a',
  },
];

/** 当前播放的歌曲索引 */
let currentTrackIndex = 0;
/** 背景音乐 audio 元素 */
let bgmAudio = null;
/** 是否正在播放 */
let isPlaying = false;

// DOM 引用
let songInfoEl = null;
let btnPlay = null;
let btnPrev = null;
let btnNext = null;
let volumeSlider = null;

/**
 * 更新歌曲信息显示
 * 如果歌名太长，添加横向滚动效果
 */
function updateSongInfo() {
  if (!songInfoEl) return;
  const track = PLAYLIST[currentTrackIndex];

  // 只设置一次歌名，不重复
  songInfoEl.textContent = track.title;
  songInfoEl.classList.remove('scrolling');

  // 等浏览器完成布局后检查是否溢出
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const wrap = songInfoEl.parentElement;
      const overflow = songInfoEl.scrollWidth - wrap.clientWidth;
      if (overflow > 4) {
        // 设置滚动距离 CSS 变量，实现：文字左移 → 末尾可见 → 停顿 → 回位
        songInfoEl.style.setProperty('--scroll-dist', '-' + overflow + 'px');
        songInfoEl.classList.add('scrolling');
      } else {
        songInfoEl.classList.remove('scrolling');
      }
    });
  });
}

/**
 * 加载当前歌曲
 */
function loadCurrentTrack() {
  if (!bgmAudio) return;
  const track = PLAYLIST[currentTrackIndex];
  // 直接使用原始路径（浏览器会自动处理 Unicode 和空格）
  bgmAudio.src = track.file;
  bgmAudio.load();
  updateSongInfo();
}

/**
 * 播放当前歌曲
 */
function playMusic() {
  if (!bgmAudio) return;
  bgmAudio.play().then(() => {
    isPlaying = true;
    btnPlay.textContent = '⏸';
  }).catch((err) => {
    console.warn('音乐播放失败：', err.message);
  });
}

/**
 * 暂停音乐
 */
function pauseMusic() {
  if (!bgmAudio) return;
  bgmAudio.pause();
  isPlaying = false;
  btnPlay.textContent = '▶';
}

/**
 * 播放 / 暂停 切换
 */
function togglePlay() {
  if (isPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
}

/**
 * 播放上一首
 */
function playPrev() {
  currentTrackIndex = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
  loadCurrentTrack();
  playMusic();
}

/**
 * 播放下一首
 */
function playNext() {
  currentTrackIndex = (currentTrackIndex + 1) % PLAYLIST.length;
  loadCurrentTrack();
  playMusic();
}

/**
 * 音量改变
 */
function onVolumeChange() {
  if (!bgmAudio || !volumeSlider) return;
  bgmAudio.volume = volumeSlider.value / 100;
}

/**
 * 初始化音乐播放器
 */
function initMusicPlayer() {
  bgmAudio = document.getElementById('bgm-audio');
  songInfoEl = document.getElementById('song-info');
  btnPlay = document.getElementById('btn-play');
  btnPrev = document.getElementById('btn-prev');
  btnNext = document.getElementById('btn-next');
  volumeSlider = document.getElementById('volume-slider');

  if (!bgmAudio) return;

  // 设置初始音量
  bgmAudio.volume = volumeSlider ? volumeSlider.value / 100 : 0.7;

  // 加载第一首歌
  loadCurrentTrack();

  // 绑定按钮事件
  btnPlay.addEventListener('click', togglePlay);
  btnPrev.addEventListener('click', playPrev);
  btnNext.addEventListener('click', playNext);
  volumeSlider.addEventListener('input', onVolumeChange);

  // 歌曲播放完毕自动切下一首
  bgmAudio.addEventListener('ended', () => {
    playNext();
  });

  // 歌曲元数据加载完成后更新显示
  bgmAudio.addEventListener('loadedmetadata', () => {
    updateSongInfo();
  });

  console.log('🎵 音乐播放器就绪，共 ' + PLAYLIST.length + ' 首歌');
}


/* ==========================================
   第六部分：计时器 — 奶瓶专注计时 (Phase 7+)
   ========================================== */

/** 计时器状态 */
let timerMode = 'countdown';    // 'countdown' | 'countup'
let timerTargetSeconds = 0;    // 倒计时目标秒数
let timerElapsedSeconds = 0;   // 正计时已过秒数 / 已过秒数
let timerRunning = false;
let timerIntervalId = null;

// DOM 引用
let timerPanel = null;
let timerDisplay = null;
let bottleFill = null;
let btnTimerStart = null;
let btnTimerPause = null;
let btnTimerReset = null;
let timerInputHr = null;
let timerInputMin = null;
let timerInputWrap = null;

/**
 * 格式化秒数为 HH:MM:SS
 * @param {number} totalSeconds
 * @returns {string}
 */
function formatHMS(totalSeconds) {
  if (totalSeconds < 0) totalSeconds = 0;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return String(h).padStart(2, '0') + ':' +
         String(m).padStart(2, '0') + ':' +
         String(s).padStart(2, '0');
}

/**
 * 计算奶瓶填充高度百分比
 */
function calcFillLevel() {
  if (timerMode === 'countdown') {
    if (timerTargetSeconds <= 0) return 100;
    // 倒计时：剩余越多，液面越高
    const remaining = timerTargetSeconds - timerElapsedSeconds;
    return Math.max(0, Math.min(100, (remaining / timerTargetSeconds) * 100));
  } else {
    // 正计时：液面从 0 开始上升，最多到 100%
    // 以 1 小时为满瓶基准
    return Math.min(100, (timerElapsedSeconds / 3600) * 100);
  }
}

/**
 * 更新计时器显示和液面
 */
function updateTimerUI() {
  if (!timerDisplay || !bottleFill) return;

  if (timerMode === 'countdown') {
    const remaining = Math.max(0, timerTargetSeconds - timerElapsedSeconds);
    timerDisplay.textContent = formatHMS(remaining);
  } else {
    timerDisplay.textContent = formatHMS(timerElapsedSeconds);
  }

  bottleFill.style.height = calcFillLevel() + '%';
}

/**
 * 计时结束处理
 */
function onTimerFinish() {
  timerRunning = false;
  clearInterval(timerIntervalId);
  timerIntervalId = null;

  // 显示猫咪反应
  if (allImagesReady && catImg) {
    updateCatImage('touch.png');
    setTimeout(() => {
      if (allImagesReady) {
        const rect = catImg.getBoundingClientRect();
        const filename = getDirectionImage(pendingMouseX, pendingMouseY, rect);
        updateCatImage(filename);
      }
    }, 1500);
  }

  // 播放提示音（复用猫叫声）
  if (meowAudio) {
    meowAudio.currentTime = 0;
    meowAudio.play().catch(() => {});
  }

  // 按钮恢复
  setTimerStartBtn('start');
  if (btnTimerPause) btnTimerPause.disabled = true;

  // 液面闪烁效果
  if (bottleFill) {
    bottleFill.style.animation = 'fillFlash 0.5s ease 3';
    setTimeout(() => {
      bottleFill.style.animation = '';
    }, 1500);
  }

  // 重置到初始状态
  timerElapsedSeconds = 0;
  updateTimerUI();
  timerPanel.classList.remove('running');
}

/**
 * 计时器滴答
 */
function timerTick() {
  timerElapsedSeconds++;

  if (timerMode === 'countdown' && timerElapsedSeconds >= timerTargetSeconds) {
    onTimerFinish();
    return;
  }

  updateTimerUI();
}

/**
 * 开始计时
 */
function startTimer() {
  if (timerRunning) return;

  if (timerMode === 'countdown') {
    const hours = parseInt(timerInputHr.value, 10) || 0;
    const minutes = parseInt(timerInputMin.value, 10) || 0;
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes < 1) {
      alert(translations[currentLang]['timer-alert']);
      return;
    }
    timerTargetSeconds = totalMinutes * 60;
    timerElapsedSeconds = 0;
  } else {
    timerElapsedSeconds = 0;
  }

  timerRunning = true;
  timerPanel.classList.add('running');

  setTimerStartBtn('restart');
  if (btnTimerPause) btnTimerPause.disabled = false;

  updateTimerUI();

  timerIntervalId = setInterval(timerTick, 1000);
}

/**
 * 更新开始按钮文字（根据语言和状态）
 * @param {'start'|'resume'|'restart'} state
 */
function setTimerStartBtn(state) {
  if (!btnTimerStart) return;
  const key = state === 'start' ? 'timer-start' : state === 'resume' ? 'timer-resume' : 'timer-restart';
  btnTimerStart.textContent = translations[currentLang][key];
  btnTimerStart.disabled = false;
}

/**
 * 暂停计时
 */
function pauseTimer() {
  if (!timerRunning) return;
  timerRunning = false;
  clearInterval(timerIntervalId);
  timerIntervalId = null;

  timerPanel.classList.remove('running');

  setTimerStartBtn('resume');
  if (btnTimerPause) btnTimerPause.disabled = true;
}

/**
 * 重置计时
 */
function resetTimer() {
  timerRunning = false;
  clearInterval(timerIntervalId);
  timerIntervalId = null;
  timerElapsedSeconds = 0;
  timerTargetSeconds = 0;

  timerPanel.classList.remove('running');

  setTimerStartBtn('start');
  if (btnTimerPause) btnTimerPause.disabled = true;

  if (timerDisplay) timerDisplay.textContent = '00:00:00';
  if (bottleFill) bottleFill.style.height = '0%';
}

/**
 * 切换计时模式
 */
function switchTimerMode(mode) {
  if (timerRunning) {
    // 正在计时中，先重置再切换
    resetTimer();
  }

  timerMode = mode;
  timerElapsedSeconds = 0;
  timerTargetSeconds = 0;

  // 更新模式按钮
  document.getElementById('mode-countdown').classList.toggle('active', mode === 'countdown');
  document.getElementById('mode-countup').classList.toggle('active', mode === 'countup');

  // 倒计时模式显示输入框，正计时隐藏
  if (mode === 'countup') {
    timerPanel.classList.add('countup-mode');
  } else {
    timerPanel.classList.remove('countup-mode');
  }

  if (timerDisplay) timerDisplay.textContent = '00:00:00';
  if (bottleFill) bottleFill.style.height = '0%';
}

/**
 * 刷新计时器上所有带 data-i18n 的元素文字
 * 在语言切换时调用
 */
function refreshTimerI18n() {
  // 刷新静态 i18n 元素（timer-content 内的）
  const i18nEls = document.querySelectorAll('.timer-content [data-i18n]');
  i18nEls.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });

  // 刷新动态按钮文字
  if (btnTimerStart) {
    if (!timerRunning && timerElapsedSeconds === 0) {
      setTimerStartBtn('start');
    } else if (!timerRunning) {
      setTimerStartBtn('resume');
    } else {
      setTimerStartBtn('restart');
    }
  }
}

/**
 * 初始化计时器
 */
function initTimer() {
  timerPanel = document.getElementById('timer-panel');
  timerDisplay = document.getElementById('timer-display');
  bottleFill = document.getElementById('bottle-fill');
  btnTimerStart = document.getElementById('btn-timer-start');
  btnTimerPause = document.getElementById('btn-timer-pause');
  btnTimerReset = document.getElementById('btn-timer-reset');
  timerInputHr = document.getElementById('timer-input-hr');
  timerInputMin = document.getElementById('timer-input-min');
  timerInputWrap = document.getElementById('timer-input-wrap');

  if (!timerPanel) return;

  // 模式切换按钮
  document.getElementById('mode-countdown').addEventListener('click', () => switchTimerMode('countdown'));
  document.getElementById('mode-countup').addEventListener('click', () => switchTimerMode('countup'));

  // 控制按钮
  btnTimerStart.addEventListener('click', startTimer);
  btnTimerPause.addEventListener('click', pauseTimer);
  btnTimerReset.addEventListener('click', resetTimer);

  // 默认倒计时模式
  switchTimerMode('countdown');

  // 初次加载时按当前语言刷新所有 timer 文字
  refreshTimerI18n();

  console.log('⏱ 奶瓶计时器就绪');
}

/* ==========================================
   第七部分：食物拖拽喂食系统
   ========================================== */

// DOM 引用
let foodPanel = null;
let foodSlots = null;
let eatAudio = null;
let feedCountEl = null;

/** 喂食计数器 */
let feedCount = 0;
/** 最大喂食次数（冷却前） */
const MAX_FEEDS = 5;
/** 吃饱状态冷却 */
let isFull = false;
/** 正在拖拽的食物数据 */
let dragData = null;
/** 拖拽克隆元素 */
let dragClone = null;
/** 原始食物槽元素 */
let dragSourceSlot = null;

/**
 * 开始拖拽食物
 */
function onFoodPointerDown(event) {
  if (isFull) return;
  if (isPetting) return;

  const slot = event.currentTarget;
  if (slot.classList.contains('is-full')) return;
  if (slot.dataset.food === 'empty') return;

  const foodImg = slot.querySelector('.food-item');
  if (!foodImg) return;

  // 创建拖拽克隆（比原食物稍大，看起来像"拿起来了"）
  const slotRect = slot.getBoundingClientRect();
  dragClone = document.createElement('img');
  dragClone.src = foodImg.src;
  dragClone.className = 'food-drag-clone';
  dragClone.style.width = (slotRect.width * 0.9) + 'px';
  dragClone.style.height = (slotRect.height * 0.9) + 'px';
  dragClone.style.objectFit = 'contain';
  dragClone.style.left = (event.clientX - slotRect.width * 0.45) + 'px';
  dragClone.style.top = (event.clientY - slotRect.height * 0.45) + 'px';
  document.body.appendChild(dragClone);

  dragData = { food: slot.dataset.food };
  dragSourceSlot = slot;

  event.preventDefault();
}

/**
 * 拖拽移动
 */
function onFoodPointerMove(event) {
  if (!dragClone) return;
  dragClone.style.left = (event.clientX - 30) + 'px';
  dragClone.style.top = (event.clientY - 30) + 'px';
}

/**
 * 释放食物 — 检测是否喂给猫咪
 */
function onFoodPointerUp(event) {
  if (!dragClone || !dragSourceSlot) return;

  // 检测是否落在猫咪头部附近
  const catRect = catImg.getBoundingClientRect();
  const catHeadCX = catRect.left + catRect.width / 2;
  const catHeadCY = catRect.top + catRect.height * 0.25;  // 头部在上半部分
  const dist = Math.hypot(event.clientX - catHeadCX, event.clientY - catHeadCY);
  const feedThreshold = catRect.width * 0.28;  // 触发半径

  // 移除拖拽克隆
  dragClone.remove();
  dragClone = null;

  if (dist < feedThreshold && allImagesReady) {
    // ✅ 喂食成功 — 根据食物类型走不同逻辑
    if (dragData && dragData.food === 'agustd') {
      triggerSpecialFeed(event.clientX, event.clientY);
    } else {
      triggerFeedSequence(event.clientX, event.clientY);
    }
  } else {
    // ❌ 没对准 — 食物立刻恢复原位（无冷却）
    showFloatingMsg(event.clientX, event.clientY, '💨', 800);
  }

  dragData = null;
  dragSourceSlot = null;
}

/**
 * 喂食成功序列
 */
function triggerFeedSequence(x, y) {
  feedCount++;
  updateFeedCountDisplay();

  // 1. 播放吃音效
  if (eatAudio) {
    eatAudio.currentTime = 0;
    eatAudio.play().catch(() => {});
  }

  // 2. 爱心粒子爆发（从猫咪头部位置）
  const catRect = catImg.getBoundingClientRect();
  spawnHearts(catRect.left + catRect.width / 2, catRect.top + catRect.height * 0.25);

  // 3. 脸红效果
  showBlush(catRect);

  // 4. 延迟后触发 touch + 猫叫
  setTimeout(() => {
    if (allImagesReady && catImg) {
      updateCatImage('touch.png');
      if (meowAudio) {
        meowAudio.currentTime = 0;
        meowAudio.play().catch(() => {});
      }
      // 恢复
      setTimeout(() => {
        if (allImagesReady) {
          const rect = catImg.getBoundingClientRect();
          const filename = getDirectionImage(pendingMouseX, pendingMouseY, rect);
          updateCatImage(filename);
        }
      }, 1500);
    }
  }, 400);

  // 5. 检查吃饱（5 次后暂停 15 秒）
  if (feedCount >= MAX_FEEDS) {
    isFull = true;
    setAllFoodSlotsFull(true);

    const catRect2 = catImg.getBoundingClientRect();
    showFullMessage(catRect2.left + catRect2.width / 2, catRect2.top - 30);

    setTimeout(() => {
      isFull = false;
      feedCount = 0;
      updateFeedCountDisplay();
      setAllFoodSlotsFull(false);
    }, 15000);
  }
}

/** suga 特殊音效 */
let sugaAudio = null;

/**
 * agustd 特殊喂食：猫变 yoongia + suga 音效 + 爱心脸红
 */
function triggerSpecialFeed(x, y) {
  // agustd 不计入吃饱计数

  // 1. 播放 suga 音效
  if (sugaAudio) {
    sugaAudio.currentTime = 0;
    sugaAudio.play().catch(() => {});
  }

  // 2. 猫咪切换为 yoongia 图片（锁定屏幕防止鼠标跟踪打断）
  isSpecialScreen = true;
  if (allImagesReady && catImg) {
    catImg.src = 'eat/yoongia.png';
  }

  // 3. 爱心 + 脸红
  const catRect = catImg.getBoundingClientRect();
  spawnHearts(catRect.left + catRect.width / 2, catRect.top + catRect.height * 0.25);
  showBlush(catRect);

  // 4. 2 秒后恢复正常猫咪
  setTimeout(() => {
    isSpecialScreen = false;
    if (allImagesReady && catImg) {
      const rect = catImg.getBoundingClientRect();
      const filename = getDirectionImage(pendingMouseX, pendingMouseY, rect);
      updateCatImage(filename);
    }
  }, 2000);
}

/**
 * 吃饱时禁用/恢复所有食物槽
 */
function setAllFoodSlotsFull(full) {
  if (!foodSlots) return;
  const slots = foodSlots.querySelectorAll('.food-slot');
  slots.forEach((s) => {
    if (full) s.classList.add('is-full');
    else s.classList.remove('is-full');
  });
}

/**
 * 爱心粒子爆发
 */
function spawnHearts(cx, cy) {
  const emojis = ['❤️', '💕', '💗', '💖', '✨'];
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('span');
    particle.className = 'heart-particle';
    particle.textContent = emojis[i % emojis.length];
    // 随机偏移方向
    const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.5;
    const dist = 40 + Math.random() * 50;
    particle.style.setProperty('--hx', Math.cos(angle) * dist + 'px');
    particle.style.setProperty('--hy', Math.sin(angle) * dist + 'px');
    particle.style.left = cx + 'px';
    particle.style.top = cy + 'px';
    document.body.appendChild(particle);

    // 动画结束后清除
    setTimeout(() => particle.remove(), 1300);
  }
}

/**
 * 脸红效果
 */
function showBlush(catRect) {
  const blush = document.createElement('div');
  blush.className = 'cat-blush';
  // 定位在猫咪脸颊两侧
  blush.style.left = (catRect.left + catRect.width * 0.28) + 'px';
  blush.style.top = (catRect.top + catRect.height * 0.35) + 'px';
  blush.style.width = (catRect.width * 0.44) + 'px';
  blush.style.height = (catRect.height * 0.22) + 'px';
  blush.style.background = 'radial-gradient(ellipse, rgba(255,140,120,0.5) 0%, transparent 70%)';
  blush.style.borderRadius = '50%';
  document.body.appendChild(blush);

  setTimeout(() => blush.remove(), 2100);
}

/**
 * 吃饱提示
 */
function showFullMessage(x, y) {
  const msg = document.createElement('div');
  msg.className = 'food-full-msg';
  msg.textContent = translations[currentLang]['food-full'];
  msg.style.left = x + 'px';
  msg.style.top = y + 'px';
  document.body.appendChild(msg);

  setTimeout(() => msg.remove(), 2600);
}

/**
 * 通用浮动消息
 */
function showFloatingMsg(x, y, text, duration) {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = `
    position:fixed;z-index:200;pointer-events:none;
    left:${x}px;top:${y}px;
    font-size:1.5rem;opacity:0.8;
    animation: floatUp ${duration}ms ease-out forwards;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), duration + 50);
}

// 为 floatUp 补充 keyframe（注入到 style 标签）
const floatUpStyle = document.createElement('style');
floatUpStyle.textContent = `
  @keyframes floatUp {
    0%   { opacity:0.8; transform:translate(0,0); }
    100% { opacity:0; transform:translate(0,-50px); }
  }
`;
document.head.appendChild(floatUpStyle);

/**
 * 更新喂食计数显示
 */
function updateFeedCountDisplay() {
  if (!feedCountEl) return;
  const tpl = translations[currentLang]['feed-count'] || '{n} / 5';
  feedCountEl.textContent = tpl.replace('{n}', feedCount);
}

/**
 * 初始化食物面板
 */
function initFoodPanel() {
  foodPanel = document.getElementById('food-panel');
  foodSlots = document.getElementById('food-slots');
  eatAudio = document.getElementById('eat-audio');
  sugaAudio = document.getElementById('suga-audio');
  feedCountEl = document.getElementById('feed-count');

  if (!foodPanel) return;

  // 给每个食物槽绑定拖拽事件
  const slots = foodSlots.querySelectorAll('.food-slot');
  slots.forEach((slot) => {
    slot.addEventListener('pointerdown', onFoodPointerDown);
  });

  // 全局移动和释放
  document.addEventListener('pointermove', onFoodPointerMove, { passive: true });
  document.addEventListener('pointerup', onFoodPointerUp);

  // 初始计数
  updateFeedCountDisplay();

  console.log('🍽 食物面板就绪，共 ' + slots.length + ' 个食物槽');
}

/* ==========================================
   初始化 (整合所有功能)
   ========================================== */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. 初始化多语言
  initLanguage();
  bindLanguageButtons();

  // 2. 获取 DOM 元素引用
  catImg = document.getElementById('cat-img');
  catContainer = document.getElementById('cat-container');
  meowAudio = document.getElementById('meow-audio');

  // 3. 初始化音乐播放器
  initMusicPlayer();

  // 3.5 初始化计时器
  initTimer();

  // 3.6 初始化食物面板
  initFoodPanel();

  // 4. 预加载所有图片
  await preloadAllImages();

  // 5. 绑定鼠标移动事件
  document.addEventListener('mousemove', onMouseMove, { passive: true });

  // 6. 鼠标离开页面时恢复默认
  document.addEventListener('mouseleave', onMouseLeave);

  // 7. 双击猫咪触发摸摸
  catImg.addEventListener('dblclick', onCatDoubleClick);

  console.log('🐾 Touch Tang — 全部就绪！');
  console.log('   语言：' + currentLang);
  console.log('   预加载：' + CAT_IMAGES.length + ' 张图片');
  console.log('   播放列表：' + PLAYLIST.length + ' 首歌');
  console.log('   移动鼠标试试吧~');
});
