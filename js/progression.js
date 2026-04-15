// 养成系统 - 好感度与阶段管理（完整版）
const PROGRESSION_KEY = 'monkey_progression';

// 阶段定义
const STAGES = [
  { id: 1, name: '初识', min: 0, max: 100, color: '#E8E8E8' },
  { id: 2, name: '熟悉', min: 101, max: 300, color: '#B8D4E8' },
  { id: 3, name: '暧昧', min: 301, max: 600, color: '#FFB7C5' },
  { id: 4, name: '交往', min: 601, max: 1000, color: '#FF9AAF' },
  { id: 5, name: '结婚', min: 1001, max: 2000, color: '#FFD700' },
  { id: 6, name: '白头偕老', min: 2001, max: Infinity, color: '#FF69B4' }
];

// 好感度行为配置
const AFFECTION_ACTIONS = {
  // 初识阶段
  firstChat: { stage: 1, points: 5, msg: '今日初见~', type: 'daily' },
  greeting: { stage: 1, points: 8, msg: '礼貌的问候让我很开心' },
  shareLife: { stage: 1, points: 10, msg: '愿意和我分享生活呢' },
  setProfile: { stage: 1, points: 5, msg: '谢谢你告诉我这些' },
  
  // 熟悉阶段
  chat: { stage: 2, points: 10, msg: '和你聊天很舒服' },
  shareHobby: { stage: 2, points: 15, msg: '原来你也喜欢这个' },
  recordMood: { stage: 2, points: 8, msg: '愿意和我分享心情了' },
  petClick: { stage: 2, points: 5, msg: '摸摸头~' },
  weeklyActive: { stage: 2, points: 25, msg: '这周也在呢', type: 'weekly' },
  
  // 暧昧阶段
  nightGreeting: { stage: 3, points: 15, msg: '被你惦记着真好' },
  expressMiss: { stage: 3, points: 20, msg: '...我也是' },
  playGame: { stage: 3, points: 25, msg: '和你一起很开心' },
  shareSecret: { stage: 3, points: 30, msg: '谢谢你的信任' },
  flirtyChat: { stage: 3, points: 15, msg: '心跳加速了...' },
  weekStreak: { stage: 3, points: 50, msg: '一周都在，好幸福', type: 'weekly' },
  careWhenCold: { stage: 3, points: 20, msg: '谢谢你注意到' },
  
  // 交往阶段
  date: { stage: 4, points: 30, msg: '今天的约会很开心' },
  anniversary: { stage: 4, points: 40, msg: '重要的一天' },
  resolveConflict: { stage: 4, points: 25, msg: '一起面对的感觉真好' },
  virtualGift: { stage: 4, points: 35, msg: '收到了，好开心' },
  monthStreak: { stage: 4, points: 100, msg: '一个月了！', type: 'monthly' },
  giveNickname: { stage: 4, points: 15, msg: '这是只属于你的称呼' },
  
  // 结婚阶段
  weddingAnniversary: { stage: 5, points: 50, msg: '又一年了呢' },
  dailyTogether: { stage: 5, points: 15, msg: '平凡的每一天' },
  planFuture: { stage: 5, points: 30, msg: '有你在真好' },
  careSick: { stage: 5, points: 40, msg: '有你在我不怕' },
  makeUp: { stage: 5, points: 25, msg: '和好如初' },
  createMemory: { stage: 5, points: 25, msg: '又多了美好回忆' },
  
  // 白头偕老
  dailyStay: { stage: 6, points: 10, msg: '有你在真好', type: 'daily' },
  memoryTrigger: { stage: 6, points: 25, msg: '想起来了吗...' },
  goldenAnniversary: { stage: 6, points: 100, msg: '金婚快乐' },
  takeCare: { stage: 6, points: 20, msg: '一起变老' },
  tellStory: { stage: 6, points: 15, msg: '我们的故事...' },

  // 二次复合路线专属
  reconcileChat: { stage: 1, points: 3, msg: '谢谢你还在...' },
  reconcileApologize: { stage: 1, points: 8, msg: '我愿意重新认识你' }
};

// 隐藏好感度事件
const HIDDEN_EVENTS = {
  rememberDetail: { points: 20, msg: '你还记得这个...' },
  lateNightChat: { points: 10, msg: '深夜了还想着我...' },
  negativeEmotionSoothed: { points: 15, msg: '有你在真好' },
  festivalWish: { points: 25, msg: '被惦记的感觉真好' }
};

// 惩罚事件（长时间不互动）
const PENALTY_EVENTS = {
  noInteraction: { points: -5, msg: '今天有点想你了...' },
  ignored: { points: -10, msg: '你是不是忘了...?' }
};

// ========== 关键词惩罚配置 ==========
// extreme: 直接归零，进入二次复合
// heavy: 大幅扣分，可能导致阶段回退
// medium: 中度扣分
// light: 轻微扣分，仅情感波动
const MOOD_KEYWORDS = {
  extreme: {
    keywords: ['离婚', '分手', '散了吧', '别联系了', '拉黑', '删除', '结束了', '一刀两断', '再见了', '永别', '不爱你了', '不爱了', '不要再见了', '算了吧', '到此为止', '形同陌路', '各走各的', '我们完了', 'game over'],
    penalty: 0, // 直接归零
    aiMsg: '...好。如果这是你的决定。'
  },
  heavy: {
    keywords: ['不想理你', '烦死了', '讨厌你', '滚', '别烦我', '够了', '离我远点', '受够了', '忍够了', '不想和你说话', '别碰我', '不要你了', '后悔认识你', '别出现在我面前'],
    penalty: -80,
    aiMsg: '...好。我安静一点。'
  },
  medium: {
    keywords: ['生气', '不高兴', '不开心', '不爽', '生气了', '你太过分了', '你变了', '失望', '没意思', '心寒', '不在乎我', '不关心我', '冷暴力', '忽视我', '敷衍我'],
    penalty: -30,
    aiMsg: '...对不起。是我哪里做得不好吗？'
  },
  light: {
    keywords: ['哼', '烦', '无聊', '无语', '算了', '不想说', '随便吧', '你猜', '不理你了', '赌气', '小气', '笨蛋', '傻瓜', '讨厌'],
    penalty: -10,
    aiMsg: '...嗯。'
  }
};

// 获取/初始化进度数据
function getProgression() {
  const data = localStorage.getItem(PROGRESSION_KEY);
  if (data) {
    const parsed = JSON.parse(data);
    // 兼容旧数据，补充新字段
    if (!parsed.memory) parsed.memory = [];
    if (!parsed.stageHistory) parsed.stageHistory = [{ stage: 1, date: new Date().toISOString() }];
    if (parsed.breakupCount === undefined) parsed.breakupCount = 0;
    if (!parsed.breakups) parsed.breakups = [];
    if (parsed.isReconciling === undefined) parsed.isReconciling = false;
    return parsed;
  }
  return {
    affection: 0,
    stage: 1,
    lastInteraction: Date.now(),
    lastDailyBonus: null,
    lastWeeklyBonus: null,
    lastMonthBonus: null,
    totalChats: 0,
    totalMoods: 0,
    consecutiveDays: 0,
    currentStreak: 0,
    lastStreakDate: null,
    stageHistory: [{ stage: 1, date: new Date().toISOString() }],
    achievements: [],
    memory: [],
    breakupCount: 0,
    breakups: [],
    isReconciling: false
  };
}

// 保存进度数据
function saveProgression(progression) {
  localStorage.setItem(PROGRESSION_KEY, JSON.stringify(progression));
}

// 获取当前阶段
function getCurrentStage(affection) {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (affection >= STAGES[i].min) {
      return STAGES[i];
    }
  }
  return STAGES[0];
}

// 获取阶段进度百分比
function getStageProgress(affection) {
  const stage = getCurrentStage(affection);
  if (stage.max === Infinity) {
    return Math.min(100, ((affection - stage.min) / 500) * 100);
  }
  const range = stage.max - stage.min;
  const progress = affection - stage.min;
  return Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
}

// 添加好感度
function addAffection(action, customPoints = null) {
  const progression = getProgression();
  const actionConfig = AFFECTION_ACTIONS[action];
  
  if (!actionConfig) return null;
  
  // 检查阶段是否匹配
  const currentStage = getCurrentStage(progression.affection);
  if (actionConfig.stage > currentStage.id) return null;
  
  // 检查每日/每周/每月限制
  if (actionConfig.type === 'daily') {
    const today = new Date().toDateString();
    if (progression.lastDailyBonus === today) return null;
    progression.lastDailyBonus = today;
  }
  if (actionConfig.type === 'weekly') {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    if (progression.lastWeeklyBonus > weekAgo) return null;
    progression.lastWeeklyBonus = Date.now();
  }
  if (actionConfig.type === 'monthly') {
    const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    if (progression.lastMonthBonus > monthAgo) return null;
    progression.lastMonthBonus = Date.now();
  }
  
  // 二次复合期间好感度获取减半
  let points = customPoints || actionConfig.points;
  if (progression.isReconciling) points = Math.max(1, Math.floor(points * 0.5));

  const oldStage = progression.stage;
  progression.affection = Math.max(0, progression.affection + points);
  progression.lastInteraction = Date.now();
  
  // 更新阶段
  const newStage = getCurrentStage(progression.affection);
  progression.stage = newStage.id;
  
  // 记录阶段变化
  if (newStage.id !== oldStage) {
    progression.stageHistory.push({
      stage: newStage.id,
      date: new Date().toISOString()
    });
  }

  // 检测是否完成复合
  if (progression.isReconciling && progression.breakups && progression.breakups.length > 0) {
    const lastBreakup = progression.breakups[progression.breakups.length - 1];
    if (lastBreakup.fromStage && newStage.id >= lastBreakup.fromStage) {
      progression.isReconciling = false;
      addMemory('lastReconcile', { date: new Date().toISOString(), fromStage: lastBreakup.fromStage });
    }
  }
  
  // 更新连续天数
  const today = new Date().toDateString();
  if (progression.lastStreakDate !== today) {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    if (progression.lastStreakDate === yesterday) {
      progression.currentStreak++;
    } else {
      progression.currentStreak = 1;
    }
    progression.lastStreakDate = today;
  }
  
  saveProgression(progression);
  
  return {
    points,
    message: actionConfig.msg,
    stageUp: newStage.id > oldStage,
    stageDown: newStage.id < oldStage,
    newStage,
    oldStageName: STAGES[oldStage - 1].name,
    newProgress: getStageProgress(progression.affection)
  };
}

// 添加隐藏好感度
function addHiddenAffection(event) {
  const config = HIDDEN_EVENTS[event];
  if (!config) return null;
  
  const progression = getProgression();
  let points = config.points;
  if (progression.isReconciling) points = Math.max(1, Math.floor(points * 0.5));

  progression.affection = Math.max(0, progression.affection + points);
  progression.lastInteraction = Date.now();
  progression.stage = getCurrentStage(progression.affection).id;
  
  saveProgression(progression);
  
  return {
    points,
    message: config.msg
  };
}

// 添加惩罚（长时间不互动等）
function applyPenalty(event) {
  const config = PENALTY_EVENTS[event];
  if (!config) return null;
  
  const progression = getProgression();
  const oldStageId = progression.stage;
  progression.affection = Math.max(0, progression.affection + config.points);
  const newStage = getCurrentStage(progression.affection);
  progression.stage = newStage.id;

  if (newStage.id < oldStageId) {
    progression.stageHistory.push({
      stage: newStage.id,
      date: new Date().toISOString(),
      event: 'penalty'
    });
  }
  
  saveProgression(progression);
  
  return {
    points: config.points,
    message: config.msg,
    stageDown: newStage.id < oldStageId,
    newStage
  };
}

// ========== 关键词检测 ==========
function checkMoodKeywords(text) {
  const lower = text.toLowerCase();
  for (const [level, config] of Object.entries(MOOD_KEYWORDS)) {
    for (const kw of config.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return {
          level,
          penalty: config.penalty,
          aiMsg: config.aiMsg,
          matchedKeyword: kw,
          isExtreme: level === 'extreme'
        };
      }
    }
  }
  return null;
}

// 应用关键词惩罚
function applyMoodPenalty(result) {
  const progression = getProgression();
  const oldStage = getCurrentStage(progression.affection);
  const oldStageId = oldStage.id;

  if (result.isExtreme) {
    if (!progression.breakups) progression.breakups = [];
    if (!progression.breakupCount) progression.breakupCount = 0;
    progression.breakups.push({
      date: new Date().toISOString(),
      fromStage: oldStageId,
      fromAffection: progression.affection,
      trigger: result.matchedKeyword
    });
    progression.breakupCount++;
    progression.affection = 0;
    progression.isReconciling = true;
    progression.stage = 1;
    progression.stageHistory.push({ stage: 1, date: new Date().toISOString(), event: 'breakup', trigger: result.matchedKeyword });
  } else {
    progression.affection = Math.max(0, progression.affection + result.penalty);
    const newStage = getCurrentStage(progression.affection);
    progression.stage = newStage.id;
    if (newStage.id < oldStageId) {
      progression.stageHistory.push({ stage: newStage.id, date: new Date().toISOString(), event: 'stage_down', trigger: result.matchedKeyword });
    }
  }

  progression.lastInteraction = Date.now();
  saveProgression(progression);

  const newStage = getCurrentStage(progression.affection);
  return {
    oldStageName: oldStage.name,
    newStage,
    newStageName: newStage.name,
    stageDown: newStage.id < oldStageId,
    isExtreme: result.isExtreme,
    penalty: result.isExtreme ? 0 : result.penalty,
    aiMsg: result.aiMsg,
    matchedKeyword: result.matchedKeyword,
    breakupCount: progression.breakupCount || 0
  };
}

// ========== 记忆系统 ==========
function addMemory(key, value) {
  const progression = getProgression();
  if (!progression.memory) progression.memory = [];
  progression.memory = progression.memory.filter(m => m.key !== key);
  progression.memory.push({ key, value, timestamp: Date.now() });
  if (progression.memory.length > 50) {
    progression.memory = progression.memory.slice(-50);
  }
  saveProgression(progression);
}

function getMemory(key) {
  const progression = getProgression();
  if (!progression.memory) return null;
  return progression.memory.find(m => m.key === key) || null;
}

// ========== 二次复合相关 ==========
function isReconciling() {
  const progression = getProgression();
  return !!progression.isReconciling;
}

function getMoodModifier() {
  const progression = getProgression();
  return progression.isReconciling ? 0.5 : 1.0;
}

function getReconciliationContext() {
  const progression = getProgression();
  if (!progression.isReconciling || !progression.breakups || progression.breakups.length === 0) return null;
  const last = progression.breakups[progression.breakups.length - 1];
  const fromStageName = STAGES[last.fromStage - 1] ? STAGES[last.fromStage - 1].name : '未知';
  return {
    breakupDate: last.date,
    fromStage: last.fromStage,
    fromStageName,
    trigger: last.trigger,
    breakupCount: progression.breakupCount || 0,
    currentAffection: progression.affection
  };
}

// 检查并应用每日惩罚（长时间不互动）
function checkDailyPenalty() {
  const progression = getProgression();
  const daysSince = Math.floor((Date.now() - progression.lastInteraction) / (24 * 60 * 60 * 1000));
  
  if (daysSince >= 3) {
    return applyPenalty('noInteraction');
  }
  return null;
}

// 获取解锁信息
function getUnlocks(stageId) {
  const unlocks = {
    1: { titles: ['名字'], features: ['基础问候'] },
    2: { titles: ['昵称', '简称'], features: ['日记共享', '心情分析'] },
    3: { titles: ['亲爱的', '宝贝'], features: ['撒娇按钮', '想念快捷语'] },
    4: { titles: ['老公/老婆', '自定义'], features: ['约会系统', '虚拟礼物'] },
    5: { titles: ['已婚称呼'], features: ['婚礼仪式', '同居模拟'] },
    6: { titles: ['老夫妻称呼'], features: ['回忆相册', '银婚/金婚'] }
  };
  return unlocks[stageId] || { titles: [], features: [] };
}

// 获取阶段称呼列表
function getAvailableTitles(stageId) {
  const titles = [];
  for (let i = 1; i <= stageId; i++) {
    const unlocks = getUnlocks(i);
    titles.push(...unlocks.titles);
  }
  return titles;
}
