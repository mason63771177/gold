#!/bin/bash

# 统一阴影效果脚本
# 仅保留两档阴影：轻阴影和重阴影，删除多层光晕/外发光

echo "开始统一阴影效果..."

# 定义两档阴影
LIGHT_SHADOW="0 2px 8px rgba(0, 0, 0, 0.1)"
HEAVY_SHADOW="0 4px 16px rgba(0, 0, 0, 0.15)"

# 修改所有HTML文件中的阴影效果
for file in *.html; do
    if [ -f "$file" ]; then
        echo "处理文件: $file"
        
        # 删除复杂的多层阴影，替换为轻阴影
        sed -i '' 's/box-shadow: 0 6px 20px rgba(0,0,0,0.35) inset, 0 12px 28px rgba(0,0,0,0.35)/box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)/g' "$file"
        sed -i '' 's/box-shadow:0 6px 20px rgba(0,0,0,0.35) inset, 0 12px 28px rgba(0,0,0,0.35)/box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)/g' "$file"
        sed -i '' 's/box-shadow: 0 6px 20px rgba(0,0,0,0.35) inset,0 12px 28px rgba(0,0,0,0.35)/box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)/g' "$file"
        
        # 删除按钮的复杂阴影，替换为重阴影
        sed -i '' 's/box-shadow: 0 8px 24px rgba(47,128,237,0.45), inset 0 1px 0 rgba(255,255,255,0.25)/box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15)/g' "$file"
        sed -i '' 's/box-shadow:0 8px 24px rgba(47,128,237,0.45), inset 0 1px 0 rgba(255,255,255,0.25)/box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15)/g' "$file"
        
        # 删除其他复杂阴影
        sed -i '' 's/box-shadow: 0 4px 12px rgba(47,128,237,0.5), inset 0 1px 1px rgba(255,255,255,0.3)/box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15)/g' "$file"
        sed -i '' 's/box-shadow: 0 8px 24px rgba(108,117,125,0.45), inset 0 1px 0 rgba(255,255,255,0.25)/box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15)/g' "$file"
        
        # 删除发光效果
        sed -i '' 's/box-shadow: 0 0 6px rgba(0,136,255,0.6)/box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)/g' "$file"
        sed -i '' 's/box-shadow: 0 0 6px rgba(0,227,174,0.6)/box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)/g' "$file"
        
        # 删除焦点状态的发光效果
        sed -i '' 's/box-shadow:0 0 0 2px rgba(86,204,242,0.5)/box-shadow: 0 0 0 2px rgba(86, 204, 242, 0.3)/g' "$file"
        sed -i '' 's/box-shadow: 0 0 0 2px rgba(86, 204, 242, 0.2)/box-shadow: 0 0 0 2px rgba(86, 204, 242, 0.3)/g' "$file"
        sed -i '' 's/box-shadow: 0 0 0 2px rgba(255, 93, 93, 0.2)/box-shadow: 0 0 0 2px rgba(255, 93, 93, 0.3)/g' "$file"
        
        # 统一其他阴影
        sed -i '' 's/box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3)/box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)/g' "$file"
        sed -i '' 's/box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4)/box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15)/g' "$file"
        sed -i '' 's/box-shadow:0 4px 16px rgba(86,204,242,0.3)/box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15)/g' "$file"
        sed -i '' 's/box-shadow:0 8px 32px rgba(0,0,0,0.3)/box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15)/g' "$file"
        sed -i '' 's/box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3)/box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15)/g' "$file"
        
        # 删除按钮激活状态的复杂阴影
        sed -i '' 's/box-shadow:0 2px 10px rgba(47,128,237,0.35), inset 0 2px 0 rgba(0,0,0,0.25)/box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)/g' "$file"
        
    fi
done

echo "阴影效果统一完成！"
echo "轻阴影: 0 2px 8px rgba(0, 0, 0, 0.1)"
echo "重阴影: 0 4px 16px rgba(0, 0, 0, 0.15)"
