# -*- coding: utf-8 -*-
import re
p = r'c:\Users\gaozhen\Desktop\小瓷\index.html'
with open(p, encoding='utf-8') as f:
    lines = f.read().split('\n')
# 找纹样加载函数定义与调用、ALL_PATTERNS 赋值、DOMContentLoaded
pat = re.compile(r'async function load|loadPatterns|loadLibrary|ALL_PATTERNS\s*=|DOMContentLoaded|fetch\(.?/api/patterns|lib-loading')
out = []
for i, l in enumerate(lines, 1):
    if pat.search(l):
        out.append(f'{i}\t{l.rstrip()[:110]}')
print('\n'.join(out))
print('--- total', len(out), '---')
