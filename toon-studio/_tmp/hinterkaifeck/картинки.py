# Список картинок «Хинтеркайфек» (Google Flow, Nano Banana 2.1, 16:9, 0 кредитов).
# Пишет картинки.json [{batch, scene, name, prompt, refs}]. Реальных людей в лицо не рисуем: силуэты, со спины, в тени, руки.
# Убийства не показываем — только пустые места, двери, сено, свет. Одна очередь «hinterkaifeck-img».
import json, os

D = os.path.dirname(os.path.abspath(__file__))

STYLE = ('cinematic painted digital illustration, dark documentary horror look, rural Bavaria 1922, '
         'rich detail, dramatic volumetric light, cold grey-blue late winter light with warm amber oil-lamp glow, deep shadows, '
         'muted desaturated earth tones with dark red accents, film grain, 16:9, no text, no letters, no writing, no logos, no watermark.')
NIGHT = ('cinematic painted digital illustration, dark horror look, rural Bavaria 1922, moonless night, deep blue-black shadows, '
         'single warm oil-lamp or lantern glow, mist, film grain, 16:9, no text, no letters, no writing, no logos, no watermark.')
ARCHIVE = ('cinematic painted digital illustration, documentary look, 1920s Germany police archive mood, sepia and grey tones, '
           'warm desk-lamp light, dust in the air, film grain, 16:9, no text, no letters, no readable writing, no logos, no watermark.')
FARM = ('a lonely small Bavarian farmstead from the 1860s: a long low single-storey whitewashed house with a stable under the same '
        'steep tiled roof, a large dark wooden barn attached at a right angle forming an L shape, one long continuous attic under the roof')

P = [
    # 0 крючок
    ('h0-01-farm-forest', f'{FARM}, standing alone at the edge of a dense dark pine forest, patchy late snow on the fields, grey dawn', STYLE),
    ('h0-02-door-dawn', 'A heavy wooden farmhouse door opening onto a snowy yard at dawn, a man\'s silhouette in a 1920s farmer coat seen from behind in the doorway', STYLE),
    ('h0-03-footprints', 'Fresh deep boot footprints in new snow leading out of a dark pine forest straight toward the viewer, low angle, cold dawn light', STYLE),
    ('h0-04-no-return', 'Wide shot: a single line of footprints in snow coming from the forest edge to a lonely farmhouse wall, and no footprints going back, eerie stillness', STYLE),
    ('h0-05-attic-ceiling', 'Inside a dark 1920s farmhouse bedroom at night, looking up at old wooden ceiling planks, dust falling through a crack as if someone walks above', NIGHT),
    ('h0-06-lantern-ladder', 'A hand holding an old oil lantern at the top of a steep wooden ladder, peering into a huge dark attic full of hay, empty', NIGHT),
    ('h0-07-six-chairs', 'An empty farmhouse kitchen table with six wooden chairs, a child\'s small chair among them, cold grey light, nobody there', STYLE),
    ('h0-08-smoke-chimney', f'{FARM} at dusk seen from far across a field, a thin line of smoke rising from the chimney, one dim window glowing, ominous', STYLE),
    ('h0-09-cows-fed', 'Inside a dim old stable, cows eating fresh hay from a wooden trough, a lantern hanging, a strange calm, no people visible', NIGHT),
    ('h0-10-folders', 'A tall stack of old police case folders tied with string on a wooden desk, a 1920s desk lamp, dust', ARCHIVE),
    ('h0-11-title', f'{FARM} at night under a black sky, the forest behind like a wall, faint lantern light in one attic gap under the roof tiles', NIGHT),
    # 1 хутор за лесом
    ('h1-01-bavaria', 'Aerial view of rolling Bavarian countryside in early spring 1922, fields with patches of snow, small villages, a church spire in the distance', STYLE),
    ('h1-02-village', 'A small Bavarian village of the 1920s with whitewashed houses and an onion-domed church tower, muddy road, grey sky', STYLE),
    ('h1-03-road-forest', 'A narrow dirt road leading out of a village toward a dark forest, a lonely farm visible far away at the forest edge', STYLE),
    ('h1-04-farm-wide', f'{FARM}, wide establishing shot, nothing around it but fields and forest, grey overcast sky', STYLE),
    ('h1-05-farm-plan', f'Bird\'s-eye painted view of {FARM}, clearly showing the L shape of house and barn, a small yard, the forest close by', STYLE),
    ('h1-06-attic-long', 'A very long dark attic under a steep tiled roof, thick hay covering the floor, wooden beams receding into darkness, thin slivers of light between tiles', NIGHT),
    ('h1-07-old-man-back', 'An old Bavarian farmer in his sixties in a 1920s work coat and hat, seen from behind, standing in a muddy farmyard looking at his fields', STYLE),
    ('h1-08-old-woman-hands', 'Close-up of an old woman\'s wrinkled hands peeling potatoes over a wooden bowl in a dim farmhouse kitchen, 1920s', STYLE),
    ('h1-09-widow-window', 'A woman in her thirties in a dark 1920s dress and headscarf, seen from behind, standing at a small farmhouse window looking out at the forest', STYLE),
    ('h1-10-children-shoes', 'A pair of small child\'s boots and a tiny pair of toddler shoes standing by a farmhouse door, 1920s', STYLE),
    ('h1-11-animals', 'Cows and pigs in an old stone-and-wood stable, a horse in a stall, a farm dog lying in straw, warm lantern light', STYLE),
    ('h1-12-gossip', 'Villagers in 1920s Bavarian clothes whispering together outside a church, seen from behind and in shadow, looking toward a distant farm', STYLE),
    # 2 тёмная тайна
    ('h2-01-wedding', 'A faded 1914 wedding photograph look: a couple in Bavarian wedding clothes standing stiffly, faces blurred and out of focus, painted', ARCHIVE),
    ('h2-02-soldiers', 'German soldiers of 1914 in spiked helmets marching away down a village road, seen from behind, a woman watching in the distance', STYLE),
    ('h2-03-trenches', 'A muddy World War One trench in France in winter 1914, barbed wire, smoke, grey sky, no gore', STYLE),
    ('h2-04-letter', 'A woman\'s hands holding an official 1914 death notice letter with a black border, the writing unreadable, a candle nearby', ARCHIVE),
    ('h2-05-cradle', 'A simple wooden cradle in a dark farmhouse room, winter light from a small window, 1915', STYLE),
    ('h2-06-courtroom', 'A 1915 provincial German courtroom, a judge\'s bench with a crucifix, two figures seen from behind on the defendants\' bench, cold light', ARCHIVE),
    ('h2-07-prison', 'A narrow prison cell window with iron bars, grey light, an empty bench, 1915 Bavaria', ARCHIVE),
    ('h2-08-empty-road', f'A muddy road leading to {FARM} with nobody on it, weeds, a broken fence, people avoid this place', STYLE),
    ('h2-09-neighbour', 'A man in his forties in a 1920s village-head suit and hat, seen from behind, walking along a field path toward a lonely farm', STYLE),
    ('h2-10-two-shadows', 'Two shadows of a man and a woman cast on a whitewashed farm wall by a lantern, close together, night', NIGHT),
    ('h2-11-baby-question', 'A toddler\'s small wooden toy horse on a farmhouse floor in a ray of light, a big dark empty room around it', STYLE),
    ('h2-12-knot', 'A thick old rope tied in a tight complicated knot hanging on a barn wall, dramatic light', STYLE),
    # 3 странности
    ('h3-01-maid-leaves', 'A young maid in a 1920s apron and shawl walking away from a farm with a small suitcase, seen from behind, autumn fog', STYLE),
    ('h3-02-attic-noise', 'A small maid\'s bedroom at night, a candle, a woman sitting up in bed in shadow, looking up at the ceiling in fear', NIGHT),
    ('h3-03-winter', f'{FARM} buried in winter snow, ice on the windows, a dark sky, total isolation', STYLE),
    ('h3-04-newspaper', 'A folded 1920s German city newspaper lying on the frozen ground near a farmhouse wall, the print unreadable and blurred', STYLE),
    ('h3-05-newspaper-hand', 'An old farmer\'s rough hand picking up a folded newspaper from the snow, the headline blurred and unreadable', STYLE),
    ('h3-06-postman', 'A 1920s rural postman with a leather bag walking a country road, seen from behind, far away', STYLE),
    ('h3-07-key-nail', 'An empty iron nail on a farmhouse door frame where a big old key used to hang, its faint outline left in the dust', STYLE),
    ('h3-08-broken-lock', 'A broken old iron padlock hanging open on the wooden door of a farm machine shed, scratches in the wood', STYLE),
    ('h3-09-man-trees', 'A dark figure of a man standing between pine trees at the forest edge, watching a distant farm, face completely in shadow, mist', NIGHT),
    ('h3-10-snow-falls', 'Fresh snow falling at night over a farmyard, a lantern by the stable door, soft silence', NIGHT),
    ('h3-11-tracks-close', 'Close-up of fresh boot prints in clean snow, sharp edges, leading toward a farm wall, dawn', STYLE),
    ('h3-12-circle-house', 'An old farmer seen from behind walking around the corner of his farmhouse in the snow, searching the ground, only his own footprints and the strange ones', STYLE),
    ('h3-13-ceiling-steps', 'Looking up from a dark farmhouse room: lamp light trembling, old wooden ceiling boards, a thin stream of hay dust falling between them', NIGHT),
    ('h3-14-attic-search', 'An old farmer holding a lantern high, walking through a huge dark attic with hay, beams casting long shadows, nobody else visible', NIGHT),
    ('h3-15-hay-lantern', 'Lantern light on a big pile of hay in a dark attic, the hay looks pressed down in one place, ominous', NIGHT),
    ('h3-16-neighbours-talk', 'Two farmers talking over a wooden fence in a 1920s village, seen from the side in silhouette, overcast', STYLE),
    ('h3-17-shut-door', 'A farmhouse door being shut from inside, the bolt sliding, warm light disappearing, night', NIGHT),
    # 4 новая служанка
    ('h4-01-two-women-road', 'Two women in 1920s Bavarian clothes, one with a bundle, walking along a field road toward a lonely farm at the forest edge, seen from behind, afternoon', STYLE),
    ('h4-02-maid-room', 'A tiny maid\'s room in a farmhouse: a narrow bed, a small suitcase open on it, a candle, a crucifix on the wall, evening light', STYLE),
    ('h4-03-sister-leaves', 'A woman walking away alone along a darkening field road, the farm behind her with lit windows, dusk', STYLE),
    ('h4-04-dusk-farm', f'{FARM} at dusk, the last light fading, the forest turning black, one window lit', NIGHT),
    ('h4-05-stable-door', 'The inner wooden door from a dark stable into a huge black barn, slightly open, lantern light spilling in, absolutely nobody', NIGHT),
    ('h4-06-barn-dark', 'Inside a vast dark wooden barn at night, hay, beams, a lantern on the ground casting a small circle of light, the rest pitch black', NIGHT),
    ('h4-07-one-by-one', 'Four lanterns lined up on the floor of a dark stable passage, leading toward a barn door, ominous, no people', NIGHT),
    ('h4-08-silent-house', 'A farmhouse living room at night with a ticking wall clock and a wooden table, quiet, the door to the dark stable closed', NIGHT),
    ('h4-09-light-out', 'An oil lamp on a farmhouse table, its flame just gone out, a curl of smoke rising in darkness', NIGHT),
    ('h4-10-empty-cot', 'An empty child\'s wooden cot in a dark bedroom, a small blanket, moonlight through a window, no child visible', NIGHT),
    ('h4-11-mattock', 'An old farm mattock leaning against a dark barn wall, wooden handle, iron head, in shadow, no blood', NIGHT),
    ('h4-12-night-farm', f'{FARM} in deep night, all windows dark, the forest black behind, total silence', NIGHT),
    # 5 четыре дня
    ('h5-01-coffee-sellers', 'Two travelling coffee sellers in 1920s coats with bags knocking on a farmhouse door, seen from behind, grey morning', STYLE),
    ('h5-02-open-gate', 'The wide wooden gate of a farm shed standing open, darkness inside, a muddy yard, grey morning', STYLE),
    ('h5-03-church', 'Inside a Bavarian village church in 1922 during Sunday mass, villagers in pews seen from behind, one pew empty', STYLE),
    ('h5-04-school', 'A 1920s village schoolroom with wooden desks, children seen from behind, one small desk empty by the window', STYLE),
    ('h5-05-postman-farm', 'A postman putting letters into a box at the gate of a silent farm, seen from behind, the farm windows dark', STYLE),
    ('h5-06-chimney-night', f'{FARM} at night with dark smoke rising from the chimney, a faint glow in the stove room window', NIGHT),
    ('h5-07-milk-pail', 'A wooden milk pail full of fresh milk standing in a dim stable next to a cow, a lantern, no people', NIGHT),
    ('h5-08-bread', 'A farmhouse kitchen table with a half-eaten loaf of bread, crumbs, a knife, a cup, at night by a dim lamp', NIGHT),
    ('h5-09-pantry-meat', 'A dark farm pantry with smoked ham hanging, a fresh cut on one piece, a knife on the shelf', NIGHT),
    ('h5-10-stove', 'An old tiled farmhouse stove with fire glowing through the iron door, in an empty dark room', NIGHT),
    ('h5-11-hay-spread', 'A dark attic floor with hay spread evenly and thickly over the boards like a carpet, lantern light, eerie', NIGHT),
    ('h5-12-tile-gap', 'Inside a dark attic: a gap where roof tiles have been pushed aside, a narrow view down onto a farmyard, cold light through it', NIGHT),
    ('h5-13-two-hollows', 'Two body-shaped hollows pressed into a pile of hay in a dark attic, as if two people lay there for a long time, lantern light', NIGHT),
    ('h5-14-above-heads', 'Cutaway painted view of a farmhouse at night: a dim lit room below and, right above it in the dark attic, a shadowy shape lying in the hay', NIGHT),
    # 6 находка
    ('h6-01-mechanic', 'A 1920s mechanic in work clothes with a toolbox, seen from behind, repairing an old fodder-chopping machine with a motor in a farm shed', STYLE),
    ('h6-02-dog', 'A farm dog on a chain barking in a muddy yard, the barn door behind it half open, grey day', STYLE),
    ('h6-03-barn-door-open', 'A large barn door standing half open, deep darkness inside, daylight outside, nobody', STYLE),
    ('h6-04-boys-run', 'Two village boys in 1920s clothes running along a field path toward a lonely farm, seen from behind, late afternoon', STYLE),
    ('h6-05-three-men', 'Three men in 1920s farmer clothes walking toward a lonely farm at dusk, seen from behind, tense', STYLE),
    ('h6-06-barn-discovery', 'Three men seen from behind, standing frozen in the doorway of a dark barn, lantern raised, the inside hidden in darkness, no bodies visible', NIGHT),
    ('h6-07-house-door', 'A man seen from behind stepping alone into a dark farmhouse corridor holding a lantern', NIGHT),
    ('h6-08-gendarmes', '1920s Bavarian gendarmes in uniforms and spiked helmets arriving at a farm at night with lanterns and a horse cart', NIGHT),
    ('h6-09-police-dogs', '1920s Munich policemen with two police dogs on leashes at a farm gate at night, seen from behind, lanterns', NIGHT),
    ('h6-10-crowd', 'A crowd of villagers in 1920s clothes trampling a muddy farmyard and crowding at a farmhouse door, seen from behind, chaos', STYLE),
    ('h6-11-kitchen-crowd', 'Strangers in a farmhouse kitchen, a pot cooking on the stove, people standing around eating, 1920s, unsettling', STYLE),
    ('h6-12-money', 'An open wooden chest in a farmhouse bedroom with bundles of old German banknotes and a few gold coins, untouched, lamp light', STYLE),
    # 7 расследование
    ('h7-01-inspector', 'A 1920s Munich police inspector in a dark coat and hat seen from behind, studying a farmyard, notebook in hand', ARCHIVE),
    ('h7-02-interrogation', 'A 1920s police interrogation room, a desk lamp, an inspector seen from behind facing a man in shadow, typewriter', ARCHIVE),
    ('h7-03-reward', 'An old 1922 German wanted poster nailed to a wooden wall, the writing blurred and unreadable, a large number-like design', ARCHIVE),
    ('h7-04-many-faces', 'A wall covered with dozens of faded 1920s portrait photos pinned up, all faces blurred, strings between them, police office', ARCHIVE),
    ('h7-05-seance', 'A 1920s seance: a dark room, candles on a round table, hands of several people around it, a covered box in the centre', NIGHT),
    ('h7-06-bombed', 'A 1944 bombed German city at night, ruins and fire, smoke rising, archive building burning', STYLE),
    ('h7-07-gump', 'A shadowy man in a 1920s paramilitary coat and cap seen from behind in a doorway, face hidden, grey light', ARCHIVE),
    ('h7-08-deathbed', 'An old woman\'s hand on a white bed sheet, a candle and a crucifix on the bedside table, 1951, quiet', ARCHIVE),
    ('h7-09-demolition', f'Workers in 1923 demolishing {FARM}, roof tiles removed, bare beams against a grey sky', STYLE),
    ('h7-10-mattock-found', 'A worker\'s hands lifting an old rusty mattock out of hay between attic beams, dark stains on it, dramatic light from the open roof', STYLE),
    ('h7-11-penknife', 'A small old folding penknife lying in hay, a ray of light on it', STYLE),
    ('h7-12-field-memorial', 'An empty field at the forest edge where a farm once stood, a small stone memorial with a cross, spring grass, grey sky', STYLE),
    ('h7-13-folders-close', 'Old police case folders being tied shut and put on a shelf in a dark archive, 1955', ARCHIVE),
    ('h7-14-cadets', 'Young police cadets of 2007 seen from behind around a table with old yellowed case files and photos, modern classroom, lamp light', 'cinematic painted digital illustration, documentary look, modern 2007 classroom, warm lamp light, film grain, 16:9, no text, no readable writing, no logos, no watermark.'),
    ('h7-15-sealed-envelope', 'A sealed envelope with a red wax seal lying on top of an old case file, the name hidden, dramatic light', ARCHIVE),
    # 8 версии
    ('h8-01-version-a', 'A man in 1920s village-head clothes standing in the ruins of a demolished farm, seen from behind, frozen ground, grey sky', STYLE),
    ('h8-02-frozen-ground', 'Close-up of frozen hard ground with a shovel that could not dig into it, frost crystals', STYLE),
    ('h8-03-court-win', 'A 1930s German courtroom, a man seen from behind standing calmly before the judge, quiet', ARCHIVE),
    ('h8-04-version-b', 'A lone soldier in a torn 1914 German uniform walking along a misty road toward a village, seen from behind', STYLE),
    ('h8-05-pow-camp', 'A 1940s prisoner of war camp in snow, barbed wire, wooden barracks, a silhouette of an officer in a long coat', STYLE),
    ('h8-06-version-c', 'A dark stranger in a long coat stepping out of a pine forest at night toward a distant lit farmhouse, seen from behind', NIGHT),
    ('h8-07-attic-eye', 'View through a narrow gap between roof tiles from inside a dark attic, looking down at a farmyard where a lantern moves', NIGHT),
    # 9 финал
    ('h9-01-empty-field', 'An empty field at the edge of a dark pine forest at dusk, nothing left of the farm, wind in the grass', STYLE),
    ('h9-02-papers', 'Hundreds of old yellowed interrogation papers spread across a desk, a magnifying glass, desk lamp', ARCHIVE),
    ('h9-03-last-tracks', 'Footprints in fresh snow leading from a dark forest toward the viewer, at night, a faint lantern glow ahead', NIGHT),
    ('h9-04-final-farm', f'{FARM} at night under a black sky, faint lantern light in one attic gap under the roof tiles, the forest like a wall behind', NIGHT),
]

# две очереди Flow (не больше 100 за раз): 1 = главы 0–4 (hinterkaifeck-img1), 2 = главы 5–9 (hinterkaifeck-img2)
out, k = [], {1: 0, 2: 0}
for n, p, s in P:
    b = 1 if n[1] in '01234' else 2
    k[b] += 1
    out.append({'batch': b, 'scene': f'scene-{k[b]:02d}', 'name': n, 'prompt': f'{p}. {s}', 'refs': []})
json.dump(out, open(os.path.join(D, 'картинки.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(out), 'картинок')
