#!/bin/bash

# 最终检查脚本
# 验证所有页面样式统一性，确保设计系统完整性

echo "开始最终检查..."
echo ""

# 检查设计系统CSS是否被所有页面引用
echo "1. 检查设计系统CSS引用情况："
missing_files=()
for file in *.html; do
    if [ -f "$file" ]; then
        if ! grep -q "design-system.css" "$file"; then
            missing_files+=("$file")
        fi
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "  ✓ 所有HTML文件都已引用设计系统CSS"
else
    echo "  ⚠ 以下文件缺少设计系统CSS引用："
    for file in "${missing_files[@]}"; do
        echo "    - $file"
    done
fi

echo ""

# 检查是否还有内联样式
echo "2. 检查剩余内联样式："
inline_count=0
for file in *.html; do
    if [ -f "$file" ]; then
        count=$(grep -c 'style="' "$file" 2>/dev/null || echo 0)
        if [ $count -gt 0 ]; then
            echo "  ⚠ $file 还有 $count 个内联样式"
            inline_count=$((inline_count + count))
        fi
    fi
done

if [ $inline_count -eq 0 ]; then
    echo "  ✓ 所有内联样式已清理完成"
else
    echo "  ⚠ 总共还有 $inline_count 个内联样式需要处理"
fi

echo ""

# 检查!important使用情况
echo "3. 检查!important使用情况："
important_count=0
for file in *.html; do
    if [ -f "$file" ]; then
        count=$(grep -c '!important' "$file" 2>/dev/null || echo 0)
        if [ $count -gt 0 ]; then
            echo "  ⚠ $file 还有 $count 个!important声明"
            important_count=$((important_count + count))
        fi
    fi
done

if [ $important_count -eq 0 ]; then
    echo "  ✓ HTML文件中的!important已清理完成"
else
    echo "  ⚠ HTML文件中总共还有 $important_count 个!important声明"
fi

echo ""

# 检查字体大小统一性
echo "4. 检查字体大小统一性："
old_sizes=("10px" "11px" "13px" "15px" "16px" "20px" "32px")
found_old_sizes=false

for size in "${old_sizes[@]}"; do
    count=$(grep -r "font-size:\s*$size\|font-size:\s*$size;" *.html 2>/dev/null | wc -l)
    if [ $count -gt 0 ]; then
        echo "  ⚠ 发现 $count 处使用旧字体大小 $size"
        found_old_sizes=true
    fi
done

if [ "$found_old_sizes" = false ]; then
    echo "  ✓ 字体大小已统一为设计系统规范"
fi

echo ""

# 检查圆角统一性
echo "5. 检查圆角统一性："
old_radius=("6px" "8px" "12px" "18px" "20px" "25px")
found_old_radius=false

for radius in "${old_radius[@]}"; do
    count=$(grep -r "border-radius.*$radius" *.html 2>/dev/null | wc -l)
    if [ $count -gt 0 ]; then
        echo "  ⚠ 发现 $count 处使用旧圆角规格 $radius"
        found_old_radius=true
    fi
done

if [ "$found_old_radius" = false ]; then
    echo "  ✓ 圆角规格已统一（按钮14px、卡片16px、弹层24px）"
fi

echo ""

# 检查阴影统一性
echo "6. 检查阴影统一性："
complex_shadows=$(grep -r "box-shadow.*," *.html 2>/dev/null | grep -v "0 2px 8px\|0 4px 16px" | wc -l)
if [ $complex_shadows -eq 0 ]; then
    echo "  ✓ 阴影已统一为两档规格"
else
    echo "  ⚠ 发现 $complex_shadows 处复杂阴影需要处理"
fi

echo ""

# 检查动画清理情况
echo "7. 检查动画清理情况："
bad_animations=("shimmer" "pulse-glow" "successPulse" "rainbow-pulse" "cyberpunk" "glow-pulse")
found_bad_animations=false

for animation in "${bad_animations[@]}"; do
    count=$(grep -r "$animation" *.html css/*.css 2>/dev/null | wc -l)
    if [ $count -gt 0 ]; then
        echo "  ⚠ 发现 $count 处使用已删除的动画 $animation"
        found_bad_animations=true
    fi
done

if [ "$found_bad_animations" = false ]; then
    echo "  ✓ 不良动画已清理完成"
fi

echo ""

# 生成检查报告
echo "=========================================="
echo "最终检查报告"
echo "=========================================="

total_issues=0

if [ ${#missing_files[@]} -gt 0 ]; then
    total_issues=$((total_issues + 1))
fi

if [ $inline_count -gt 0 ]; then
    total_issues=$((total_issues + 1))
fi

if [ $important_count -gt 0 ]; then
    total_issues=$((total_issues + 1))
fi

if [ "$found_old_sizes" = true ]; then
    total_issues=$((total_issues + 1))
fi

if [ "$found_old_radius" = true ]; then
    total_issues=$((total_issues + 1))
fi

if [ $complex_shadows -gt 0 ]; then
    total_issues=$((total_issues + 1))
fi

if [ "$found_bad_animations" = true ]; then
    total_issues=$((total_issues + 1))
fi

if [ $total_issues -eq 0 ]; then
    echo "🎉 所有检查项目都已通过！"
    echo "设计系统优化完成，样式统一性良好。"
else
    echo "⚠️  发现 $total_issues 个问题需要处理"
    echo "请根据上述检查结果进行相应修复。"
fi

echo ""
echo "设计系统规范总结："
echo "- 圆角：按钮14px、卡片16px、弹层24px"
echo "- 阴影：轻阴影(0 2px 8px)、重阴影(0 4px 16px)"
echo "- 字阶：H1(24px)、H2(18px)、Body(14px)、Caption(12px)"
echo "- 动效：统一0.3s时长，cubic-bezier(0.4, 0, 0.2, 1)缓动"
echo "- 组件：去内联化，统一CSS类，移除!important"