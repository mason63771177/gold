#!/bin/bash

# 批量修改圆角规格的脚本
# 按钮14、卡片16、弹层24，去除零散规格

echo "开始统一圆角规格..."

# 修改所有HTML文件中的圆角规格
for file in *.html; do
    if [ -f "$file" ]; then
        echo "处理文件: $file"
        
        # 统一按钮圆角为14px
        sed -i '' 's/border-radius: 6px/border-radius: 14px/g' "$file"
        sed -i '' 's/border-radius: 8px/border-radius: 14px/g' "$file"
        sed -i '' 's/border-radius: 12px/border-radius: 14px/g' "$file"
        sed -i '' 's/border-radius:6px/border-radius:14px/g' "$file"
        sed -i '' 's/border-radius:8px/border-radius:14px/g' "$file"
        sed -i '' 's/border-radius:12px/border-radius:14px/g' "$file"
        
        # 统一卡片圆角为16px
        sed -i '' 's/border-radius: 18px/border-radius: 16px/g' "$file"
        sed -i '' 's/border-radius: 20px/border-radius: 16px/g' "$file"
        sed -i '' 's/border-radius:18px/border-radius:16px/g' "$file"
        sed -i '' 's/border-radius:20px/border-radius:16px/g' "$file"
        
        # 统一弹层圆角为24px（保持24px不变）
        # 这里不需要修改，因为24px已经是目标值
        
        # 修改特殊的圆角值
        sed -i '' 's/border-radius: 25px/border-radius: 14px/g' "$file"
        sed -i '' 's/border-radius:25px/border-radius:14px/g' "$file"
        
        # 修改tab按钮的圆角
        sed -i '' 's/border-radius: 14px/border-radius: 14px/g' "$file"
        
    fi
done

echo "圆角规格统一完成！"
echo "按钮: 14px"
echo "卡片: 16px" 
echo "弹层: 24px"
