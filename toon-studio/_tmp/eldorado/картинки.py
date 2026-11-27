# Список картинок «Эльдорадо» (Flow, Nano Banana 2.1, 16:9). Пишет картинки.json [{scene, name, prompt}] и печатает
# массив сцен для flow_generate. Порядок = scene-01.. в Flow-проекте eldorado-img.
import json
STYLE = ('cinematic painted digital illustration, moody historical documentary look, rich detail, dramatic volumetric light, '
         'deep jungle greens, warm gold and stone, film grain, 16:9, no text, no letters, no watermark.')
P = [
 # 0 hook
 ('e0-01-graves', 'Rusted conquistador helmets and broken swords on overgrown graves in a dark jungle, mist, ominous'),
 ('e0-02-burning', 'Spanish conquistadors on horseback riding past a burning indigenous village at dusk, smoke and embers'),
 ('e0-03-army', 'A long column of 16th-century Spanish soldiers and native porters marching into an endless misty rainforest, aerial view'),
 ('e0-04-lake-drained', 'Workers in 1900s clothes standing on the cracked muddy bottom of a half-drained round mountain lake'),
 ('e0-05-lidar-night', 'A small survey airplane flying over the dark Amazon rainforest at night firing thin green laser beams down into the canopy'),
 ('e0-06-cave', 'Three Colombian farmers in 1969 with a lantern discovering a glint of gold inside a clay pot in a dark mountain cave'),
 ('e0-07-raft', 'Close-up of a small ancient Muisca golden votive raft with a crowned chief figure and attendants, glowing on black velvet, museum lighting'),
 ('e0-08-mirage', 'A shimmering mirage of a golden city with golden roofs rising out of jungle mist at sunrise, dreamlike'),
 # 1 golden man
 ('e1-01-andes', 'Green highland plateau of the Colombian Andes with small round thatched Muisca villages and fields, clouds'),
 ('e1-02-goldsmith', 'A Muisca goldsmith casting small gold figurines in a clay mould by firelight, close-up of molten gold'),
 ('e1-03-sun', 'Muisca priests raising golden offerings toward the rising sun on a mountain, rays of light'),
 ('e1-04-resin', 'Attendants covering a young Muisca chief in sticky resin by torchlight before a ceremony'),
 ('e1-05-gold-dust', 'A Muisca chief covered head to toe in shining gold dust, glowing like a living sun, portrait, dark background'),
 ('e1-06-raft-lake', 'A golden chief on a reed raft piled with gold and emeralds floating to the middle of a perfectly round crater lake at dawn, crowds and smoke on the shore'),
 ('e1-07-sinking', 'Underwater view of golden ornaments and emeralds sinking into dark green lake water, rays of light from above'),
 ('e1-08-diving', 'The golden chief diving into the dark lake, gold dust washing off his skin in glittering clouds underwater'),
 # 2 rumour
 ('e2-01-march', 'Spanish conquistadors in armour with horses climbing steep Andean mountain trails in 1537, clouds below'),
 ('e2-02-battle', 'Clash between Spanish soldiers with steel swords and Muisca warriors with spears on a highland plain, dust, not gory'),
 ('e2-03-loot', 'Conquistadors piling gold ornaments and emeralds on a table by candlelight, greedy faces'),
 ('e2-04-vision', 'A vision of a city with golden roofs and golden streets floating in the clouds above the jungle, imagined by a conquistador'),
 ('e2-05-pointing', 'An indigenous guide pointing toward distant blue jungle mountains while Spanish soldiers look, sunset'),
 ('e2-06-ranges', 'Endless ranges of jungle-covered mountains fading into haze, one behind another'),
 # 3 expedition of death
 ('e3-01-quito', 'The small colonial town of Quito in the Andes in 1541, an expedition gathering with horses, pigs and dogs'),
 ('e3-02-column', 'A huge expedition column descending from the Andes into cloud forest: Spaniards, thousands of native porters, pigs and dogs'),
 ('e3-03-rain', 'Exhausted conquistadors in rotting clothes trudging through jungle mud in heavy rain'),
 ('e3-04-starving', 'Starving Spanish soldiers boiling leather belts and shoe soles in a pot by a small fire in the jungle at night'),
 ('e3-05-graves', 'Simple crosses and graves of native porters along a jungle trail, sad and quiet, mist'),
 ('e3-06-boat', 'Spanish soldiers building a small wooden brigantine boat on a muddy jungle riverbank'),
 ('e3-07-orellana-leaves', 'A small boat with Spanish soldiers drifting away down a wide jungle river into the unknown'),
 ('e3-08-return', 'Ragged starving survivors of an expedition stumbling back into a mountain town'),
 # 4 the river
 ('e4-01-amazon', 'The enormous brown Amazon river as wide as a sea, a tiny boat on it, aerial view'),
 ('e4-02-banks', 'Many indigenous villages, fields and smoke along the banks of the Amazon in 1542, canoes, crowded and alive'),
 ('e4-03-warriors', 'Indigenous warriors with bows on the riverbank attacking a Spanish boat, long hair, arrows flying'),
 ('e4-04-ocean', 'The mouth of the Amazon river meeting the Atlantic ocean, a small boat reaching the open sea'),
 ('e4-05-empty', 'The same Amazon riverbank years later: empty dense jungle, no villages, eerie silence'),
 ('e4-06-orellana', 'Portrait of a weathered Spanish captain with an eyepatch in a battered helmet, 16th century, jungle background'),
 ('e4-07-map', 'Antique painted map of South America with rivers and jungles, sea monsters, without any writing'),
 # 5 wrath of god
 ('e5-01-boats', 'Several wooden boats of a Spanish expedition on a dark Amazon river in 1560, rain'),
 ('e5-02-madness', 'A wild-eyed bearded conquistador staring madly in the dark jungle, firelight on his face'),
 ('e5-03-tent', 'Shadow of a man with a dagger on the wall of a tent at night, ominous, not gory'),
 ('e5-04-wrath', 'A furious conquistador standing on a river raft raising his sword against a stormy sky, soldiers fearful'),
 ('e5-05-surround', 'Royal Spanish soldiers with muskets surrounding a small fort at dawn'),
 ('e5-06-candle', 'A rosary and a candle on a rough wooden table in a dark room, grief, quiet'),
 # 6 drain the lake
 ('e6-01-guatavita', 'Aerial view of Lake Guatavita, a perfectly round green crater lake surrounded by Andean forest'),
 ('e6-02-notch', 'Hundreds of 16th-century indigenous workers cutting a deep notch into the rim of a crater lake, water pouring out'),
 ('e6-03-emerald', 'A muddy hand holding a huge raw emerald the size of an egg, close-up'),
 ('e6-04-collapse', 'A landslide collapsing the walls of a cut in a crater rim, workers fleeing'),
 ('e6-05-notch-today', 'A large V-shaped notch still visible in the rim of a round crater lake today, aerial view'),
 ('e6-06-pumps', 'Edwardian engineers with steam pumps and a tunnel draining a mountain lake in 1910'),
 ('e6-07-mud', 'Men in 1910 hats standing helplessly on the hard sun-baked cracked mud bottom of a drained lake'),
 ('e6-08-auction', 'An auction room in London in 1911 with Muisca gold artifacts on display and gentlemen bidding'),
 # 7 Raleigh
 ('e7-01-raleigh', 'An Elizabethan courtier explorer with pearl earring and ruff collar, oil portrait style'),
 ('e7-02-orinoco', 'English sailing ships and boats on the Orinoco river with distant waterfalls and tepuis'),
 ('e7-03-manoa', 'Imagined golden city of Manoa on the shore of a vast lake, glowing at sunset'),
 ('e7-04-tower', 'An old man writing by candlelight in a stone prison cell in the Tower of London'),
 ('e7-05-fort', 'Night attack by English soldiers on a Spanish fort on a jungle river, musket smoke and fire'),
 ('e7-06-scaffold', 'A scaffold in a London square in 1618, a crowd watching, grey sky, solemn, not gory'),
 # 8 Fawcett
 ('e8-01-fawcett', 'A British explorer in 1925 with a wide hat and moustache, with his young son and a friend, at the edge of the Brazilian jungle'),
 ('e8-02-letter', 'A handwritten letter on a camp table next to an oil lamp and a compass, 1925'),
 ('e8-03-into', 'Three men with backpacks walking into a wall of dense green jungle, seen from behind'),
 ('e8-04-camp', 'An abandoned jungle campsite with a cold fire and a hanging hammock, overgrown'),
 ('e8-05-search', 'A 1930s search party with canoes on a jungle river looking for lost explorers'),
 ('e8-06-night', 'Dark Amazon jungle at night with glowing eyes and mist'),
 # 9 what the jungle hid
 ('e9-01-plane', 'A small plane flying over the rainforest with a glowing laser scanning grid projected onto the canopy'),
 ('e9-02-map', 'A 3D lidar terrain map glowing on a screen revealing rectangular earthen platforms and straight roads hidden under the forest'),
 ('e9-03-city', 'Reconstruction of an ancient Amazonian city 2500 years ago: earthen platforms with wooden houses, plazas and straight raised roads in a green valley'),
 ('e9-04-roads', 'Straight wide raised earthen roads connecting settlements across a jungle valley, aerial reconstruction'),
 ('e9-05-disease', 'A sick indigenous village with people lying in hammocks, smoke, sorrow, 16th century, tasteful'),
 ('e9-06-swallowed', 'An abandoned indigenous village being swallowed by jungle, roofs collapsing, vines'),
 ('e9-07-terra-preta', 'Hands holding rich black soil with pottery shards, Amazon terra preta, close-up'),
 # 10 versions
 ('e10-a', 'A golden raft on a dark round lake at night under stars, golden glow beneath the water'),
 ('e10-b', 'Ruins of earthen mounds of an ancient Amazon city overgrown by giant trees, sunbeams'),
 ('e10-c', 'A hidden lost Inca city of stone and gold in cloud forest on a jungle mountain, mysterious'),
 ('e10-three', 'Three paths splitting in a jungle: one to a golden lake, one to ancient mounds, one into a misty mountain'),
 ('e10-final', 'Golden sunset light over the endless Amazon rainforest, a sense of an unsolved mystery, epic final shot'),
]
out = [{'scene': 'scene-%02d' % (i + 1), 'name': n, 'prompt': p + '. ' + STYLE} for i, (n, p) in enumerate(P)]
json.dump(out, open('/Users/makentosh/Brigada/toon-studio/_tmp/eldorado/картинки.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(out))
