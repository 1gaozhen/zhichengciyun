# -*- coding: utf-8 -*-
"""细化分析 test_output 4 张 PNG 的色彩分布（放宽青蓝阈值，拆分杂色）"""
import os
from PIL import Image

DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'test_output')

def classify(r, g, b):
    # 白色（瓷胎）
    if r >= 225 and g >= 225 and b >= 225:
        return 'white'
    # 青蓝系（含淡青、青灰、深蓝，主色范围放宽）
    if b >= r and b >= g and b > 60:
        return 'blue_cyan'
    # 金/黄/棕/赭（破色关键1）
    if r > g + 25 and r > b + 40:
        return 'gold_yellow'
    # 红/橙（破色关键2）
    if r > 150 and g < r - 30 and b < r - 60:
        return 'red_orange'
    # 深黑（线稿墨色，青花也用）
    if max(r, g, b) < 50:
        return 'dark_line'
    # 浅灰中性
    if abs(r - g) < 15 and abs(g - b) < 15 and 50 <= max(r, g, b) < 225:
        return 'gray_neutral'
    return 'other'

def analyze(path):
    im = Image.open(path).convert('RGB')
    w, h = im.size
    total = 0
    counts = {'white': 0, 'blue_cyan': 0, 'gold_yellow': 0, 'red_orange': 0, 'dark_line': 0, 'gray_neutral': 0, 'other': 0}
    for y in range(0, h, 6):
        for x in range(0, w, 6):
            r, g, b = im.getpixel((x, y))
            counts[classify(r, g, b)] += 1
            total += 1
    return w, h, {k: round(v / total * 100, 1) for k, v in counts.items()}

print('=' * 110)
print(f'{"文件":<46}{"白":>6}{"青蓝":>7}{"金棕":>7}{"红橙":>7}{"墨线":>7}{"灰":>7}{"其他":>7}  {"青花对版":<8}')
print('=' * 110)
files = sorted(f for f in os.listdir(DIR) if f.endswith('.png'))
all_pass = True
rows = []
for fn in files:
    path = os.path.join(DIR, fn)
    w, h, c = analyze(path)
    main_color = c['white'] + c['blue_cyan'] + c['dark_line']
    break_color = c['gold_yellow'] + c['red_orange']
    pass_qh = main_color >= 85 and break_color < 5 and c['other'] < 10
    if not pass_qh: all_pass = False
    rows.append((fn, c, main_color, break_color, pass_qh))
    print(f'{fn[:46]:<46}{c["white"]:>6}{c["blue_cyan"]:>7}{c["gold_yellow"]:>7}{c["red_orange"]:>7}{c["dark_line"]:>7}{c["gray_neutral"]:>7}{c["other"]:>7}  {"YES" if pass_qh else "NO":<8}')
print('=' * 110)
print('评判标准（青花瓷对版）:')
print('  ✅ 主色(白+青蓝+墨线) >= 85% AND 破色(金棕+红橙) < 5% AND 其他 < 10%')
print(f'\n汇总: {"全部对版 ✅" if all_pass else "存在不对版项 ❌"}')

# 对比第一轮 vs 第二轮（v2）
print('\n' + '=' * 80)
print('  龙纹 + 冰裂 第二轮 vs 第一轮 对比')
print('=' * 80)
pairs = [
    ('02_青花龙纹开光适中_seed20260820.png', '青花龙纹开光_v2_seed20260820.png', '龙纹'),
    ('04_青花冰裂纹边饰满工_seed20260822.png', '青花冰裂纹边饰_v2_seed20260822.png', '冰裂'),
]
for f1, f2, label in pairs:
    p1 = os.path.join(DIR, f1); p2 = os.path.join(DIR, f2)
    if not (os.path.exists(p1) and os.path.exists(p2)): continue
    _, _, c1 = analyze(p1)
    _, _, c2 = analyze(p2)
    bc1 = c1['gold_yellow'] + c1['red_orange']
    bc2 = c2['gold_yellow'] + c2['red_orange']
    mc1 = c1['white'] + c1['blue_cyan'] + c1['dark_line']
    mc2 = c2['white'] + c2['blue_cyan'] + c2['dark_line']
    print(f'\n  [{label}]')
    print(f'    第一轮: 主色 {mc1:.1f}%  破色 {bc1:.1f}%  (金棕 {c1["gold_yellow"]}% + 红橙 {c1["red_orange"]}%)')
    print(f'    第二轮: 主色 {mc2:.1f}%  破色 {bc2:.1f}%  (金棕 {c2["gold_yellow"]}% + 红橙 {c2["red_orange"]}%)')
    delta = bc2 - bc1
    if delta < 0:
        print(f'    ✅ 破色下降 {abs(delta):.1f} 个百分点（金色排除强化生效）')
    elif delta > 0:
        print(f'    ⚠️ 破色上升 {delta:.1f} 个百分点（需进一步排查）')
    else:
        print(f'    ➡️ 破色无变化')

