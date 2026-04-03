// ── 模拟评论数据 ──
const comments = [
  { id:1, user:'张明',    avatar:'张', time:'03:22', text:'这里的链式法则推导是整章的核心，建议反复看。', likes:14, active:false },
  { id:2, user:'Iris W.', avatar:'I',  time:'07:45', text:'请问梯度消失问题老师后面会展开讲吗？', likes:6, active:false },
  { id:3, user:'陈浩然',  avatar:'陈', time:'11:04', text:'可以对比一下 SGD 和 Adam 的收敛速度图，直观很多。', likes:9, active:false },
  { id:4, user:'王芳',    avatar:'王', time:'15:18', text:'到这里我开始有点乱了，权重更新那步能再解释一下吗？', likes:3, active:true },
  { id:5, user:'LiuYang', avatar:'L',  time:'19:33', text:'这张图配合板书一起看效果极好，建议投屏学习！', likes:21, active:false },
  { id:6, user:'顾云峰',  avatar:'顾', time:'28:10', text:'ReLU 在这里的选取理由讲得很清楚，感谢老师。', likes:7, active:false },
  { id:7, user:'Priya K.',avatar:'P',  time:'35:47', text:'交叉熵损失和 MSE 的适用场景对比是个很好的补充。', likes:11, active:false },
  { id:8, user:'赵欣然',  avatar:'赵', time:'41:09', text:'总结部分把三个阶段串起来的方式很有助于记忆！', likes:18, active:false },
];

function renderComments() {
  const list = document.getElementById('commentList');
  list.innerHTML = comments.map(c => `
    <div class="comment-item ${c.active ? 'active' : ''}">
      <div class="avatar" style="width:32px;height:32px;font-size:12px;flex-shrink:0">${c.avatar}</div>
      <div class="comment-body">
        <div class="comment-meta">
          <span class="comment-name">${c.user}</span>
          <span class="timestamp-chip">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            ${c.time}
          </span>
        </div>
        <div class="comment-text">${c.text}</div>
        <div class="comment-actions">
          <button class="like-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            ${c.likes}
          </button>
          <button class="like-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            回复
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // 滚动到当前高亮评论
  const activeEl = list.querySelector('.active');
  if (activeEl) activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// ── 身份切换 ──
function setRole(btn, role) {
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const adminTools = document.getElementById('adminTools');
  adminTools.style.display = role === 'admin' ? 'flex' : 'none';
}

// ── 初始化 ──
renderComments();

// ══════════════════════════════════════
//  时间轴工具函数
// ══════════════════════════════════════

const TOTAL_SEC = 2700; // 45:00

function timeToSec(t) {
  const [m, s] = t.split(':').map(Number);
  return m * 60 + s;
}

function secToTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

// 跳转到指定秒数，联动进度条 + 弹幕 + 逐字稿高亮
function seekTo(sec) {
  sec = Math.max(0, Math.min(TOTAL_SEC, sec));
  const timeStr = secToTime(sec);
  const pct     = (sec / TOTAL_SEC * 100).toFixed(2) + '%';

  // 进度条
  const fill = document.getElementById('trackFill');
  if (fill) fill.style.width = pct;

  // 时间显示
  const curTimeEl = document.getElementById('currentTime');
  if (curTimeEl) curTimeEl.textContent = timeStr;

  // 发送栏时间
  const sendBarTime = document.getElementById('sendBarTime');
  if (sendBarTime) sendBarTime.textContent = timeStr;

  // 最近弹幕高亮
  let bestIdx = 0, bestDiff = Infinity;
  comments.forEach((c, i) => {
    const d = Math.abs(timeToSec(c.time) - sec);
    if (d < bestDiff) { bestDiff = d; bestIdx = i; }
  });
  comments.forEach((c, i) => c.active = (i === bestIdx));
  renderComments();

  // 逐字稿段落高亮（若已渲染）
  updateTranscriptHighlight(sec);
}

// 单独更新逐字稿高亮，不重新渲染整个列表
function updateTranscriptHighlight(sec) {
  const paras = document.querySelectorAll('.transcript-para');
  if (!paras.length) return;
  let bestIdx = 0, bestDiff = Infinity;
  transcript.forEach((p, i) => {
    const d = Math.abs(timeToSec(p.time) - sec);
    if (d < bestDiff) { bestDiff = d; bestIdx = i; }
  });
  paras.forEach((el, i) => el.classList.toggle('current', i === bestIdx));
  transcript.forEach((p, i) => p.current = (i === bestIdx));
}

// ══════════════════════════════════════
//  画中画 / 逐字稿
// ══════════════════════════════════════

// ── AI 逐字稿模拟数据 ──
const transcript = [
  { time: '00:00', text: '同学们好，今天我们来学习反向传播算法，这是深度学习中最核心的算法之一。' },
  { time: '01:20', text: '首先让我们回顾前向传播的过程。给定输入 x，经过各层神经元的计算，得到最终输出 ŷ。' },
  { time: '03:10', text: '这里的关键是链式法则。当我们有复合函数时，导数可以通过链式相乘来计算，这是整个反向传播的数学基础。' },
  { time: '05:45', text: '损失函数 L 衡量了预测与真实值之间的差距。常用的有均方误差（MSE）和交叉熵损失函数。' },
  { time: '07:30', text: '反向传播第一步：计算输出层梯度。对损失函数关于输出层参数求偏导数，得到梯度信号。' },
  { time: '09:15', text: '得到输出层梯度后，利用链式法则将梯度反向传播到隐藏层。每一层的梯度都依赖后面一层的梯度。' },
  { time: '11:00', text: '这就是"反向"传播名称的由来——梯度从输出层向输入层方向流动，与前向传播方向相反。' },
  { time: '13:22', text: '激活函数的选择对梯度传播有重要影响。ReLU 在正值区间梯度为 1，能有效缓解梯度消失问题。' },
  { time: '15:10', text: '现在来到权重更新环节。得到每个参数的梯度后，按照梯度下降方向更新权重参数。', current: true },
  { time: '15:18', text: 'w = w − α · ∂L/∂w，其中 α 是学习率，控制每次更新的步长大小。学习率的选择对训练效果至关重要。', current: true },
  { time: '17:05', text: '学习率太大会导致训练不稳定甚至发散；学习率太小则收敛缓慢，训练效率低下。' },
  { time: '19:30', text: '为了解决学习率选择的难题，研究者提出了自适应优化算法，如 Adam、RMSprop、AdaGrad 等。' },
  { time: '22:15', text: '梯度消失是深层网络训练的一大挑战。梯度经过多层反向传播后，会呈指数级衰减，导致浅层参数几乎不更新。' },
  { time: '25:40', text: '针对梯度消失，除 ReLU 外，还可使用残差连接（ResNet）、批归一化（BatchNorm）等技术。' },
  { time: '28:00', text: '我们通过一个具体例子来理解整个流程。假设有两层网络，输入维度为 3，隐藏层维度为 4，输出为 2。' },
  { time: '32:10', text: '计算完所有层的梯度后，执行一次参数更新，完成一个训练步骤，通常称为一个 iteration（迭代）。' },
  { time: '36:45', text: '实际训练中通常使用小批量梯度下降（Mini-batch SGD），每次取一小批样本计算梯度，平衡效率与稳定性。' },
  { time: '40:20', text: '总结反向传播的三个阶段：前向传播计算输出、计算损失梯度、反向传播更新参数。' },
  { time: '43:00', text: '三个阶段不断循环迭代，使网络逐渐学习到数据中的规律。这就是深度学习训练的本质。' },
];

function renderTranscript() {
  const body = document.getElementById('transcriptBody');
  if (!body) return;
  body.innerHTML = transcript.map(p => {
    const sec = timeToSec(p.time);
    return `
    <div class="transcript-para ${p.current ? 'current' : ''}">
      <div class="t-time" onclick="seekTo(${sec})" title="跳转至 ${p.time}">${p.time}</div>
      <div class="t-text">${p.text}</div>
    </div>`;
  }).join('');
  const cur = body.querySelector('.current');
  if (cur) setTimeout(() => cur.scrollIntoView({ block: 'center', behavior: 'smooth' }), 80);
}

// ── 视图切换：视频 ↔ 逐字稿 ──
function switchView(mode) {
  const videoMain      = document.getElementById('videoMain');
  const transcriptMain = document.getElementById('transcriptMain');
  const btnVideo       = document.getElementById('btnVideo');
  const btnTranscript  = document.getElementById('btnTranscript');

  if (mode === 'video') {
    videoMain.style.display      = 'flex';
    transcriptMain.style.display = 'none';
    btnVideo.classList.add('active');
    btnTranscript.classList.remove('active');
  } else {
    videoMain.style.display      = 'none';
    transcriptMain.style.display = 'flex';
    btnTranscript.classList.add('active');
    btnVideo.classList.remove('active');
    renderTranscript();
  }
}

// ── 点赞按钮 ──
function toggleLike(btn) {
  btn.classList.toggle('liked');
}

// 预渲染逐字稿
renderTranscript();

// ── 进度条点击 → 联动弹幕 ──
document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('progressTrack');
  if (!track) return;
  track.addEventListener('click', e => {
    const rect = track.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(Math.round(pct * TOTAL_SEC));
  });
});
