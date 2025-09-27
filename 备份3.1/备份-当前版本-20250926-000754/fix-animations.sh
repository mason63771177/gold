#!/bin/bash

# 动画清理脚本
# 删除shimmer/pulse/持续闪烁动画，仅保留必要动效，统一时长与缓动

echo "开始清理动画效果..."

# 处理所有HTML文件
for file in *.html; do
    if [ -f "$file" ]; then
        echo "处理文件: $file"
        
        # 删除shimmer动画
        sed -i '' '/animation: shimmer/d' "$file"
        sed -i '' '/@keyframes shimmer/,/}/d' "$file"
        
        # 删除pulse-glow动画
        sed -i '' '/animation: pulse-glow/d' "$file"
        sed -i '' '/@keyframes pulse-glow/,/}/d' "$file"
        
        # 删除successPulse动画
        sed -i '' '/animation: successPulse/d' "$file"
        sed -i '' '/@keyframes successPulse/,/}/d' "$file"
        
        # 删除rainbow-pulse动画
        sed -i '' '/animation: rainbow-pulse/d' "$file"
        sed -i '' '/@keyframes rainbow-pulse/,/}/d' "$file"
        
        # 删除cyberpunk相关动画
        sed -i '' '/animation: cyberpunk-glow/d' "$file"
        sed -i '' '/animation: cyberpunk-logo/d' "$file"
        sed -i '' '/animation: cyberpunk-text/d' "$file"
        sed -i '' '/@keyframes cyberpunk-glow/,/}/d' "$file"
        sed -i '' '/@keyframes cyberpunk-logo/,/}/d' "$file"
        sed -i '' '/@keyframes cyberpunk-text/,/}/d' "$file"
        
        # 保留celebrate动画但统一时长为0.3s
        sed -i '' 's/animation: celebrate 0.6s ease-out/animation: celebrate 0.3s ease-out/g' "$file"
        
        # 统一动画时长和缓动函数
        sed -i '' 's/transition: all [0-9.]*s [^;]*/transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)/g' "$file"
        sed -i '' 's/transition: [^;]*ease[^;]*/transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)/g' "$file"
        
        echo "  ✓ 已清理 $file 的动画效果"
    fi
done

# 处理CSS文件
for file in css/*.css; do
    if [ -f "$file" ]; then
        echo "处理CSS文件: $file"
        
        # 删除glow-pulse动画
        sed -i '' '/animation: glow-pulse/d' "$file"
        sed -i '' '/@keyframes glow-pulse/,/}/d' "$file"
        
        # 统一动画时长和缓动函数
        sed -i '' 's/transition: all [0-9.]*s [^;]*/transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)/g' "$file"
        
        echo "  ✓ 已清理 $file 的动画效果"
    fi
done

echo ""
echo "动画清理完成！"
echo "保留的动画："
echo "  - celebrate: 0.3s ease-out (庆祝动画)"
echo "删除的动画："
echo "  - shimmer (闪烁效果)"
echo "  - pulse-glow (脉冲发光)"
echo "  - successPulse (成功脉冲)"
echo "  - rainbow-pulse (彩虹脉冲)"
echo "  - cyberpunk系列 (赛博朋克动画)"
echo "  - glow-pulse (发光脉冲)"
echo "统一规范："
echo "  - 动画时长: 0.3s"
echo "  - 缓动函数: cubic-bezier(0.4, 0, 0.2, 1)"