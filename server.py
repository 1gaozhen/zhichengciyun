# -*- coding: utf-8 -*-
"""
智承瓷韵 · 后端服务
- 提供静态文件服务（index.html 等）
- 代理 SiliconFlow（硅基流动）文生图接口，API Key 仅存于服务端，不暴露给浏览器
启动：python server.py   然后访问 http://localhost:8123/
"""
import os
import re
import json
import urllib.request
import urllib.error
from http.server import HTTPServer, ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

# ===== 配置 =====
# 优先使用环境变量，未设置则使用下方默认 Key（仅本地演示用，切勿提交到公开仓库）
API_KEY = os.environ.get("SILICONFLOW_API_KEY", "sk-hwooygrqxjgyuhgemobkeiflpozbvzdetefycydeosabcdsg")
# 硅基流动官方域名（国内）：https://api.siliconflow.cn  国际：https://api.siliconflow.com
SF_BASE_URL = os.environ.get("SF_BASE_URL", "https://api.siliconflow.cn")
# 默认生图模型：Kolors 对中文文化内容理解较好；也可改为 baidu/ERNIE-Image-Turbo / Qwen-Image / black-forest-labs/FLUX.1-schnell
DEFAULT_MODEL = os.environ.get("SF_MODEL", "Kwai-Kolors/Kolors")
PORT = int(os.environ.get("PORT", "8123"))
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        # 对 HTML 禁用缓存，确保前端更新即时生效；其余资源可缓存
        try:
            if self.path.endswith(".html") or self.path.endswith("/"):
                self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
                self.send_header("Pragma", "no-cache")
        except Exception:
            pass
        super().end_headers()

    # ----- 通用 CORS / JSON 工具 -----
    def _set_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._set_cors()
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors()
        self.end_headers()

    # ----- 路由 -----
    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/generate":
            return self._handle_generate()
        if path == "/api/models":
            return self._handle_models()
        if path == "/api/chat":
            return self._handle_chat()
        if path == "/api/chat_message":
            return self._handle_chat_message()
        self._json(404, {"error": "not found"})

    # ----- 小瓷问答：调用硅基流动 LLM 解答陶瓷疑问 -----
    def _handle_chat(self):
        length = int(self.headers.get("Content-Length", 0) or 0)
        raw = self.rfile.read(length).decode("utf-8", errors="ignore") if length else ""
        try:
            data = json.loads(raw) if raw else {}
            question = (data.get("question") or "").strip()
        except Exception:
            return self._json(400, {"error": "请求体解析失败"})
        if not question:
            return self._json(400, {"error": "问题不能为空"})
        url = SF_BASE_URL + "/v1/chat/completions"
        system_prompt = (
            "你是「瓷韵小匠」，扎根醴陵的陶瓷文化知识助手，服务智承瓷韵项目（传统陶瓷纹样 AI 生成与 3D 展示网站）。\n"
            "知识范围：中国传统陶瓷（青花瓷、粉彩、釉下五彩、颜色釉、斗彩）、醴陵陶瓷历史、纹样寓意、拉胚施釉烧成工艺、器型分类。\n\n"
            "核心事实（必须据此回答，不得编造）：\n"
            "- 青花瓷：釉下钴蓝，仅青蓝白二色，高温一次烧成。\n"
            "- 粉彩：釉上彩，玻璃白打底，低温二次烧成，色彩温润。\n"
            "- 醴陵釉下五彩：釉下多彩（红绿蓝黄紫等），湖南醴陵清末创烧，高温一次烧成，「五彩」指多彩而非五种固定色。\n"
            "- 缠枝纹寓生生不息；牡丹寓富贵；凤纹寓祥瑞；海水江崖寓福山寿海；冰裂纹源于釉面开片。\n"
            "- 常见器型：梅瓶、玉壶春瓶、盖罐、盘、碗。\n\n"
            "回答规则：\n"
            "1. 只答陶瓷相关；他领域问题礼貌说明并引导回陶瓷。\n"
            "2. 不确定时说「小瓷对此了解有限，建议查阅专业陶瓷资料」。\n"
            "3. 答案 80-150 字，结构：【定义】+【特征/工艺】+【寓意或应用】，结尾可一句亲切互动。\n"
            "4. 用「小瓷」第一人称，语气亲切专业。"
        )
        # few-shot 示例（仅 1 条，避免上下文过长干扰 7B 模型）
        few_shot = [
            {"role": "user", "content": "什么是醴陵釉下五彩？"},
            {"role": "assistant", "content": "醴陵釉下五彩是湖南醴陵独创的陶瓷装饰技艺，创烧于清末。在素胎上以红、绿、蓝、黄、紫等高温釉下彩料绘画，再罩透明釉高温一次烧成，色彩通透永不褪色。「五彩」指多彩而非固定五种颜色。【特征】釉下彩绘、色彩鲜艳、耐磨损；【寓意】集工艺与美学于一体，被誉为东方陶瓷艺术高峰。想了解哪种纹样配五彩最经典？"},
        ]
        payload = {
            "model": os.environ.get("SF_CHAT_MODEL", "Qwen/Qwen2.5-7B-Instruct"),
            "messages": [
                {"role": "system", "content": system_prompt},
                *few_shot,
                {"role": "user", "content": question},
            ],
            "stream": False,
            "max_tokens": 350,
            "temperature": 0.7,    # 恢复常规温度，避免低温导致重复
            "top_p": 0.9,
            "repetition_penalty": 1.1,   # 温和抑制 7B 小模型常见的字重复（以以/再再）
        }
        req = urllib.request.Request(url, data=json.dumps(payload, ensure_ascii=False).encode("utf-8"), method="POST")
        req.add_header("Authorization", "Bearer " + API_KEY)
        req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                answer = result["choices"][0]["message"]["content"].strip()
                # 后处理：去除可能的 markdown 标记、多余空行
                answer = answer.replace("**", "").replace("##", "").strip()
                # 修复 7B 小模型把「上」误生成成孤立「D」的坏习惯（仅替换被中文包围的 D）
                answer = re.sub(r'(?<=[\u4e00-\u9fff])D(?=[\u4e00-\u9fff])', '上', answer)
                # 去除连续重复的同一汉字（如「以以」「再再」「样样」），保留正常叠词白名单
                _dup_ok = {'隐','微','漫','渐','匆','悠','往','淡','轻','缓','迟','沉','默','悄','纷','滔','潺','皑','灼','熠','盈','脉','习','凛','赫','烈','隆','嗡','蒙','茫','渺','翠','澄','清','白','红','绿','黄','蓝','紫','金','银','瓷','瓷','陶','韵','儿','哥','姐','弟','爷','奶','太太','宝贝','亲爱的','慢慢','常常','轻轻','静静','悄悄','渐渐','悠悠','微微'}
                answer = re.sub(r'(.)\1', lambda m: m.group(0) if m.group(1) in _dup_ok else m.group(1), answer)
                # 超长答案截断到最近句号
                if len(answer) > 250:
                    cut = answer[:250]
                    last_period = max(cut.rfind("。"), cut.rfind("！"), cut.rfind("？"))
                    if last_period > 100:
                        answer = cut[:last_period + 1]
                return self._json(200, {"answer": answer})
        except urllib.error.HTTPError as e:
            err = e.read().decode("utf-8", errors="ignore")
            return self._json(e.code, {"error": "上游模型错误", "detail": err[:500]})
        except Exception as e:
            return self._json(500, {"error": "请求失败: " + str(e)})

    # ----- 瓷友私信：模拟其他用户回复（调用 LLM 角色扮演）-----
    def _handle_chat_message(self):
        length = int(self.headers.get("Content-Length", 0) or 0)
        raw = self.rfile.read(length).decode("utf-8", errors="ignore") if length else ""
        try:
            data = json.loads(raw) if raw else {}
            friend_name = (data.get("friend") or "").strip()
            my_name = (data.get("me") or "瓷友").strip()
            msg = (data.get("message") or "").strip()
        except Exception:
            return self._json(400, {"error": "请求体解析失败"})
        if not msg or not friend_name:
            return self._json(400, {"error": "缺少好友名或消息内容"})
        # 角色设定：让 LLM 扮演指定瓷友人设回复用户消息
        personas = {
            "瓷友·墨白": "你是一位温润如玉的青年陶艺师，擅长青花分水技法，话不多但见解独到，喜欢用古典诗意比喻瓷器。",
            "瓷友·青衫": "你是一位性格爽朗的瓷韵短视频博主，热情爱分享，常带网络流行语和 emoji，喜欢鼓励新瓷友。",
            "瓷友·素心": "你是一位宁静淡泊的素色瓷爱好者，崇尚宋瓷极简美学，说话温柔简洁，常引用苏轼等古人词句。",
            "瓷友·问瓷": "你是一位博学的陶瓷史研究者，对醴陵釉下五彩、景德镇历代名窑如数家珍，回复偏知识性但口语化。",
            "瓷友·青瓷": "你是一位手作瓷人，常驻窑坊，喜欢分享拉胚、施釉、烧成的实操心得，回复中常带温度/气氛等工艺细节。",
        }
        persona = personas.get(friend_name, "你是一位热爱陶瓷文化的瓷友，回复亲切自然、口语化，控制在 50 字以内。")
        url = SF_BASE_URL + "/v1/chat/completions"
        payload = {
            "model": os.environ.get("SF_CHAT_MODEL", "Qwen/Qwen2.5-7B-Instruct"),
            "messages": [
                {"role": "system", "content": persona + " 用户名是「" + my_name + "」。请以 " + friend_name + " 的口吻回复用户的消息，控制在 60 字以内，亲切自然，可用 1-2 个 emoji。"},
                {"role": "user", "content": msg},
            ],
            "stream": False,
            "max_tokens": 180,
            "temperature": 0.85,
        }
        req = urllib.request.Request(url, data=json.dumps(payload, ensure_ascii=False).encode("utf-8"), method="POST")
        req.add_header("Authorization", "Bearer " + API_KEY)
        req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                reply = result["choices"][0]["message"]["content"].strip()
                return self._json(200, {"reply": reply, "friend": friend_name})
        except urllib.error.HTTPError as e:
            err = e.read().decode("utf-8", errors="ignore")
            return self._json(e.code, {"error": "上游模型错误", "detail": err[:500]})
        except Exception as e:
            # 兜底回复：让前端不卡死
            fallbacks = [
                "你这个想法很有意思，我刚刚在拉胚，等会儿细聊~ 🌸",
                "懂你！瓷韵之美正在于此，回聊～ 🍵",
                "哈哈，我们瓷友就喜欢这种交流，等下分享一张我刚烧的图给你看 👀",
                "你说得在理，釉下五彩确实妙，下次窑开一起约？ 🔥",
            ]
            import random
            return self._json(200, {"reply": random.choice(fallbacks), "friend": friend_name})

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path == "/api/health":
            return self._json(200, {"ok": True, "model": DEFAULT_MODEL})
        if path == "/api/lan-url":
            return self._handle_lan_url()
        if path == "/api/image":
            return self._handle_image_proxy(parsed.query)
        if path == "/api/patterns":
            return self._handle_patterns()
        # 其余交给静态文件服务
        return super().do_GET()

    # ----- 局域网访问 URL（供手机扫码用，无依赖 socket 探测本机 IP）-----
    def _handle_lan_url(self):
        import socket
        ip = "127.0.0.1"
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
        except Exception:
            try:
                ip = socket.gethostbyname(socket.gethostname())
            except Exception:
                pass
        finally:
            s.close()
        url = "http://{}:{}/".format(ip, PORT)
        return self._json(200, {"url": url, "ip": ip, "port": PORT})

    # ----- 纹样库扫描：按子文件夹分类 -----
    # 子文件夹名 → 展示主分类名
    CAT_LABELS = {
        "云纹": "云纹类",
        "动物": "动物瑞兽类",
        "吉祥": "吉祥寓意图",
        "缠枝纹": "缠枝花卉类",
        "花卉": "花卉类",
        "青花": "青花综合",
        "黑鲸": "黑鲸素材",
        "images": "经典纹样",
    }
    # 子文件夹名 → 命名简称（用于短名规范化，让"莲 (1).jpg"→"缠枝莲纹·1"而非"莲（二）"）
    CAT_SHORT = {
        "云纹": "云",
        "动物": "瑞兽",
        "吉祥": "吉祥",
        "缠枝纹": "缠枝",
        "花卉": "花卉",
        "青花": "青花",
        "黑鲸": "黑鲸",
        "images": "经典",
    }
    # images 文件夹中非纹样的照片（博物馆/人物照），排除
    EXCLUDE_IMAGES = {"lilingbowuguan.jpg", "ai-human.jpg",
                      "liling1.jpg", "liling2.jpg", "liling3.jpg",
                      "liling4.jpg", "liling5.jpg", "liling6.jpg"}

    # 由纹样名推导母题（供 AI 提示词参考，与前端 deriveMotif 保持一致）
    @staticmethod
    def _derive_motif(name):
        n = name
        if "缠枝" in n or "莲" in n or "荷" in n: return "缠枝莲"
        if "牡丹" in n or "宝相" in n or "团花" in n: return "牡丹"
        if "龙" in n: return "龙纹"
        if "凤" in n: return "凤纹"
        if "麒麟" in n or "瑞兽" in n or "兽" in n or "螭" in n or "狮" in n: return "麒麟"
        if "蝙蝠" in n or "五福" in n or "五蝠" in n: return "蝙蝠"
        if "寿" in n: return "寿桃"
        if "福" in n or "八宝" in n or "吉祥" in n or "吉祥" in n: return "吉语字"
        if "葡萄" in n: return "葡萄"
        if "葫芦" in n: return "葫芦"
        if "婴" in n: return "婴戏"
        if "海水" in n or "江崖" in n: return "海水江崖"
        if "梅" in n: return "梅枝"
        if "菊" in n: return "菊花"
        if "山水" in n: return "山水"
        if "云" in n: return "如意云"
        if "回纹" in n or "几何" in n: return "回纹"
        if "人物" in n or "婴" in n: return "人物"
        if "鱼" in n: return "鱼藻"
        return "缠枝莲"

    # 由纹样名推导子分类（更细的题材分组）
    @staticmethod
    def _derive_sub(name):
        n = name
        if "缠枝" in n: return "缠枝纹"
        if "牡丹" in n: return "牡丹纹"
        if "龙" in n or "凤" in n or "麒麟" in n or "狮" in n or "兽" in n or "螭" in n: return "龙凤瑞兽"
        if "云" in n: return "云气纹"
        if "团花" in n or "宝相" in n: return "团花宝相"
        if "回纹" in n or "几何" in n: return "几何回纹"
        if "寿" in n or "福" in n or "吉祥" in n or "八宝" in n or "盘长" in n: return "吉语文字"
        if "婴" in n or "人物" in n: return "人物故事"
        if "菊" in n or "梅" in n or "莲" in n or "荷" in n or "花卉" in n or "花" in n: return "花卉纹"
        if "葡萄" in n or "葫芦" in n or "石榴" in n or "三多" in n: return "瓜果纹"
        if "鱼" in n or "鸟" in n or "蝶" in n or "蝠" in n: return "鱼虫花鸟"
        if "山水" in n or "山石" in n: return "山水景致"
        return "其他纹样"

    @staticmethod
    def _cn_num(n):
        cn = "零一二三四五六七八九十"
        if n <= 10: return cn[n]
        if n < 20: return "十" + (cn[n - 10] if n - 10 else "")
        return str(n)

    def _handle_patterns(self):
        import re
        base = os.path.join(ROOT, "纹样wy")
        patterns = []
        categories_order = []
        # 同分类下同名计数，用于中文编号去重
        used_names = {}
        if not os.path.isdir(base):
            return self._json(200, {"patterns": [], "categories": []})
        for folder in sorted(os.listdir(base)):
            fpath = os.path.join(base, folder)
            if not os.path.isdir(fpath):
                continue
            cat = self.CAT_LABELS.get(folder, folder)
            if cat not in categories_order:
                categories_order.append(cat)
            try:
                files = sorted(os.listdir(fpath))
            except OSError:
                files = []
            generic_seq = 0  # 青花瓷图案矢量素材 通用命名计数
            for fname in files:
                low = fname.lower()
                if not low.endswith((".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp")):
                    continue
                if folder == "images" and fname in self.EXCLUDE_IMAGES:
                    continue
                stem = os.path.splitext(fname)[0]
                # 去掉尾部 " (N)" 副本号
                stem = re.sub(r"\s*\(\d+\)\s*$", "", stem)
                # 去掉 "图案矢量素材-N" 之类的素材编号
                stem = re.sub(r"\s*-\d+\s*$", "", stem)
                # pattern_NN_xx.jpg 经典纹样：用已知 17 款命名
                m_pat = re.match(r"pattern_(\d+)_", fname)
                if m_pat:
                    stem = self.PATTERN_NAMES.get(int(m_pat.group(1)), stem)
                # 英文 pattern 名映射为规范中文名（pattern (N)EnglishName / pattern_EnglishName (N)）
                stem = self._en_to_cn(stem)
                # 通用名（青花瓷图案矢量素材）→ 按序号命名为"青花综合纹样·壹/贰…"
                if "青花瓷图案矢量素材" in stem:
                    generic_seq += 1
                    stem = "青花综合纹样·" + self._cn_num(generic_seq)
                # 黑鲸素材 (N) → 黑鲸纹样·N
                if "黑鲸素材" in stem:
                    m_no = re.search(r"\((\d+)\)", fname)
                    no = int(m_no.group(1)) if m_no else 0
                    stem = "黑鲸纹样·" + self._cn_num(no) if no else "黑鲸纹样"
                stem = stem.strip() or fname
                # 短名规范化：文件名为"母题 (N)"形式（如"莲 (1).jpg"/"凤纹 (3).png"）时，
                # 补全为"分类·母题N"，避免出现"莲（二）"/"凤纹（三）"等无意义命名（乱码感）
                if len(stem) <= 2:
                    m_no2 = re.search(r"\((\d+)\)", fname)
                    if m_no2:
                        no2 = int(m_no2.group(1))
                        cat_short = self.CAT_SHORT.get(folder, "")
                        motif_name = stem if stem.endswith("纹") else stem + "纹"
                        # 避免分类简称与母题重复（如"云纹"+"云"→"云云纹"）
                        if cat_short and not motif_name.startswith(cat_short):
                            stem = cat_short + motif_name + "·" + str(no2)
                        else:
                            stem = motif_name + "·" + str(no2)
                # 全局同名去重：按出现序号追加中文变体号（二）（三），保证全库唯一
                used_names[stem] = used_names.get(stem, 0) + 1
                if used_names[stem] > 1:
                    stem = stem + "（" + self._cn_num(used_names[stem]) + "）"
                motif = self._derive_motif(stem)
                sub = self._derive_sub(stem)
                rel_path = "纹样wy/{}/{}".format(folder, fname)
                patterns.append({
                    "name": stem,
                    "category": cat,
                    "subcategory": sub,
                    "motif": motif,
                    "path": rel_path,
                    "file": fname,
                })
        return self._json(200, {"patterns": patterns, "categories": categories_order})

    # 原 reference 站 17 款经典青花纹样命名（用于 images/pattern_NN_*.jpg）
    PATTERN_NAMES = {
        1: "青花菊花纹", 2: "青花繁复缠枝花纹", 3: "青花龙纹纹样",
        4: "青花缠枝大花纹", 5: "青花福禄平安多子纹", 6: "青花葡萄纹",
        7: "青花缠枝牡丹纹", 8: "青花凤凰纹样", 9: "青花折枝小花纹",
        10: "青花缠枝团花纹样", 11: "青花富贵平安纹", 12: "青花祥龙纳福纹",
        13: "青花吉语文字纹", 14: "青花瑞兽纹样", 15: "青花寿桃吉祥纹",
        16: "青花婴戏多子纹", 17: "青花团花纹样",
    }
    # 英文纹样名 → 规范中文名映射（用于 pattern_EnglishName / pattern (N)EnglishName 等文件）
    EN_NAME_MAP = {
        "eight auspicious symbols": "八吉祥纹",
        "bao xiang flower": "宝相花纹",
        "lotus": "莲花纹", "lotus flower": "莲花纹",
        "peony": "牡丹纹", "peony flower": "牡丹纹",
        "chrysanthemum": "菊花纹", "dragon": "龙纹", "phoenix": "凤纹",
        "cloud": "云纹", "floral": "花卉纹", "flower": "花纹",
        "geometric": "几何纹", "border": "边花纹", "scroll": "卷草纹",
        "treasure": "杂宝纹", "bat": "蝙蝠纹", "crane": "仙鹤纹",
        "fish": "鱼藻纹", "butterfly": "蝴蝶纹", "gourd": "葫芦纹",
        "interlocking": "缠枝纹", "vine": "藤蔓纹", "leaf": "叶纹",
        "wave": "海水纹", "mountain": "山石纹", "character": "文字纹",
    }

    @staticmethod
    def _en_to_cn(stem):
        """将英文 pattern 名转规范中文名；非英文名原样返回"""
        import re as _re
        low = stem.lower()
        # 形如 "pattern (2)Eight Auspicious Symbols" 或 "pattern_Bao Xiang Flower"
        m = _re.match(r"pattern[\s_]*(.*)", low)
        if not m:
            return stem
        key = m.group(1).strip()
        if not key:
            return stem
        # 直接整串匹配
        if key in Handler.EN_NAME_MAP:
            return Handler.EN_NAME_MAP[key]
        # 子串匹配：取命中的最长英文短语拼接
        hit = ""
        for en, cn in Handler.EN_NAME_MAP.items():
            if en in key and len(en) > len(hit):
                hit = en
        if hit:
            return Handler.EN_NAME_MAP[hit]
        return stem

    # ----- 图片代理（解决 WebGL 纹理跨域污染） -----
    def _handle_image_proxy(self, query):
        from urllib.parse import parse_qs
        qs = parse_qs(query)
        url = (qs.get("url", [""])[0]).strip()
        if not url:
            return self._json(400, {"error": "缺少 url 参数"})
        # 仅允许 http(s) 且禁止访问内网地址，防止 SSRF
        if not url.lower().startswith(("http://", "https://")):
            return self._json(400, {"error": "仅支持 http/https"})
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 zc"})
            with urllib.request.urlopen(req, timeout=60) as resp:
                ctype = resp.headers.get("Content-Type", "image/png")
                data = resp.read()
                # S3 常返回 octet-stream，按魔数识别真实图片类型，便于浏览器解码
                if "octet-stream" in ctype or "application/" in ctype:
                    if data[:8] == b"\x89PNG\r\n\x1a\n":
                        ctype = "image/png"
                    elif data[:2] == b"\xff\xd8":
                        ctype = "image/jpeg"
                    elif data[:4] == b"RIFF" and data[8:12] == b"WEBP":
                        ctype = "image/webp"
                    else:
                        ctype = "image/png"
        except Exception as e:
            return self._json(502, {"error": f"图片获取失败: {e}"})
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "public, max-age=3600")
        self._set_cors()
        self.end_headers()
        self.wfile.write(data)

    # ----- 模型列表（前端选择用） -----
    MODELS = [
        {"id": "Kwai-Kolors/Kolors", "name": "Kolors · 快手可图", "note": "中文文化内容理解佳"},
        {"id": "baidu/ERNIE-Image-Turbo", "name": "ERNIE-Image-Turbo · 百度文心", "note": "极速 8 步，价低"},
        {"id": "Qwen-Image", "name": "Qwen-Image · 通义万相", "note": "支持中文提示与负向词"},
        {"id": "black-forest-labs/FLUX.1-schnell", "name": "FLUX.1-schnell", "note": "开源快速模型"},
        {"id": "black-forest-labs/FLUX.1-dev", "name": "FLUX.1-dev", "note": "高质量开源模型"},
    ]

    def _handle_models(self):
        length = int(self.headers.get("Content-Length", 0) or 0)
        self._json(200, {"default": DEFAULT_MODEL, "models": self.MODELS})

    # ----- 生图代理 -----
    def _handle_generate(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length) if length else b"{}"
            data = json.loads(raw.decode("utf-8") or "{}")
        except Exception as e:
            return self._json(400, {"error": f"请求体解析失败: {e}"})

        prompt = (data.get("prompt") or "").strip()
        if not prompt:
            return self._json(400, {"error": "prompt 不能为空"})

        model = data.get("model") or DEFAULT_MODEL
        image_size = data.get("image_size") or "1024x1024"
        negative_prompt = data.get("negative_prompt") or ""
        seed = data.get("seed")

        # 组装 SiliconFlow 请求体
        payload = {
            "model": model,
            "prompt": prompt,
            "image_size": image_size,
        }
        if negative_prompt:
            payload["negative_prompt"] = negative_prompt
        if seed is not None:
            try:
                payload["seed"] = int(seed)
            except ValueError:
                pass
        # 额外推理参数（步数/CFG）按模型可选传递
        for k in ("num_inference_steps", "cfg", "batch_size", "guidance_scale"):
            if k in data:
                payload[k] = data[k]

        body = json.dumps(payload).encode("utf-8")
        url = f"{SF_BASE_URL}/v1/images/generations"
        req = urllib.request.Request(
            url,
            data=body,
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                result = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            return self._json(e.code, {"error": "SiliconFlow 返回错误", "detail": err_body})
        except urllib.error.URLError as e:
            return self._json(502, {"error": f"无法连接 SiliconFlow: {e.reason}"})
        except Exception as e:
            return self._json(500, {"error": f"服务端异常: {e}"})

        # 返回标准结构：images:[{url}], timings, seed
        return self._json(200, result)

    # 安静日志
    def log_message(self, fmt, *args):
        import sys
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))


def main():
    print(f"智承瓷韵服务启动中...")
    print(f"  静态目录 : {ROOT}")
    print(f"  本地地址 : http://localhost:{PORT}")
    print(f"  生图模型 : {DEFAULT_MODEL}")
    print(f"  SF 接口  : {SF_BASE_URL}/v1/images/generations")
    print(f"  API Key  : {API_KEY[:8]}...{API_KEY[-4:]}")
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务已停止")
        server.server_close()


if __name__ == "__main__":
    main()
