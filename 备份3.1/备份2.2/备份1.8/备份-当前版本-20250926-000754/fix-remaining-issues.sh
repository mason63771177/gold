#!/bin/bash

# 补充修复脚本
# 处理最终检查中发现的遗漏问题

echo "开始修复遗漏问题..."

# 处理所有HTML文件
for file in *.html; do
    if [ -f "$file" ]; then
        echo "修复文件: $file"
        
        # 修复字体大小
        sed -i '' 's/font-size: 10px/font-size: var(--font-caption)/g' "$file"
        sed -i '' 's/font-size:10px/font-size: var(--font-caption)/g' "$file"
        sed -i '' 's/font-size: 16px/font-size: var(--font-body)/g' "$file"
        sed -i '' 's/font-size:16px/font-size: var(--font-body)/g' "$file"
        
        # 修复圆角规格
        sed -i '' 's/border-radius: 6px/border-radius: var(--radius-btn)/g' "$file"
        sed -i '' 's/border-radius:6px/border-radius: var(--radius-btn)/g' "$file"
        sed -i '' 's/border-radius: 8px/border-radius: var(--radius-btn)/g' "$file"
        sed -i '' 's/border-radius:8px/border-radius: var(--radius-btn)/g' "$file"
        sed -i '' 's/border-radius: 12px/border-radius: var(--radius-btn)/g' "$file"
        sed -i '' 's/border-radius:12px/border-radius: var(--radius-btn)/g' "$file"
        sed -i '' 's/border-radius: 20px/border-radius: var(--radius-card)/g' "$file"
        sed -i '' 's/border-radius:20px/border-radius: var(--radius-card)/g' "$file"
        
        # 修复复杂阴影
        sed -i '' 's/box-shadow: 0 1px 3px[^;]*/box-shadow: var(--shadow-light)/g' "$file"
        sed -i '' 's/box-shadow:0 1px 3px[^;]*/box-shadow: var(--shadow-light)/g' "$file"
        sed -i '' 's/box-shadow: 0 2px 4px[^;]*/box-shadow: var(--shadow-light)/g' "$file"
        sed -i '' 's/box-shadow:0 2px 4px[^;]*/box-shadow: var(--shadow-light)/g' "$file"
        sed -i '' 's/box-shadow: 0 4px 8px[^;]*/box-shadow: var(--shadow-heavy)/g' "$file"
        sed -i '' 's/box-shadow:0 4px 8px[^;]*/box-shadow: var(--shadow-heavy)/g' "$file"
        
        # 删除cyberpunk相关动画
        sed -i '' '/cyberpunk/d' "$file"
        
        echo "  ✓ 已修复 $file"
    fi
done

# 添加CSS变量到设计系统
cat >> css/design-system.css << 'EOF'

/* 补充CSS变量 */
:root {
  /* 圆角变量 */
  --radius-btn: 14px;
  --radius-card: 16px;
  --radius-modal: 24px;
  
  /* 阴影变量 */
  --shadow-light: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-heavy: 0 4px 16px rgba(0, 0, 0, 0.15);
  
  /* 颜色变量补充 */
  --color-neutral-200: #e5e7eb;
  --color-neutral-500: #6b7280;
  --color-primary: #3b82f6;
  --color-primary-dark: #1d4ed8;
  --color-success: #10b981;
  --color-error: #ef4444;
  
  /* 背景变量 */
  --bg-card: #ffffff;
}
EOF

echo ""
echo "遗漏问题修复完成！"
echo "修复内容："
echo "  - 统一字体大小变量"
echo "  - 统一圆角规格变量"
echo "  - 简化复杂阴影"
echo "  - 删除cyberpunk动画"
echo "  - 添加CSS变量定义"