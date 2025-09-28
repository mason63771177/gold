// 主题切换系统
class ThemeSwitcher {
  constructor() {
    this.themes = {
      'cyberpunk': {
        name: '赛博朋克',
        icon: '🌆',
        description: '炫酷科技风'
      },

      'business': {
        name: '经典商务',
        icon: '💼',
        description: '专业商务风'
      },
      'dark-tech': {
        name: '暗黑科技',
        icon: '⚡',
        description: '冷峻科技风'
      },
      'fresh': {
        name: '清新简约',
        icon: '🌿',
        description: '简洁清新风'
      }
    };
    
    this.currentTheme = this.loadTheme();
    this.init();
  }

  // 初始化主题系统
  init() {
    this.applyTheme(this.currentTheme);
    this.createThemeSwitcher();
  }

  // 从本地存储加载主题
  loadTheme() {
    return localStorage.getItem('selectedTheme') || 'cyberpunk';
  }

  // 保存主题到本地存储
  saveTheme(theme) {
    localStorage.setItem('selectedTheme', theme);
  }

  // 应用主题
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme === 'cyberpunk' ? '' : theme);
    this.currentTheme = theme;
    this.saveTheme(theme);
  }

  // 创建主题切换器UI
  createThemeSwitcher() {
    const switcherHTML = `
      <div class="theme-switcher" id="themeSwitcher">
        <button class="theme-toggle-btn" id="themeToggleBtn">
          <span class="theme-icon">${this.themes[this.currentTheme].icon}</span>
          <span class="theme-text">风格</span>
        </button>
        <div class="theme-dropdown" id="themeDropdown">
          ${Object.entries(this.themes).map(([key, theme]) => `
            <div class="theme-option ${key === this.currentTheme ? 'active' : ''}" data-theme="${key}">
              <span class="theme-option-icon">${theme.icon}</span>
              <div class="theme-option-info">
                <div class="theme-option-name">${theme.name}</div>
                <div class="theme-option-desc">${theme.description}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // 插入到页面顶部
    const header = document.querySelector('.header');
    if (header) {
      header.insertAdjacentHTML('beforeend', switcherHTML);
      this.bindEvents();
    }
  }

  // 绑定事件
  bindEvents() {
    const toggleBtn = document.getElementById('themeToggleBtn');
    const dropdown = document.getElementById('themeDropdown');
    const options = document.querySelectorAll('.theme-option');

    // 切换下拉菜单
    toggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', () => {
      dropdown.classList.remove('show');
    });

    // 主题选择
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const theme = option.getAttribute('data-theme');
        this.switchTheme(theme);
        dropdown.classList.remove('show');
      });
    });
  }

  // 切换主题
  switchTheme(theme) {
    this.applyTheme(theme);
    
    // 更新UI
    const toggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = toggleBtn?.querySelector('.theme-icon');
    if (themeIcon) {
      themeIcon.textContent = this.themes[theme].icon;
    }

    // 更新选中状态
    document.querySelectorAll('.theme-option').forEach(option => {
      option.classList.toggle('active', option.getAttribute('data-theme') === theme);
    });

    // 触发主题切换事件
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  // 获取当前主题
  getCurrentTheme() {
    return this.currentTheme;
  }
}

// 主题切换器样式
const themeSwitcherStyles = `
<style>
.theme-switcher {
  position: relative;
  margin-left: auto;
}

.theme-toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--btn-gradient);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--btn-shadow);
  transition: all 0.3s ease;
}

.theme-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--btn-shadow), var(--btn-glow);
}

.theme-icon {
  font-size: 16px;
}

.theme-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1000;
  min-width: 200px;
}

.theme-dropdown.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  margin: 4px;
}

.theme-option:hover {
  background: var(--bg-secondary);
  transform: translateX(4px);
}

.theme-option.active {
  background: var(--btn-gradient);
  color: var(--text-primary);
}

.theme-option-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.theme-option-info {
  flex: 1;
}

.theme-option-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
}

.theme-option-desc {
  font-size: 12px;
  opacity: 0.8;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .theme-toggle-btn {
    padding: 6px 10px;
    font-size: 12px;
  }
  
  .theme-dropdown {
    min-width: 180px;
  }
  
  .theme-option {
    padding: 10px 12px;
  }
}
</style>
`;

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
  // 插入样式
  document.head.insertAdjacentHTML('beforeend', themeSwitcherStyles);
  
  // 初始化主题切换器
  window.themeSwitcher = new ThemeSwitcher();
});

// 导出供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeSwitcher;
}