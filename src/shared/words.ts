// Built-in English word list. Server-only: guessers never receive the chosen word until the reveal.
//
// Each line:  level|word|very close guesses|close guesses
//   level        e (easy), m (medium) or h (hard)
//   very close   synonyms or near-identical answers, separated by ";"
//   close        related ideas, separated by ";"

import type { CategoryId } from "./categories";

const DATA: Record<CategoryId, string> = {
  animals: `
e|dog|puppy;pup;doggy;hound;canine|bone;leash;bark;wolf;kennel;pet
e|cat|kitten;kitty;feline;tomcat|mouse;meow;whiskers;lion;tiger;pet
e|fish|goldfish;salmon;tuna;trout|water;aquarium;fin;shark;ocean;bait
e|bird|sparrow;robin;pigeon;birdie|feather;wing;nest;beak;egg;fly
e|horse|pony;stallion;mare;foal|saddle;horseshoe;donkey;zebra;stable;gallop
e|cow|bull;calf;cattle;ox|milk;farm;moo;goat;barn;udder
e|pig|piglet;hog;swine;boar|mud;farm;bacon;oink;snout
e|sheep|lamb;ram;ewe|wool;farm;goat;shepherd;baa
e|duck|duckling;mallard;goose|pond;quack;swan;feather;beak
e|chicken|hen;rooster;chick;cockerel|egg;farm;feather;turkey;coop
e|rabbit|bunny;hare;bunnies|carrot;ears;hop;burrow;easter
e|mouse|mice;rat;hamster|cheese;cat;squeak;trap;tail
e|lion|lioness;lion cub;big cat|tiger;mane;roar;king;jungle;zoo
e|tiger|tigress;big cat;tiger cub|lion;stripes;jungle;leopard;zoo
e|elephant|mammoth;elephant calf|trunk;tusk;ivory;rhino;zoo;ears
e|monkey|ape;chimp;chimpanzee;gorilla;baboon|banana;jungle;tail;tree;zoo
e|bear|grizzly;grizzly bear;polar bear;brown bear;bear cub|honey;panda;forest;claw;cave
e|frog|toad;tadpole;bullfrog|pond;lily pad;jump;green;croak
e|snake|serpent;cobra;python;viper;rattlesnake|hiss;fang;lizard;slither;venom
e|spider|tarantula;arachnid|web;bug;insect;eight legs;ant
e|bee|bumblebee;honeybee;wasp;hornet|honey;hive;sting;flower;buzz
e|butterfly|moth|caterpillar;wings;flower;insect;cocoon
e|turtle|tortoise;terrapin;sea turtle|shell;slow;sea;pond
e|snail|slug;escargot|shell;slow;garden;slime
e|whale|blue whale;orca;killer whale;humpback|ocean;dolphin;shark;sea;fin
e|shark|great white;hammerhead;great white shark|ocean;fin;jaws;teeth;whale;fish
e|owl|barn owl;owlet|night;hoot;bird;feather;wise
e|penguin|emperor penguin;penguins|ice;antarctica;bird;snow;tuxedo
e|giraffe|giraffes|neck;tall;spots;zebra;savanna
e|zebra|zebras|stripes;horse;giraffe;savanna
e|ant|ants;termite|bug;insect;anthill;colony;spider
e|crab|hermit crab;lobster|claw;beach;sea;shell
e|duckling|baby duck;duck|pond;feather;quack
e|puppy|pup;dog;doggy|bone;bark;cute;leash
m|octopus|squid;cuttlefish|tentacles;ocean;ink;sea
m|kangaroo|wallaby;joey|australia;pouch;hop;koala
m|crocodile|alligator;croc;gator|swamp;teeth;reptile;lizard
m|dolphin|porpoise|ocean;whale;fin;sea;shark
m|camel|dromedary|desert;hump;sand;llama
m|parrot|macaw;parakeet;cockatoo|bird;feather;talk;pirate
m|flamingo|flamingos|pink;bird;one leg;lake
m|peacock|peahen;peafowl|feathers;bird;tail;colorful
m|squirrel|chipmunk|nut;acorn;tree;tail
m|bat|vampire bat;fruit bat|cave;night;wings;dracula;fly
m|jellyfish|jelly|sea;ocean;sting;tentacles
m|panda|giant panda;red panda;panda bear|bamboo;bear;china
m|koala|koala bear|australia;eucalyptus;tree;kangaroo
m|hippo|hippopotamus|river;mouth;rhino;mud
m|rhino|rhinoceros|horn;hippo;elephant;africa
m|fox|vixen;red fox|tail;forest;sly;wolf
m|wolf|wolves;coyote;werewolf|howl;moon;dog;pack
m|deer|reindeer;moose;elk;fawn;stag|antlers;forest;bambi
m|ladybug|ladybird|bug;spots;insect;beetle
m|seahorse|sea horse|ocean;fish;coral
m|swan|cygnet;goose|lake;white;duck;bird
m|eagle|hawk;falcon;bald eagle|bird;wings;feather;claws
m|goat|billy goat;mountain goat|horns;farm;sheep;beard
m|donkey|mule;burro|horse;farm;ears
m|lobster|crayfish;crawfish|claw;sea;red;crab
m|hedgehog|porcupine|spikes;spines;prickly
m|worm|earthworm|dirt;soil;bird;fishing
m|mosquito|gnat;midge|bite;itch;insect;buzz
m|leopard|cheetah;jaguar;panther|spots;big cat;fast
m|polar bear|white bear|ice;arctic;snow;bear
m|gorilla|ape;silverback|monkey;jungle;chest
m|turkey|wild turkey|thanksgiving;feathers;bird
m|lizard|gecko;iguana|reptile;tail;scales
m|beetle|bug|insect;shell;ladybug
m|seal|sea lion|ocean;ice;flippers
m|goldfish|fish;koi|bowl;orange;aquarium
h|chameleon|lizard;gecko;iguana|color;camouflage;tongue
h|platypus|duckbilled platypus|duck;beaver;australia
h|sloth|three toed sloth|slow;tree;lazy
h|narwhal|unicorn whale|tusk;whale;horn;ocean
h|armadillo|pangolin|shell;armor
h|anteater|aardvark|ant;tongue;snout
h|porcupine|hedgehog|quills;spikes
h|stingray|manta ray;ray|ocean;fish;tail
h|woodpecker|bird|tree;peck;wood
h|scorpion|scorpio|sting;tail;desert;spider
h|walrus|sea lion;seal|tusks;ice;whiskers
h|caterpillar|larva|butterfly;leaf;worm
h|ostrich|emu|bird;egg;tall;sand
h|beaver|otter|dam;river;wood;teeth
h|skunk|polecat|smell;stink;stripe
h|vulture|buzzard|bird;desert;bones
h|pufferfish|blowfish|spikes;fish;balloon
h|praying mantis|mantis|insect;green;grasshopper
h|grasshopper|cricket;locust|jump;insect;green
h|hummingbird|humming bird|bird;nectar;flower
`,

  food: `
e|apple|green apple;red apple|fruit;pear;tree;pie;orchard
e|banana|bananas;plantain|fruit;monkey;peel;yellow
e|orange|tangerine;mandarin;clementine|fruit;juice;lemon;citrus
e|grapes|grape;bunch of grapes|wine;fruit;raisin;vine
e|strawberry|strawberries;berry|fruit;red;cream;jam
e|watermelon|melon|fruit;seeds;summer;slice
e|pineapple|pineapples|fruit;tropical;pizza
e|cherry|cherries|fruit;red;pie;cake
e|lemon|lime|sour;citrus;lemonade;yellow
e|carrot|carrots|vegetable;orange;rabbit;root
e|corn|maize;sweet corn;corn on the cob|popcorn;vegetable;yellow
e|potato|potatoes;spud|fries;chips;vegetable;mash
e|tomato|tomatoes|ketchup;vegetable;red;salad
e|mushroom|mushrooms;toadstool;fungus|vegetable;forest
e|egg|eggs;yolk|chicken;omelette;breakfast;shell
e|bread|loaf;baguette;bun|toast;sandwich;butter;bakery
e|cheese|cheddar;mozzarella;cheese slice|mouse;milk;pizza;holes
e|pizza|pizza slice|cheese;pepperoni;italian;slice
e|burger|hamburger;cheeseburger|bun;fries;fast food;meat
e|hot dog|sausage;frankfurter;hotdog|bun;ketchup;mustard
e|ice cream|gelato;ice cream cone;sundae;soft serve|cone;scoop;dessert;cold
e|cake|gateau;sponge cake|dessert;candle;slice;birthday
e|cookie|biscuit;cookies|chocolate chip;milk;dessert;jar
e|donut|doughnut;donuts|sprinkles;dessert;sweet;hole
e|candy|sweets;sweet;candies|sugar;chocolate;dessert
e|lollipop|lolly;sucker|candy;sweet;stick
e|popcorn|popped corn|cinema;movie;corn;butter
e|sandwich|sub;sarnie|bread;lunch;ham;toast
e|milk|glass of milk;cream|cow;white;bottle
e|coffee|espresso;latte;cappuccino|cup;mug;tea;caffeine
e|tea|green tea;iced tea;cup of tea|cup;kettle;coffee;mug
e|juice|orange juice;apple juice|glass;drink;fruit;straw
e|french fries|fries;chips|potato;ketchup;burger
e|chocolate|chocolate bar;cocoa|candy;sweet;dessert;brown
e|pancake|pancakes;crepe;flapjack|syrup;breakfast;waffle
e|noodles|ramen;instant noodles|bowl;chopsticks;soup;pasta
e|rice|bowl of rice;fried rice|chopsticks;grain;bowl
e|cupcake|muffin;cupcakes|cake;frosting;sprinkles
m|spaghetti|pasta;noodles;linguine|meatball;sauce;italian;fork
m|sushi|sashimi;maki;sushi roll|rice;fish;chopsticks;japan
m|taco|burrito;tacos|mexican;tortilla;shell
m|pretzel|pretzels|salt;bread;snack;knot
m|waffle|waffles|pancake;syrup;breakfast
m|broccoli|cauliflower|vegetable;green;tree
m|avocado|guacamole|green;toast;pit
m|coconut|coconuts|palm tree;tropical;beach
m|onion|onions;shallot|cry;vegetable;garlic
m|garlic|garlic clove;garlic bread|vampire;onion;clove
m|pear|pears|fruit;apple;green
m|peach|peaches;nectarine;apricot|fruit;fuzzy
m|mango|mangoes;mangos|fruit;tropical;yellow
m|kiwi|kiwi fruit|fruit;green;fuzzy
m|peanut|peanuts;nut|peanut butter;shell;elephant
m|soup|broth;stew|bowl;spoon;hot
m|salad|caesar salad;green salad|lettuce;bowl;vegetable;healthy
m|steak|beef;meat|grill;knife;fork;barbecue
m|bacon|ham;pork|breakfast;egg;pig
m|sausage|hot dog;salami|meat;grill;breakfast
m|omelette|omelet;scrambled eggs|egg;breakfast;pan
m|milkshake|shake;smoothie|straw;milk;ice cream
m|lemonade|lemon juice|lemon;drink;stand;glass
m|smoothie|milkshake|fruit;blender;straw
m|cereal|cornflakes;oatmeal;porridge|bowl;milk;breakfast
m|honey|honeycomb|bee;jar;sweet
m|jam|jelly;marmalade|toast;jar;strawberry
m|pie|apple pie;tart|dessert;slice;crust
m|cotton candy|candy floss;fairy floss|fair;pink;sugar
m|toast|toasted bread|bread;toaster;butter;breakfast
m|birthday cake|cake|candles;party;birthday
m|fried egg|egg;sunny side up|frying pan;breakfast
m|chili pepper|chili;chilli;jalapeno|hot;spicy;red
m|fruit salad|fruit bowl|fruit;bowl;salad
m|ice cube|ice|cold;freezer;drink
m|meatball|meatballs|spaghetti;meat
m|cucumber|cucumbers|vegetable;green;salad;pickle
m|pumpkin pie|pumpkin|pie;thanksgiving
m|chicken nugget|nuggets;chicken nuggets|chicken;fast food
m|bubble gum|chewing gum;gum|bubble;pink;chew
m|cheese grater|grater|cheese;kitchen
h|corn dog|corndog|hot dog;stick;fair
h|gingerbread man|gingerbread|cookie;christmas
h|fortune cookie|fortune|cookie;chinese
h|croissant|croissants|pastry;bakery;french;breakfast
h|dumpling|dumplings;gyoza|steam;chinese
h|pomegranate|pomegranates|fruit;seeds;red
h|popsicle|ice lolly;ice pop|ice cream;stick;cold
h|kebab|kabob;skewer;shish kebab|meat;grill;stick
h|nachos|tortilla chips|cheese;mexican;chips
h|lasagna|lasagne|pasta;italian;cheese
h|pickle|gherkin|cucumber;jar;sour
h|cheesecake|cheese cake|dessert;cake
h|marshmallow|marshmallows|campfire;sweet;smores
h|bubble tea|boba;boba tea|tea;tapioca;straw
h|cappuccino|latte;espresso|coffee;foam;cup
h|food truck|food van|truck;street food
h|picnic basket|hamper|picnic;basket;park
h|caramel apple|toffee apple;candy apple|apple;stick
h|spring roll|egg roll|chinese;fried
h|club sandwich|sandwich|toothpick;layers
h|hot chocolate|hot cocoa;cocoa|mug;marshmallow;winter
h|gummy bear|gummy bears;jelly bear|candy;sweet
`,

  home: `
e|chair|stool;seat;armchair|table;sit;sofa
e|table|desk;dining table|chair;dinner;kitchen
e|bed|mattress;double bed|pillow;sleep;blanket;bedroom
e|door|doorway;front door|knob;handle;key;house
e|window|windowpane|curtain;house;glass;view
e|lamp|lantern;desk lamp;table lamp|bulb;light;shade
e|clock|wall clock|time;hands;tick;watch
e|key|keys|lock;door;keychain
e|cup|mug;teacup|tea;coffee;drink
e|spoon|teaspoon;ladle|fork;knife;soup
e|fork|forks|knife;spoon;eat
e|knife|blade;butter knife|fork;cut;kitchen
e|plate|dish|food;dinner;fork;bowl
e|bowl|dish|soup;spoon;cereal
e|book|novel;notebook|read;page;library
e|pencil|pen;crayon|write;eraser;paper
e|scissors|shears|cut;paper;blade
e|toothbrush|tooth brush|teeth;toothpaste;bathroom
e|umbrella|parasol|rain;wet
e|candle|candles|flame;wax;birthday;light
e|pillow|cushion|bed;sleep;blanket
e|sofa|couch;settee|tv;living room;chair
e|television|tv;telly|remote;watch;screen
e|bucket|pail|water;mop;sand
e|broom|brush;mop|sweep;witch;dust
e|box|crate;carton|package;cardboard
e|gift|present|ribbon;box;birthday;bow
e|balloon|balloons|party;birthday;air
e|ladder|step ladder|climb;rungs
e|mirror|looking glass|reflection;glass;face
e|bathtub|tub;bath|bubbles;shower;water
e|toilet|loo;lavatory|bathroom;flush
e|soap|bar of soap|bubbles;wash;hands
e|towel|bath towel|shower;dry;bathroom
e|fridge|refrigerator|freezer;kitchen;cold
e|oven|stove;cooker|bake;kitchen
e|kettle|teapot|tea;boil;water
e|blanket|quilt;duvet|bed;warm;pillow
e|basket|hamper|picnic;wicker
m|alarm clock|clock|wake;ring;bed
m|backpack|rucksack;schoolbag|school;straps;bag
m|hammer|mallet|nail;tool;hit
m|light bulb|bulb;lightbulb|lamp;idea;light
m|vacuum cleaner|vacuum;hoover|clean;carpet
m|washing machine|washer|laundry;clothes
m|frying pan|pan;skillet|cook;egg;kitchen
m|ceiling fan|fan|air;spin;ceiling
m|picture frame|frame;photo frame|photo;wall
m|bookshelf|bookcase;shelf|books
m|curtains|curtain;drapes|window
m|stairs|staircase;steps|climb;floor
m|doorbell|bell|door;ring
m|mailbox|letterbox;postbox|letter;mail
m|trash can|bin;dustbin;garbage can;wastebasket|trash;rubbish
m|toaster|toaster oven|toast;bread
m|microwave|microwave oven|oven;popcorn
m|blender|mixer|smoothie;kitchen
m|rolling pin|roller|dough;bake
m|sewing machine|sewing|needle;thread
m|paintbrush|brush|paint;art
m|paper clip|paperclip|paper;office
m|stapler|staples|paper;office
m|envelope|letter|mail;stamp
m|calendar|planner|date;month
m|hourglass|sand timer;egg timer|sand;time
m|magnet|magnets|metal;fridge
m|battery|batteries|power;charge
m|flashlight|torch|light;dark
m|padlock|lock|key
m|clothes hanger|hanger;coat hanger|clothes;closet
m|plunger|sink plunger|toilet;clog
m|comb|hairbrush|hair;brush
m|teddy bear|teddy;stuffed bear|toy;bear
m|piggy bank|money box|coins;pig;savings
m|screwdriver|screw driver|screw;tool
m|wrench|spanner|tool;bolt
m|needle|sewing needle|thread;sew
m|iron|clothes iron|ironing;clothes
m|vase|flower vase|flowers;water
m|fireplace|chimney;hearth|fire;wood
m|sink|basin|tap;water;dishes
m|shower|shower head|water;bathroom
h|chandelier|candelabra|ceiling;light;crystal
h|thermometer|thermostat|temperature;fever
h|mousetrap|mouse trap|mouse;cheese
h|safety pin|pin|needle;clothes
h|lava lamp|lamp|lava;light
h|rocking chair|chair;rocker|rock;grandma
h|welcome mat|doormat;mat|door;welcome
h|light switch|switch|light;wall
h|fire extinguisher|extinguisher|fire;red
h|smoke detector|smoke alarm|alarm;smoke
h|ironing board|iron|clothes
h|bunk bed|bed|ladder;sleep
h|wind chime|chimes|wind;bell
h|jigsaw puzzle|puzzle|pieces
h|snow globe|globe|snow
h|cuckoo clock|clock|bird;tick
h|tape measure|measuring tape|measure;inches
h|sticky note|post it;post-it|note;paper
h|key ring|keychain|keys
h|coat rack|hat stand|coat;hook
`,

  places: `
e|house|home;cottage;hut|roof;door;chimney
e|school|classroom;college|teacher;student;bus
e|beach|seaside;shore;coast|sand;sea;sun;umbrella
e|castle|palace;fort;fortress|king;queen;tower
e|farm|ranch;barn|cow;tractor;farmer
e|park|playground;garden|tree;bench;swing
e|zoo|safari park|animals;cage;lion
e|bridge|footbridge|river;road
e|island|isle|sea;palm tree;beach
e|hospital|clinic|doctor;nurse;ambulance
e|church|chapel;cathedral|cross;bell
e|tent|camp|camping;sleeping bag
e|igloo|ice house|snow;cold;ice
e|city|town|buildings;skyscraper
e|library|bookshop|books;read
e|desert|dunes|sand;camel;cactus
e|jungle|rainforest|tree;monkey;forest
e|cave|cavern|bat;dark;rock
e|garden|backyard|flower;plants
e|playground|play area|slide;swing;park
m|airport|airfield;terminal|plane;runway
m|lighthouse|beacon|light;sea;ship
m|stadium|arena|football;crowd
m|museum|gallery|art;history
m|bakery|bake shop|bread;cake
m|cinema|movie theater;theater|movie;popcorn
m|restaurant|cafe;diner|food;waiter
m|supermarket|grocery store;store|shopping cart;food
m|train station|station|train;platform
m|circus|big top|clown;tent
m|treehouse|tree house|tree;ladder
m|haunted house|ghost house|ghost;spooky
m|pyramid|pyramids|egypt;sand;pharaoh
m|skyscraper|tower;high rise|building;city
m|waterfall|falls|water;cliff
m|prison|jail|bars;prisoner
m|bank|vault|money
m|post office|mail office|mail;letter
m|fire station|firehouse|firefighter
m|hotel|motel|room;bed
m|gas station|petrol station|fuel;car
m|parking lot|car park|car
m|construction site|building site|crane;helmet
m|amusement park|theme park;fun fair|roller coaster
m|aquarium|fish tank|fish
m|space station|station|space;astronaut
m|windmill|wind turbine|farm;wind
m|swimming pool|pool|swim;water
m|farmhouse|farm|barn
m|classroom|class|school;teacher;desk
m|kitchen|cookhouse|cook;oven;fridge
m|bathroom|restroom;washroom|toilet;shower
m|barn|stable;shed|farm;hay
h|Eiffel Tower|tower|paris;france
h|Statue of Liberty|liberty|new york;statue
h|Taj Mahal|mahal|india;agra;palace
h|Great Wall of China|great wall|china;wall
h|Big Ben|clock tower|london;clock
h|Mount Everest|everest|mountain;snow
h|Leaning Tower of Pisa|leaning tower;pisa|italy;tower
h|North Pole|arctic|santa;ice;snow
h|Colosseum|coliseum|rome;arena
h|Stonehenge|stones|england
h|ski resort|ski slope|ski;snow
h|observatory|telescope|stars;space
h|Gateway of India|gateway|mumbai;india
h|Sydney Opera House|opera house|sydney;australia
h|Golden Gate Bridge|golden gate|san francisco;bridge
h|Hollywood sign|hollywood|movie;los angeles
h|Mount Rushmore|rushmore|faces;presidents
h|lost and found|lost property|lost
h|launch pad|launchpad|rocket;space
`,

  actions: `
e|sleeping|sleep;nap;asleep|bed;snore;pillow
e|running|run;jogging;sprint|race;shoes
e|swimming|swim|pool;water
e|jumping|jump;hopping|trampoline
e|dancing|dance|music;party
e|eating|eat;munch|food;fork
e|crying|cry;tears;sob|sad;baby
e|laughing|laugh;giggle|funny;joke
e|singing|sing|song;microphone
e|reading|read|book;library
e|walking|walk;stroll|feet;park
e|cooking|cook;baking|kitchen;chef
e|painting|paint|brush;canvas
e|fishing|fish|rod;boat;lake
e|climbing|climb|mountain;rope
e|waving|wave|hand;hello
e|clapping|clap;applause|hands
e|sneezing|sneeze;achoo|cold;tissue
e|yawning|yawn|tired;sleepy
e|thinking|think|idea;brain
e|drinking|drink;sip|cup;water
e|smiling|smile;grin|happy;face
m|juggling|juggle|balls;circus
m|skydiving|parachuting|plane;parachute
m|surfing|surf|wave;board;beach
m|brushing teeth|brushing;brush teeth|teeth;toothpaste
m|sweeping|sweep|broom;floor
m|knitting|knit|wool;needles
m|skipping rope|jump rope;skipping|rope
m|flying a kite|kite flying;kite|wind;string
m|taking a selfie|selfie|phone;photo
m|ice skating|skating|ice;skates
m|rowing|row;canoeing|boat;oars
m|tying shoelaces|tying laces;laces|shoes
m|bowling|bowl|pins;ball
m|hiccup|hiccups|drink
m|whistling|whistle|lips
m|shopping|shop|bag;mall
m|texting|text;messaging|phone
m|snoring|snore|sleep
m|sunbathing|tanning|beach;sun
m|camping|camp|tent;fire
m|gardening|garden|plant;flowers
m|hugging|hug|arms;love
m|driving|drive|car;wheel
m|typing|type|keyboard
m|diving|dive|water;pool
m|washing hands|hand washing|soap;sink
m|kicking|kick|ball;leg
m|shouting|shout;yelling|loud;mouth
m|winking|wink|eye
h|eavesdropping|eavesdrop;spying|listen;ear
h|meditating|meditation|yoga;calm
h|hibernating|hibernation|bear;winter
h|photobombing|photobomb|photo
h|babysitting|babysitter|baby
h|hitchhiking|hitchhike|thumb;road
h|daydreaming|daydream|dream;cloud
h|proposing|proposal|ring;marry
h|moonwalking|moonwalk|dance
h|multitasking|multitask|busy
h|parallel parking|parking|car
h|bungee jumping|bungee|jump;rope
h|tightrope walking|tightrope|circus;balance
h|sleepwalking|sleepwalk|sleep
h|sign language|signing|hands;deaf
h|stage fright|nervous|stage;fear
h|procrastinating|procrastinate|delay;lazy
h|brainstorming|brainstorm|ideas;thinking
h|window shopping|browsing|shop;window
`,

  people: `
e|doctor|physician;surgeon|hospital;nurse;stethoscope
e|nurse|nurses|hospital;doctor
e|teacher|tutor;professor|school;class
e|chef|cook|kitchen;hat
e|farmer|rancher|farm;tractor
e|police officer|policeman;cop;police|badge;handcuffs
e|firefighter|fireman|fire;hose;truck
e|baby|infant;toddler|cradle;diaper;crying
e|king|monarch;emperor|crown;throne;castle
e|queen|empress;monarch|crown;throne
e|clown|jester|circus;red nose
e|pirate|buccaneer|ship;treasure;parrot
e|astronaut|cosmonaut;spaceman|space;rocket;moon
e|cowboy|cowgirl|horse;hat;lasso
m|dentist|orthodontist|teeth;tooth
m|pilot|aviator|plane;airport
m|magician|illusionist|magic;rabbit;hat
m|detective|investigator;sherlock|magnifying glass;clue
m|scientist|chemist|lab;experiment
m|artist|painter|paint;art
m|photographer|cameraman|camera;photo
m|mailman|postman;mail carrier|letter;mail
m|plumber|plumbing|pipe;wrench
m|waiter|waitress;server|restaurant;tray
m|lifeguard|life guard|pool;beach;whistle
m|referee|umpire|whistle;football
m|soldier|army|gun;helmet
m|builder|construction worker|helmet;brick
m|mechanic|car mechanic|car;wrench
m|ninja|samurai|sword;black
m|knight|warrior|armor;sword;horse
m|princess|prince|crown;castle
m|grandma|grandmother;granny|old;knitting
m|bride|groom|wedding;dress
m|twins|twin|brothers;sisters
m|singer|vocalist|song;microphone
m|DJ|disc jockey|music;headphones
m|barber|hairdresser|hair;scissors
m|judge|lawyer|court;hammer
m|student|pupil|school;books
m|caveman|cave man|club;cave
m|gardener|groundskeeper|plants;shovel
h|archaeologist|paleontologist|dig;bones
h|ventriloquist|puppeteer|puppet
h|lumberjack|woodcutter|axe;tree
h|electrician|electric|wire;power
h|paparazzi|photographer|camera;celebrity
h|tour guide|guide|tourist
h|zookeeper|zoo keeper|zoo;animals
h|beekeeper|bee keeper|bee;honey
h|acrobat|gymnast|circus;flip
h|conductor|orchestra conductor|music;baton
h|fortune teller|psychic|crystal ball
h|scuba diver|diver|ocean;tank
h|chimney sweep|sweep|chimney;soot
h|mime artist|mime|silent;face paint
h|personal trainer|trainer;coach|gym;fitness
`,

  sports: `
e|football|soccer|ball;goal;kick
e|basketball|hoops|ball;hoop;court
e|tennis|tennis ball|racket;ball;net
e|cricket|cricket bat|bat;ball;wicket
e|baseball|softball|bat;ball;glove
e|golf|mini golf|ball;club;hole
e|skateboard|skateboarding|wheels;ramp
e|boxing|boxer|gloves;punch;ring
e|kite|kites|wind;string;sky
e|chess|chessboard|king;queen;knight
e|dice|die|game;roll
e|yoga|stretching|mat;meditate
e|trophy|cup;award|win;gold
e|medal|gold medal|win;olympics
e|skiing|ski|snow;mountain
e|swing|swings|playground;park
e|slide|playground slide|playground;park
m|cycling|biking|bike;helmet
m|bowling ball|ball|pins;bowling
m|volleyball|beach volleyball|ball;net
m|badminton|shuttlecock|racket;net
m|ice hockey|hockey|puck;stick;ice
m|rugby|rugby ball|ball;tackle
m|karate|kung fu;martial arts|belt;kick
m|archery|bow and arrow|arrow;target
m|surfboard|surfing|wave;beach
m|snowboard|snowboarding|snow;mountain
m|roller skates|rollerblades;inline skates|skates;wheels
m|trampoline|bouncy castle|jump
m|fishing rod|fishing pole|fish;hook
m|playing cards|cards;deck of cards|poker;ace
m|video game|gaming|controller;console
m|darts|dartboard|target;arrow
m|treadmill|running machine|gym;run
m|dumbbell|weights;barbell|gym;lift
m|marathon|race|run;finish line
m|olympics|olympic games|rings;medal
m|tug of war|rope pull|rope;team
m|hula hoop|hoop|spin;waist
m|frisbee|flying disc|throw;dog
m|horse riding|horseback riding|horse;saddle
m|board game|boardgame|dice;counters
m|table tennis|ping pong|paddle;ball
m|goalkeeper|goalie|goal;gloves
m|whistle|referee whistle|referee;blow
m|soccer ball|football|kick;goal
m|swimming goggles|goggles|pool;swim
h|hopscotch|hop scotch|chalk;jump
h|sumo wrestling|sumo|wrestle;japan
h|fencing|sword fighting|sword;mask
h|figure skating|ice skating|ice;skates
h|pole vault|pole vaulting|jump;bar
h|rock climbing|climbing|wall;rope
h|water polo|polo|pool;ball
h|gymnastics|gymnast|flip;balance
h|rubik's cube|rubiks cube;cube|puzzle;colors
h|origami|paper folding|paper;crane
h|karaoke|singalong|microphone;song
h|checkmate|chess|king
h|hat trick|hattrick|goal;three
h|photo finish|finish line|race
h|penalty kick|penalty|goal;football
h|slam dunk|dunk|basketball;hoop
h|scuba diving|diving|ocean;tank
`,

  movies: `
e|Frozen|frozen 2|elsa;anna;olaf;snow
e|Toy Story|toy story 2|woody;buzz;toys
e|Spider-Man|spiderman;spider man|spider;web;superhero
e|Batman|bat man;the batman|bat;joker;gotham
e|Superman|super man|cape;krypton;superhero
e|Harry Potter|potter|wizard;hogwarts;wand
e|Shrek|shrek 2|ogre;donkey;fiona
e|Finding Nemo|nemo;finding dory|fish;clownfish;dory
e|The Lion King|lion king|simba;lion;mufasa
e|Star Wars|starwars|lightsaber;jedi;darth vader
e|Cars|lightning mcqueen|car;race
e|Minions|minion|despicable me;banana;yellow
e|Mickey Mouse|mickey|disney;mouse
m|Titanic|the titanic|ship;iceberg;jack;rose
m|Jaws|jaws 2|shark;beach
m|Jurassic Park|jurassic world|dinosaur;t rex
m|Ghostbusters|ghost busters|ghost;slime
m|Avatar|avatar 2|blue;pandora
m|The Avengers|avengers|iron man;thor;hulk;marvel
m|Iron Man|ironman|suit;avengers;tony stark
m|Hulk|incredible hulk|green;avengers
m|Pokemon|pokémon;pikachu|ball;ash
m|SpongeBob|spongebob squarepants;sponge bob|sponge;patrick;pineapple
m|The Simpsons|simpsons|homer;bart;yellow
m|Tom and Jerry|tom & jerry|cat;mouse
m|Up|up movie|balloons;house;pixar
m|Kung Fu Panda|kungfu panda|panda;po
m|Ice Age|ice age 2|mammoth;sloth;squirrel
m|Madagascar|madagascar 2|zebra;lion;penguins
m|Pirates of the Caribbean|pirates|jack sparrow;ship
m|The Little Mermaid|little mermaid|ariel;mermaid
m|Cinderella|cinderella story|glass slipper;pumpkin
m|Snow White|snow white and the seven dwarfs|apple;dwarfs
m|Beauty and the Beast|beauty & the beast|rose;beast;belle
m|Aladdin|alladin|lamp;genie;carpet
m|Peter Pan|peterpan|tinkerbell;hook
m|King Kong|kong|gorilla;skyscraper
m|Godzilla|gojira|monster;lizard
m|Squid Game|squidgame|game;red light green light
m|Stranger Things|strangerthings|eleven;demogorgon
m|Game of Thrones|got|dragon;throne
m|Friends|friends tv show|central perk;couch
m|Mr Bean|mr. bean;bean|teddy;mini
m|Barbie|barbie movie|doll;pink
m|Inside Out|inside out 2|emotions;joy
m|Monsters Inc|monsters, inc.;monsters university|sully;mike
m|Coco|coco movie|guitar;skeleton
m|Moana|moana 2|ocean;maui
m|Wall-E|walle;wall e|robot;eve
m|Ratatouille|ratatoullie|rat;chef
m|Home Alone|home alone 2|kid;burglar;christmas
m|Paddington|paddington bear|bear;marmalade
m|The Incredibles|incredibles|superhero;family
m|Scooby-Doo|scooby doo;scooby|dog;mystery
h|The Matrix|matrix|neo;red pill
h|Back to the Future|back to the future 2|time machine;car
h|E.T.|et;e t|alien;bicycle
h|Jumanji|jumanji 2|board game;jungle
h|Inception|inception movie|dream;spinning top
h|Interstellar|interstellar movie|space;black hole
h|The Wizard of Oz|wizard of oz|dorothy;yellow brick road
h|Breaking Bad|breakingbad|chemistry;walter white
h|The Office|office|dunder mifflin
h|Mission Impossible|mission: impossible|tom cruise;spy
h|James Bond|007;bond|spy;tuxedo
h|Indiana Jones|indiana|whip;hat
h|Sherlock Holmes|sherlock|detective;pipe
h|Mary Poppins|poppins|umbrella;nanny
h|Pinocchio|pinnochio|nose;puppet
h|The Jungle Book|jungle book|mowgli;baloo
h|Despicable Me|despicable me 2|minions;gru
h|Zootopia|zootropolis|bunny;fox
h|Encanto|encanto movie|family;magic
h|Oppenheimer|oppenheimer movie|bomb
h|Transformers|transformer|robot;car
h|The Terminator|terminator|robot;cyborg
h|Charlie and the Chocolate Factory|willy wonka;wonka|chocolate;factory
`,

  brands: `
e|Apple|apple inc;iphone|mac;logo;phone
e|Nike|nike shoes|swoosh;shoes;just do it
e|McDonald's|mcdonalds;mcdonald|burger;fries;golden arches
e|Coca-Cola|coca cola;coke|soda;bottle;pepsi
e|Google|google search|search;chrome
e|YouTube|you tube|video;play button
e|Lego|legos|bricks;toy
e|Netflix|netflix app|movies;red
e|Amazon|amazon prime|box;delivery;smile
e|Instagram|insta;ig|camera;photo
e|Pepsi|pepsi cola|soda;coke
e|Disney|walt disney|mickey;castle
e|WhatsApp|whats app|chat;phone;message
m|Starbucks|starbucks coffee|coffee;mermaid
m|Adidas|addidas|three stripes;shoes
m|Puma|puma shoes|cat;shoes
m|Facebook|fb;meta|like;social media
m|Twitter|tweet|bird;social media
m|TikTok|tik tok|video;dance
m|Snapchat|snap|ghost;yellow
m|Spotify|spotify music|music;green
m|Uber|uber eats|taxi;ride
m|Tesla|tesla motors|electric car;elon musk
m|Ferrari|ferrari car|red car;horse
m|BMW|bmw car|car
m|Mercedes|mercedes benz;benz|car;star
m|Toyota|toyota car|car
m|Samsung|samsung galaxy|phone;tv
m|Sony|sony tv|tv;camera
m|PlayStation|ps5;ps4|controller;game
m|Xbox|x box|controller;game
m|Nintendo|nintendo switch|mario;game
m|KFC|kentucky fried chicken|chicken;bucket
m|Domino's|dominos|pizza;delivery
m|Burger King|burgerking|burger;crown
m|Subway|subway sandwich|sandwich
m|Pizza Hut|pizzahut|pizza;hut
m|KitKat|kit kat|chocolate;break
m|Oreo|oreos|cookie;milk
m|Nutella|nutella jar|chocolate;spread
m|Pringles|pringle|chips;can
m|Red Bull|redbull|energy drink;wings
m|Microsoft|windows|computer;bill gates
m|IKEA|ikea furniture|furniture;sweden
m|Gmail|google mail|email
m|Zoom|zoom call|video call
m|Airbnb|air bnb|house;travel
m|Lay's|lays|chips
m|Rolex|rolex watch|watch;gold
m|Gucci|gucci bag|fashion
m|Crocs|croc|shoes;clogs
m|Converse|chucks|shoes
m|Duolingo|duo|owl;language
m|Super Mario|mario|nintendo;plumber
h|Levi's|levis|jeans
h|Vans|vans shoes|shoes
h|Zara|zara store|clothes
h|Visa|visa card|credit card
h|Mastercard|master card|credit card
h|Shell|shell petrol|gas station
h|Heinz|heinz ketchup|ketchup
h|Toblerone|toblerone bar|chocolate;triangle
h|Michelin|michelin man|tyre
h|Monopoly|monopoly game|board game
h|Chupa Chups|chupa|lollipop
h|Duracell|duracell bunny|battery
h|Android|android phone|robot;google
h|Bluetooth|blue tooth|wireless
h|Wikipedia|wiki|encyclopedia
h|LinkedIn|linked in|job
h|Reddit|reddit alien|alien
h|Lamborghini|lambo|car;bull
h|Porsche|porsche car|car
h|Volkswagen|vw|beetle;car
h|Jeep|jeep car|car
h|Dunkin|dunkin donuts|donut
h|Pinterest|pinterest board|pin
`,

  nature: `
e|sun|sunshine;sunny|hot;summer;sky
e|moon|full moon;crescent|night;star
e|star|stars|night;sky;moon
e|cloud|clouds;cloudy|rain;sky
e|rain|raining;rainy;drizzle|umbrella;cloud
e|snow|snowing;snowfall|snowflake;cold;winter
e|rainbow|rainbows|rain;colors;sky
e|tree|trees;oak;pine|leaf;forest
e|flower|flowers;daisy;tulip|petal;garden
e|leaf|leaves|tree;green
e|mountain|mountains;hill|snow;climb
e|river|stream;creek|water;bridge
e|volcano|volcanoes|lava;eruption
e|fire|flame;flames|hot;smoke
e|lightning|lightning bolt;thunderbolt|storm;cloud;thunder
e|wave|waves|ocean;surf
e|sunflower|sunflowers|flower;yellow
e|cactus|cacti|desert;spikes
e|rose|roses|flower;thorn;red
e|grass|lawn|green;garden
e|snowman|snow man|snow;carrot
m|tornado|twister;whirlwind|wind;storm
m|thunderstorm|storm;thunder|lightning;rain
m|snowflake|snowflakes|snow;winter
m|sunset|sunrise;dusk|sun;evening
m|palm tree|coconut tree|beach;island
m|forest|woods;woodland|trees
m|lake|pond|water;fish
m|ocean|sea|waves;water
m|iceberg|glacier|ice;titanic
m|earthquake|quake|shake;crack
m|hurricane|cyclone;typhoon|storm;wind
m|cliff|cliffs|rock;edge
m|desert island|island|palm tree
m|four leaf clover|clover;shamrock|luck
m|planet|planets;saturn|space
m|comet|meteor;asteroid|space
m|fog|mist;foggy|cloud
m|puddle|puddles|rain;splash
m|acorn|acorns|oak;squirrel
m|pinecone|pine cone|tree
m|seashell|shell;sea shell|beach
m|coral reef|coral;reef|ocean;fish
m|footprint|footprints|feet;sand
m|bonfire|campfire|fire
m|sandcastle|sand castle|sand;beach
m|tulip|tulips|flower
m|mushroom ring|fairy ring|mushroom
m|wind|breeze;windy|kite;blow
m|ice|ice cube;frozen|cold;water
h|solar eclipse|eclipse|sun;moon
h|northern lights|aurora;aurora borealis|sky;lights
h|avalanche|snowslide|snow;mountain
h|tsunami|tidal wave|wave;ocean
h|constellation|stars|sky
h|shooting star|falling star|star;wish
h|black hole|blackhole|space
h|whirlpool|vortex|water
h|quicksand|quick sand|sand;sink
h|hailstorm|hail|ice;storm
h|stalactite|stalagmite|cave
h|monsoon|rainy season|rain
h|photosynthesis|plants|sun;leaf
h|food chain|food web|animals
h|mirage|illusion|desert
h|oasis|desert oasis|desert;water
h|crop circle|crop circles|aliens;field
h|gravity|gravitation|apple;fall
h|dew drop|dewdrop;dew|morning;water
`,

  transport: `
e|car|automobile;auto|wheel;drive;road
e|bus|school bus;coach|stop;road
e|train|locomotive;railway|track;station
e|plane|airplane;aeroplane;jet|airport;fly;wings
e|boat|ship;sailboat|sea;sail
e|bicycle|bike;cycle|wheel;pedal
e|truck|lorry|road;delivery
e|helicopter|chopper|rotor;fly
e|rocket|spaceship;space rocket|space;launch
e|tractor|farm tractor|farm
e|taxi|cab|car;yellow
e|motorcycle|motorbike|helmet;road
e|ambulance|ambulance van|hospital;siren
e|fire truck|fire engine|fire;ladder
e|police car|cop car|siren;police
e|submarine|sub|ocean;periscope
e|scooter|moped|wheels
e|map|atlas|travel;directions
e|suitcase|luggage|travel;airport
m|hot air balloon|balloon|basket;sky
m|sailboat|yacht|sail;sea
m|canoe|kayak|paddle;river
m|parachute|parachutes|skydiving
m|traffic light|stop light;traffic signal|red;green
m|speed bump|bump|road;car
m|passport|passport stamp|travel;airport
m|compass|compass needle|north;directions
m|anchor|anchors|ship;sea
m|cable car|gondola|mountain;cable
m|roller coaster|rollercoaster|ride;amusement park
m|wheelchair|wheel chair|wheels
m|spaceship|spacecraft;ufo|space;alien
m|steering wheel|wheel|car;drive
m|road sign|sign|road
m|ticket|tickets|train;cinema
m|pirate ship|ship|pirate;sail
m|bulldozer|digger;excavator|construction
m|crane|tower crane|construction
m|tank|army tank|army
m|jet ski|jetski|water;wave
m|limousine|limo|car;fancy
m|school bus|bus|school;yellow
m|cruise ship|cruise;ocean liner|ship;holiday
m|steam train|steam engine|train;smoke
h|periscope|telescope|submarine
h|tugboat|tug boat|ship;harbor
h|toll booth|toll|road;car
h|zebra crossing|crosswalk;pedestrian crossing|road;stripes
h|flat tyre|flat tire;puncture|car;wheel
h|seatbelt|seat belt|car
h|hitchhiker|hitchhiking|thumb
h|jet lag|jetlag|plane;tired
h|conveyor belt|conveyor|airport
h|gondola|venice boat|venice;boat
h|space shuttle|shuttle|space;rocket
h|monorail|monorail train|train
h|unicycle|uni cycle|wheel;circus
h|hoverboard|segway|wheels
h|lifeboat|life boat|ship
h|propeller|propellor|plane;fan
h|tandem bicycle|tandem|bicycle;two
h|boarding pass|ticket|plane;airport
`,

  fantasy: `
e|dragon|dragons|fire;wings;castle
e|unicorn|unicorns|horn;rainbow;horse
e|ghost|spirit;phantom|boo;haunted
e|robot|android;droid|metal;machine
e|alien|martian;extraterrestrial|ufo;space
e|wizard|sorcerer;warlock|wand;hat;magic
e|witch|sorceress|broom;cat;hat
e|mermaid|merman|sea;tail;fish
e|vampire|dracula|fangs;blood;bat
e|monster|beast|scary
e|fairy|pixie|wings;wand
e|crown|tiara|king;queen
e|treasure chest|treasure|gold;pirate
e|magic wand|wand|magic;wizard
m|zombie|zombies;undead|brains
m|mummy|mummies|pyramid;bandages
m|superhero|super hero|cape;mask
m|werewolf|wolfman|moon;wolf
m|giant|ogre|big
m|genie|djinn|lamp;wish
m|elf|elves|christmas;ears
m|troll|trolls|bridge
m|goblin|gremlin|green
m|skeleton|skeletons;skull|bones
m|jack-o'-lantern|jack o lantern;pumpkin|halloween
m|magic carpet|flying carpet|carpet;aladdin
m|crystal ball|fortune|glass ball
m|Santa Claus|santa;father christmas|christmas;sleigh
m|tooth fairy|fairy|tooth;pillow
m|time machine|time travel|clock
m|flying saucer|ufo|alien
m|potion|magic potion|bottle;witch
m|spell book|spellbook|magic;book
m|centaur|half horse|horse;bow
m|cyclops|one eyed giant|eye
m|phoenix|firebird|fire;bird
m|Frankenstein|frankenstein's monster|monster
m|leprechaun|leprechauns|pot of gold;rainbow
m|Easter Bunny|easter rabbit|eggs;easter
m|haunted castle|castle|ghost;spooky
m|sword|blade|knight;fight
m|shield|armor|knight
h|Medusa|gorgon|snakes;stone
h|Pegasus|winged horse|wings;horse
h|Loch Ness Monster|nessie|lake;scotland
h|Bigfoot|sasquatch;yeti|footprint;forest
h|invisibility cloak|invisible cloak|harry potter
h|Excalibur|sword in the stone|sword;king arthur
h|Trojan horse|wooden horse|troy
h|Humpty Dumpty|humpty|egg;wall
h|Jack and the Beanstalk|beanstalk|giant;bean
h|Little Red Riding Hood|red riding hood|wolf;grandma
h|Rapunzel|rapunzle|hair;tower
h|Sleeping Beauty|sleeping princess|princess;sleep
h|Goldilocks|goldilocks and the three bears|bears;porridge
h|Pied Piper|piper|rats;flute
h|Kraken|giant squid|octopus;sea
h|Minotaur|bull man|labyrinth;bull
h|griffin|gryphon|eagle;lion
h|pot of gold|gold|rainbow;leprechaun
h|wishing well|well|coin;wish
`,

  tech: `
e|computer|pc;desktop|screen;keyboard
e|phone|mobile;cellphone;smartphone|call;app
e|laptop|notebook;macbook|computer
e|camera|webcam|photo;picture
e|headphones|earphones;headset|music;ears
e|keyboard|keys|computer;type
e|calculator|calc|math;numbers
e|radio|stereo|music;antenna
e|microphone|mic|sing;voice
m|computer mouse|mouse|click;computer
m|tablet|ipad|screen;touch
m|smartwatch|apple watch|wrist;watch
m|printer|printing|paper;ink
m|joystick|gamepad|game
m|satellite|satellite dish|space;orbit
m|drone|quadcopter|fly;camera
m|wifi|wi-fi;wireless|internet;signal
m|charger|charging cable|battery;plug
m|plug|socket|electricity
m|remote control|remote|tv
m|selfie stick|selfie|phone;stick
m|speaker|loudspeaker|music;sound
m|USB stick|usb;flash drive;pen drive|computer
m|email|e-mail;mail|letter;inbox
m|password|passcode|lock;login
m|emoji|smiley|face;phone
m|hashtag|hash tag|twitter
m|QR code|qr|scan;code
m|computer virus|virus|bug
m|video call|facetime|camera;call
m|game controller|controller|video game
m|vending machine|vending|snacks;coins
m|ATM|cash machine|money;card
m|3D glasses|3d|movie;glasses
m|telescope|binoculars|stars;space
m|microscope|magnifier|lab;cells
m|robot vacuum|roomba|vacuum
m|television remote|remote|tv
h|virtual reality|vr;vr headset|goggles
h|artificial intelligence|ai|robot
h|barcode|bar code|scan
h|screenshot|screen shot|phone
h|loading screen|loading|computer
h|solar panel|solar|sun;energy
h|wind turbine|windmill|wind;energy
h|escalator|moving stairs|stairs
h|elevator|lift|floor
h|search engine|search|internet
h|spam|junk mail|email
h|low battery|battery low|phone
h|firewall|fire wall|computer
h|hologram|holo|3d
h|cursor|pointer|mouse
h|traffic camera|speed camera|car;road
h|power bank|portable charger|battery
`,

  clothes: `
e|hat|cap;beanie|head
e|shoe|shoes;sneaker;sneakers|foot;laces
e|sock|socks|foot;shoe
e|shirt|t-shirt;tshirt;blouse|clothes
e|dress|gown;frock|skirt;wedding
e|glasses|spectacles;specs|eyes
e|ring|wedding ring|finger;diamond
e|watch|wristwatch|time;wrist
e|scarf|muffler|neck;winter
e|glove|gloves;mitten|hand;winter
e|jacket|coat|winter
e|pants|trousers;jeans|legs
e|boots|boot|shoes;rain
e|bag|handbag;purse|carry
e|skirt|miniskirt|dress
m|sunglasses|shades|sun;glasses
m|necklace|chain;pendant|neck;jewelry
m|bow tie|bowtie|tie;suit
m|tie|necktie|suit;shirt
m|belt|belts|pants;buckle
m|high heels|heels;stilettos|shoes
m|flip flops|sandals;slippers|beach
m|raincoat|rain jacket|rain
m|wallet|billfold|money
m|earrings|earring|ears;jewelry
m|bracelet|bangle|wrist
m|helmet|hard hat|head;bike
m|apron|pinafore|kitchen;cook
m|pajamas|pyjamas|sleep;bed
m|hoodie|sweatshirt|hood
m|sweater|jumper;pullover|wool
m|swimsuit|bikini;swimming costume|beach;pool
m|cowboy hat|stetson|cowboy
m|top hat|tophat|magician
m|baseball cap|cap|baseball
m|mittens|gloves|winter
m|tuxedo|suit|wedding
m|wedding dress|bridal gown|bride
m|lipstick|lip gloss|makeup
m|perfume|cologne|smell
m|hair bow|bow;ribbon|hair
m|shorts|short pants|summer;legs
m|slippers|slipper|bed;feet
h|monocle|eyeglass|eye
h|cufflinks|cuff links|shirt
h|suspenders|braces|pants
h|tiara|diadem|princess
h|kilt|tartan skirt|scotland
h|beret|french hat|france
h|sombrero|mexican hat|mexico
h|ponytail|pony tail|hair
h|mustache|moustache|beard
h|eyepatch|eye patch|pirate
h|wristband|sweatband|wrist
h|handcuffs|cuffs|police
h|zipper|zip|jacket
h|button|buttons|shirt
h|fanny pack|bum bag;waist bag|bag
h|onesie|jumpsuit|pajamas
h|tutu|ballet skirt|ballet
h|shoelace|lace;laces|shoe
`,
};

export type Level = "easy" | "medium" | "hard";

export interface WordEntry {
  word: string;
  level: Level;
  category: CategoryId;
  very: string[];
  close: string[];
}

const LEVELS: Record<string, Level> = { e: "easy", m: "medium", h: "hard" };
const list = (s: string | undefined) => (s ?? "").split(";").map((x) => x.trim()).filter(Boolean);

function parse(): WordEntry[] {
  const out: WordEntry[] = [];
  const seen = new Set<string>();
  for (const [category, block] of Object.entries(DATA) as [CategoryId, string][]) {
    for (const raw of block.split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      const [lv, word, very, close] = line.split("|");
      const level = LEVELS[lv];
      if (!level || !word?.trim()) continue;
      const key = `${category}:${word.trim().toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ word: word.trim(), level, category, very: list(very), close: list(close) });
    }
  }
  return out;
}

export const WORD_ENTRIES: WordEntry[] = parse();
