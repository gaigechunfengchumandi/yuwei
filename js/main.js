/* =========================================
   与微 - 健康自我管理平台
   JavaScript - All Interactions & Animations
   ========================================= */

// --- Theme System ---
const ThemeManager = {
  init() {
    const saved = localStorage.getItem('yuwei-theme') || 'system';
    this.apply(saved);
    this.bindToggle();
  },

  apply(mode) {
    let resolved;
    if (mode === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = mode;
    }
    document.documentElement.setAttribute('data-theme', resolved);
    localStorage.setItem('yuwei-theme', mode);
    this.updateIcon(resolved);
  },

  updateIcon(theme) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const svg = btn.querySelector('svg');
    if (theme === 'dark') {
      svg.innerHTML = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>';
    } else {
      svg.innerHTML = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>';
    }
  },

  bindToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const current = localStorage.getItem('yuwei-theme') || 'system';
      const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
      document.body.classList.add('theme-transitioning');
      this.apply(next);
      setTimeout(() => document.body.classList.remove('theme-transitioning'), 300);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (localStorage.getItem('yuwei-theme') === 'system') this.apply('system');
    });
  }
};

// --- Navigation ---
const Navigation = {
  init() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.module;
        this.switchTo(target);
      });
    });
  },

  switchTo(moduleId) {
    // Update tabs
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.nav-tab[data-module="${moduleId}"]`).classList.add('active');

    // Update pages
    document.querySelectorAll('.module-page').forEach(p => p.classList.remove('active'));
    document.getElementById(moduleId).classList.add('active');

    // Re-trigger scroll animations
    ScrollAnimations.observeNewCards();
  }
};

// --- Scroll Animations ---
const ScrollAnimations = {
  init() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    this.observeAll();
  },

  observeAll() {
    document.querySelectorAll('.step-card, .companion-card, .review-card, .response-card, .self-card, .growth-chart-wrap').forEach(el => {
      this.observer.observe(el);
    });
  },

  observeNewCards() {
    const activePage = document.querySelector('.module-page.active');
    if (!activePage) return;
    activePage.querySelectorAll('.step-card:not(.visible), .companion-card:not(.visible)').forEach(el => {
      this.observer.observe(el);
    });
  }
};

// --- Module 1: Action Plan ---
const ActionPlan = {
  currentTheme: null,
  currentAction: 0,
  confidenceValue: 5,
  checkedIn: false,
  sliderDragging: false,

  actions: [
    { title: '比平时早躺下10分钟', desc: '不要求睡着，只是比平时多给身体一点休息的时间。', tag: '系统推荐' },
    { title: '饭后散步15分钟', desc: '在小区或附近公园慢慢走，不用跑。', tag: '备选方案' },
    { title: '每天喝一杯温水', desc: '起床后第一件事，给身体一个温暖的开始。', tag: '备选方案' },
    { title: '睡前不看手机30分钟', desc: '用读书或听音乐代替刷手机，让大脑慢慢安静下来。', tag: '备选方案' },
  ],

  init() {
    this.bindThemeSelection();
    this.bindActionSlider();
    this.bindCustomInput();
    this.bindConfidenceSlider();
    this.bindCheckIn();
    this.bindReview();
  },

  bindThemeSelection() {
    const options = document.querySelectorAll('#m1 .theme-option');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        this.currentTheme = opt.dataset.value;
      });
    });

    const customBtn = document.querySelector('#m1 .theme-option-custom');
    if (customBtn) {
      customBtn.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('selected'));
        customBtn.classList.add('selected');
        this.currentTheme = 'custom';
      });
    }
  },

  bindActionSlider() {
    const prevBtn = document.querySelector('#m1 .slider-btn-prev');
    const nextBtn = document.querySelector('#m1 .slider-btn-next');

    if (prevBtn) prevBtn.addEventListener('click', () => this.slideAction(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => this.slideAction(1));
  },

  slideAction(dir) {
    this.currentAction = Math.max(0, Math.min(this.actions.length - 1, this.currentAction + dir));
    const track = document.querySelector('#m1 .action-track');
    if (track) {
      track.style.transform = `translateX(-${this.currentAction * 100}%)`;
    }
    this.updateActionCards();
  },

  updateActionCards() {
    const cards = document.querySelectorAll('#m1 .action-card');
    cards.forEach((card, i) => {
      card.classList.toggle('primary', i === this.currentAction);
    });
  },

  bindCustomInput() {
    const input = document.querySelector('#m1 .custom-input');
    const counter = document.querySelector('#m1 .char-count');
    if (!input) return;

    input.addEventListener('input', () => {
      const len = input.value.length;
      counter.textContent = `${len}/30`;
      counter.classList.toggle('warn', len > 25);
      if (len > 30) input.value = input.value.slice(0, 30);
    });
  },

  bindConfidenceSlider() {
    const track = document.querySelector('#m1 .confidence-slider-track');
    const thumb = document.querySelector('#m1 .confidence-slider-thumb');
    const fill = document.querySelector('#m1 .confidence-slider-fill');
    const display = document.querySelector('#m1 .confidence-value');
    const encourage = document.querySelector('#m1 .confidence-encourage');

    if (!track || !thumb) return;

    const updateSlider = (value) => {
      this.confidenceValue = value;
      const pct = value / 10 * 100;
      fill.style.width = pct + '%';
      thumb.style.left = pct + '%';
      display.textContent = value;

      display.classList.remove('high', 'low');
      if (value >= 7) display.classList.add('high');
      if (value <= 3) display.classList.add('low');

      encourage.classList.toggle('show', value <= 3);
    };

    // Mouse drag
    thumb.addEventListener('mousedown', () => this.sliderDragging = true);
    document.addEventListener('mouseup', () => this.sliderDragging = false);
    document.addEventListener('mousemove', (e) => {
      if (!this.sliderDragging) return;
      const rect = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      updateSlider(Math.round(pct * 10));
    });

    // Touch drag
    thumb.addEventListener('touchstart', () => this.sliderDragging = true);
    document.addEventListener('touchend', () => this.sliderDragging = false);
    document.addEventListener('touchmove', (e) => {
      if (!this.sliderDragging) return;
      const touch = e.touches[0];
      const rect = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
      updateSlider(Math.round(pct * 10));
    });

    // Click on track
    track.addEventListener('click', (e) => {
      const rect = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      updateSlider(Math.round(pct * 10));
    });

    updateSlider(5);
  },

  bindCheckIn() {
    const btn = document.querySelector('#m1 .checkin-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      if (this.checkedIn) return;
      this.checkedIn = true;
      btn.classList.add('done');

      // Add rays
      const raysContainer = btn.querySelector('.sun-rays');
      if (raysContainer) {
        for (let i = 0; i < 8; i++) {
          const ray = document.createElement('div');
          ray.className = 'sun-ray';
          ray.style.cssText = `--angle: ${i * 45}deg; animation-delay: ${i * 0.15}s`;
          raysContainer.appendChild(ray);
        }
      }

      // Change text
      const label = btn.querySelector('.checkin-label');
      if (label) label.textContent = '已完成';
    });
  },

  bindReview() {
    const options = document.querySelectorAll('#m1 .review-option');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });
  }
};

// --- Module 2: Peer Stories ---
const PeerStories = {
  init() {
    this.bindCompanionCards();
    this.bindWarmActions();
    this.bindKeyStep();
    this.bindStoryModal();
  },

  bindCompanionCards() {
    const cards = document.querySelectorAll('#m2 .companion-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        this.openStory(card);
      });
    });
  },

  openStory(card) {
    const modal = document.getElementById('storyModal');
    const name = card.querySelector('.companion-name').textContent;
    const snippet = card.querySelector('.companion-snippet').textContent;

    const body = modal.querySelector('.story-modal-body');
    body.innerHTML = `
      <div class="story-section">
        <div class="story-section-title"><span class="dot"></span>我的困境</div>
        <div class="story-section-text">曾经和你一样，${snippet}。那段日子真的很难熬...</div>
      </div>
      <div class="story-section">
        <div class="story-section-title"><span class="dot"></span>我的转折</div>
        <div class="story-section-text">我发现一个小改变就能让事情变得不一样。不是什么惊天动地的方法，只是一个微小的调整。</div>
      </div>
      <div class="story-section">
        <div class="story-section-title"><span class="dot"></span>我的第一步</div>
        <div class="story-section-text">具体、微小、可复制。你也可以试试看。</div>
      </div>
      <div class="story-section">
        <div class="story-section-title"><span class="dot"></span>我的现在</div>
        <div class="story-section-text">改变是真实的，但不夸大。我还在路上，但已经比之前好很多了。</div>
      </div>
      <div class="key-step-popup show" id="keyStepPopup">
        <div class="key-step-quote">Ta 最关键的一步是：<em>每天睡前放下手机10分钟</em>。你觉得这个方法，你可以试试看吗？</div>
        <div class="key-step-actions">
          <button class="btn-primary blue" onclick="PeerStories.tryAction()">我想试试</button>
          <button class="btn-secondary" onclick="PeerStories.saveAction()">先收藏</button>
        </div>
      </div>
    `;

    modal.classList.add('show');
  },

  closeStory() {
    const modal = document.getElementById('storyModal');
    modal.classList.remove('show');
  },

  tryAction() {
    this.closeStory();
    // Auto-switch to module 1 and add action
    Navigation.switchTo('m1');
    // Visual feedback
    const card = document.querySelector('#m1 .action-card.primary');
    if (card) {
      card.style.borderColor = '#6a9bcc';
      card.querySelector('.action-card-title').textContent = '每天睡前放下手机10分钟';
    }
  },

  saveAction() {
    this.closeStory();
    // Show brief toast-like feedback
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:var(--bg-card);padding:12px 24px;border-radius:20px;border:1px solid var(--accent-blue);color:var(--accent-blue);font-size:14px;font-weight:600;z-index:300;animation:bubbleIn 0.3s ease';
    toast.textContent = '已收藏到行动备选库';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  },

  bindKeyStep() {
    // handled in openStory
  },

  bindWarmActions() {
    const actions = document.querySelectorAll('#m2 .warm-action');
    actions.forEach(act => {
      act.addEventListener('click', () => {
        if (act.classList.contains('sent')) return;
        act.classList.add('sent');
        act.textContent = act.textContent + ' \u2714';
      });
    });
  },

  bindStoryModal() {
    const closeBtn = document.querySelector('#storyModal .story-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeStory());
  }
};

// --- Module 3: Cognitive Restructuring ---
const Cognition = {
  selectedThought: null,
  selectedBodyPart: null,
  selectedEmotion: null,
  selectedAlternative: null,

  init() {
    this.bindThoughtOptions();
    this.bindBodyScan();
    this.bindEmotionTags();
    this.bindDialogue();
    this.bindAlternativeOptions();
    this.bindResponseCard();
  },

  bindThoughtOptions() {
    const options = document.querySelectorAll('#m3 .thought-option');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        this.selectedThought = opt.textContent;
      });
    });
  },

  bindBodyScan() {
    const parts = document.querySelectorAll('#m3 .body-part');
    parts.forEach(part => {
      part.addEventListener('click', () => {
        parts.forEach(p => p.classList.remove('selected'));
        part.classList.add('selected');
        this.selectedBodyPart = part.dataset.part;
      });
    });
  },

  bindEmotionTags() {
    const tags = document.querySelectorAll('#m3 .emotion-tag');
    tags.forEach(tag => {
      tag.addEventListener('click', () => {
        tags.forEach(t => t.classList.remove('selected'));
        tag.classList.add('selected');
        this.selectedEmotion = tag.textContent;
      });
    });
  },

  bindDialogue() {
    // The dialogue flow is pre-built in HTML, interactions handled by alternative options
  },

  bindAlternativeOptions() {
    const options = document.querySelectorAll('#m3 .alternative-option');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        this.selectedAlternative = opt.textContent;

        // Generate response card
        this.generateResponseCard();
      });
    });
  },

  generateResponseCard() {
    const cardArea = document.querySelector('#m3 .response-card-area');
    if (!cardArea) return;

    cardArea.innerHTML = `
      <div class="response-card visible">
        <div class="response-card-label">你的理性回应卡片</div>
        <div class="response-card-thought">
          我的自动想法："${this.selectedThought || '我感觉心跳好快，是不是要犯病了？'}"
        </div>
        <div class="response-card-response">
          更现实的回应："${this.selectedAlternative || '这只是喝了咖啡的正常反应。它会过去的。'}"
        </div>
        <div class="response-card-actions">
          <button class="btn-primary green" onclick="Cognition.saveCard()">保存到能量工具箱</button>
          <button class="btn-secondary" onclick="Cognition.setWallpaper()">设为锁屏壁纸</button>
        </div>
      </div>
    `;
  },

  saveCard() {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:var(--bg-card);padding:12px 24px;border-radius:20px;border:1px solid var(--accent-green);color:var(--accent-green);font-size:14px;font-weight:600;z-index:300;animation:bubbleIn 0.3s ease';
    toast.textContent = '已保存到能量工具箱';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  },

  setWallpaper() {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:var(--bg-card);padding:12px 24px;border-radius:20px;border:1px solid var(--accent-green);color:var(--accent-green);font-size:14px;font-weight:600;z-index:300;animation:bubbleIn 0.3s ease';
    toast.textContent = '壁纸设置功能将在正式版中上线';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  },

  bindResponseCard() {
    // handled dynamically
  }
};

// --- Module 4: Verbal Persuasion ---
const Persuasion = {
  init() {
    this.bindSelfCardBlanks();
    this.renderGrowthChart();
  },

  bindSelfCardBlanks() {
    const blanks = document.querySelectorAll('#m4 .self-card-fill .blank');
    blanks.forEach(blank => {
      blank.addEventListener('click', () => {
        // Create inline input
        const currentText = blank.textContent;
        const isFilled = blank.classList.contains('filled');

        if (isFilled) {
          // Allow re-editing
          blank.classList.remove('filled');
          blank.textContent = '';
        }

        const input = document.createElement('input');
        input.type = 'text';
        input.style.cssText = 'width:100%;background:transparent;border:none;color:var(--accent-green);font-weight:600;font-size:16px;outline:none;text-align:center;';
        input.placeholder = '点击输入...';
        input.value = isFilled ? currentText : '';

        blank.textContent = '';
        blank.appendChild(input);
        input.focus();

        input.addEventListener('blur', () => {
          const val = input.value.trim();
          if (val) {
            blank.textContent = val;
            blank.classList.add('filled');
          } else {
            blank.textContent = '';
            blank.classList.remove('filled');
          }
          input.remove();
        });

        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') input.blur();
        });
      });
    });
  },

  renderGrowthChart() {
    // Simulated growth data
    const weeks = ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周'];
    const confidence = [3, 4, 5, 6, 7, 8]; // confidence scores
    const actions = [2, 4, 5, 6, 7, 7]; // action completion
    const cards = [1, 2, 3, 4, 5, 6]; // cognitive cards

    const container = document.querySelector('#m4 .growth-chart-container');
    if (!container) return;

    const barsArea = container.querySelector('.chart-bars');
    if (!barsArea) return;

    const maxVal = 10;
    weeks.forEach((week, i) => {
      const group = document.createElement('div');
      group.className = 'chart-bar-group';

      // Stacked bar: confidence (green) + actions (orange) + cards (blue)
      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      bar.style.height = `${(confidence[i] / maxVal) * 160}px`;

      const bar2 = document.createElement('div');
      bar2.className = 'chart-bar orange';
      bar2.style.height = `${(actions[i] / maxVal) * 120}px`;

      const label = document.createElement('div');
      label.className = 'chart-bar-label';
      label.textContent = week;

      group.appendChild(bar);
      group.appendChild(bar2);
      group.appendChild(label);
      barsArea.appendChild(group);
    });
  }
};

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  Navigation.init();
  ScrollAnimations.init();
  ActionPlan.init();
  PeerStories.init();
  Cognition.init();
  Persuasion.init();

  // Show first module
  Navigation.switchTo('m1');
});
