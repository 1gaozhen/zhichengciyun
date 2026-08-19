# -*- coding: utf-8 -*-
"""只重跑龙纹 + 冰裂两个用例，验证金色强化排除是否生效"""
import os, sys, json, time, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_generation import build_prompt, call_api, save_image, OUTPUT_DIR

CASES = [
    {"name": "青花龙纹开光_v2", "motif": "龙纹", "style": "青花瓷",
     "layout": "开光", "density": 55, "refName": "青花龙纹纹样", "seed": 20260820},
    {"name": "青花冰裂纹边饰_v2", "motif": "冰裂纹", "style": "青花瓷",
     "layout": "边饰", "density": 90, "refName": None, "seed": 20260822},
]

os.makedirs(OUTPUT_DIR, exist_ok=True)
print("=" * 80)
print("  龙纹金鳞强化 + 冰裂母题修复 · 第二轮验证")
print("=" * 80)

for i, case in enumerate(CASES, 1):
    print(f"\n--- 用例 {i}/2: {case['name']} ---")
    prompt, negative = build_prompt(case)
    print(f"prompt 长度: {len(prompt)} 字符")
    print(f"negative 长度: {len(negative)} 字符")
    if case['motif'] == '龙纹':
        gold_count = negative.count('gold')
        print(f"negative 中 gold 出现次数: {gold_count} (期望 >=10)")
        print(f"  gold scale 出现次数: {negative.count('gold scale')}")
    print(f"\n调用 API seed={case['seed']}...")
    t0 = time.time()
    result, cost = call_api(prompt, negative, case['seed'])
    print(f"  耗时: {cost:.1f}s")
    if 'error' in result or 'http_error' in result:
        print(f"  ❌ 失败: {result}")
        continue
    out_path = os.path.join(OUTPUT_DIR, f"{case['name']}_seed{case['seed']}.png")
    ok, info = save_image(result, out_path)
    print(f"  {'✅' if ok else '❌'} {info}")
    if ok: print(f"  路径: {out_path}")

print(f"\n{'='*80}")
print("  生成完成，运行 analyze_output.py 查看色彩分布")
print("="*80)
