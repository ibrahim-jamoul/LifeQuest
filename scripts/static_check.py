"""Source-level checks possible without a Flutter SDK. Not a Dart compiler."""
from pathlib import Path
import re
import sys
from xml.etree import ElementTree
from collections import Counter
root=Path(__file__).resolve().parent.parent
files=list((root/'lib').rglob('*.dart'))
assert len(files)>=10,'Expected Flutter sources'
for f in files:
    contents=f.read_text(encoding='utf-8')
    # relative imports are grounded on file system, package: and flutter: imports require SDK
    for name in re.findall(r"import ['\"]([^'\"]+)['\"]",contents):
        if not name.startswith(('package:','dart:')):
            path=f.parent/name
            assert path.is_file(),f'Broken relative Dart import {f}: {name}'
    for name in re.findall(r"AssetArt\('([A-Za-z0-9_-]+)'",contents):
        assert (root/'assets'/'illustrations'/f'{name}.svg').is_file(),f'Missing illustration {name}'
for f in (root/'assets'/'illustrations').glob('*.svg'):
    ElementTree.parse(f)
rows=[]
for line in (root/'assets'/'data'/'catalogue_6e.txt').read_text(encoding='utf8').splitlines():
    if line and not line.startswith('#'):
        cols=line.split('|'); assert len(cols)==5,cols; rows.append(cols)
assert len(rows)==115,f'Expected 115 catalog items; got {len(rows)}'
assert len(set(row[0] for row in rows))==len(rows),'Duplicate stable ids'
assert next(row for row in rows if row[0]=='MAT-09')[3]=='Fraction comme partage'
assert not list(root.rglob('.env')),'Sensitive env file in archive'
print('PASS: Dart source paths, illustrations, XML and 115-entry catalogue')
print('Files:',len(files),'SVG:',len(list((root/'assets'/'illustrations').glob('*.svg'))))
