# -*- coding: utf-8 -*-
import re
p = r'c:\Users\gaozhen\Desktop\小瓷\index.html'
with open(p, encoding='utf-8') as f:
    lines = f.read().split('\n')
out = []
for i, l in enumerate(lines, 1):
    if 'window.ALL_PATTERNS' in l:
        out.append(f'{i}\t{l.rstrip()[:115]}')
print('\n'.join(out))
print('--- total', len(out), '---')
