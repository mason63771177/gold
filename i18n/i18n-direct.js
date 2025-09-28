/**
 * 直接国际化替换脚本
 * 立即执行模板替换，不依赖复杂的加载逻辑
 */

console.log('直接国际化脚本开始执行');

// 定义翻译映射
const translations = {
    'content.____100_usdt': '立即入金100 USDT，开启168小时挑战期，解锁任务系统和收益机会。',
    'content._____100': '立即激活 100 USDT',
    'content.___10_______________': '查看前10名收益排行榜，了解潜在收益机会。',
    'content.______100': '立即激活 100 USDT',  // 添加6个下划线的版本以防万一
    'content.__currentmastertask__': '所有大神任务已完成',
    'content.168____': '168小时挑战',
    'content.__completedtasks____': '已完成任务：0/3',
    'content.__quizcorrect___': '答题进度：0/20',
    'content.__teammembers__': '团队成员：0人',
    'content._': '收益：',
    'content.__totalearnings__': '0.00',
    'content.__totalearnings____': '0.00 USDT',
    'content.____168___________': '168小时挑战期已结束，您可以再次激活账号继续挑战。',
    'content._______completedtasks__3': '已完成任务：0/3',
    'content._______teammembers__': '团队成员：0人',
    'content.__currenttask_desc__': '完成任务描述',
    'messages.withdraw': '提现',
    'messages.ranking': '排行榜',
    'content.____type____': '类型：任务',
    'content.__bug__': '修复bug',
    'messages.hour': '小时',
    'messages.minute': '分钟',
    'messages.second': '秒',
    'placeholders.__________________': '请输入您的邀请码',
    'alts.message': '消息',
    'content.______________ta': '点击查看详细任务列表',
    'content.___7_____': '裂金7日挑战',
    'content.login': '登录',
    'content.register': '注册',
    'content.password': '密码',
    'messages.______6___': '密码至少6位',
    'content.___________________': '我们是团队结构游戏，不支持玩家独立注册',
    'content.________________': '注册即表示同意用户协议和隐私政策',
    'content.__________': '点击重新发送验证邮件',
    'placeholders._______': '请输入邮箱',
    'placeholders._____': '请输入密码',
    'placeholders.________6_': '请输入密码（至少6位）',
    'placeholders.______': '请输入邀请码',
    'alts.__7_': '裂金7日',
    'messages.cancel': '取消',
    'content.___edit': '编辑',
    'content.____preview': '预览',
    'content.____deletion': '删除',
    'placeholders.____________': '搜索题目关键词',
    'placeholders.__________': '请输入题目内容',
    'placeholders.option_a': '选项A',
    'placeholders.option_b': '选项B',
    'placeholders.option_c': '选项C',
    'placeholders.option_d': '选项D',
    'placeholders._____________': '答错时的提示信息',
    'content.1____a': '1. 用户A',
    'content._____200': '收益：200',
    'content.2____b': '2. 用户B',
    'content._____150': '收益：150',
    'content.3____c': '3. 用户C',
    'content._____120': '收益：120',
    'messages.grab': '抢红包',
    'content.___grab': '抢红包',
    'content.progress': '进度',
    'content.__record_username___': '用户记录',
    'content._______________6___': '请输入新密码（至少6位）',
    'placeholders._________6_': '请输入新密码（至少6位）',
    'placeholders.________': '请确认密码',
    'content.________________________': '退出登录将清除所有本地数据，请确认是否继续？',
    'content._______________': '距离大神任务一还需2人',
    'content.____________________________': '请输入您注册时使用的邮箱地址，我们将向您发送密码重置链接。',
    'content.____100': '请转入 100 USDT (TRC20)',
    'content.bug___': '请简要描述遇到的问题',
    'placeholders._______________': '请详细描述您遇到的问题，包括操作步骤和错误现象',
    'placeholders.___usdt_____trc20': '请输入USDT地址（TRC20）',
    'placeholders.__20_usdt': '最低20 USDT',
    'placeholders._______': '请输入邮箱',
    'placeholders.___usdt____': '请输入USDT地址',
    'content.__level_count__': '等级：1',
    'content._______member_earnings': '成员收益：0.00',
    'content.____________': '团队管理',
    'content._________': '邀请链接',
    'content.__websocket': '连接WebSocket',
    'content.__ping': '发送Ping',
    'placeholders.__jwt_token': '请输入JWT Token',
    'content.1________': '1. 完成注册',
    'content.2__bug________': '2. 修复bug并获得奖励',
    'content.__bug____': '修复bug奖励',
    'content.3__________': '3. 邀请好友加入',
    'content.4_________': '4. 完成每日任务',
    'content.5_________': '5. 参与社区活动',
    'content.__7______': '裂金7日挑战',
    'content.__5________': '5天收益挑战',
    'content.state': '状态',
    'content.amount': '金额',
    'content.___': '手续费',
    'content.__id': '交易ID',
    'content.time': '时间',
    'content._______': '未找到交易记录。',
    'content._____________': '恭喜您！您的邮箱已成功验证，现在可以正常使用所有功能了。',
    'content.____________________': '验证链接无效或已过期，请重新发送验证邮件。',
    'content.________': '重新发送验证邮件',
    'content._______________________': '没有收到邮件？请检查垃圾邮件文件夹，或者等待几分钟后重试。',
    'content.__': '明细',
    'content.confirm': '确认',
    'content.websocket____': 'WebSocket连接状态',
    'content.__7___': '裂金7日 · 提现',
    'content.amount__usdt_': '提现金额（USDT）',
    'content.all': '全部',
    'content.usdt____': 'USDT地址',
    'content._____': '固定手续费',
    'content._______5__': '比例手续费（5%）',
    'content.___________': '请仔细核对您的收款地址：',
    'content.______': '确认提现',
    'content.______________': '点击下方按钮测试设置功能',
    'content.__________________': '🔄 重新加载页面'
};

// 立即执行替换
function immediateReplace() {
    console.log('开始立即替换模板语法');
    
    // 获取所有文本节点
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        if (node.textContent.includes('{{') && node.textContent.includes('}}')) {
            textNodes.push(node);
        }
    }
    
    console.log('找到包含模板的节点数量:', textNodes.length);
    
    textNodes.forEach((node, index) => {
        const originalText = node.textContent;
        let newText = originalText;
        
        // 替换所有模板语法
        newText = newText.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const trimmedKey = key.trim();
            const translation = translations[trimmedKey];
            console.log(`节点${index + 1}: ${match} -> ${trimmedKey} -> ${translation || '未找到'}`);
            return translation || match;
        });
        
        if (newText !== originalText) {
            console.log(`更新节点内容: "${originalText}" -> "${newText}"`);
            node.textContent = newText;
        }
    });
    
    console.log('模板替换完成');
}

// 页面加载完成后立即执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', immediateReplace);
} else {
    immediateReplace();
}

// 也在页面完全加载后再执行一次
window.addEventListener('load', function() {
    console.log('页面完全加载，再次执行替换');
    setTimeout(immediateReplace, 100);
});

// 导出到全局
window.immediateReplace = immediateReplace;