# Список картинок «Кольская сверхглубокая» (Google Flow, Nano Banana 2.1, 16:9, 0 кредитов).
# Пишет картинки.json [{batch, scene, name, prompt, refs}]. Героев с листами нет (реальных людей не рисуем в лицо),
# поэтому одна очередь «kolskaya-img».
import json, os

D = os.path.dirname(os.path.abspath(__file__))

STYLE = ('cinematic painted digital illustration, moody documentary look, Soviet Arctic 1970s-1980s, Kola Peninsula tundra, '
         'rich detail, dramatic volumetric light, cold blue-grey polar light with warm sodium-orange work lamps, deep shadows, '
         'muted desaturated tones with rust-red accents, film grain, 16:9, no text, no letters, no writing, no logos, no watermark.')
HELL = ('cinematic painted digital illustration, dark horror documentary look, deep red and black, volumetric smoke, film grain, '
        '16:9, no text, no letters, no writing, no watermark.')
MODERN = ('cinematic painted digital illustration, moody documentary look, rich detail, dramatic light, muted tones with rust-red '
          'accents, film grain, 16:9, no text, no letters, no writing, no logos, no watermark.')

P = [
    # 0 крючок
    ('k0-01-tundra', 'Endless snowy tundra under a dark grey Arctic sky, wind blowing snow over low rocks, a cluster of abandoned industrial buildings far away', STYLE),
    ('k0-02-ruins', 'Abandoned Soviet industrial building in the Arctic, broken windows, collapsed roof, rusted metal, snow drifting inside', STYLE),
    ('k0-03-cap', 'Close-up of a small rusty round steel cap welded shut and bolted onto a concrete floor among debris and snow, the only object in the frame', STYLE),
    ('k0-04-cap-wide', 'A small rusty welded steel cap in the middle of a cracked concrete floor of a ruined hall, cold light through holes in the roof', STYLE),
    ('k0-05-crosssection', 'Cutaway illustration of the Earth\'s crust: a tiny thin vertical shaft going straight down 12 kilometres through layered rock, the drilling tower on the surface looks microscopic', STYLE),
    ('k0-06-everest', 'Side by side comparison: Mount Everest standing above the ground and a thin borehole going even deeper below the ground, scale diagram painted', STYLE),
    ('k0-07-microphone', 'An old reel-to-reel tape recorder and a microphone on a long cable lowered into a dark round hole in the ground, red glow below', HELL),
    ('k0-08-screams', 'Faint ghostly distorted faces screaming in red smoke rising from a deep dark shaft, horror atmosphere', HELL),
    ('k0-09-workers', 'Silhouettes of Soviet drillers in padded jackets and helmets standing on a drilling platform at night, steam, orange work lights', STYLE),
    # 1 гонка в недра
    ('k1-01-coldwar', 'A Soviet rocket and an American rocket on opposite sides of a dark starry sky, cold war space race mood', MODERN),
    ('k1-02-sputnik', 'The first artificial satellite, a shiny metal sphere with four long antennas, orbiting above the Earth', MODERN),
    ('k1-03-moon', 'An astronaut boot print in grey lunar dust, the Earth rising above the Moon\'s horizon', MODERN),
    ('k1-04-underfoot', 'A person standing on a meadow, the ground below cut away to show deep dark unknown layers of rock fading into blackness', MODERN),
    ('k1-05-stars', 'A large old observatory telescope pointed at a sky full of stars and galaxies at night', MODERN),
    ('k1-06-seismic', 'A seismograph drawing jagged lines on a paper roll in a laboratory, lamp light, papers with wave diagrams', STYLE),
    ('k1-07-layers', 'Painted textbook-style cross-section of the Earth: crust of granite, then basalt, then the glowing mantle, clean and clear', MODERN),
    ('k1-08-mohole', 'An ocean drilling barge in rough grey sea in the 1960s, a drilling derrick on the deck, storm clouds', MODERN),
    ('k1-09-kola-map', 'Aerial view of the Kola Peninsula coast: rocky tundra, lakes and the Barents Sea, low winter sun', STYLE),
    ('k1-10-ancient-rock', 'Ancient pink and grey granite rock outcrops in the tundra with lichen, very old weathered stone', STYLE),
    ('k1-11-first-drill', 'A drill bit entering frozen rocky ground for the first time, workers in padded jackets watching, a Soviet red banner on the rig without writing', STYLE),
    ('k1-12-target', 'A long thin borehole diagram drawn on blueprint paper on a desk, a ruler and pencil, a lamp', STYLE),
    # 2 город на краю
    ('k2-01-zapolyarny', 'A small Soviet Arctic town of five-storey concrete apartment blocks in snow, factory chimneys, low polar light', STYLE),
    ('k2-02-polar-night', 'Polar night over the tundra: dark blue sky with green northern lights, a lit drilling tower in the distance', STYLE),
    ('k2-03-midnight-sun', 'Midnight sun hanging low over the summer tundra and lakes, a drilling tower on the horizon', STYLE),
    ('k2-04-shift', 'Soviet drillers in padded jackets and fur hats changing shifts at the foot of a drilling tower in snowfall, steam from their breath', STYLE),
    ('k2-05-lab', 'Soviet geologists in white coats in a lab examining rock samples under microscopes, 1980s equipment, notebooks', STYLE),
    ('k2-06-tower', 'A tall enclosed Soviet drilling tower in the Arctic tundra, its lights glowing against the dark sky, snow', STYLE),
    ('k2-07-rig', 'A huge Soviet drilling rig being assembled in the Arctic in 1974, cranes, trucks, workers, snow', STYLE),
    ('k2-08-pipes', 'Long steel drill pipes being screwed together on a drilling floor by workers with huge wrenches, oil and steam', STYLE),
    ('k2-09-bit', 'Close-up of a worn heavy rotary drill bit with steel teeth grinding through dark granite deep underground', STYLE),
    ('k2-10-narrow', 'A narrow round dark borehole seen from directly above, a gloved hand spread wide next to it for scale', STYLE),
    ('k2-11-trip', 'Workers pulling a long drill string up out of the borehole at night, stands of pipe racked in the tower, orange lamps', STYLE),
    ('k2-12-core', 'Long cylindrical rock core samples laid out in wooden boxes in rows, labelled with tags without writing, a geologist leaning over them', STYLE),
    # 3 рекорд
    ('k3-01-record', 'Soviet drilling crew celebrating at night on the drilling floor, raising fists, steam and lights', STYLE),
    ('k3-02-oklahoma', 'A tall American drilling rig in flat Oklahoma plains at sunset in the 1970s', MODERN),
    ('k3-03-twelve', 'Cutaway view of the borehole reaching twelve kilometres deep, deeper than an outline of the ocean trench beside it', STYLE),
    ('k3-04-trench', 'The dark deep ocean trench seen in cross-section, faint light from above fading into blackness', MODERN),
    ('k3-05-congress', 'A large conference hall in Moscow in 1984 filled with international scientists, a big screen with a drilling diagram, applause', STYLE),
    ('k3-06-visitors', 'Foreign scientists in winter coats visiting the Arctic drilling site, Soviet geologists showing them rock cores', STYLE),
    # 4 обрыв
    ('k4-01-lifting', 'Tense drillers watching the gauges as a drill string is lifted out of the hole, close-up of a needle dropping', STYLE),
    ('k4-02-broken', 'The broken twisted end of a steel drill pipe coming up out of the borehole, workers staring in shock', STYLE),
    ('k4-03-lost-pipes', 'Cutaway view: kilometres of broken steel pipes stuck deep in the narrow borehole far underground, darkness', STYLE),
    ('k4-04-sidetrack', 'Cutaway diagram of a new borehole branching sideways around the old blocked one and continuing down', STYLE),
    ('k4-05-years', 'A wall calendar with pages flying, a drilling tower outside the window through seasons of snow and summer', STYLE),
    ('k4-06-guinness', 'An old thick record book open on a desk next to a rock core sample, warm lamp', STYLE),
    # 5 что нашли
    ('k5-01-textbook', 'An old Soviet geology textbook open on a diagram of granite and basalt layers, a hand pointing', STYLE),
    ('k5-02-granite-deep', 'A rock core of pink-grey granite under a bright lamp, a geologist\'s gloved hand turning it', STYLE),
    ('k5-03-no-basalt', 'Geologists arguing over seismic charts and rock cores on a table, surprised faces, cigarette smoke, 1980s', STYLE),
    ('k5-04-water', 'Deep underground cracks in granite filled with seeping water glistening in darkness', STYLE),
    ('k5-05-mud', 'Grey drilling mud bubbling and foaming as it flows out into a steel trough at the drilling site, steam', STYLE),
    ('k5-06-cracks', 'A crumbling fractured rock core breaking apart in a geologist\'s hands, dust and fragments', STYLE),
    ('k5-07-plankton', 'Microscope view of tiny round fossil microorganisms preserved in dark rock, glowing outlines', STYLE),
    ('k5-08-microscope', 'A Soviet scientist looking into a microscope in a dim lab, rock thin sections on the table', STYLE),
    ('k5-09-ancient-earth', 'The young Earth 2.7 billion years ago: a dark ocean, bare volcanic rock, no plants, a hazy orange sky', MODERN),
    # 6 жар
    ('k6-01-thermometer', 'A gauge with a needle rising into the red zone, sweating engineers watching, steam', STYLE),
    ('k6-02-hot-rock', 'Deep underground: glowing hot rock squeezing around a narrow borehole, red heat, the rock looks soft', STYLE),
    ('k6-03-bent-pipe', 'A twisted bent steel drill pipe and a destroyed drill bit lying on the snow, workers looking at it', STYLE),
    ('k6-04-aluminium', 'Lightweight silver aluminium drill pipes stacked on the rig, workers handling them', STYLE),
    ('k6-05-accident', 'A dark tense drilling floor after an accident, alarm red light, workers standing still', STYLE),
    ('k6-06-germany', 'A tall modern drilling tower in the green Bavarian countryside in the 1990s', MODERN),
    ('k6-07-limit', 'Cutaway of the Earth with a thin borehole stopped by a wall of red heat, the deep mantle glowing far below, unreachable', STYLE),
    # 7 колодец в ад
    ('k7-01-magazine', 'A small 1980s religious magazine lying on a kitchen table in Finland, a cup of coffee, winter window', MODERN),
    ('k7-02-tv', 'An old 1989 television set in a dark American living room showing a preacher on stage, blue glow', MODERN),
    ('k7-03-siberia', 'A drilling tower in a dark Siberian forest at night, ominous red light from below, legend illustration', HELL),
    ('k7-04-void', 'A drill bit breaking through into a vast dark cavern underground, glowing red heat below', HELL),
    ('k7-05-mic-lowered', 'A microphone hanging on a long cable deep in a dark hellish shaft, red glow, smoke', HELL),
    ('k7-06-melting', 'A microphone melting and dripping in red-hot smoke', HELL),
    ('k7-07-gas', 'A cloud of glowing gas bursting out of a drilling tower at night, a dark winged shape in the smoke', HELL),
    ('k7-08-flee', 'Silhouettes of terrified workers running away from a drilling tower at night, red glow behind them', HELL),
    ('k7-09-internet', 'A computer screen in a dark room playing an audio waveform, a person in headphones listening, red light', MODERN),
    ('k7-10-compare', 'A split image: left side a hellish fiery cavern, right side plain grey granite rock under work lights', MODERN),
    # 8 кто это придумал
    ('k8-01-chain', 'A newspaper clipping passed from hand to hand across a table, then a fax machine and a TV studio in the background, 1989', MODERN),
    ('k8-02-letter', 'A man writing a letter at a desk by a window in Norway, seen from behind, a newspaper clipping and scissors on the desk', MODERN),
    ('k8-03-clipping', 'A Norwegian newspaper article clipping with an English typed translation beside it, a pen, 1989 desk', MODERN),
    ('k8-04-bat', 'A black bat flying out of a dark shaft in red smoke, legend illustration', HELL),
    ('k8-05-studio', 'A 1990 TV studio with bright lights and a camera pointed at an empty stage', MODERN),
    ('k8-06-truth', 'A man laughing while reading a newspaper in a 1990 cafe, seen from the side, face in shadow', MODERN),
    ('k8-07-tape-loop', 'Old audio tape loops and a mixing console with layered sound waves, dim studio light', MODERN),
    ('k8-08-alaska', 'An oil rig in the frozen Alaskan sea at night, ominous red glow, legend illustration', HELL),
    ('k8-09-movie', 'A dark cinema hall with an audience watching a horror film on the screen, red light on faces', MODERN),
    # 9 финал
    ('k9-01-ussr-end', 'A red flag being lowered at dusk over a snowy Soviet town in 1991, quiet and sad', STYLE),
    ('k9-02-empty-lab', 'An abandoned Soviet geology lab with dust, broken microscopes and scattered rock cores, light through dirty windows', STYLE),
    ('k9-03-dismantle', 'Workers dismantling a drilling tower and loading metal onto trucks in grey Arctic weather', STYLE),
    ('k9-04-abandoned', 'The abandoned Kola drilling complex in the tundra today, rusting buildings under snow, a raven on a wall', STYLE),
    ('k9-05-weld', 'A welder in a mask welding a steel cap shut over a borehole, bright sparks in a dark hall', STYLE),
    ('k9-06-sakhalin', 'An offshore oil platform in the cold sea, a long well drawn going almost horizontally under the seabed, cutaway', MODERN),
    ('k9-07-earth-scale', 'The whole Earth cut in half with its glowing core, a tiny scratch on the surface marking how deep humans have drilled', MODERN),
    ('k9-08-voyager', 'A space probe drifting far away from the Sun into dark interstellar space', MODERN),
    ('k9-09-cap-snow', 'The rusty welded cap at the borehole slowly being covered with snow, silence, last light', STYLE),
]


def main():
    rows = [{'batch': 1, 'scene': f'scene-{i:02d}', 'name': n, 'prompt': f'{p}. {s}', 'refs': []} for i, (n, p, s) in enumerate(P, 1)]
    json.dump(rows, open(os.path.join(D, 'картинки.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('картинок:', len(rows))


if __name__ == '__main__':
    main()
