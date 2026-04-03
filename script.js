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
