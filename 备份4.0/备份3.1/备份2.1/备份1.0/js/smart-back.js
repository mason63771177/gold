// 智能返回函数 - 解决直接访问页面时返回按钮无效的问题
function smartBack() {
  // 检查是否有浏览历史记录
  if (document.referrer && document.referrer.includes(window.location.origin)) {
    // 如果有同域的来源页面，使用浏览器返回
    history.back();
  } else {
    // 如果没有历史记录或来源不是同域，返回到主页
    window.location.href = 'index.html';
  }
}

// 为了兼容性，也可以根据当前页面返回到特定页面
function smartBackToParent() {
  const currentPage = window.location.pathname.split('/').pop();
  
  // 定义页面的父页面关系
  const pageParents = {
    'wallet.html': 'index.html',
    'withdraw.html': 'wallet.html',
    'transaction.html': 'wallet.html',
    'tasks.html': 'index.html',
    'team.html': 'index.html',
    'team_member.html': 'team.html',
    'ranking.html': 'index.html',
    'ranking_user.html': 'ranking.html',
    'redpacket.html': 'index.html',
    'quiz.html': 'tasks.html'
  };
  
  // 检查是否有浏览历史记录
  if (document.referrer && document.referrer.includes(window.location.origin)) {
    history.back();
  } else {
    // 返回到指定的父页面，如果没有定义则返回主页
    const parentPage = pageParents[currentPage] || 'index.html';
    window.location.href = parentPage;
  }
}