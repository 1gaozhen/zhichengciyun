# -*- coding: utf-8 -*-
import re
p = r'c:\Users\gaozhen\Desktop\小瓷\index.html'
with open(p, encoding='utf-8') as f:
    lines = f.read().split('\n')
pat = re.compile(r'ALL_PATTERNS|renderFeedCard|poster|fc-video|fc-img|FEED_DATA\s*=|纹样.*封面')
out = []
for i, l in enumerate(lines, 1):
    if pat.search(l):
        out.append(f'{i}\t{l.rstrip()[:115]}')
print('\n'.join(out))
print('--- total', len(out), '---')
