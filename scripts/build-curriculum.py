import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = (root / '3d_academy_curriculum_v0_1-1.md').read_text()
section = source.split('## 4. Программа по неделям', 1)[1].split('## 5. Модель одного урока', 1)[0]
modules = []
for block in re.split(r'(?=^### Модуль \d+\.)', section, flags=re.M):
    heading = re.search(r'^### Модуль (\d+)\. (.+?) \(недели (\d+)–(\d+)\)', block, re.M)
    if not heading:
        continue
    number, name, start, end = heading.groups()
    goal = re.search(r'\*\*Цель:\*\* (.+)', block)
    rows = []
    for line in block.splitlines():
        m = re.match(r'^\| (\d+) \| (.+) \| (.+) \| (.+) \|$', line)
        if m:
            week, topic, practice, result = m.groups()
            rows.append(dict(number=int(week), topic=topic, practice=practice, result=result))
        elif int(number) == 7:
            m = re.match(r'^\| (\d+) \| (.+) \| (.+) \|$', line)
            if m:
                week, practice, result = m.groups()
                rows.append(dict(number=int(week), topic=practice, practice=practice, result=result))
    modules.append(dict(number=int(number), name=name, start=int(start), end=int(end), goal=goal.group(1) if goal else rows[0]['topic'], weeks=rows))
assert len(modules) == 7 and sum(len(m['weeks']) for m in modules) == 28
(root / 'curriculum.json').write_text(json.dumps(modules, ensure_ascii=False, indent=2) + '\n')
