# Список картинок «Роопкунд» (Google Flow, Nano Banana 2.1, 16:9, 0 кредитов).
# Пишет картинки.json [{batch, scene, name, prompt, refs}]. Людей — со спины, силуэтами, без лиц. Кости — без натурализма
# (старые, белые, полузанесённые, как в документальном кино). Две очереди Flow: 1 = главы 0–4, 2 = главы 5–9.
import json, os

D = os.path.dirname(os.path.abspath(__file__))

STYLE = ('cinematic painted digital illustration, dark documentary mystery look, high Himalaya, rich detail, dramatic volumetric light, '
         'cold blue-grey glacier light with pale gold sun, thin mist, deep shadows, muted desaturated tones with dark turquoise accents, '
         'film grain, 16:9, no text, no letters, no writing, no logos, no watermark.')
STORM = ('cinematic painted digital illustration, dark horror look, high Himalaya in a violent storm, black clouds, hail and snow, '
         'flashes of cold light, film grain, 16:9, no text, no letters, no writing, no logos, no watermark.')
LAB = ('cinematic painted digital illustration, documentary look, modern genetics laboratory and archive mood, cool white and teal light, '
       'clean surfaces, film grain, 16:9, no text, no letters, no readable writing, no logos, no watermark.')
OLD = ('cinematic painted digital illustration, historical documentary look, warm sepia and dusty gold tones, soft volumetric light, '
       'film grain, 16:9, no text, no letters, no writing, no logos, no watermark.')
LAKE = ('a tiny round glacial lake at about 5000 metres in the Himalaya, lying in a rocky bowl below the huge snowy Trishul peak, '
        'partly frozen, scree slopes and boulders around it')

P = [
    # 0 крючок
    ('r0-01-peaks', 'Endless chain of giant snowy Himalayan peaks above a sea of clouds at dawn, thin air, immense scale', STYLE),
    ('r0-02-lake-ice', f'{LAKE}, almost completely covered with cracked white ice and snow, wind blowing snow', STYLE),
    ('r0-03-lake-thaw', f'{LAKE} in late summer, the ice melting, dark turquoise water showing, grey stones on the shore', STYLE),
    ('r0-04-shore-bones', 'Shallow clear icy water at the edge of a mountain lake, old white human bones half buried in pebbles and gravel under the water, documentary, not gory', STYLE),
    ('r0-05-many-bones', 'A wide rocky lakeshore at high altitude scattered with many old weathered white bones among boulders, mist, documentary, not gory', STYLE),
    ('r0-06-skull-stones', 'An old weathered human skull lying among grey stones and lichen beside icy water, sombre, documentary, not gory', STYLE),
    ('r0-07-slippers-rings', 'Old crumbling leather slippers, a few simple metal rings and a rusty iron spearhead lying among stones by a frozen lake', STYLE),
    ('r0-08-question', f'{LAKE} at dusk under a dark sky, the bowl in deep shadow, one last light on the peak, ominous', STYLE),
    ('r0-09-dna-helix', 'A glowing DNA double helix rising like smoke above an icy mountain lake at night, mysterious', LAB),
    ('r0-10-title', f'{LAKE} at night under stars, faint pale glow of bones along the shore, the peak black against the sky', STYLE),
    # 1 озеро у края неба
    ('r1-01-india-map', 'Painted relief map of northern India with the Himalaya range, a small glowing point marking a lake in the mountains of Uttarakhand', OLD),
    ('r1-02-himalaya-valley', 'Green Himalayan valley with terraced fields and a small village far below gigantic snowy mountains', STYLE),
    ('r1-03-trishul', 'The huge three-headed snowy Himalayan peak Trishul, shaped like a trident, towering over glaciers, golden light on its summits', STYLE),
    ('r1-04-lake-wide', f'{LAKE}, wide establishing shot, the lake looks tiny compared to the mountains, summer', STYLE),
    ('r1-05-lake-close', 'A small round high mountain lake seen from its rim, about forty metres across, shallow dark water, stones all around', STYLE),
    ('r1-06-trek-forest', 'A narrow trekking path through a dense misty Himalayan forest, a few hikers with backpacks seen from behind far ahead', STYLE),
    ('r1-07-meadow', 'Wide high alpine meadow in the Himalaya with golden autumn grass, a trail crossing it toward snowy peaks', STYLE),
    ('r1-08-rock-snow', 'A bleak zone of bare rock, scree and snow patches in the high Himalaya, wind, nothing alive', STYLE),
    ('r1-09-steep-climb', 'Climbers seen from behind struggling up a steep scree and snow slope at high altitude, rope, breath steaming', STYLE),
    ('r1-10-blizzard', 'Sudden blizzard sweeping over a high mountain pass, a lone hiker seen from behind leaning into the wind', STORM),
    ('r1-11-lake-frozen', f'{LAKE} completely buried in snow in winter, only a faint round outline visible, white silence', STYLE),
    ('r1-12-no-one', 'An empty high mountain landscape with no trails, no houses, no people, only rocks, snow and sky', STYLE),
    # 2 находка
    ('r2-01-1942', 'Faded wartime mood: a 1940s British colonial office in India with a ceiling fan, maps on the wall, papers, warm light', OLD),
    ('r2-02-ranger', 'A 1940s Indian forest ranger in khaki uniform and turban seen from behind, climbing a rocky Himalayan slope with a walking stick', STYLE),
    ('r2-03-ranger-lake', 'A 1940s forest ranger seen from behind standing on the rim above a small half-frozen mountain lake, frozen in shock', STYLE),
    ('r2-04-bones-water', 'View down into shallow clear water of a mountain lake: many old white bones lying on the bottom among stones, eerie, documentary, not gory', STYLE),
    ('r2-05-telegram', 'A 1940s telegraph office: an operator\'s hand on a Morse key, a typed message slip, wartime India, sepia', OLD),
    ('r2-06-ww2-map', 'A 1942 war map of Southeast Asia and India on a table with pins and arrows, an oil lamp, tense', OLD),
    ('r2-07-soldiers-snow', 'Imagined: a column of soldiers in 1940s uniforms trudging through deep Himalayan snow, seen from behind, ghostly and faded', STORM),
    ('r2-08-officers', 'British officers in 1940s uniforms seen from behind examining old bones on a rocky shore, mountains behind', STYLE),
    ('r2-09-old-bones', 'Close-up of very old, brittle, yellowed bone fragments on a cloth beside a 1940s notebook, documentary, not gory', OLD),
    # 3 что лежит в озере
    ('r3-01-scattered', 'High mountain lakeshore with countless old bones scattered and mixed among boulders and scree, seen from above, documentary, not gory', STYLE),
    ('r3-02-landslide', 'A rockslide of grey stones rolling down a steep slope above a small mountain lake, dust cloud', STYLE),
    ('r3-03-frozen-preserved', 'Old bones partly encased in clear blue glacier ice at the edge of a lake, frozen in time, documentary, not gory', STYLE),
    ('r3-04-artifacts', 'Archaeological find spread on a cloth: crumbling leather slippers, wooden objects, iron spearheads, simple rings, high altitude light', OLD),
    ('r3-05-imagine-shore', 'First-person view standing on a silent snowy lakeshore at 5000 metres, cold wind, thin ice on dark water, pale shapes beneath', STYLE),
    ('r3-06-travellers-ghost', 'Ghostly faded silhouettes of ancient travellers walking in a line along a mountain ridge toward a lake, seen from behind, mist', STYLE),
    ('r3-07-1950s-survey', '1950s scientists in wool coats seen from behind measuring bones laid out on a canvas sheet at a mountain camp, tents', OLD),
    ('r3-08-museum', 'Old museum storeroom shelves with wooden boxes of bones and labelled trays, dusty light', LAB),
    ('r3-09-village-elders', 'A Himalayan mountain village at evening, warm firelight from a house, an old man telling a story seen from behind to listeners', OLD),
    # 4 легенда
    ('r4-01-nanda-devi', 'The majestic snowy peak Nanda Devi glowing pink at sunrise above Himalayan ridges, sacred mood', STYLE),
    ('r4-02-goddess-snow', 'A huge faint shape of a serene goddess formed by clouds and snow above the Himalayan summits, mystical, painted', STYLE),
    ('r4-03-pilgrims-path', 'A long line of pilgrims with colourful flags and drums walking up a mountain path toward snowy peaks, seen from behind', STYLE),
    ('r4-04-king-procession', 'Legendary ancient Indian royal procession climbing a Himalayan pass: a king on a palanquin, servants, porters, musicians, seen from behind, painted like a legend', OLD),
    ('r4-05-queen', 'A legendary ancient Indian queen in rich garments seen from behind on a palanquin carried up a mountain trail, painted like a legend', OLD),
    ('r4-06-dancers', 'Legendary dancers and musicians celebrating on a high mountain meadow with drums, swirling colourful cloth, seen from a distance, painted like a legend', OLD),
    ('r4-07-sky-darkens', 'Black storm clouds suddenly rolling over a Himalayan pass, the light disappearing, a procession tiny below', STORM),
    ('r4-08-hail', 'Huge hailstones falling violently onto rocks and snow at high altitude, nowhere to hide, dramatic', STORM),
    ('r4-09-legend-end', 'After the storm: an empty frozen lakeshore covered with fresh hailstones, abandoned drums and cloth, silence, no bodies visible', STORM),
    ('r4-10-legend-book', 'An old illustrated manuscript page about a mountain goddess and a storm, painted miniature style, the writing unreadable', OLD),
]
P += [
    # 5 град
    ('r5-01-theories', 'Three ghostly translucent scenes over a mountain lake: soldiers, merchants with mules, sick travellers, painted montage', STYLE),
    ('r5-02-army', 'Ancient army with spears marching through a Himalayan storm, seen from behind, faded and ghostly', STORM),
    ('r5-03-merchants', 'A caravan of merchants with loaded mules caught in snow on a mountain pass, seen from behind', STORM),
    ('r5-04-epidemic', 'Exhausted travellers wrapped in blankets lying by a campfire at a cold mountain camp, sombre, faces hidden', STYLE),
    ('r5-05-expedition-2000s', '2000s scientific expedition with modern tents, cameras and orange jackets at a high mountain lake, seen from behind', STYLE),
    ('r5-06-film-crew', 'A documentary film crew seen from behind filming bones on a rocky lakeshore at high altitude, camera on tripod', STYLE),
    ('r5-07-skull-study', 'A scientist\'s gloved hands examining an old skull on a cloth with a magnifying glass, clinical, not gory', LAB),
    ('r5-08-hail-skull', 'Painted diagram: round hailstones falling from above toward a simple outline of a human head, scientific illustration style', LAB),
    ('r5-09-carbon', 'Glowing carbon atoms slowly fading like sand in an hourglass, scientific visualisation, dark background', LAB),
    ('r5-10-hourglass-bone', 'An antique hourglass with sand running, next to an old bone fragment on a lab bench, soft light', LAB),
    ('r5-11-850', 'A painted timeline stretching back into the past with a glowing mark far to the left, misty ancient mountains along it', OLD),
    ('r5-12-solved', f'{LAKE} on a calm clear day, deceptively peaceful', STYLE),
    # 6 ДНК
    ('r6-01-lab', 'Modern ancient-DNA clean room: researchers in full white suits and masks working under hoods, seen from behind', LAB),
    ('r6-02-samples', 'Rows of small labelled tubes with bone powder and tooth fragments in a lab rack, cool light', LAB),
    ('r6-03-uv', 'A bone fragment under violet ultraviolet light inside a sterile cabinet, eerie glow', LAB),
    ('r6-04-drill', 'Gloved hands drilling a tiny sample from an old bone, fine white powder, macro, clinical', LAB),
    ('r6-05-two-labs', 'Split image: a lab in India and a lab in America, identical white benches and machines, connected by a glowing line', LAB),
    ('r6-06-sequencer', 'A modern DNA sequencing machine with glowing panels and screens of coloured letters patterns, unreadable', LAB),
    ('r6-07-38', 'Thirty-eight small glowing points arranged in a grid on a dark screen, like stars, abstract', LAB),
    ('r6-08-three-groups', 'Abstract scientific chart of dots separating into three clearly different coloured clusters on a dark background, painted', LAB),
    ('r6-09-south-asia', 'A warm-coloured map of South Asia with a soft glow over India, painted', OLD),
    ('r6-10-mediterranean', 'A painted map with a glowing line stretching from the eastern Mediterranean islands across deserts to the Himalaya', OLD),
    ('r6-11-crete', 'The sunlit Greek island of Crete seen from the sea, white villages and rocky hills, blue water', OLD),
    ('r6-12-southeast-asia', 'A painted map with a glowing point in Southeast Asia and a thin line to the Himalaya', OLD),
    ('r6-13-world-lake', 'A small mountain lake as a glowing point on a globe, with lines arriving from far corners of the world', LAB),
    # 7 тысяча лет
    ('r7-01-dates', 'Painted timeline with two separate glowing clusters of marks a thousand years apart, mountains in the background', OLD),
    ('r7-02-medieval', 'Medieval Himalayan travellers in simple cloaks crossing a high pass around the year 800, seen from behind, painted', OLD),
    ('r7-03-1800-world', 'Montage of the year 1800: tall sailing ships at sea, a distant battle smoke, a British colonial fort in India, painted', OLD),
    ('r7-04-long-journey', 'A small group of 1800s travellers in Ottoman-era clothing crossing a vast desert toward distant snowy mountains, seen from behind', OLD),
    ('r7-05-climb-1800', 'A group of 1800s travellers in long coats and head wraps climbing a steep Himalayan slope in snow, seen from behind', STYLE),
    ('r7-06-thousand-years', 'Two ghostly groups of travellers walking toward the same small mountain lake from opposite sides, centuries apart, mist', STYLE),
    ('r7-07-men-women', 'Silhouettes of men and women travellers in a line seen from behind on a ridge, no faces, evening light', STYLE),
    ('r7-08-no-family', 'Abstract family-tree diagram with all branches broken and disconnected, painted on old paper, no text', OLD),
    ('r7-09-food', 'Still life on a rough wooden table: wheat ears, barley, rice and flatbread, inland farm kitchen, no fish', OLD),
    ('r7-10-tall-man', 'A very tall broad-shouldered traveller in an 1800s coat seen from behind standing among shorter companions on a mountain path', STYLE),
    ('r7-11-question', f'{LAKE} under heavy grey clouds, a lone set of old footprints leading to the shore, mysterious', STYLE),
    # 8 версии
    ('r8-01-pilgrimage', 'Modern Nanda Devi pilgrimage procession with flags and music winding along a high Himalayan ridge, seen from behind', STYLE),
    ('r8-02-temple', 'An ancient stone Himalayan temple with carved walls and worn inscriptions, prayer flags, morning light, writing unreadable', OLD),
    ('r8-03-hail-pilgrims', 'Pilgrims caught in a violent hailstorm on an exposed ridge, seen from behind, no shelter', STORM),
    ('r8-04-alexander', 'Ancient Greek-Macedonian soldiers with spears and plumed helmets marching across Asian mountains, painted like a fresco, ghostly', OLD),
    ('r8-05-ottoman', 'An 1800s Ottoman-era caravanserai courtyard with travellers, camels and bales, warm evening light, seen from a distance', OLD),
    ('r8-06-archive', 'Dusty colonial-era archive with stacks of old ledgers and letters, a lamp, someone\'s hand turning a yellowed page, unreadable', OLD),
    ('r8-07-trap', f'{LAKE} seen from above like a dark eye in the mountains, storm clouds gathering around it, ominous', STORM),
    ('r8-08-sun-burn', 'Blinding sun on snow at high altitude, a hiker seen from behind shielding their eyes, harsh light', STYLE),
    ('r8-09-sudden-storm', 'Within minutes black clouds swallow a sunny Himalayan pass, the trail disappearing in grey', STORM),
    ('r8-10-fallen', 'A lone backpack and a walking stick left on the snow near a mountain lake, no person, wind', STORM),
    # 9 финал
    ('r9-01-trekkers', 'Modern trekkers in colourful jackets seen from behind arriving at a small high mountain lake, phones raised to take photos', STYLE),
    ('r9-02-hand-bone', 'A tourist\'s hand reaching toward an old bone on the stones by a mountain lake, moral tension, not gory', STYLE),
    ('r9-03-mules', 'Mules loaded with sacks walking away down a mountain trail from a high lake, seen from behind, dusk', STYLE),
    ('r9-04-protection', 'A simple stone marker and rope barrier around a high mountain lakeshore, quiet, protective', STYLE),
    ('r9-05-empty-shore', 'An empty clean lakeshore at high altitude with only stones, the bones gone, melancholic', STYLE),
    ('r9-06-final-lake', f'{LAKE} at twilight, the last light on Trishul, mist over the water, quiet and haunting', STYLE),
    ('r9-07-night-stars', 'A tiny mountain lake under a sky full of stars and the Milky Way, faint pale shapes along the shore, silence', STYLE),
]

out, k = [], {1: 0, 2: 0}
for n, p, s in P:
    b = 1 if n[1] in '01234' else 2
    k[b] += 1
    out.append({'batch': b, 'scene': f'scene-{k[b]:02d}', 'name': n, 'prompt': f'{p}. {s}', 'refs': []})
json.dump(out, open(os.path.join(D, 'картинки.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(out), 'картинок', k)
