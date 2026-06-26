const APP = {
  totals: { m1: 5, m2: 4, m3: 4, m4: 4 },
  completed: {
    m1: new Set(),
    m2: new Set(),
    m3: new Set(),
    m4: new Set(),
  },
  state: {
    currentModule: "m1",
    themeLabel: "睡个好觉",
    actionLabel: "比平时早躺下10分钟",
    confidence: 5,
    thought: "我的心跳好快，是不是要犯病了",
    alternative: "这是一阵紧张感，它会慢慢过去。",
    selectedStory: "未选择",
    peerAction: "等待提取",
    checkinDone: false,
    affirmations: {
      admire: "",
      prove: "",
    },
  },
};

const storyData = {
  xiaolin: {
    name: "小林",
    role: "睡眠困扰的大学生",
    keyStep: "每天睡前放下手机 10 分钟",
    sections: [
      ["困境", "那段时间他总是熬到很晚，越想早点睡越清醒，第二天又会因为疲惫更焦虑。"],
      ["转折", "他不再要求自己立刻改掉所有习惯，而是先接受“只做一点点也算开始”。"],
      ["第一步", "他先把睡前最后 10 分钟从手机里拿出来，换成拉窗帘、喝水、躺下。"],
      ["现在", "虽然偶尔还是会晚睡，但他第一次感觉到自己能慢慢把节奏拉回来。"],
    ],
  },
  zhouya: {
    name: "周雅",
    role: "想建立运动习惯的白领",
    keyStep: "下班后先出门走 15 分钟",
    sections: [
      ["困境", "她总觉得运动要完整、要高效，结果每次一忙就整个计划作废。"],
      ["转折", "后来她只给自己一个要求：下班后先出门，不规定速度和距离。"],
      ["第一步", "她从饭后绕小区走 15 分钟开始，只把运动定义成“我今天有动起来”。"],
      ["现在", "运动不再是压力项，反而变成了她一天里最容易完成的一件事。"],
    ],
  },
  chenchen: {
    name: "陈晨",
    role: "为饮食焦虑的年轻人",
    keyStep: "先把晚饭时间稳定下来",
    sections: [
      ["困境", "她总在“要吃得完美”和“干脆乱吃”之间来回摆动，越在意越容易失控。"],
      ["转折", "她把目标从“完美饮食”改成“先让身体感到舒服”，优先建立规律。"],
      ["第一步", "她先固定晚饭时间，并保证每顿饭里至少有一项让自己安心的食物。"],
      ["现在", "她开始不再把每顿饭都当成考试，而是当成一件可以慢慢调好的日常。"],
    ],
  },
};

function $(selector, scope = document) {
  return scope.querySelector(selector);
}

function $$(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

function showToast(text) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = text;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 1800);
}

const ThemeManager = {
  init() {
    const saved = localStorage.getItem("yuwei-theme") || "system";
    this.apply(saved);
    $("#themeToggle").addEventListener("click", () => {
      const current = localStorage.getItem("yuwei-theme") || "system";
      const next = current === "light" ? "dark" : current === "dark" ? "system" : "light";
      this.apply(next);
    });
  },

  apply(mode) {
    const resolved = mode === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : mode;
    document.documentElement.setAttribute("data-theme", resolved);
    localStorage.setItem("yuwei-theme", mode);
    this.updateIcon(resolved);
  },

  updateIcon(theme) {
    const svg = $("#themeToggle svg");
    if (theme === "dark") {
      svg.innerHTML = '<path d="M12 3a7.5 7.5 0 0 0 9 9A9 9 0 1 1 12 3Z"></path>';
    } else {
      svg.innerHTML = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>';
    }
  },
};

const Progress = {
  mark(stepId) {
    const [moduleId, index] = stepId.split("-");
    APP.completed[moduleId].add(index);
    const card = document.querySelector(`[data-step="${stepId}"]`);
    if (card) {
      const status = $(".step-status", card);
      status.textContent = "已完成";
      status.classList.add("done");
    }
    this.render();
  },

  render() {
    let globalDone = 0;
    let globalTotal = 0;

    Object.entries(APP.totals).forEach(([moduleId, total]) => {
      const done = APP.completed[moduleId].size;
      globalDone += done;
      globalTotal += total;

      const countText = `${done}/${total}`;
      const navCount = document.querySelector(`[data-module-count="${moduleId}"]`);
      const railCount = document.querySelector(`[data-module-progress="${moduleId}"]`);
      if (navCount) navCount.textContent = countText;
      if (railCount) railCount.textContent = countText;
    });

    $("#globalProgressText").textContent = `${globalDone}/${globalTotal}`;
    $("#summaryProgress").textContent = `${globalDone}/${globalTotal}`;
    $("#overviewStatus").textContent = globalDone === globalTotal ? "本周完成" : "进行中";
  },
};

const Summary = {
  render() {
    $("#summaryTheme").textContent = APP.state.themeLabel;
    $("#summaryAction").textContent = APP.state.actionLabel;
    $("#summaryConfidence").textContent = `${APP.state.confidence}/10`;
    $("#moduleOneTheme").textContent = APP.state.themeLabel;
    $("#moduleOneAction").textContent = APP.state.actionLabel;
    $("#moduleOneConfidence").textContent = `${APP.state.confidence}/10`;
    $("#checkinActionText").textContent = APP.state.actionLabel;
    $("#peerStoryName").textContent = APP.state.selectedStory;
    $("#peerKeyAction").textContent = APP.state.peerAction;
    $("#cognitionThought").textContent = APP.state.thought;
    $("#cognitionAlternative").textContent = APP.state.alternative;

    const filled = Object.values(APP.state.affirmations).filter(Boolean).length;
    $("#affirmationStatus").textContent = filled === 2 ? "已填写" : filled === 1 ? "填写中" : "待填写";
  },
};

const Navigation = {
  init() {
    $$(".nav-tab, .module-rail-card").forEach((button) => {
      button.addEventListener("click", () => this.switchTo(button.dataset.module));
    });
  },

  switchTo(moduleId) {
    APP.state.currentModule = moduleId;
    $$(".nav-tab").forEach((tab) => {
      const active = tab.dataset.module === moduleId;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    $$(".module-rail-card").forEach((card) => {
      card.classList.toggle("active", card.dataset.module === moduleId);
    });
    $$(".module-page").forEach((page) => {
      page.classList.toggle("active", page.id === moduleId);
    });
  },
};

const ActionPlan = {
  actions: [
    "比平时早躺下10分钟",
    "饭后散步15分钟",
    "每天喝一杯温水",
    "睡前不看手机30分钟",
  ],
  actionIndex: 0,
  dragging: false,

  init() {
    this.renderDots();
    this.bindThemeOptions();
    this.bindActionCards();
    this.bindSliderButtons();
    this.bindCustomAction();
    this.bindConfidence();
    this.bindCheckin();
    this.bindReview();
  },

  renderDots() {
    const dots = $("#actionDots");
    dots.innerHTML = "";
    this.actions.forEach((_, index) => {
      const dot = document.createElement("span");
      dot.className = `slider-dot${index === this.actionIndex ? " active" : ""}`;
      dots.appendChild(dot);
    });
  },

  setAction(index) {
    this.actionIndex = index;
    APP.state.actionLabel = this.actions[index];
    $$(".action-card").forEach((card, i) => {
      card.classList.toggle("primary", i === index);
    });
    $$("#actionDots .slider-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
    Summary.render();
    Progress.mark("m1-2");
  },

  bindThemeOptions() {
    $$(".theme-option").forEach((button) => {
      button.addEventListener("click", () => {
        $$(".theme-option").forEach((item) => item.classList.remove("selected"));
        button.classList.add("selected");
        APP.state.themeLabel = button.dataset.label;
        Summary.render();
        Progress.mark("m1-1");
      });
    });
  },

  bindActionCards() {
    $$(".action-card").forEach((button, index) => {
      button.addEventListener("click", () => this.setAction(index));
    });
  },

  bindSliderButtons() {
    $("#actionPrev").addEventListener("click", () => {
      this.setAction((this.actionIndex + this.actions.length - 1) % this.actions.length);
    });
    $("#actionNext").addEventListener("click", () => {
      this.setAction((this.actionIndex + 1) % this.actions.length);
    });
  },

  bindCustomAction() {
    const input = $("#customActionInput");
    const count = $("#customActionCount");
    input.addEventListener("input", () => {
      count.textContent = `${input.value.length}/30`;
      if (input.value.trim().length >= 3) {
        APP.state.actionLabel = input.value.trim();
        Summary.render();
        Progress.mark("m1-2");
      }
    });
  },

  bindConfidence() {
    const track = $("#confidenceTrack");
    const fill = $("#confidenceFill");
    const thumb = $("#confidenceThumb");
    const valueEl = $("#confidenceValue");
    const encourage = $("#confidenceEncourage");

    const update = (value) => {
      APP.state.confidence = value;
      const pct = value / 10;
      fill.style.width = `${pct * 100}%`;
      thumb.style.left = `calc(${pct * 100}% - 15px)`;
      valueEl.textContent = String(value);
      encourage.classList.toggle("hidden", value > 3);
      Summary.render();
      Progress.mark("m1-3");
    };

    const setFromClientX = (clientX) => {
      const rect = track.getBoundingClientRect();
      const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      update(Math.round(pct * 10));
    };

    track.addEventListener("click", (event) => setFromClientX(event.clientX));
    thumb.addEventListener("pointerdown", () => {
      this.dragging = true;
    });
    document.addEventListener("pointermove", (event) => {
      if (!this.dragging) return;
      setFromClientX(event.clientX);
    });
    document.addEventListener("pointerup", () => {
      this.dragging = false;
    });

    update(APP.state.confidence);
  },

  bindCheckin() {
    const button = $("#checkinBtn");
    button.addEventListener("click", () => {
      if (APP.state.checkinDone) return;
      APP.state.checkinDone = true;
      button.classList.add("done");
      $(".checkin-btn-text", button).textContent = "已完成";
      Progress.mark("m1-4");
      showToast("今天已记录");
    });
  },

  bindReview() {
    $$(".review-option").forEach((button) => {
      button.addEventListener("click", () => {
        $$(".review-option").forEach((item) => item.classList.remove("selected"));
        button.classList.add("selected");
        Progress.mark("m1-5");
      });
    });
  },
};

const PeerStories = {
  init() {
    this.bindCards();
    this.bindModal();
    this.bindActions();
  },

  bindCards() {
    $$(".companion-card").forEach((card) => {
      card.addEventListener("click", () => {
        $$(".companion-card").forEach((item) => item.classList.remove("selected"));
        card.classList.add("selected");
        const story = storyData[card.dataset.story];
        APP.state.selectedStory = story.name;
        APP.state.peerAction = story.keyStep;
        $("#keyStepText").textContent = `Ta 最关键的一步是：${story.keyStep}。你愿意先试试看吗？`;
        Summary.render();
        Progress.mark("m2-1");
        this.openStory(story);
      });
    });
  },

  openStory(story) {
    $("#storyModalName").textContent = story.name;
    const body = $("#storyModalBody");
    body.innerHTML = "";
    story.sections.forEach(([title, text]) => {
      const section = document.createElement("section");
      section.className = "story-section";
      section.innerHTML = `<h4 class="story-section-title">${title}</h4><p class="story-section-text">${text}</p>`;
      body.appendChild(section);
    });
    $("#storyModal").classList.add("show");
    $("#storyModal").setAttribute("aria-hidden", "false");
    Progress.mark("m2-2");
  },

  closeStory() {
    $("#storyModal").classList.remove("show");
    $("#storyModal").setAttribute("aria-hidden", "true");
  },

  bindModal() {
    $("#storyModalClose").addEventListener("click", () => this.closeStory());
    $("#storyModalBackdrop").addEventListener("click", () => this.closeStory());
  },

  bindActions() {
    $("#tryPeerAction").addEventListener("click", () => {
      APP.state.actionLabel = APP.state.peerAction;
      Summary.render();
      this.closeStory();
      Navigation.switchTo("m1");
      showToast("已带入行动计划");
      Progress.mark("m2-3");
      Progress.mark("m1-2");
    });

    $("#savePeerAction").addEventListener("click", () => {
      Progress.mark("m2-3");
      showToast("已收藏到行动备选");
    });

    $$(".warm-action").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.classList.contains("sent")) return;
        button.classList.add("sent");
        button.textContent = `${button.textContent} · 已发送`;
        Progress.mark("m2-4");
      });
    });
  },
};

const Cognition = {
  init() {
    this.bindMoodRescue();
    this.bindThoughts();
    this.bindCustomThought();
    this.bindBodyScan();
    this.bindAlternatives();
    this.bindCardActions();
  },

  refreshCard() {
    $("#dialoguePrompt").textContent = `你刚才提到“${APP.state.thought}”。除了最坏的解释，还有没有别的可能？`;
    $("#responseThought").textContent = `我的自动想法：“${APP.state.thought}”`;
    $("#responseAlternative").textContent = `更现实的回应：“${APP.state.alternative}”`;
    Summary.render();
  },

  bindMoodRescue() {
    $("#moodRescueBtn").addEventListener("click", () => {
      $("#moodRescueNote").classList.toggle("hidden");
      Progress.mark("m3-1");
    });
  },

  bindThoughts() {
    $$(".thought-option").forEach((button) => {
      button.addEventListener("click", () => {
        $$(".thought-option").forEach((item) => item.classList.remove("selected"));
        button.classList.add("selected");
        APP.state.thought = button.textContent;
        this.refreshCard();
        Progress.mark("m3-1");
      });
    });
  },

  bindCustomThought() {
    $("#customThoughtInput").addEventListener("input", (event) => {
      const value = event.target.value.trim();
      if (value.length >= 4) {
        APP.state.thought = value;
        this.refreshCard();
        Progress.mark("m3-1");
      }
    });
  },

  bindBodyScan() {
    $$(".body-part").forEach((button) => {
      button.addEventListener("click", () => {
        $$(".body-part").forEach((item) => item.classList.remove("selected"));
        button.classList.add("selected");
        Progress.mark("m3-2");
      });
    });
    $$(".emotion-tag").forEach((button) => {
      button.addEventListener("click", () => {
        $$(".emotion-tag").forEach((item) => item.classList.remove("selected"));
        button.classList.add("selected");
        Progress.mark("m3-2");
      });
    });
  },

  bindAlternatives() {
    $$(".alternative-option").forEach((button) => {
      button.addEventListener("click", () => {
        $$(".alternative-option").forEach((item) => item.classList.remove("selected"));
        button.classList.add("selected");
        APP.state.alternative = button.textContent;
        this.refreshCard();
        Progress.mark("m3-3");
        Progress.mark("m3-4");
      });
    });
  },

  bindCardActions() {
    $("#saveResponseCard").addEventListener("click", () => {
      Progress.mark("m3-4");
      showToast("已保存到能量工具箱");
    });
    $("#setWallpaperBtn").addEventListener("click", () => {
      showToast("壁纸功能将在正式版开放");
    });
  },
};

const Persuasion = {
  data: [
    { week: "第1周", confidence: 3, action: 2, cards: 1 },
    { week: "第2周", confidence: 4, action: 3, cards: 2 },
    { week: "第3周", confidence: 5, action: 4, cards: 3 },
    { week: "第4周", confidence: 6, action: 5, cards: 4 },
    { week: "第5周", confidence: 7, action: 6, cards: 5 },
    { week: "第6周", confidence: 8, action: 7, cards: 6 },
  ],

  init() {
    this.renderChart();
    this.bindAffirmations();
    Progress.mark("m4-1");
    Progress.mark("m4-2");
    Progress.mark("m4-4");
  },

  renderChart() {
    const bars = $("#chartBars");
    const max = 10;
    bars.innerHTML = "";
    this.data.forEach((item) => {
      const group = document.createElement("div");
      group.className = "chart-bar-group";
      group.innerHTML = `
        <div class="chart-bar-stack">
          <span class="chart-bar green" style="height:${(item.confidence / max) * 160}px"></span>
          <span class="chart-bar orange" style="height:${(item.action / max) * 160}px"></span>
          <span class="chart-bar blue" style="height:${(item.cards / max) * 160}px"></span>
        </div>
        <span class="chart-bar-label">${item.week}</span>
      `;
      bars.appendChild(group);
    });
  },

  bindAffirmations() {
    $$(".blank").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.blank;
        const current = APP.state.affirmations[key];
        const value = window.prompt("写下一句你愿意对自己承认的话", current || "");
        if (value === null) return;
        const trimmed = value.trim();
        APP.state.affirmations[key] = trimmed;
        button.textContent = trimmed || "";
        button.classList.toggle("filled", Boolean(trimmed));
        Summary.render();

        const filledCount = Object.values(APP.state.affirmations).filter(Boolean).length;
        if (filledCount >= 2) Progress.mark("m4-3");
      });
    });
  },
};

document.addEventListener("DOMContentLoaded", () => {
  ThemeManager.init();
  Navigation.init();
  ActionPlan.init();
  PeerStories.init();
  Cognition.init();
  Persuasion.init();
  Summary.render();
  Progress.render();
  Navigation.switchTo("m1");
});
