/**
 * 全局背景Logo初始化脚本
 * 自动在所有页面添加带光晕效果的背景logo
 */

(function() {
  'use strict';
  
  // 等待DOM加载完成
  function initGlobalBackground() {
    // 检查是否已经添加过背景
    if (document.querySelector('.global-background')) {
      return;
    }
    
    // 创建背景容器
    const backgroundContainer = document.createElement('div');
    backgroundContainer.className = 'global-background';
    
    // 创建logo容器
    const logoContainer = document.createElement('div');
    logoContainer.className = 'global-logo';
    
    // 创建logo图片
    const logoImage = document.createElement('img');
    logoImage.className = 'global-logo-image';
    logoImage.src = 'logo_gold7.png'; // 正确的logo文件路径
    logoImage.alt = 'Background Logo';
    logoImage.loading = 'lazy';
    
    // 图片加载成功后的回调
    logoImage.onload = function() {
        adjustLogoForTheme();
        adjustLogoPosition();
    };
    
    // 如果logo图片加载失败，使用SVG作为备用
    logoImage.onerror = function() {
        console.warn('Logo图片加载失败，使用SVG备用方案');
      // 创建SVG logo作为备用
      const svgLogo = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgLogo.setAttribute('viewBox', '0 0 200 200');
      svgLogo.setAttribute('class', 'global-logo-image');
      svgLogo.innerHTML = `
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:var(--accent-color, #40E0D0);stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:var(--secondary-color, #FF6B6B);stop-opacity:0.6" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="80" fill="url(#logoGradient)" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="var(--accent-color, #40E0D0)" stroke-width="2" opacity="0.6" />
        <circle cx="100" cy="100" r="40" fill="none" stroke="var(--accent-color, #40E0D0)" stroke-width="1" opacity="0.4" />
        <text x="100" y="110" text-anchor="middle" fill="var(--text-primary, #ffffff)" font-size="24" font-weight="bold" opacity="0.8">LOGO</text>
      `;
      
      // 替换失败的图片
      logoContainer.removeChild(logoImage);
      logoContainer.appendChild(svgLogo);
    };
    
    // 组装元素
    logoContainer.appendChild(logoImage);
    backgroundContainer.appendChild(logoContainer);
    
    // 添加到页面最前面（但z-index最低）
    document.body.insertBefore(backgroundContainer, document.body.firstChild);
    
    // 添加样式表（如果还没有加载）
    if (!document.querySelector('link[href*="global-background.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'css/global-background.css';
      document.head.appendChild(link);
    }
    
    // 监听主题变化，调整logo透明度
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          adjustLogoForTheme();
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    
    // 初始调整
    adjustLogoForTheme();
  }
  
  // 根据主题调整logo显示
  function adjustLogoForTheme() {
    const logo = document.querySelector('.global-logo');
    if (!logo) return;
    
    const theme = document.documentElement.getAttribute('data-theme') || 'cyberpunk';
    
    // 根据不同主题调整透明度（提高可见度）
    switch(theme) {
      case 'cyberpunk':
        logo.style.opacity = '0.12';
        break;
      case 'business':
        logo.style.opacity = '0.10';
        break;
      case 'dark-tech':
        logo.style.opacity = '0.14';
        break;
      case 'fresh':
        logo.style.opacity = '0.10';
        break;
      default:
        logo.style.opacity = '0.10';
    }
  }
  
  // 检查页面类型，调整logo位置
  function adjustLogoPosition() {
    const logo = document.querySelector('.global-logo');
    if (!logo) return;
    
    // 检查是否是特殊页面（如登录、注册页面）
    const isAuthPage = document.body.classList.contains('auth-page') || 
                      window.location.pathname.includes('login') ||
                      window.location.pathname.includes('register');
    
    if (isAuthPage) {
      // 认证页面logo位置稍微上移
      logo.style.transform = 'translate(-50%, -60%)';
    } else {
      // 普通页面居中
      logo.style.transform = 'translate(-50%, -50%)';
    }
  }
  
  // 性能优化：防抖函数
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // 监听窗口大小变化，调整logo
  const debouncedResize = debounce(() => {
    adjustLogoPosition();
  }, 250);
  
  // 初始化函数
  function init() {
    initGlobalBackground();
    adjustLogoPosition();
    
    // 初始化国际化
    if (window.i18n) {
      window.i18n.init().then(() => {
        console.log('国际化初始化完成');
      }).catch(error => {
        console.error($t('messages._________'), error);
      });
    }
    
    // 创建跨页语言切换控件
    createLanguageSwitch();
    
    // 监听窗口大小变化
    window.addEventListener('resize', debouncedResize);
    
    // 监听页面可见性变化，优化性能
    document.addEventListener('visibilitychange', function() {
      const logo = document.querySelector('.global-logo');
      if (!logo) return;
      
      if (document.hidden) {
        // 页面隐藏时暂停动画
        logo.style.animationPlayState = 'paused';
      } else {
        // 页面显示时恢复动画
        logo.style.animationPlayState = 'running';
      }
    });
  }
  
  // 创建语言切换控件（固定右上角）
  function createLanguageSwitch() {
     // 登录页不创建全局语言按钮，避免与页面内控件或顶部布局重叠
     const path = (window.location && window.location.pathname) || '';
     if (path.includes('login.html')) return;
     if (document.querySelector('.global-lang-switch')) return;
     const currentLang = (localStorage.getItem('preferred-language') || localStorage.getItem('language') || navigator.language || 'zh-CN');
     const isEN = (currentLang || '').toLowerCase().startsWith('en');
    
    const container = document.createElement('div');
    container.className = 'global-lang-switch';
    container.setAttribute('aria-label', 'Language Switcher');
    container.style.zIndex = '9999';
    
    const btn = document.createElement('button');
    btn.className = 'lang-btn';
    btn.type = 'button';
    btn.innerHTML = `🌐 ${isEN ? 'EN' : '中文'}`;
    
    const menu = document.createElement('div');
    menu.className = 'lang-menu';
    menu.innerHTML = `
      <button class="lang-item" data-lang="zh-CN">中文（简体）</button>
      <button class="lang-item" data-lang="en-US">English</button>
    `;
    
    btn.addEventListener('click', () => {
      menu.classList.toggle('open');
    });
    
    // 选择语言
    menu.addEventListener('click', (e) => {
      const target = e.target.closest('.lang-item');
      if (!target) return;
      const lang = target.getAttribute('data-lang');
      localStorage.setItem('language', lang);
      localStorage.setItem('preferred-language', lang);
      localStorage.setItem('gold7_language', lang);
      // 立即更新按钮文案
      btn.innerHTML = `🌐 ${lang.toLowerCase().startsWith('en') ? 'EN' : '中文'}`;
      menu.classList.remove('open');
      
      // 分发语言变更事件
      document.dispatchEvent(new Event('language-changed'));
      
      // 若页面提供了模板替换函数，尝试即时替换
      try {
        if (window.i18n && typeof window.i18n.init === 'function') {
          // 重新初始化以应用新语言
          window.i18n.init().then(() => {
            if (typeof window.i18n.setLanguage === 'function') {
              window.i18n.setLanguage(lang);
            }
            if (typeof window.scheduleReplace === 'function') {
              window.scheduleReplace();
            }
          }).catch(() => {
            // 回退刷新
            setTimeout(() => location.reload(), 200);
          });
        } else {
          // 无i18n引擎，回退刷新
          setTimeout(() => location.reload(), 200);
        }
      } catch (err) {
        // 安全回退：刷新页面
        setTimeout(() => location.reload(), 200);
      }
    });
    
    // 点击页面其他区域时关闭菜单
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        menu.classList.remove('open');
      }
    });
    
    container.appendChild(btn);
    container.appendChild(menu);
    document.body.appendChild(container);
  }
  
  // DOM加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // 导出到全局，供其他脚本调用
  window.GlobalBackground = {
    init: init,
    adjustLogoForTheme: adjustLogoForTheme,
    adjustLogoPosition: adjustLogoPosition
  };
  
})();