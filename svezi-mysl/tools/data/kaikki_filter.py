# Čte kaikki.org JSONL (Wiktextract, CC BY-SA) ze stdin a vypíše základní tvary běžných slovních druhů.
import sys, json, re
OK_POS = {'noun', 'verb', 'adj', 'adv'}
BAD = {'vulgar', 'offensive', 'derogatory', 'slur', 'ethnic', 'pejorative'}
OLD = {'archaic', 'obsolete', 'dated', 'dialectal', 'rare', 'regional', 'nonstandard', 'misspelling', 'Internet', 'slang'}
LETTERS = re.compile(r'^[a-záčďéěíňóřšťúůýž]{3,9}$')
out = {}
for line in sys.stdin:
    try:
        e = json.loads(line)
    except Exception:
        continue
    w = e.get('word', '')
    pos = e.get('pos')
    if pos not in OK_POS or not LETTERS.match(w):
        continue
    senses = e.get('senses') or []
    good = []
    bad = False
    for s in senses:
        tags = set(s.get('tags') or [])
        if s.get('form_of') or s.get('alt_of') or 'form-of' in tags or 'alt-of' in tags:
            continue
        if tags & BAD:
            bad = True
        if not (tags & OLD):
            good.append(s)
    if bad or not good:
        continue
    gl = (good[0].get('glosses') or [''])[0][:60]
    prev = out.get(w)
    if prev is None:
        out[w] = {'pos': {pos}, 'gloss': gl}
    else:
        prev['pos'].add(pos)
for w, v in sorted(out.items()):
    print(w + '\t' + ','.join(sorted(v['pos'])) + '\t' + v['gloss'].replace('\t', ' '))
