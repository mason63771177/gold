#!/bin/bash

# 最终修复脚本 - 彻底解决所有遗留问题
# 只处理主目录中的文件，不处理备份文件夹

echo "开始最终修复..."

# 处理主目录中的HTML文件
for file in *.html; do
    if [ -f "$file" ]; then
        echo "最终修复文件: $file"
        
        # 修复内联样式中的圆角
        sed -i '' 's/border-radius: 6px/border-radius: 14px/g' "$file"
        sed -i '' 's/border-radius:6px/border-radius: 14px/g' "$file"
        sed -i '' 's/border-radius: 8px/border-radius: 14px/g' "$file"
        sed -i '' 's/border-radius:8px/border-radius: 14px/g' "$file"
        sed -i '' 's/border-radius: 12px/border-radius: 14px/g' "$file"
        sed -i '' 's/border-radius:12px/border-radius: 14px/g' "$file"
        sed -i '' 's/border-radius: 20px/border-radius: 16px/g' "$file"
        sed -i '' 's/border-radius:20px/border-radius: 16px/g' "$file"
        
        # 修复CSS样式中的圆角
        sed -i '' 's/border-radius: 6px;/border-radius: 14px;/g' "$file"
        sed -i '' 's/border-radius:6px;/border-radius: 14px;/g' "$file"
        sed -i '' 's/border-radius: 8px;/border-radius: 14px;/g' "$file"
        sed -i '' 's/border-radius:8px;/border-radius: 14px;/g' "$file"
        sed -i '' 's/border-radius: 12px;/border-radius: 16px;/g' "$file"
        sed -i '' 's/border-radius:12px;/border-radius: 16px;/g' "$file"
        sed -i '' 's/border-radius: 20px;/border-radius: 16px;/g' "$file"
        sed -i '' 's/border-radius:20px;/border-radius: 16px;/g' "$file"
        
        # 修复复杂阴影 - 更精确的匹配
        sed -i '' 's/box-shadow: 0 2px 6px[^;]*/box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)/g' "$file"
        sed -i '' 's/box-shadow:0 2px 6px[^;]*/box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)/g' "$file"
        sed -i '' 's/box-shadow: 0 4px 12px[^;]*/box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15)/g' "$file"
        sed -i '' 's/box-shadow:0 4px 12px[^;]*/box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15)/g' "$file"
        
        # 删除--btn-glow引用
        sed -i '' 's/var(--btn-glow)/0 2px 8px rgba(0, 0, 0, 0.1)/g' "$file"
        sed -i '' 's/box-shadow: var(--btn-glow);/box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);/g' "$file"
        
        echo "  ✓ 已最终修复 $file"
    fi
done

# 处理JS文件
for file in *.js; do
    if [ -f "$file" ]; then
        echo "最终修复JS文件: $file"
        
        # 修复JS中的样式
        sed -i '' 's/border-radius: 6px/border-radius: 14px/g' "$file"
        sed -i '' 's/border-radius:6px/border-radius: 14px/g' "$file"
        sed -i '' 's/border-radius: 8px/border-radius: 14px/g' "$file"
        sed -i '' 's/border-radius:8px/border-radius: 14px/g' "$file"
        sed -i '' 's/border-radius: 12px/border-radius: 16px/g' "$file"
        sed -i '' 's/border-radius:12px/border-radius: 16px/g' "$file"
        
        echo "  ✓ 已最终修复 $file"
    fi
done

# 处理CSS文件
for file in css/*.css; do
    if [ -f "$file" ]; then
        echo "最终修复CSS文件: $file"
        
        # 修复CSS中的圆角
        sed -i '' 's/border-radius: 6px/border-radius: 14px/g' "$file"
        sed -i '' 's/border-radius:6px/border-radius: 14px/g' "$file"
        sed -i '' 's/border-radius: 8px/border-radius: 14px/g' "$file"
        sed -i '' 's/border-radius:8px/border-radius: 14px/g' "$file"
        sed -i '' 's/border-radius: 12px/border-radius: 16px/g' "$file"
        sed -i '' 's/border-radius:12px/border-radius: 16px/g' "$file"
        sed -i '' 's/border-radius: 20px/border-radius: 16px/g' "$file"
        sed -i '' 's/border-radius:20px/border-radius: 16px/g' "$file"
        
        echo "  ✓ 已最终修复 $file"
    fi
done

echo ""
echo "最终修复完成！"
echo "修复内容："
echo "  - 统一所有圆角规格"
echo "  - 简化所有复杂阴影"
echo "  - 删除--btn-glow引用"
echo "  - 处理HTML、JS、CSS文件"