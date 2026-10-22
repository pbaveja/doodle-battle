// Word list for the student edition. Server-only, like words.ts: guessers never receive the word.
//
// Each line:  class|word|very close guesses|close guesses
//   class        the CBSE / NCERT class where the topic is first taught, 6 to 12 (6 means "by Class 6")
//   very close   synonyms or near-identical answers, separated by ";"
//   close        related ideas, separated by ";"
//
// Only words that can be drawn. Topics shared with the Tamil Nadu State Board are graded where NCERT teaches them.

import { MIN_WORD_GRADE, type SubjectId } from "./students";

const DATA: Record<SubjectId, string> = {
  physics: `
6|magnet|bar magnet;horseshoe magnet|north pole;iron;compass;attract
6|shadow|shade|light;sun;dark
6|compass|magnetic compass|north;needle;direction
6|measuring tape|tape measure;measure tape|length;metre;scale
6|torch|flashlight|light;battery;bulb
7|thermometer|clinical thermometer|temperature;fever;mercury
7|electric bulb|bulb;light bulb|filament;switch;current
7|battery|dry cell;battery cell|current;circuit;torch
7|switch|electric switch|circuit;on;off
7|pendulum|simple pendulum|swing;time;bob
7|plane mirror|mirror|reflection;image
7|fuse|electric fuse|wire;circuit;safety
7|electromagnet|electric magnet|coil;iron;current
8|friction|rubbing|rough;force;slip
8|lightning|thunderbolt;thunder|cloud;storm;charge;spark
8|lightning conductor|lightning rod|building;earth;storm
8|tuning fork|fork|sound;vibration;note
8|kaleidoscope|toy kaleidoscope|mirror;patterns;reflection
9|rocket|space rocket|newton;launch;thrust
9|seesaw|teeter totter|lever;balance
9|pulley|block and pulley|rope;lift;wheel
9|echo|echoes|sound;reflection;cave
9|sound wave|wave|vibration;compression
9|gravity|gravitation|newton;apple;fall
9|spring balance|weighing scale|weight;newton
10|convex lens|lens;magnifying glass|focus;rays;refraction
10|concave mirror|curved mirror|focus;torch;reflection
10|prism|glass prism|spectrum;dispersion;light
10|rainbow|spectrum|prism;rain;colours
10|human eye|eye;eyeball|lens;retina;pupil
10|spectacles|glasses;specs|eye;lens
10|electric circuit|circuit|battery;bulb;wire
10|resistor|resistance|ohm;circuit
10|electric motor|motor|coil;magnet;rotation
10|solenoid|coil|magnet;current
11|projectile|projectile motion|parabola;cannon;throw
11|vector|arrow|magnitude;direction
11|inclined plane|ramp;slope|friction;block
11|spring|coil spring|hooke;stretch;oscillation
11|satellite|artificial satellite|orbit;earth
11|thermos flask|thermos;vacuum flask|heat;insulation
11|hydraulic lift|hydraulic jack|pressure;car;pascal
12|capacitor|condenser|charge;plates
12|transformer|step up transformer|coil;voltage;ac
12|magnetic field lines|field lines|magnet;north;south
12|optical fibre|optical fiber|light;cable;total internal reflection
12|telescope|refracting telescope|lens;stars
12|diode|pn junction;p n junction|semiconductor;current
12|solar cell|solar panel|sunlight;electricity
12|nucleus|atomic nucleus|proton;neutron
12|ammeter|current meter|current;galvanometer
12|generator|ac generator;dynamo|coil;electricity
`,
  chemistry: `
6|water|h2o|drop;liquid;tap
6|salt|table salt;common salt|sea;sodium chloride;taste
6|filter paper|filter|funnel;sieve
6|sieve|strainer;chalni|flour;filter
7|acid|acids|lemon;sour;litmus
7|litmus paper|litmus|acid;base;red;blue
7|rust|rusting|iron;oxygen;water
7|crystal|crystals|salt;sugar
7|turmeric|haldi|indicator;yellow
8|fire extinguisher|extinguisher|fire;foam;carbon dioxide
8|candle flame|flame;candle|wax;burn;fire
8|matchstick|match|fire;burn
8|petrol pump|petrol|fuel;car
8|coal|charcoal|fuel;mine;black
8|plastic bottle|bottle|plastic;recycle
9|atom|atoms|proton;electron;nucleus
9|molecule|molecules|atoms;bond
9|evaporation|evaporate|vapour;sun;water
9|beaker|glass beaker|lab;liquid
9|test tube|tube|lab;flask
9|states of matter|matter|solid;liquid;gas
9|ice cube|ice|solid;melting;freeze
10|soap|bar of soap|bubbles;wash
10|bunsen burner|burner|flame;lab;gas
10|baking soda|sodium bicarbonate|cake;bubbles
10|periodic table|table of elements|elements;mendeleev
10|corrosion|corroded|iron;metal
10|electrolysis|electrolytic cell|electrodes;current
10|diamond|diamonds|carbon;graphite;ring
10|graphite|pencil lead|carbon;pencil
11|electron shell|orbit;shell|atom;electrons
11|conical flask|erlenmeyer flask;flask|lab;titration
11|burette|buret|titration;lab
11|chemical bond|bond|atoms;molecule
11|benzene ring|benzene|hexagon;carbon
11|pipette|dropper|lab;liquid
11|hydrogen balloon|balloon|gas;hydrogen
12|galvanic cell|daniell cell|zinc;copper;salt bridge
12|catalyst|catalysts|reaction;speed
12|polymer|polymers|chain;monomer;plastic
12|rubber band|rubber|polymer;stretch
12|detergent|washing powder|soap;clean
`,
  biology: `
6|leaf|leaves|plant;green;tree
6|root|roots|plant;soil
6|flower|blossom|petal;plant
6|seed|seeds|plant;sprout
7|photosynthesis|food making|sunlight;leaf;chlorophyll
7|lungs|lung|breathing;air
7|stomach|tummy|digestion;food
7|teeth|tooth|mouth;dentist
7|heart|human heart|blood;beat;pump
7|stomata|stoma|leaf;pores
7|pollination|pollen|bee;flower
8|cell|cells|nucleus;membrane
8|microscope|compound microscope|lens;slide;magnify
8|bacteria|germs;bacterium|microbe;disease
8|virus|viruses|germ;disease;flu
8|vaccine|injection;vaccination|doctor;disease
8|yeast|yeast cells|bread;fermentation
8|tadpole|tadpoles|frog;metamorphosis
8|forest|jungle|trees;wildlife
9|mitochondria|mitochondrion|cell;energy
9|onion peel|onion cells|microscope;cell
9|plant cell|cell wall|chloroplast;vacuole
9|neuron|nerve cell|brain;nerve
9|beehive|hive|honey;bee
10|kidney|kidneys|urine;excretion
10|brain|human brain|nerve;head
10|digestive system|gut|stomach;intestine
10|amoeba|amoebae|cell;pseudopodia
10|food chain|chain|grass;deer;tiger
10|stamen|stamens|pollen;flower
10|chromosome|chromosomes|gene;dna
11|chloroplast|chloroplasts|leaf;photosynthesis
11|skeleton|bones|skull;ribs
11|cockroach|roach|insect;antenna
11|earthworm|worm|soil;segments
11|xylem|xylem vessels|water;plant;phloem
11|muscle|muscles|biceps;bones
11|red blood cell|rbc;blood cell|blood;haemoglobin
12|dna|double helix;dna double helix|gene;chromosome
12|embryo|foetus;fetus|womb;baby
12|pea plant|garden pea|mendel;genetics
12|insulin|insulin injection|diabetes;sugar
12|biogas plant|biogas|cow dung;fuel
12|evolution|darwin|monkey;man;fossil
12|antibody|antibodies|immunity;y shape
`,
  maths: `
6|triangle|triangles|three sides;angle
6|circle|circles|round;radius
6|square|squares|four sides
6|number line|line|numbers;zero
6|protractor|angle measurer|angle;degree
6|angle|angles|degree;protractor
7|fraction|fractions|half;numerator
7|parallel lines|parallel|lines;never meet
7|right angle|ninety degrees|angle;corner
7|symmetry|line of symmetry|mirror;butterfly
7|cube|cubes|dice;box
8|pie chart|pie graph|data;sectors
8|bar graph|bar chart|data;bars
8|cylinder|cylinders|can;circle
8|cone|cones|ice cream;circle
8|parallelogram|rhombus|quadrilateral
8|trapezium|trapezoid|quadrilateral
9|coordinate axes|graph|x axis;y axis
9|histogram|histograms|bars;data
9|sphere|ball|globe;radius
9|chord|chords|circle;diameter
10|tangent|tangent line|circle;touch
10|angle of elevation|height and distance|tower;shadow
10|dice|die|probability;six
10|coin toss|heads or tails|probability;coin
10|frustum|bucket|cone;cylinder
10|parabola|curve|quadratic;graph
11|venn diagram|venn|sets;circles
11|ellipse|oval|conic;foci
11|hyperbola|hyperbolas|conic
11|sine wave|sine curve|graph;trigonometry
11|infinity|infinite|endless;eight
12|integral|integration;integral sign|area;calculus
12|matrix|matrices|rows;columns
12|three dimensional axes|3d axes|x y z;space
12|area under curve|area|integral;graph
12|tree diagram|probability tree|probability;branches
`,
  history: `
6|cave painting|rock painting|early humans;stone age
6|stone tools|stone axe|early humans;hunting
6|harappan seal|seal;indus seal|harappa;bull
6|stupa|sanchi stupa|buddha;dome
6|ashoka pillar|pillar;lion capital|emperor;ashoka
7|red fort|lal qila|mughal;delhi
7|qutub minar|qutb minar|delhi;tower
7|chola temple|brihadeeswara temple;big temple|tanjore;gopuram
7|crown|king crown|king;throne
7|sword|talwar|warrior;battle
7|war elephant|elephant|battle;army
7|taj mahal|taj|shah jahan;agra
7|coin|coins|king;trade
8|trading ship|ship|east india company;trade
8|spinning wheel|charkha|gandhi;khadi
8|salt march|dandi march|gandhi;salt
8|steam engine|steam train|railway;british
8|indigo|indigo plant|blue;dye;planters
8|tricolour|indian flag;tiranga|independence;india
9|guillotine|execution|french revolution;king
9|bastille|fortress|french revolution;prison
10|printing press|press|gutenberg;books
10|newspaper|paper;daily|print;press
10|factory|mill|industrial revolution;smoke
11|ziggurat|temple tower|mesopotamia
11|colosseum|roman colosseum|rome;gladiator
11|clay tablet|cuneiform|writing;mesopotamia
11|great wall|great wall of china|china;wall
12|great bath|mohenjo daro bath|harappa;indus
12|stone chariot|hampi chariot|hampi;vijayanagara
12|sanchi gateway|torana|stupa;buddhism
`,
  geography: `
6|globe|world globe|earth;map
6|map|maps|direction;scale
6|equator|equator line|latitude;globe
6|mountain|mountains|peak;himalaya
6|plateau|tableland|flat;highland
6|island|islands|sea;water
7|volcano|volcanoes|lava;eruption
7|earthquake|quake|tremor;crack
7|tsunami|tidal wave|wave;sea
7|desert|deserts|sand;camel
7|tide|tides|moon;sea
7|cyclone|hurricane|storm;wind
8|dam|reservoir|river;water
8|terrace farming|step farming|hills;fields
8|windmill|wind turbine|wind;energy
8|rainwater harvesting|rain harvesting|rain;tank
9|monsoon|rainy season|rain;clouds
9|river delta|delta|river;sea
9|mangrove|mangroves|sundarbans;coast
9|coral reef|coral|sea;island
10|irrigation|canal|farm;water
10|paddy field|rice field|rice;farming
10|tea garden|tea plantation|tea;hills
10|coal mine|mine|coal;miner
10|oil rig|oil well|petroleum;sea
11|earth core|core|crust;mantle
11|glacier|glaciers|ice;mountain
11|waterfall|falls|river;cliff
11|sand dune|dune|desert;wind
12|port|harbour;harbor|ship;trade
12|highway|expressway|transport;car
12|airport|airfield|plane;transport
12|pipeline|oil pipeline|transport;oil
`,
  civics: `
6|vote|voting|election;ballot
6|panchayat|gram panchayat|village;sarpanch
7|ballot box|voting box|election;vote
7|voting ink|indelible ink;ink mark|finger;election
7|market|bazaar|shop;buy
8|parliament|parliament house|mps;delhi
8|court|courtroom|judge;law
8|police station|thana|police;law
8|judge|justice|court;hammer
9|constitution|constitution of india|ambedkar;book
9|election campaign|campaign|rally;votes
9|national emblem|lion capital emblem|ashoka;emblem
10|political party|party symbol|election;symbol
10|protest|rally|slogan;demand
11|scales of justice|justice scale|court;law;balance
11|gavel|judge hammer|court;judge
11|president|rashtrapati|india;head
12|united nations|un|world;peace
12|atom bomb|nuclear bomb|war;cold war
12|handshake|shake hands|treaty;friendship
12|berlin wall|wall|germany;cold war
`,
  economics: `
6|money|cash;rupee|coin;note
6|shop|store|buy;sell
6|rupee note|currency note;note|money;gandhi
7|bank|banks|money;loan
7|vegetable vendor|vendor;sabziwala|market;cart
8|ration card|ration|shop;rice
8|shopping cart|trolley|supermarket;buy
8|price tag|tag|price;cost
9|farmer|kisan|farm;crops
9|tractor|tractors|farm;field
10|credit card|card|bank;loan
10|cheque|check|bank;payment
10|atm|cash machine|bank;money
10|container ship|cargo ship|trade;goods
11|demand curve|demand|price;graph
11|stock market|share market|shares;bull
11|piggy bank|savings|money;coin
12|budget|briefcase|government;finance
12|tax|taxes|government;income
12|inflation|price rise|money;prices
`,
  computers: `
6|computer|pc|keyboard;screen
6|mouse|computer mouse|click;cursor
6|keyboard|computer keyboard|keys;typing
7|monitor|screen|computer;display
7|printer|printers|paper;ink
7|email|mail|letter;internet
8|internet|web|wifi;network
8|wifi|wireless|internet;router
8|password|passcode|lock;login
9|robot|robots|ai;machine
9|cloud storage|cloud|internet;files
9|pendrive|usb drive;usb|storage;data
10|computer virus|malware|virus;hacker
10|hacker|hacking|cyber;security
10|spreadsheet|excel|cells;table
11|flowchart|flow diagram|algorithm;diagram
11|cpu|processor|chip;computer
11|binary|binary code|zeros and ones;bits
11|router|modem|network;wifi
12|database|db|table;records
12|network|computer network|nodes;cables
12|server|servers|data;internet
12|bug|software bug|error;code
12|stack|stack of plates|push;pop
`,
  commerce: `
11|ledger|account book|accounts;entries
11|calculator|calc|maths;numbers
11|invoice|bill|payment;goods
11|balance sheet|balance|assets;liabilities
11|cash register|till|money;shop
11|warehouse|storehouse;godown|goods;storage
11|insurance|policy|risk;umbrella
12|advertisement|advert;ad|tv;billboard
12|logo|brand logo|brand;company
12|packaging|package|box;product
12|share certificate|share|company;stock
12|organisation chart|org chart|manager;hierarchy
12|salesman|salesperson|selling;customer
12|board meeting|meeting|directors;company
`,
};

export interface StudentWord {
  word: string;
  grade: number;
  subject: SubjectId;
  very: string[];
  close: string[];
}

const list = (s: string | undefined) => (s ?? "").split(";").map((x) => x.trim()).filter(Boolean);

function parse(): StudentWord[] {
  const out: StudentWord[] = [];
  const seen = new Set<string>();
  for (const [subject, block] of Object.entries(DATA) as [SubjectId, string][]) {
    for (const raw of block.split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      const [g, word, very, close] = line.split("|");
      const grade = Number(g);
      if (!Number.isInteger(grade) || grade < MIN_WORD_GRADE || grade > 12 || !word?.trim()) continue;
      // One word, one subject: the same word in two subjects would come up twice.
      const key = word.trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ word: word.trim(), grade, subject, very: list(very), close: list(close) });
    }
  }
  return out;
}

export const STUDENT_WORDS: StudentWord[] = parse();
