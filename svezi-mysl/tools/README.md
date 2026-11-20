# Nástroje pro vývoj

Pomocné skripty mimo aplikaci. Aplikace sama je nepotřebuje.

| Skript | Co dělá |
|---|---|
| `minihry_db.py DOCS` | Z jednoho zdroje vytvoří plán miniher `docs/minihry-databaze.md` a `.csv`. |
| `build-artifact.cjs ROOT OUT` | Sestaví jednosouborovou verzi aplikace pro náhled. |
| `smoke-artifact2.cjs OUT` | Rychlá kontrola sestaveného souboru v prohlížeči. |
| `quick-shots.cjs ROOT OUT "zařízení" měřítko id:úroveň:čekáNa,...` | Snímky první úlohy hry na dané úrovni. |
| `fit-check2.cjs ROOT [id,id…]` | Kontrola rozložení na malém iPhonu s největším písmem a na iPhonu 13. |
| `gen-stress.cjs ROOT id,id… [opakování]` | Zátěžová kontrola generátorů úloh. |
| `scene-shot.cjs id soubor.png` | Snímek pohlednice zastávky. |

## Data pro slovní hry a mapu (`data/`)

Stažené soubory se do repozitáře neukládají. Hry dostanou jen odvozený výběr se zdrojem a licencí v hlavičce.

| Zdroj | Licence | K čemu |
|---|---|---|
| Wikislovník přes [kaikki.org](https://kaikki.org/dictionary/Czech/) (Wiktextract), `kaikki.org-dictionary-Czech.jsonl` | CC BY-SA 4.0 (a GFDL) | základní tvary a slovní druhy |
| [wordfreq](https://pypi.org/project/wordfreq/) | data CC BY-SA 4.0 | četnost slov (Zipf) |
| [Natural Earth](https://www.naturalearthdata.com) 1:10m, `naciscdn.org/naturalearth/10m/…` | volné dílo | kraje (`admin_1_states_provinces`), řeky (`rivers_lake_centerlines`), státy (`admin_0_countries`) |

Postup pro slovník:

1. `curl -sL https://kaikki.org/dictionary/Czech/kaikki.org-dictionary-Czech.jsonl | python3 -I data/kaikki_filter.py > lemmas.tsv`
   (podstatná a přídavná jména, slovesa a příslovce o 3–9 písmenech; bez vulgárních, zastaralých, nářečních a slangových slov)
2. `pip install --target pylib wordfreq` a `python3 -I data/freq.py pylib lemmas.tsv lemmas_freq.tsv` (přidá četnost)
3. Výběr do her: četnost Zipf aspoň 3 (asi 8 900 slov). Ručně vyřadit neplnovýznamová slova označená jako jména (pro, bez, jak, jen, proti) a hovorové výrazy.
