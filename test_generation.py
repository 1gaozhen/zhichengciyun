# -*- coding: utf-8 -*-
"""
智承瓷韵 · 青花瓷生图修复验证测试脚本
用法：
  1. 先启动后端服务（start.bat 或 python server.py），确保 http://localhost:8123 可访问
  2. 运行：python test_generation.py
  3. 结果：prompt 文本打印到控制台 + 生成图片保存为 test_output/*.png
"""
import os
import sys
import json
import time
import urllib.request
import urllib.error

# ====== 测试用例配置（青花瓷风格，固定 seed 便于对比修复前后差异） ======
TEST_CASES = [
    {
        "name": "青花缠枝莲满地繁密",
        "motif": "缠枝莲",
        "style": "青花瓷",
        "layout": "满地",
        "density": 85,
        "refName": "青花繁复缠枝花纹",  # 纹样库参考
        "seed": 20260819,              # 固定 seed，可对比修复前后
    },
    {
        "name": "青花龙纹开光适中",
        "motif": "龙纹",
        "style": "青花瓷",
        "layout": "开光",
        "density": 55,
        "refName": "青花龙纹纹样",
        "seed": 20260820,
    },
    {
        "name": "青花山水散点疏朗",
        "motif": "山水",
        "style": "青花瓷",
        "layout": "散点",
        "density": 35,
        "refName": None,
        "seed": 20260821,
    },
    {
        "name": "青花冰裂纹边饰满工",
        "motif": "冰裂纹",
        "style": "青花瓷",
        "layout": "边饰",
        "density": 90,
        "refName": None,
        "seed": 20260822,
    },
]

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_output")
API_URL = "http://localhost:8123/api/generate"

# ====== 与前端 buildPrompt 对齐的 prompt 构造逻辑（Python 版） ======
MOTIF_ELEMENTS = {
    '缠枝莲': '主纹为缠枝牡丹或缠枝莲，含饱满花头、舒展花瓣、绵延卷曲藤蔓、对称枝叶、忍冬卷草，纹样从画布四角边缘起笔，四个角落均被纹样元素填满，中央不空',
    '牡丹': '主纹为大朵写生牡丹，含层叠花瓣、花蕊、舒展枝叶、含苞花蕾，纹样从画布四角边缘起笔，四个角落均被纹样元素填满，中央不空',
    '如意云': '如意云头纹，含三连云、四连云、灵芝形云朵、对称分布，纹样从画布四角边缘起笔，四个角落均被云朵填满，中央不空',
    '梅枝': '折枝梅花，含老干虬枝、五瓣花朵、含苞花蕾、零星点叶，纹样从画布四角边缘起笔，四个角落均被梅花枝叶填满，中央不空',
    '菊花': '团菊或折枝菊，含多层菊瓣、花心、舒展菊叶，纹样从画布四角边缘起笔，四个角落均被菊花填满，中央不空',
    '山水': '青花山水小品单元，含远山近水、亭台楼阁、点景人物、波纹水脚，画面被8到12个独立相似的山水小品均匀排列如邮票拼贴，间距约20%画面宽度',
    '海水江崖': '海水江崖纹，含层叠波涛、对称江崖、寿山福海，纹样从画布四角边缘起笔，四个角落均被波涛江崖填满，中央不空',
    '葡萄': '折枝葡萄，含藤蔓卷须、累累果实、葡萄叶，纹样从画布四角边缘起笔，四个角落均被葡萄藤蔓填满，中央不空',
    '寿桃': '折枝桃枝，含饱满寿桃、桃叶、吉祥寓意，纹样从画布四角边缘起笔，四个角落均被寿桃枝叶填满，中央不空',
    '葫芦': '折枝葫芦，含藤蔓、葫芦果实、卷草，纹样从画布四角边缘起笔，四个角落均被葫芦藤蔓填满，中央不空',
    '蝙蝠': '五蝠捧寿，含对称展翅蝙蝠、祥云、寿字，纹样从画布四角边缘起笔，四个角落均被蝙蝠祥云填满，中央不空',
    '龙纹': '云龙纹或海水龙，含五爪龙身、龙鳞、龙发、火珠、祥云，龙身为青蓝色单色绘制，龙嘴龙眼均为青蓝色，龙鳞为青蓝色不含任何金色，火珠为青蓝色不含金色，绝不出现金色鳞片金色边金色火珠红色棕色，无金边无金鳞无金火珠',
    '凤纹': '凤凰牡丹，含展翅凤鸟、长尾翎羽、牡丹花头、祥云，纹样从画布四角边缘起笔，四个角落均被凤凰牡丹填满，中央不空',
    '麒麟': '麒麟瑞兽，含鳞甲、鬃毛、火焰纹、祥云、海水，纹样从画布四角边缘起笔，四个角落均被麒麟祥云填满，中央不空',
    '婴戏': '婴戏图，含圆脸孩童、戏耍姿态、庭园景致，纹样从画布四角边缘起笔，四个角落均被孩童庭园填满，中央不空',
    '吉语字': '缠枝围绕福寿喜字，含吉祥文字、缠枝卷草、八宝，纹样从画布四角边缘起笔，四个角落均被缠枝文字填满，中央不空',
    '回纹': '回纹边饰，含连续几何回字、对称转折，纹样从画布四角边缘起笔，四个角落均被回纹填满，中央不空',
    '冰裂纹': '纯冰裂开片纹，仅有不规则自然裂纹、网格细分、细碎开片纹路；绝对不含梅花、不含花卉、不含任何树木枝干、不含植物、不含器物；整张画面只布满细碎的裂纹网格，无任何具象母题',
}

STYLE_DESC = {
    '青花瓷': '中国传统青花瓷风格，白瓷胎体上以钴蓝料绘纹样，仅青蓝色与白色二色，青料浓淡有致，苏麻离青发色沉稳',
    '粉彩': '中国清代粉彩瓷风格，玻璃白打底上施柔和彩料，色彩柔和不刺眼，含粉红、嫩绿、鹅黄、淡蓝、矾红等色，温润雅致',
    '釉下五彩': '湖南醴陵釉下五彩瓷风格，釉下多彩绘画，色彩鲜艳明亮通透，含红、绿、黄、蓝、紫多色釉下彩，层次清晰',
    '现代简约': '现代国潮简约陶瓷风格，简化几何线条，少量主色，留白多，扁平化设计，融入当代美学',
}

LAYOUT_DESC = {
    '满地': '满地铺满构图，纹样从画布四角边缘起笔，四个角落均被纹样元素填满，纹样均匀布满整个画面从上到下从左到右，中央不空，无大面积留白',
    '开光': '开光构图，画面中央有一个圆形或扇形开光框，框内绘制主纹作为视觉中心，框外区域填满缠枝辅助纹样不留白',
    '散点': '散点构图，画面被8到12个独立相似的纹样小品均匀排列如邮票拼贴，每个小品间距约20%画面宽度，整体均匀覆盖',
    '边饰': '边饰构图，画面四周15%宽度的环形区域绘制密集主纹环绕一周，中央70%区域填充辅助散点纹样，整体不留白',
}


def build_prompt(case):
    """与前端 buildPrompt 完全等价的 Python 实现，便于离线审查 prompt 文本"""
    s = case
    density_desc = (
        '繁密满工，纹样均匀铺满不留白' if s['density'] > 70
        else ('疏朗留白，纹样间留出大量空白' if s['density'] < 40
              else '疏密适中，纹样间有适度呼吸')
    )
    style_desc = STYLE_DESC.get(s['style'], '中国传统陶瓷')
    layout_desc = LAYOUT_DESC.get(s['layout'], '满地铺满')
    motif_element = MOTIF_ELEMENTS.get(s['motif'], '传统纹样元素')
    ref_clause = f'参考传统纹样「{s["refName"]}」的经典构图与母题特征，' if s.get('refName') else ''
    pref_boost = ''  # 本次测试不注入历史偏好
    color_constraint = (
        '仅青蓝单色与白色，绝不出现其他颜色，绝不出现金色银色铜色赭色' if s['style'] == '青花瓷'
        else ('少量主色简洁线条' if s['style'] == '现代简约'
              else '可多色饱和渲染')
    )
    prompt = (
        f'中国传统陶瓷纹样平面展开图，{style_desc}，{ref_clause}以「{s["motif"]}」为母题，'
        f'{motif_element}，{layout_desc}，{density_desc}{pref_boost}，{color_constraint}，'
        f'纹样铺满整个方形画布从边缘到边缘均匀分布，左右边缘可无缝对接平铺，'
        f'纯平面2D纹样图案本身，无透视无阴影无立体感，高清矢量线稿质感，非遗传统工艺，对称均衡构图。'
        f'本图永远只画纹样图案本身，永远不含任何陶瓷器造型轮廓，永远不画花瓶碗盘罐壶陶瓷物件，永远不出现器物器型的剪影或边框'
    )
    # 动态 negative prompt（与前端完全对齐）
    neg = (
        'photograph, 3d render, perspective, shadow, blurry, low quality, watermark, text, logo, messy, distorted, '
        'asymmetric, overlapping elements, blank margins, empty space, '
        # 器物词重复3次（B 项）
        'vessel, vase, bottle, pot, jar, bowl, plate, cup, ceramic object, 3d object, product photo, '
        'vessel, vase, bottle, pot, jar, bowl, plate, cup, ceramic, '
        'vessel, vase, bottle, pot, jar, bowl, plate, cup, '
        # A 项：金色/赭色/木框等破色词
        'gold, golden, silver, copper, brass, bronze, ocher, ochre, tan, yellowish-brown, reddish-brown, '
        'wooden frame, wooden frame, picture frame, photo frame, ornate frame, '
        'red eye, red mouth, red tongue, colored eyes, golden scales, golden edge, gilded, gilt'
    )
    if s['style'] == '青花瓷':
        neg += (
            ', color, colored, red, green, yellow, pink, purple, orange, brown, multicolor, gradient, grayscale, '
            'gold, golden, yellow-gold, amber, caramel, honey, cream, beige, ivory, '
            'red mouth, red eye, red tongue, gold edge, gold rim, gold border, gold accent, '
            'wooden border, brown border, dark border, aged border, antique frame'
        )
    elif s['style'] == '现代简约':
        neg += ', cluttered, overly complex, traditional dense pattern, ornate, gold, golden, silver, gilded, ornate frame, decorative border'
    else:
        neg += ', black and white line drawing only, monochrome blue only, no color, gold, golden, gilded, wooden frame, dark border'
    if s['motif'] == '冰裂纹':
        # C 项：冰裂主题排除花卉树木植物
        neg += (
            ', plum blossom, plum flower, flower, floral, blossom, petal, '
            'tree, tree branch, branch, twig, plant, leaves, foliage, '
            '梅花, 花朵, 树枝, 植物, '
            'vase, ceramic vessel, porcelain, pot, jar'
        )
    elif s['motif'] == '龙纹':
        # 龙纹特殊：gold 重复 5 次（与前端一致）
        neg += (
            ', crackle, ice crackle, broken lines, ice pattern, '
            'gold, golden, gold scale, gold rim, gold edge, gold border, gold accent, gold tooth, gold claw, gold horn, gold eye, gold pearl, gold flame, gold cloud, '
            'gold, golden, gold scale, gold rim, gold edge, gold border, gold accent, gold tooth, gold claw, gold horn, gold eye, gold pearl, gold flame, gold cloud, '
            'gold, golden, gold scale, gold rim, gold edge, gold border, gold accent, gold tooth, gold claw, gold horn, gold eye, gold pearl, gold flame, gold cloud, '
            'gold, golden, gold scale, gold rim, gold edge, gold border, gold accent, gold tooth, gold claw, gold horn, gold eye, gold pearl, gold flame, gold cloud, '
            'gold, golden, gold scale, gold rim, gold edge, gold border, gold accent, gold tooth, gold claw, gold horn, gold eye, gold pearl, gold flame, gold cloud, '
            'yellow scale, yellow rim, yellow border, yellow pearl, yellow flame, '
            'amber scale, caramel scale, bronze scale, copper scale, brass scale'
        )
    else:
        neg += ', crackle, ice crackle, broken lines, ice pattern'
    if s['motif'] != '山水':
        neg += ', realistic landscape, portrait, scene, figure, human face'
    return prompt, neg


def call_api(prompt, negative, seed, image_size='1024x1024', model='Kwai-Kolors/Kolors', timeout=120):
    payload = {
        "model": model,
        "prompt": prompt,
        "negative_prompt": negative,
        "image_size": image_size,
        "seed": int(seed),
    }
    body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
    req = urllib.request.Request(
        API_URL,
        data=body,
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read()
            cost = time.time() - t0
            return json.loads(raw.decode('utf-8', errors='ignore')), cost
    except urllib.error.HTTPError as e:
        return {"http_error": e.code, "detail": e.read().decode('utf-8', errors='ignore')}, time.time() - t0
    except Exception as e:
        return {"error": str(type(e).__name__), "detail": str(e)}, time.time() - t0


def save_image(data, out_path):
    """返回 (success, info)"""
    if not data.get('images') or not data['images']:
        return False, f"API 返回无 images 字段: {data}"
    img = data['images'][0]
    # 两种情况：URL 或 base64
    url = img.get('url') or ''
    b64 = img.get('b64_json') or ''
    try:
        if url.startswith('http'):
            # 用后端 /api/image 代理下载（避免跨域/防盗链），若失败直连
            proxy = f"http://localhost:8123/api/image?url={urllib.parse.quote(url)}"
            try:
                with urllib.request.urlopen(proxy, timeout=60) as r:
                    blob = r.read()
            except Exception:
                with urllib.request.urlopen(url, timeout=60) as r:
                    blob = r.read()
            with open(out_path, 'wb') as f:
                f.write(blob)
            return True, f"URL 图片已保存 ({len(blob)} bytes)"
        elif b64:
            import base64
            if ',' in b64:
                b64 = b64.split(',', 1)[1]
            blob = base64.b64decode(b64)
            with open(out_path, 'wb') as f:
                f.write(blob)
            return True, f"Base64 图片已保存 ({len(blob)} bytes)"
        else:
            # 兜底：images[0] 本身就是 base64 字符串（无封装）
            import base64 as _b64
            blob = _b64.b64decode(url or str(img))
            with open(out_path, 'wb') as f:
                f.write(blob)
            return True, f"兜底 base64 解码已保存 ({len(blob)} bytes)"
    except Exception as e:
        return False, f"图片保存失败: {type(e).__name__}: {e}"


def run_one(idx, case):
    sep = '=' * 70
    print(f"\n{sep}")
    print(f"  用例 {idx}/{len(TEST_CASES)}: {case['name']}")
    print(f"  motif={case['motif']}  style={case['style']}  layout={case['layout']}  "
          f"density={case['density']}  seed={case['seed']}  refName={case.get('refName')}")
    print(sep)
    prompt, negative = build_prompt(case)
    print("【PROMPT】\n" + prompt + "\n")
    print("【NEGATIVE PROMPT】\n" + negative + "\n")
    # 关键校验点（青花瓷风格必须满足的约束）
    checks = []
    if case['style'] == '青花瓷':
        checks.append(('青花瓷 prompt 含「仅青蓝单色与白色」', '仅青蓝单色与白色' in prompt))
        checks.append(('青花瓷 prompt 含「绝不出现金色银色铜色赭色」', '绝不出现金色银色铜色赭色' in prompt))
        checks.append(('negative 排除红色', 'red,' in negative))
        checks.append(('negative 排除彩色', 'multicolor' in negative))
        # A 项：金色赭色木框破色词
        checks.append(('negative 含 gold/golden', 'gold' in negative and 'golden' in negative))
        checks.append(('negative 含 ocher/ochre 赭色', 'ocher' in negative or 'ochre' in negative))
        checks.append(('negative 含 wooden frame 木框', 'wooden frame' in negative))
        checks.append(('negative 含 gilded/gilt 镀金', 'gilded' in negative or 'gilt' in negative))
    if case['motif'] == '冰裂纹':
        checks.append(('冰裂主题 negative 不含 crackle（不能排除自己）', 'crackle' not in negative))
        # C 项：冰裂主题排除花卉树木
        checks.append(('冰裂主题 negative 排除 plum blossom 梅花', 'plum blossom' in negative))
        checks.append(('冰裂主题 negative 排除 flower', 'flower' in negative))
        checks.append(('冰裂主题 negative 排除 tree branch 树枝', 'tree branch' in negative or 'tree,' in negative))
        checks.append(('冰裂主题 prompt 明确「不含梅花不含花卉」', '不含梅花' in prompt and '不含花卉' in prompt))
    else:
        checks.append(('非冰裂主题 negative 含 crackle', 'crackle,' in negative or 'crackle' in negative))
    # B 项：器物词重复3次
    checks.append(('negative 中 vase 出现 >=3 次', negative.count('vase') >= 3))
    checks.append(('negative 中 jar 出现 >=3 次', negative.count('jar') >= 3))
    checks.append(('prompt 末尾含「永远不画花瓶碗盘罐壶」断言', '永远不画花瓶碗盘罐壶陶瓷物件' in prompt))
    # D 项：布局具体视觉描述
    if case['layout'] == '满地':
        checks.append(('满地布局含「四角边缘起笔，四个角落均被填满」', '四个角落' in prompt and '边缘起笔' in prompt))
    elif case['layout'] == '开光':
        checks.append(('开光布局含「圆形或扇形开光框」', '圆形或扇形开光框' in prompt))
    elif case['layout'] == '散点':
        checks.append(('散点布局含「8到12个独立相似小品邮票拼贴」', '8到12个' in prompt and '邮票拼贴' in prompt))
    elif case['layout'] == '边饰':
        checks.append(('边饰布局含「四周15%宽度环形区域」', '15%' in prompt and '环形区域' in prompt))
    checks.append(('negative 排除器物 vase', 'vase' in negative))
    checks.append(('prompt 强调「不画器物器型」', '绝对不画任何器物器型' in prompt or '永远不画花瓶碗盘罐壶' in prompt))
    checks.append(('prompt 不再含 seedXXX 文本后缀', 'seed' not in prompt[-20:].lower() and 'seed' not in prompt.lower()))
    print("【约束校验】")
    all_ok = True
    for name, ok in checks:
        mark = '✅' if ok else '❌'
        if not ok: all_ok = False
        print(f"  {mark} {name}")
    if not all_ok:
        print("  ⚠️  存在约束失败，请审查 prompt/negative 文本")
    # 调用 API 生图
    print("\n【调用 /api/generate】...")
    result, cost = call_api(prompt, negative, case['seed'])
    print(f"  耗时: {cost:.1f}s")
    if 'error' in result or 'http_error' in result:
        print(f"  ❌ 调用失败: {result}")
        return False
    images = result.get('images', [])
    print(f"  ✅ 返回 images 数量: {len(images)}")
    if result.get('seed') is not None:
        print(f"  ✅ 后端返回 seed: {result['seed']}")
    # 保存图片
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    safe_name = case['name'].replace(' ', '_').replace('/', '_')
    out_path = os.path.join(OUTPUT_DIR, f"{idx:02d}_{safe_name}_seed{case['seed']}.png")
    ok, info = save_image(result, out_path)
    if ok:
        print(f"  ✅ {info}")
        print(f"  ✅ 路径: {out_path}")
    else:
        print(f"  ❌ {info}")
        return False
    return True


def main():
    print("=" * 70)
    print("  智承瓷韵 · 青花瓷生图修复验证（本地测试）")
    print("  测试 API:", API_URL)
    print("  输出目录:", OUTPUT_DIR)
    print("=" * 70)
    # 预检查服务是否在线
    try:
        with urllib.request.urlopen(API_URL.replace('/api/generate', '/'), timeout=5):
            pass
        print("✅ 后端服务在线")
    except Exception as e:
        print(f"❌ 无法连接后端 {API_URL[:-13]}: {e}")
        print("   请先运行: python server.py  或双击 start.bat")
        sys.exit(1)

    ok_count = 0
    for i, case in enumerate(TEST_CASES, 1):
        try:
            if run_one(i, case):
                ok_count += 1
        except Exception as e:
            print(f"  ❌ 用例异常: {type(e).__name__}: {e}")
    print(f"\n{'=' * 70}")
    print(f"  完成: {ok_count}/{len(TEST_CASES)} 个用例成功")
    print(f"  输出目录: {OUTPUT_DIR}")
    print("=" * 70)


if __name__ == '__main__':
    import urllib.parse
    main()
