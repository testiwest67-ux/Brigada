# Список картинок «Танцевальная чума 1518» (Google Flow, Nano Banana 2.1, 16:9, 0 кредитов).
# Пишет картинки.json [{batch, scene, name, prompt, refs}] — scene-NN = номер внутри своей очереди Flow:
#   очередь 1 «tanceval-img»: листы персонажей + картинки без героев; очередь 2 «tanceval-img2»: картинки с героями
#   (образцы — листы из очереди 1 путём к файлу; asset: не используем — даёт CHARACTER LOCK, см. Фланнан).
import json, os

D = os.path.dirname(os.path.abspath(__file__))
BG = os.path.abspath(os.path.join(D, '..', '..', 'public', 'tanceval-chuma', 'bg')).replace('\\', '/')

STYLE = ('cinematic painted digital illustration, moody historical documentary look, Strasbourg 1518, Northern Renaissance '
         'atmosphere, rich detail, dramatic volumetric light, warm candle gold and hot summer haze, deep shadows, muted earth '
         'tones with dark red accents, film grain, 16:9, no text, no letters, no writing, no watermark.')
SHEET = ('Character reference sheet on a plain light grey background: full body front view, back view and side view in a row; '
         'below them four head close-ups: neutral, scared, exhausted, angry. Soft blue-grey pencil and watercolour wash '
         'illustration, clean, consistent proportions, no text, no letters.')

TROFFEA = ('Frau Troffea, a thin woman about thirty from 1518 Strasbourg, pale tired face, dark auburn hair under a simple white '
           'linen coif, plain grey-brown wool dress with a laced bodice, faded apron, worn leather shoes')
HUSBAND = ('her husband, a stocky craftsman about thirty-five, short brown beard, brown wool tunic, leather work apron, '
           'dark felt cap')
PARACELSUS = ('the Swiss physician Paracelsus around 1526, round clean-shaven face, receding hair, intense eyes, dark scholar '
              'gown with fur collar, holding a book')

SHEETS = [
    ('char-troffea-sheet', TROFFEA),
    ('char-husband-sheet', 'A stocky craftsman about thirty-five from 1518 Strasbourg, short brown beard, brown wool tunic, leather work apron, dark felt cap'),
    ('char-paracelsus-sheet', PARACELSUS),
]

P1 = [
    # 0 крючок
    ('c0-01-stage', 'A wooden stage in a crowded 16th-century market square, dozens of exhausted townspeople dancing on it, musicians with drums and fiddles beside it, a silent crowd watching, hot summer evening light'),
    ('c0-02-faces', 'Close-up of grey exhausted faces with empty staring eyes of townspeople dancing in a crowd, sweat, dust in the air'),
    ('c0-03-feet', 'Close-up of swollen feet in worn leather boots and wooden clogs stamping on cobblestones, dark stains soaking the leather, dust'),
    ('c0-04-fall', 'A dancer collapsing on a wooden stage while others keep dancing around him, two men lifting him up by the arms'),
    ('c0-05-musicians', 'Musicians playing a drum, a fiddle, a bagpipe and a horn at the edge of a wooden stage, sweating, uneasy faces'),
    ('c0-06-council', 'Town councillors in dark fur-trimmed robes watching a dancing crowd from the balcony of a Gothic town hall'),
    ('c0-07-documents', 'Old handwritten chronicles, letters with red wax seals and a quill on an oak desk by candlelight, the writing too blurred to read'),
    ('c0-08-rhine', 'Aerial view of the Rhine river valley at dusk with small medieval walled towns along the river, ominous red sky'),
    ('c0-09-silhouettes', 'Dark silhouettes of many people dancing wildly against a blood-red sunset sky over medieval rooftops'),
    # 1 город на краю
    ('c1-01-city', 'Panorama of Strasbourg in 1518: the tall Gothic cathedral spire above steep roofs of half-timbered houses, the river with boats, summer haze'),
    ('c1-02-street', 'A busy narrow street of half-timbered houses in Strasbourg 1518 with merchants, craftsmen and hanging guild signs shaped like a boot and a key'),
    ('c1-03-famine', 'A ruined dry wheat field with stunted grain, thin hungry peasants standing in it, harsh sun'),
    ('c1-04-bread', 'An empty baker\'s stall with bare shelves, a thin crowd of hungry townspeople staring at it'),
    ('c1-05-poor-meal', 'A poor family in a dim hut eating thin grey gruel from wooden bowls, hollow cheeks, candle'),
    ('c1-06-revolt', 'Angry peasants with pitchforks and torches gathering at night outside a village, no violence'),
    ('c1-07-sick', 'Sick people lying on straw in a dim stone hospice, nuns in white caring for them, shafts of light'),
    ('c1-08-comet', 'A huge glowing comet over a medieval town at night, frightened townspeople pointing at the sky'),
    ('c1-09-heat', 'Blazing white sun over medieval rooftops, cracked dry earth and heat haze, a dog panting in the shade'),
    ('c1-10-prayer', 'A worried townsman kneeling and praying among many candles in a dark Gothic cathedral'),
    ('c1-11-vitus-statue', 'A painted wooden statue of Saint Vitus as a young man holding a palm leaf in a candle-lit stone chapel niche, stern face, ominous shadows'),
    ('c1-12-curse-vision', 'A nightmarish vision of a ring of people dancing helplessly under a stormy angry sky, painted like an old altarpiece'),
    # 2 первая (без героев)
    ('c2-01-lane', 'A narrow cobbled lane with leaning half-timbered houses in Strasbourg on a hot July morning, empty, laundry lines, long shadows'),
    ('c2-10-saverne', 'A dusty road climbing into the green Vosges mountains toward a small town and a chapel on a wooded hill, summer 1518'),
    # 3 зараза
    ('c3-03-thirty', 'About thirty townspeople of all ages dancing helplessly in a small square, strangers to each other, others staring from doorways'),
    ('c3-04-hundreds', 'Wide view of hundreds of people dancing through the streets of a medieval city at dusk, dust and long shadows'),
    ('c3-05-night', 'Night in a medieval street lit by torches, people still dancing with empty eyes, some collapsed against walls'),
    ('c3-06-mother', 'A frightened mother pulling her small child away from a group of dancers in the street, looking back in fear'),
    # 4 лекарство хуже болезни
    ('c4-01-physicians', 'City council meeting in a wood-panelled chamber, physicians in long dark robes and caps arguing before councillors'),
    ('c4-02-humours', 'A 16th-century physician examining four glass flasks with red, yellow, black and pale liquids by a window'),
    ('c4-03-bloodletting', 'A barber-surgeon preparing a brass bloodletting bowl and a small knife beside a patient, no blood visible'),
    ('c4-04-guildhall', 'The large timbered hall of a carpenters\' guild cleared of tables, its wooden floor turned into a dance floor, dancers inside'),
    ('c4-05-building', 'Carpenters hammering together a large wooden stage in a horse market, townspeople watching'),
    ('c4-06-hiring', 'A council official paying silver coins to a group of musicians with drums, fiddles, pipes and horns'),
    ('c4-07-strongmen', 'Strong young men holding exhausted dancers upright under the arms so they keep dancing on a stage'),
    ('c4-08-spectacle', 'A huge crowd packed around a wooden stage in a market square, loud music, dancers in the middle, like a dark festival'),
    ('c4-09-joining', 'Several people in the watching crowd beginning to sway and dance one after another, the rest stepping back in horror'),
    # 5 святой Вит
    ('c5-01-dismantle', 'Workers tearing down a wooden stage in an empty market square, planks on the cobblestones, late summer'),
    ('c5-02-decree', 'A town crier on the steps of a town hall reading a sealed decree from a scroll to a silent crowd, a drum lying silent at his feet'),
    ('c5-03-wedding', 'A small modest wedding in a courtyard, only a lute player making music, guests dancing gently'),
    ('c5-04-carts', 'Wooden carts carrying exhausted dancers along a mountain road through a forest, monks walking beside them'),
    ('c5-05-chapel', 'A small old stone chapel of Saint Vitus on a wooded hill above a valley, pilgrims climbing the path'),
    ('c5-06-red-shoes', 'Close-up of a priest painting small crosses with holy oil on the tops and soles of a pair of red shoes, candlelight'),
    ('c5-07-ritual', 'Inside a dim chapel full of incense smoke: people in red shoes holding small wooden crosses walk slowly around a wooden statue of Saint Vitus while a priest prays'),
    ('c5-08-calm', 'Exhausted former dancers sitting calmly on chapel benches, relieved faces, soft golden light through a small window'),
    ('c5-09-quiet-street', 'A quiet empty street of Strasbourg in early September, soft autumn light, a single red shoe left on the cobblestones'),
    # 6 это уже было
    ('c6-01-christmas', 'Eleventh-century peasants dancing in a ring around a small stone village church on a snowy Christmas Eve night, a priest at the door'),
    ('c6-02-children', 'A crowd of medieval children dancing and jumping along a country road between green fields in 1237'),
    ('c6-03-piper', 'The legend of the Pied Piper: a piper in a colourful coat leading a line of children out of a medieval town gate, fairytale painting'),
    ('c6-04-bridge', 'About two hundred people dancing on a long wooden bridge over a wide river in the Middle Ages, the bridge sagging'),
    ('c6-05-bridge-break', 'A wooden medieval bridge cracking and breaking apart over a river, planks falling, people at the edges fleeing, no gore'),
    ('c6-06-aachen', 'The great cathedral of Aachen in 1374, crowds dancing in the square in front of it, summer'),
    ('c6-07-church', 'People dancing wildly inside a Gothic church nave while a priest raises a cross'),
    ('c6-08-monk', 'A lone monk dancing in a stone cloister, his robe swirling, other monks watching from the arches'),
    ('c6-09-old-woman', 'An old peasant woman dancing alone in front of a tiny forest chapel of Saint Vitus, as she has every year'),
    ('c6-10-map', 'An antique painted map of the Rhine and Moselle river valleys with small towns and glowing red points along the rivers, no writing'),
    # 7 сколько умерло
    ('c7-01-heat-collapse', 'A dancer collapsing in midday heat in a dusty square, townspeople rushing to him'),
    ('c7-02-books', 'A modern historian\'s desk covered with old books, open archive folders and a magnifying glass, lamp light, no person'),
    ('c7-03-scribe', 'A seventeenth-century scribe writing a thick chronicle by candlelight, a hundred years after the events'),
    ('c7-04-archive', 'Rows of old leather-bound city registers on shelves in a stone archive, gloved hands turning a yellowed page'),
    ('c7-05-poem', 'An old manuscript page with decorated borders and faded verses beside a candle, the writing unreadable'),
    ('c7-06-weak', 'Thin starving people still dancing slowly in the heat, hollow cheeks, dust'),
    ('c7-07-question', 'A dark empty street at night, one abandoned red shoe on the cobblestones under a single lantern'),
    # 8 версии
    ('c8-01-ergot', 'Close-up of ears of rye with dark purple-black ergot fungus horns growing among the grains, morning dew'),
    ('c8-02-vision', 'A peasant holding a piece of dark bread, the world around him swirling into hallucinatory colours and shapes'),
    ('c8-03-cold-hands', 'Close-up of pale bluish cold hands with darkening fingertips clasped together, candlelight, not gory'),
    ('c8-04-fields', 'Endless rye fields across Europe under a cloudy sky, small villages on the horizon'),
    ('c8-05-fear', 'A tight crowd of frightened medieval townspeople with wide fearful eyes, looking at something off-screen'),
    ('c8-06-trance', 'A woman in a trance, eyes half-closed, arms rising, a ghostly glow around her in a dark street'),
    ('c8-07-laughing', 'A 1960s classroom of an African girls\' boarding school, several schoolgirls laughing helplessly and crying at their desks, a worried teacher'),
    ('c8-08-closed-school', 'An empty 1960s school building in rural Tanganyika with its doors shut, dusty yard, quiet afternoon'),
    ('c8-09-procession', 'A medieval religious procession dancing along a road with crosses and banners without writing, monks and pilgrims'),
    # 9 финал
    ('c9-01-today', 'Modern Strasbourg cathedral square at dusk with tourists, faint ghostly shadows of dancing figures on the old walls'),
    ('c9-05-shoes-steps', 'A pair of worn red shoes on the stone steps of a small chapel at sunset, quiet and mysterious'),
]

P2 = [
    ('c2-02-door', f'{TROFFEA}, stepping out of the door of her half-timbered house into a narrow cobbled lane on a hot July morning'),
    ('c2-03-dancing', f'{TROFFEA}, dancing alone in the middle of an empty cobbled street, no music, eyes unfocused, arms raised'),
    ('c2-04-neighbours', f'{TROFFEA}, dancing in the lane while neighbours lean out of windows above: one laughing, one crossing herself'),
    ('c2-05-husband', f'{TROFFEA}, dancing, while {HUSBAND} holds her hands and begs her to stop, desperate face'),
    ('c2-06-night', f'{TROFFEA}, collapsed asleep on the cobblestones at night beside her doorstep, a lantern on the ground'),
    ('c2-07-morning', f'{TROFFEA}, dancing again at dawn, exhausted, swollen feet, dark stains on her worn shoes'),
    ('c2-08-paracelsus', f'{PARACELSUS}, writing in a book by candlelight in a cluttered study with flasks and skulls of animals'),
    ('c2-09-cart', f'{TROFFEA}, sitting slumped in a wooden cart driven out of a medieval city gate by two guards'),
    ('c3-01-watchers', f'{TROFFEA}, dancing in the lane while a crowd of neighbours, passers-by and children watch her'),
    ('c3-02-joining', f'{TROFFEA}, dancing in the lane, and beside her a young man and another woman start to dance too, staring blankly'),
    ('c8-10-spite', f'{TROFFEA}, dancing defiantly in the street while {HUSBAND} stands ashamed and neighbours gossip behind their hands'),
]


def main():
    rows = []
    for i, (name, who) in enumerate(SHEETS, 1):
        rows.append({'batch': 1, 'scene': f'scene-{i:02d}', 'name': name, 'prompt': f'{who}. {SHEET}', 'refs': []})
    for j, (name, p) in enumerate(P1, len(SHEETS) + 1):
        rows.append({'batch': 1, 'scene': f'scene-{j:02d}', 'name': name, 'prompt': f'{p}. {STYLE}', 'refs': []})
    for k, (name, p) in enumerate(P2, 1):
        refs = []
        if 'Troffea' in p: refs.append(f'{BG}/char-troffea-sheet.png')
        if 'husband' in p: refs.append(f'{BG}/char-husband-sheet.png')
        if 'Paracelsus' in p: refs.append(f'{BG}/char-paracelsus-sheet.png')
        rows.append({'batch': 2, 'scene': f'scene-{k:02d}', 'name': name, 'prompt': f'{p}. {STYLE}', 'refs': refs})
    json.dump(rows, open(os.path.join(D, 'картинки.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('очередь 1:', sum(r['batch'] == 1 for r in rows), 'очередь 2:', sum(r['batch'] == 2 for r in rows))


if __name__ == '__main__':
    main()
