#!/bin/bash

# 字阶统一脚本
# 将所有字体大小统一为 H1(24px)/H2(18px)/Body(14px)/Caption(12px) 四档

echo "开始统一字阶规范..."

# 处理所有HTML文件
for file in *.html; do
    if [ -f "$file" ]; then
        echo "处理文件: $file"
        
        # 备份原文件
        cp "$file" "备份/${file%.html}-$(date +%Y%m%d_%H%M%S).html"
        
        # 统一字体大小
        # 将各种大字体统一为 H1 (24px)
        sed -i '' 's/font-size: 32px/font-size: 24px/g' "$file"
        sed -i '' 's/font-size: 28px/font-size: 24px/g' "$file"
        sed -i '' 's/font-size: 26px/font-size: 24px/g' "$file"
        
        # 将中等字体统一为 H2 (18px)
        sed -i '' 's/font-size: 20px/font-size: 18px/g' "$file"
        sed -i '' 's/font-size: 19px/font-size: 18px/g' "$file"
        sed -i '' 's/font-size: 17px/font-size: 18px/g' "$file"
        
        # 将正文字体统一为 Body (14px)
        sed -i '' 's/font-size: 16px/font-size: 14px/g' "$file"
        sed -i '' 's/font-size: 15px/font-size: 14px/g' "$file"
        sed -i '' 's/font-size: 13px/font-size: 14px/g' "$file"
        
        # 将小字体统一为 Caption (12px)
        sed -i '' 's/font-size: 11px/font-size: 12px/g' "$file"
        sed -i '' 's/font-size: 10px/font-size: 12px/g' "$file"
        
        # 添加设计系统CSS引用（如果不存在）
        if ! grep -q "design-system.css" "$file"; then
            # 在head标签中添加设计系统CSS
            sed -i '' '/<\/head>/i\
    <link rel="stylesheet" href="css/design-system.css">
' "$file"
        fi
        
        # 为金额相关元素添加等宽字体类
        sed -i '' 's/<span class="balance"/<span class="balance text-amount"/g' "$file"
        sed -i '' 's/<div class="balance"/<div class="balance text-amount"/g' "$file"
        sed -i '' 's/<span class="amount"/<span class="amount text-amount"/g' "$file"
        sed -i '' 's/<div class="amount"/<div class="amount text-amount"/g' "$file"
        sed -i '' 's/<span class="price"/<span class="price text-amount"/g' "$file"
        sed -i '' 's/<div class="price"/<div class="price text-amount"/g' "$file"
        
        # 为倒计时元素添加等宽字体类
        sed -i '' 's/<span id="countdown"/<span id="countdown" class="text-countdown"/g' "$file"
        sed -i '' 's/<div id="countdown"/<div id="countdown" class="text-countdown"/g' "$file"
        sed -i '' 's/<span class="countdown"/<span class="countdown text-countdown"/g' "$file"
        sed -i '' 's/<div class="countdown"/<div class="countdown text-countdown"/g' "$file"
        
        # 为标题添加语义化类
        sed -i '' 's/<h1[^>]*>/<h1 class="text-h1">/g' "$file"
        sed -i '' 's/<h2[^>]*>/<h2 class="text-h2">/g' "$file"
        
        echo "  ✓ 已统一 $file 的字阶"
    fi
done

echo ""
echo "字阶统一完成！"
echo "统一规范："
echo "  H1: 24px (主标题)"
echo "  H2: 18px (副标题)"  
echo "  Body: 14px (正文)"
echo "  Caption: 12px (说明文字)"
echo "  金额/倒计时: 等宽数字字体"