/**
 * 简化版国际化系统
 * 直接加载语言包并替换模板语法
 */

console.log('i18n-simple.js 脚本已加载');

// 先加载文本配置
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOMContentLoaded 事件触发');
    try {
        console.log('开始加载国际化系统...');
        
        // 加载texts.js
        await loadScript('./i18n/texts.js');
        console.log('texts.js 加载完成，window.TEXTS:', !!window.TEXTS);
        
        // 加载中文语言包
        await loadScript('./i18n/lang/zh-CN.js');
        console.log('zh-CN.js 加载完成，window.zhCN:', !!window.zhCN);
        
        // 获取语言包数据
        const translations = window.zhCN || {};
        console.log('翻译数据:', translations);
        
        // 测试特定键值
        console.log('测试键值 content.____100_usdt:', getNestedValue(translations, 'content.____100_usdt'));
        console.log('测试键值 content._____100:', getNestedValue(translations, 'content._____100'));
        console.log('测试键值 content.___10_______________:', getNestedValue(translations, 'content.___10_______________'));
        
        // 替换页面中的模板语法
        replaceTemplates(translations);
        
        console.log('国际化系统加载完成');
    } catch (error) {
        console.error('国际化系统加载失败:', error);
    }
});

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function replaceTemplates(translations) {
    console.log('开始替换模板语法...');
    
    // 替换HTML中的模板语法
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
    
    console.log('找到包含模板语法的文本节点:', textNodes.length);
    
    textNodes.forEach((node, index) => {
        let text = node.textContent;
        console.log(`处理节点 ${index + 1}: "${text}"`);
        
        text = text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const trimmedKey = key.trim();
            const value = getNestedValue(translations, trimmedKey);
            console.log(`  替换 ${match} -> ${trimmedKey} -> ${value || '未找到'}`);
            return value || match;
        });
        
        if (text !== node.textContent) {
            console.log(`  节点内容已更新: "${node.textContent}" -> "${text}"`);
            node.textContent = text;
        }
    });
    
    // 替换属性中的模板语法
    const elements = document.querySelectorAll('[title*="{{"], [placeholder*="{{"], [alt*="{{"], [aria-label*="{{"]');
    console.log('找到包含模板语法的属性元素:', elements.length);
    
    elements.forEach(element => {
        ['title', 'placeholder', 'alt', 'aria-label'].forEach(attr => {
            const value = element.getAttribute(attr);
            if (value && value.includes('{{')) {
                const newValue = value.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
                    const trimmedKey = key.trim();
                    const result = getNestedValue(translations, trimmedKey);
                    console.log(`  属性替换 ${attr}: ${match} -> ${result || '未找到'}`);
                    return result || match;
                });
                element.setAttribute(attr, newValue);
            }
        });
    });
    
    console.log('模板替换完成');
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : null;
    }, obj);
}

// 导出到全局
window.i18nSimple = {
    replaceTemplates,
    getNestedValue
};