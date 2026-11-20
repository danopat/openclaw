# Doplní k lemmatům frekvenci (Zipf) z wordfreq a vypíše statistiku.
import sys
sys.path.insert(0, sys.argv[1])
from wordfreq import zipf_frequency
rows = []
for line in open(sys.argv[2], encoding='utf-8'):
    w, pos, gloss = line.rstrip('\n').split('\t')
    rows.append((w, pos, gloss, zipf_frequency(w, 'cs')))
with open(sys.argv[3], 'w', encoding='utf-8') as f:
    for r in sorted(rows, key=lambda r: -r[3]):
        f.write('%s\t%s\t%.2f\t%s\n' % (r[0], r[1], r[3], r[2]))
for t in (2.5, 3.0, 3.3, 3.5, 4.0):
    print(t, sum(1 for r in rows if r[3] >= t), 'podstatných jmen:', sum(1 for r in rows if r[3] >= t and 'noun' in r[1]))
