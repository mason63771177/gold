#!/bin/bash

# 内联样式清理脚本
# 组件去内联化，收敛到统一类，移除!important，减少内联style

echo "开始清理内联样式..."

# 处理所有HTML文件
for file in *.html; do
    if [ -f "$file" ]; then
        echo "处理文件: $file"
        
        # 移除!important声明（保留设计系统CSS中的必要!important）
        if [ "$file" != "css/design-system.css" ]; then
            sed -i '' 's/ !important//g' "$file"
        fi
        
        # 替换常见的内联样式为CSS类
        # 隐藏元素
        sed -i '' 's/style="display: none;"/class="hidden"/g' "$file"
        sed -i '' 's/style="display:none;"/class="hidden"/g' "$file"
        
        # 文本居中
        sed -i '' 's/style="text-align:center;[^"]*"/class="text-center"/g' "$file"
        sed -i '' 's/style="text-align: center;[^"]*"/class="text-center"/g' "$file"
        
        # 颜色相关
        sed -i '' 's/style="color:var(--muted)[^"]*"/class="text-muted"/g' "$file"
        sed -i '' 's/style="color: var(--muted)[^"]*"/class="text-muted"/g' "$file"
        sed -i '' 's/style="color:#666[^"]*"/class="text-muted"/g' "$file"
        sed -i '' 's/style="color: #666[^"]*"/class="text-muted"/g' "$file"
        
        # 字体大小
        sed -i '' 's/style="font-size:14px[^"]*"/class="text-body"/g' "$file"
        sed -i '' 's/style="font-size: 14px[^"]*"/class="text-body"/g' "$file"
        sed -i '' 's/style="font-size:12px[^"]*"/class="text-caption"/g' "$file"
        sed -i '' 's/style="font-size: 12px[^"]*"/class="text-caption"/g' "$file"
        
        # 边距
        sed -i '' 's/style="margin-bottom: 16px[^"]*"/class="mb-md"/g' "$file"
        sed -i '' 's/style="margin-bottom:16px[^"]*"/class="mb-md"/g' "$file"
        sed -i '' 's/style="margin-bottom: 12px[^"]*"/class="mb-sm"/g' "$file"
        sed -i '' 's/style="margin-bottom:12px[^"]*"/class="mb-sm"/g' "$file"
        
        # Flex布局
        sed -i '' 's/style="display: flex[^"]*"/class="flex"/g' "$file"
        sed -i '' 's/style="display:flex[^"]*"/class="flex"/g' "$file"
        
        echo "  ✓ 已清理 $file 的内联样式"
    fi
done

# 添加新的CSS类到设计系统
cat >> css/design-system.css << 'EOF'

/* 工具类 - 补充 */
.hidden {
  display: none !important;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: var(--color-neutral-500);
}

.mb-xs {
  margin-bottom: 4px;
}

.mb-sm {
  margin-bottom: 8px;
}

.mb-md {
  margin-bottom: 16px;
}

.mb-lg {
  margin-bottom: 24px;
}

.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flex-column {
  flex-direction: column;
}

/* 按钮状态类 */
.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: white;
  border: none;
}

.btn-success {
  background: linear-gradient(135deg, var(--color-success), #1e7e34);
  color: white;
  border: none;
}

/* 卡片类 */
.card-section {
  background: var(--bg-card);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-card);
  padding: 16px;
  margin-bottom: 8px;
}

/* 错误消息类 */
.error-message {
  color: var(--color-error);
  font-size: var(--font-caption);
  margin-top: 4px;
}
EOF

echo ""
echo "内联样式清理完成！"
echo "清理内容："
echo "  - 移除!important声明"
echo "  - 转换常见内联样式为CSS类"
echo "  - 添加工具类到设计系统"
echo "新增CSS类："
echo "  - .hidden (隐藏元素)"
echo "  - .text-center (文本居中)"
echo "  - .text-muted (静音文本)"
echo "  - .mb-* (边距类)"
echo "  - .flex-* (布局类)"
echo "  - .btn-* (按钮状态类)"
echo "  - .card-section (卡片类)"