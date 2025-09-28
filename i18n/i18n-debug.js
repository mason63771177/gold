console.log('🚀 调试版国际化脚本开始执行');

// 语言包定义
const translations = {
    'zh-CN': {
        'content.login': '登录',
        'content.register': '注册',
        'content.password': '密码',
        'content.___7_____': '裂金7日挑战',
        'placeholders._______': '请输入邮箱',
        'placeholders._____': '请输入密码',
        'placeholders.________6_': '请输入密码（至少6位）',
        'alts.__7_': '裂金7日',
        'buttons.back': '返回',
        'buttons.confirm': '确定',
        'buttons.cancel': '取消',
        'buttons.login': '登录',
        'buttons.register': '注册'
    },
    'en-US': {
        'content.login': 'Login',
        'content.register': 'Register',
        'content.password': 'Password',
        'content.___7_____': 'Gold Rush 7-Day Challenge',
        'placeholders._______': 'Enter email',
        'placeholders._____': 'Enter password',
        'placeholders.________6_': 'Enter password (at least 6 characters)',
        'alts.__7_': 'Gold Rush 7-Day',
        'buttons.back': 'Back',
        'buttons.confirm': 'Confirm',
        'buttons.cancel': 'Cancel',
        'buttons.login': 'Login',
        'buttons.register': 'Register'
    }
};

// 获取当前语言
function getCurrentLanguage() {
    const lang = localStorage.getItem('preferred-language') || 'zh-CN';
    console.log('📍 获取当前语言:', lang);
    return lang;
}

// 设置语言
function setLanguage(lang) {
    console.log('🔄 设置语言为:', lang);
    localStorage.setItem('preferred-language', lang);
    
    // 立即更新按钮状态
    updateSwitcherButtons();
    
    // 平滑的模板替换，避免闪烁
    console.log('🎯 开始平滑模板替换');
    replaceTemplates();
    
    // 延迟执行确保成功，但减少次数避免闪烁
    setTimeout(() => {
        console.log('🔄 延迟模板替换 (200ms)');
        replaceTemplates();
    }, 200);
}

// 替换模板
function replaceTemplates() {
    const currentLang = getCurrentLanguage();
    const currentTranslations = translations[currentLang] || translations['zh-CN'];
    
    console.log('🎯 开始替换模板，当前语言:', currentLang);
    console.log('📚 可用翻译数量:', Object.keys(currentTranslations).length);
    
    let replacementCount = 0;
    
    // 遍历所有文本节点
    function walkTextNodes(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.textContent;
            let originalText = text;
            
            // 替换所有模板语法
            for (const [key, value] of Object.entries(currentTranslations)) {
                const template = `{{${key}}}`;
                if (text.includes(template)) {
                    text = text.replace(new RegExp(template.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
                    replacementCount++;
                    console.log(`✅ 替换文本: ${template} -> ${value}`);
                }
            }
            
            if (text !== originalText) {
                node.textContent = text;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // 处理属性中的模板
            if (node.hasAttributes()) {
                const attributes = ['placeholder', 'title', 'alt', 'value'];
                attributes.forEach(attr => {
                    if (node.hasAttribute(attr)) {
                        let attrValue = node.getAttribute(attr);
                        let originalValue = attrValue;
                        
                        for (const [key, value] of Object.entries(currentTranslations)) {
                            const template = `{{${key}}}`;
                            if (attrValue.includes(template)) {
                                attrValue = attrValue.replace(new RegExp(template.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
                                replacementCount++;
                                console.log(`✅ 替换属性: ${attr}="${template}" -> ${value}`);
                            }
                        }
                        
                        if (attrValue !== originalValue) {
                            node.setAttribute(attr, attrValue);
                            // 对于placeholder，直接设置属性确保生效
                            if (attr === 'placeholder' && node.tagName === 'INPUT') {
                                node.placeholder = attrValue;
                            }
                        }
                    }
                });
            }
            
            // 递归处理子节点
            for (let child of node.childNodes) {
                walkTextNodes(child);
            }
        }
    }
    
    walkTextNodes(document.body);
    console.log(`🎉 模板替换完成，共替换 ${replacementCount} 个模板`);
}

// 创建语言切换器
function createLanguageSwitcher() {
    console.log('🎨 创建语言切换器');
    
    // 检查是否已存在
    if (document.getElementById('language-switcher')) {
        console.log('⚠️ 语言切换器已存在');
        return;
    }
    
    const switcher = document.createElement('div');
    switcher.id = 'language-switcher';
    switcher.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: rgba(0, 0, 0, 0.9);
        border-radius: 8px;
        padding: 10px;
        display: flex;
        gap: 10px;
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    `;
    
    const currentLang = getCurrentLanguage();
    
    // 中文按钮
    const zhBtn = document.createElement('button');
    zhBtn.textContent = '中文';
    zhBtn.id = 'zh-btn';
    zhBtn.style.cssText = `
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        background: ${currentLang === 'zh-CN' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
        color: white;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: all 0.3s ease;
    `;
    zhBtn.onclick = () => {
        console.log('🇨🇳 点击中文按钮');
        setLanguage('zh-CN');
    };
    
    // 英文按钮
    const enBtn = document.createElement('button');
    enBtn.textContent = 'EN';
    enBtn.id = 'en-btn';
    enBtn.style.cssText = `
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        background: ${currentLang === 'en-US' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
        color: white;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: all 0.3s ease;
    `;
    enBtn.onclick = () => {
        console.log('🇺🇸 点击英文按钮');
        setLanguage('en-US');
    };
    
    switcher.appendChild(zhBtn);
    switcher.appendChild(enBtn);
    document.body.appendChild(switcher);
    
    console.log('✅ 语言切换器创建完成');
}

// 更新按钮状态
function updateSwitcherButtons() {
    const currentLang = getCurrentLanguage();
    const zhBtn = document.getElementById('zh-btn');
    const enBtn = document.getElementById('en-btn');
    
    console.log('🔄 更新按钮状态，当前语言:', currentLang);
    
    if (zhBtn && enBtn) {
        zhBtn.style.background = currentLang === 'zh-CN' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)';
        enBtn.style.background = currentLang === 'en-US' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)';
        console.log('✅ 按钮状态更新完成');
    } else {
        console.log('❌ 找不到按钮元素');
    }
}

// 初始化
function init() {
    console.log('🚀 初始化多语言系统');
    
    // 创建语言切换器
    createLanguageSwitcher();
    
    // 执行初始模板替换
    setTimeout(() => {
        console.log('🎯 执行初始模板替换');
        replaceTemplates();
    }, 300);
}

// DOM加载完成后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 页面完全加载后再次执行
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🔄 页面加载完成，再次执行模板替换');
        replaceTemplates();
    }, 500);
});

// 暴露全局函数
window.setLanguage = setLanguage;
window.getCurrentLanguage = getCurrentLanguage;
window.replaceTemplates = replaceTemplates;

console.log('✅ 调试版国际化脚本加载完成');