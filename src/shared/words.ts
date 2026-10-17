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
e|kitten|kitty;cat;baby cat|meow;yarn;whiskers;cute
e|lamb|sheep;baby sheep|wool;farm;baa;fluffy
e|goose|geese;gander|duck;honk;pond;feather
e|starfish|sea star|beach;ocean;arms;sand
e|hamster|gerbil;guinea pig|wheel;cage;pet;seeds
e|pony|small horse;foal|saddle;mane;ride
e|calf|baby cow;cow|milk;farm;moo
e|chick|baby chicken;chicken|egg;yellow;farm;peep
e|piglet|baby pig;pig|mud;pink;farm
e|tortoise|turtle|shell;slow;race
e|fly|housefly;bluebottle|buzz;insect;wings;swatter
e|dinosaur|t rex;dino|fossil;extinct;roar;jurassic
e|crow|raven;blackbird|black;bird;caw;scarecrow
e|parakeet|budgie;budgerigar|bird;cage;green
m|cheetah|leopard;jaguar|fast;spots;run;savanna
m|arctic fox|polar fox|snow;white
m|raccoon|racoon|mask;trash;tail;night
m|otter|sea otter;river otter|river;float;shell
m|moose|elk|antlers;canada;forest
m|reindeer|caribou|santa;sleigh;antlers;snow
m|bison|buffalo|horns;prairie;herd
m|yak|ox|mountain;horns;fur
m|llama|alpaca|wool;peru;spit
m|hyena|hyenas|laugh;savanna;scavenger
m|meerkat|mongoose|desert;burrow;stand
m|toucan|hornbill|beak;bird;rainforest
m|pelican|stork|beak;pouch;fish;bird
m|seagull|gull|beach;bird;chips
m|stork|heron|baby;beak;bird
m|robin|redbreast|bird;worm;red
m|rooster|cockerel;cock|crow;dawn;farm
m|bull|ox|horns;red;matador
m|salmon|trout|river;jump;pink;fish
m|swordfish|marlin|sword;ocean;fish
m|clownfish|nemo|anemone;orange;stripes
m|shrimp|prawn|seafood;pink;sea
m|squid|calamari;octopus|ink;tentacles;sea
m|sea turtle|turtle|ocean;shell;swim
m|tadpole|frog|pond;tail;swim
m|cockroach|roach|bug;kitchen;insect
m|dragonfly|damselfly|wings;pond;insect
m|firefly|lightning bug|glow;night;insect
m|centipede|millipede|legs;bug
m|chipmunk|squirrel|nut;cheeks;stripes
m|mole|vole|tunnel;dig;garden
m|badger|wolverine|stripes;burrow
m|guinea pig|hamster|pet;cage
m|jaguar|leopard;panther|spots;jungle
m|gazelle|antelope;impala|savanna;run;horns
m|warthog|boar|tusks;africa;pig
m|orangutan|ape;monkey|orange;jungle;tree
m|puffin|penguin|beak;bird;cliff
m|iguana|lizard|reptile;green;scales
m|gecko|lizard|wall;reptile
m|pigeon|dove|city;bird;statue
m|dove|pigeon|peace;white;bird
m|hawk|falcon;eagle|bird;hunt;sky
h|axolotl|salamander|pink;water;gills
h|pangolin|anteater|scales;ball
h|tapir|anteater|nose;jungle
h|lemur|monkey|tail;madagascar;rings
h|okapi|giraffe;zebra|stripes;forest
h|manatee|sea cow;dugong|water;slow
h|komodo dragon|monitor lizard|lizard;reptile;island
h|hermit crab|crab|shell;beach
h|sea urchin|urchin|spikes;ocean
h|electric eel|eel|shock;water
h|snow leopard|leopard|mountain;spots;snow
h|blobfish|ugly fish|deep sea;pink
h|hammerhead shark|shark|ocean;head
h|bald eagle|eagle|america;bird
h|tasmanian devil|devil|australia;growl
h|flying fish|fish|ocean;wings
h|basset hound|hound;dog|ears;sad
h|dalmatian|spotty dog;dog|spots;firefighter
h|poodle|dog|curly;fluffy
h|bulldog|dog|wrinkles;drool
h|mantis shrimp|shrimp|colorful;punch
h|sea lion|seal|ocean;bark;ball
h|kingfisher|bird|river;fish;blue
m|ferret|weasel|pet;tube
m|weasel|stoat;ferret|sneaky
m|stag|deer|antlers;forest
m|cobra|snake|hood;hiss;charmer
m|wasp|hornet;bee|sting;yellow;stripes
m|tuna|fish|can;ocean
m|eel|moray|slippery;water
m|mule|donkey|cart;stubborn
m|flea|bug|dog;itch;jump
m|termite|ant|wood;mound
h|koi|carp;goldfish|pond;japan;orange
h|albatross|seabird|wings;ocean
h|emu|ostrich|australia;bird
h|wombat|koala|australia;burrow
h|piranha|fish|teeth;river
h|marmot|groundhog|burrow;mountain
h|groundhog|marmot;woodchuck|shadow;burrow
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
e|blueberry|berry;bilberry|blue;muffin;fruit
e|raspberry|berry|red;fruit;jam
e|lime|lemon|green;sour;citrus
e|plum|prune|purple;fruit
e|apricot|peach|orange;fruit
e|cabbage|lettuce|green;salad;leaves
e|lettuce|cabbage|salad;green;leaf
e|peas|pea;green peas|pod;green
e|beans|bean;baked beans|can;green
e|chips|crisps|potato;packet;salty
e|biscuit|cookie;cracker|tea;crumb
e|muffin|cupcake|blueberry;bake
e|jelly|jello;gelatin|wobble;dessert
e|butter|margarine|toast;knife;yellow
e|yogurt|curd|cup;spoon;milk
e|soda|fizzy drink;pop|can;bubbles
e|water bottle|bottle|drink;plastic
e|pasta|noodles;macaroni|italy;sauce
e|salt|salt shaker|pepper;shaker
e|sugar|sugar cube|sweet;spoon
e|ketchup|tomato sauce|bottle;fries;red
e|candy cane|candy|christmas;stripes
e|cherry pie|pie|dessert;crust
e|fruit bowl|bowl of fruit|apple;banana
e|cookies and milk|milk and cookies|glass;dunk
e|cheese sandwich|sandwich|bread;slice
e|boiled egg|egg|shell;yolk
e|bun|bread roll;roll|bakery;burger
m|bagel|doughnut|bread;hole;cream cheese
m|burrito|wrap;taco|mexico;beans;rice
m|quesadilla|taco|cheese;tortilla
m|cheeseburger|burger|bun;cheese
m|french toast|toast|egg;breakfast
m|porridge|oatmeal|bowl;breakfast;oats
m|cornflakes|cereal|milk;bowl
m|sundae|ice cream|cherry;sauce;nuts
m|banana split|sundae;ice cream|cherry;scoop
m|brownie|chocolate cake|square;chocolate
m|macaron|macaroon|french;colorful;cookie
m|eclair|pastry|cream;chocolate
m|cinnamon roll|cinnamon bun|swirl;icing
m|apple pie|pie|crust;dessert
m|jelly beans|jellybeans;candy|sweet;colorful
m|chewing gum|gum|chew;bubble
m|peanut butter|peanuts|jar;jam;sandwich
m|eggplant|aubergine;brinjal|purple;vegetable
m|bell pepper|capsicum;pepper|green;red;vegetable
m|radish|beet|red;root
m|beetroot|beet|red;root;purple
m|cauliflower|broccoli|white;vegetable
m|asparagus|spears|green;vegetable
m|celery|stalk|green;crunch
m|zucchini|courgette|squash;green
m|sweet potato|yam|orange;root
m|ginger|ginger root|root;spice
m|chestnut|nut|roast;brown
m|walnut|nut|shell;brain
m|almond|nut|shell;brown
m|cashew|nut|curved
m|olive|olives|oil;green;black
m|fig|figs|fruit;purple
m|papaya|pawpaw|orange;seeds;fruit
m|grapefruit|orange|pink;citrus;sour
m|cranberry|berry|red;sauce
m|blackberry|berry|black;bush
m|dates|date|sweet;palm;desert
m|lemon tart|tart|pastry;yellow
m|pudding|custard|dessert;spoon
m|custard|pudding|yellow;dessert
m|fish and chips|fish|chips;newspaper;fried
m|roast chicken|chicken|oven;dinner;leg
m|chicken wings|wings|spicy;sauce
m|drumstick|chicken leg|bone;chicken
m|fried rice|rice|wok;egg
m|salmon fillet|fish|pink
m|baked potato|jacket potato;potato|butter;oven
m|mashed potatoes|mash;potato|gravy
m|garlic bread|bread|butter;garlic
m|pepperoni|salami|pizza;sausage
m|hot sauce|chili sauce|spicy;bottle
m|mustard|mayonnaise|yellow;hot dog
m|mayonnaise|mayo|white;jar
m|vinegar|sauce|bottle;sour
m|cocktail|mocktail|glass;umbrella;straw
m|coconut water|coconut|straw;tropical
m|iced tea|tea|ice;glass
m|hot cross bun|bun|cross;easter
h|sushi roll|sushi|seaweed;rice
h|ramen|noodle soup;noodles|bowl;chopsticks;japan
h|dim sum|dumpling|bamboo;steam
h|paella|rice|spain;pan;seafood
h|fondue|cheese fondue|melted;fork;pot
h|tiramisu|cake|coffee;italy
h|souffle|cake|rise;oven
h|crepe|pancake|thin;french
h|churros|churro|sugar;stick;fried
h|baguette|bread|french;long
h|pita bread|flatbread|pocket
h|falafel|chickpea|ball;fried
h|hummus|dip|chickpea;pita
h|guacamole|avocado dip|avocado;dip;green
h|salsa|dip|tomato;nachos
h|sorbet|ice cream|fruit;scoop
h|gingerbread house|gingerbread|christmas;candy;house
h|wedding cake|cake|tiers;bride
h|layer cake|cake|layers;slice
h|maple syrup|syrup|pancake;canada;sweet
h|corn on the cob|corn|butter;yellow
h|stuffed turkey|roast turkey|thanksgiving;dinner
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
e|door handle|doorknob;handle|door;turn
e|teapot|kettle|tea;spout;cup
e|mug|cup|coffee;handle
e|glass of water|glass;tumbler|drink;water
e|bottle|flask|cap;drink
e|jar|pot|lid;jam
e|pan|frying pan;pot|cook;stove
e|pot|saucepan|cook;lid;stove
e|stove|cooker;hob|kitchen;fire;cook
e|desk|table|chair;work;drawer
e|stool|chair|seat;bar
e|bench|seat|park;sit
e|cupboard|cabinet;closet|kitchen;doors
e|drawer|cabinet|desk;pull
e|carpet|rug|floor
e|rug|carpet;mat|floor
e|tap|faucet|water;sink
e|bin|trash can;dustbin|rubbish;lid
e|crayon|crayons|draw;color
e|eraser|rubber|pencil;mistake
e|ruler|scale|measure;straight
e|notebook|book|write;pages
e|pen|ballpoint|ink;write
e|tissue|tissues;napkin|nose;sneeze
e|toothpaste|tooth paste|toothbrush;teeth
e|shampoo|soap|hair;bottle
e|sponge|scrubber|wash;dishes;soap
e|cushion|pillow|sofa;soft
e|crib|cot|baby;sleep
e|rocking horse|toy horse|toy;rock
e|doll|dolly|toy;girl
e|toy car|car|toy;wheels
e|bell|doorbell|ring;ding
e|globe|world|earth;map;spin
e|letter|envelope|post;stamp
e|newspaper|paper|news;read
e|photo|photograph|picture;camera
e|lunchbox|lunch box|school;sandwich
m|armchair|chair|sofa;sit
m|bean bag|beanbag|sit;soft
m|hammock|swing|tree;relax
m|cradle|crib|baby;rock
m|wardrobe|closet|clothes;hanger
m|chest of drawers|dresser|drawers;bedroom
m|bedside table|nightstand|lamp;bed
m|dining table|table|dinner;chairs
m|staircase|stairs|steps;banister
m|chimney|smokestack|smoke;roof;santa
m|roof|rooftop|house;tiles
m|fence|railing|garden;gate
m|gate|door|fence;garden
m|garage|carport|car;door
m|attic|loft|roof;dusty
m|basement|cellar|stairs;dark
m|balcony|terrace|window;view
m|porch|veranda|door;steps
m|doormat|mat|welcome;shoes
m|coat hook|hook|coat;wall
m|clothes peg|peg;clothespin|washing line
m|washing line|clothesline|clothes;pegs
m|laundry basket|basket|clothes;dirty
m|dishwasher|washing machine|dishes;kitchen
m|spatula|turner|flip;pancake
m|whisk|mixer|eggs;beat
m|ladle|spoon|soup;scoop
m|grater|cheese grater|cheese
m|chopping board|cutting board|knife;kitchen
m|tea bag|teabag|tea;string
m|teaspoon|spoon|tea;stir
m|chopsticks|chopstick|noodles;rice
m|lunch tray|tray|food;cafeteria
m|tray|platter|carry;serve
m|thermos|flask|hot;drink
m|pepper shaker|pepper pot|salt
m|tablecloth|table cover|table;cloth
m|napkin|serviette|table;wipe
m|sticky tape|tape;sellotape|stick;roll
m|glue|glue stick|stick;paper
m|paint can|paint tin|brush;wall
m|toolbox|tool kit|tools;hammer
m|saw|handsaw|wood;cut
m|drill|power drill|hole;screw
m|nail|nails|hammer;wood
m|screw|bolt|screwdriver
m|mop|broom|floor;bucket;wet
m|dustpan|dust pan|broom;sweep
m|feather duster|duster|clean;dust
m|watering can|can|garden;plants
m|plant pot|flower pot|plant;soil
m|houseplant|plant|pot;leaves
m|hairdryer|hair dryer;blow dryer|hair;hot;air
m|hairbrush|brush;comb|hair
m|razor|shaver|shave;beard
m|bath mat|mat|bath;wet
m|shower curtain|curtain|bath;shower
m|bubble bath|bath|bubbles;foam
m|rubber duck|duck toy|bath;yellow;squeak
m|night light|lamp|dark;sleep
m|dollhouse|doll house|toy;dolls
h|grandfather clock|clock|pendulum;tall
h|pendulum|swing|clock
h|coffee maker|coffee machine|coffee;cup
h|dish rack|drying rack|plates;wash
h|spice rack|spices|kitchen;jars
h|pressure cooker|cooker|whistle;steam
h|air conditioner|ac;air con|cool;cold
h|radiator|heater|warm;pipe
h|space heater|heater|warm
h|humidifier|steam|mist
h|extension cord|cable|plug;socket
h|power socket|socket;outlet|plug;wall
h|fuse box|breaker|electric
h|doorstop|door stop|door
h|peephole|spy hole|door;eye
h|letterbox|mailbox|door;letters
h|egg timer|timer|eggs;sand
h|bookend|bookends|books;shelf
h|paperweight|weight|desk;paper
h|pincushion|pin cushion|pins;needles
h|thimble|finger cap|sewing;needle
h|knitting needles|needles|wool;yarn
h|ball of yarn|yarn;wool|knit;cat
h|step stool|stool|reach
h|recliner|armchair|relax;tv
h|ottoman|footstool|feet
h|hat stand|coat rack|hats
h|place mat|placemat|table;plate
h|tea cosy|cosy|teapot
h|cookie jar|jar|cookies;lid
h|bread bin|breadbox|bread
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
e|shop|store|buy;money
e|market|bazaar|stalls;fruit;buy
e|village|town|huts;farm
e|road|street|car;lane
e|street|road|lamp post;houses
e|pond|lake|duck;frog;water
e|bus stop|bus station|bus;wait;sign
e|bedroom|room|bed;sleep
e|living room|lounge|sofa;tv
e|tower|spire|tall;castle
e|well|water well|bucket;rope
e|tunnel|subway|dark;train
e|hut|cabin|straw;village
e|mall|shopping mall|shops;escalator
e|cafe|coffee shop|coffee;cake
e|toy shop|toy store|toys
e|pet shop|pet store|animals;fish
m|palace|castle|king;queen;royal
m|temple|shrine|worship;bell
m|mosque|minaret|dome;prayer
m|cathedral|church|bells;tower
m|log cabin|cabin|wood;forest
m|barber shop|salon|haircut;chair
m|gym|fitness center|weights;treadmill
m|theater|theatre|stage;curtain;play
m|concert|gig|stage;music;crowd
m|harbour|harbor;port|boats;dock
m|pier|jetty|sea;boats
m|marina|harbour|yachts
m|dam|reservoir|water;river
m|canal|waterway|boats;water
m|motel|hotel|road;sign
m|campsite|camping ground|tent;fire
m|car park|parking lot|cars
m|petrol pump|gas station|fuel;car
m|greenhouse|glasshouse|plants;glass
m|orchard|fruit farm|trees;apples
m|vineyard|grapes|vines;wine
m|ranch|farm|horses;cowboy
m|stable|barn|horses;hay
m|kennel|doghouse|dog
m|nest|bird nest|eggs;bird;tree
m|beehive|hive|bees;honey
m|anthill|ant hill|ants
m|police station|station|police;jail
m|courtroom|court|judge
m|water park|aqua park|slides;pool
m|bowling alley|bowling|pins;ball
m|ice rink|skating rink|skates;ice
m|race track|track|cars;race
m|football pitch|field;pitch|goal;grass
m|tennis court|court|net;tennis
m|cricket ground|stadium|pitch;bat
m|maze|labyrinth|hedges;lost
m|graveyard|cemetery|graves;ghost
m|crossroads|junction|roads;signs
m|roundabout|traffic circle|cars
m|highway|motorway;expressway|cars;fast
m|city skyline|skyline|buildings
h|India Gate|war memorial|delhi;arch
h|Red Fort|fort|delhi;red
h|Lotus Temple|temple|lotus;delhi
h|Great Pyramid|pyramid|egypt
h|Sphinx|lion statue|egypt;pyramid
h|Machu Picchu|ruins|peru;mountain
h|Niagara Falls|waterfall|canada;water
h|Grand Canyon|canyon|arizona;rocks
h|Christ the Redeemer|statue|rio;brazil;arms
h|Arc de Triomphe|arch|paris
h|Tower Bridge|bridge|london
h|London Eye|ferris wheel;big wheel|london
h|Burj Khalifa|skyscraper|dubai;tall
h|Times Square|square|new york;lights
h|Mount Fuji|volcano|japan;mountain
h|Angkor Wat|temple|cambodia
h|Petra|city|jordan;rock
h|Easter Island|statues|heads;island
h|Disneyland|theme park|castle;mickey
h|South Pole|antarctica|penguins;ice
h|Antarctica|south pole|ice;penguins
h|Sahara|desert|sand;camels
h|Amazon rainforest|rainforest|jungle;river
h|Venice|canals|gondola;italy
h|White House|president|america
h|Kremlin|moscow|russia;domes
h|planetarium|observatory|stars;dome
h|dungeon|prison|castle;dark
h|catacombs|tunnels|bones
h|art gallery|gallery|paintings;frame
h|laboratory|lab|scientist;test tube
h|factory|plant|chimney;workers
h|power station|power plant|electricity;chimney
h|oil rig|rig|ocean;drill
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
e|sitting|sit;seated|chair
e|standing|stand|feet
e|kneeling|kneel|knees;pray
e|hopping|hop;jump|one leg
e|throwing|throw;toss|ball
e|catching|catch|ball;hands
e|writing|write|pen;paper
e|drawing|sketching;draw|pencil;paper
e|playing|play|toys;game
e|riding a bike|cycling;biking|bicycle
e|hiding|hide|seek;behind
e|falling|fall;tripping|trip;ground
e|blowing bubbles|bubbles|wand;soap
e|brushing hair|combing hair|brush;comb
e|washing dishes|doing the dishes|sink;soap
e|taking a bath|bathing|bathtub;bubbles
e|showering|shower|water;soap
e|whispering|whisper|secret;ear
e|pointing|point|finger
e|shaking hands|handshake|hands;meet
e|high five|hi five|hands;clap
e|blowing a kiss|kiss|lips;heart
e|pushing|push|shove
e|pulling|pull|rope;tug
m|stretching|stretch|yoga;arms
m|lifting weights|weightlifting|dumbbell;gym
m|doing push ups|push ups;pushups|exercise;floor
m|jogging|running|park;shoes
m|sliding|slide|playground
m|swinging|swing|playground
m|digging|dig|shovel;hole
m|planting|planting a tree|seed;soil
m|watering plants|watering|can;garden
m|ironing|ironing clothes|iron;board
m|vacuuming|hoovering|vacuum cleaner
m|baking|bake|oven;cake
m|chopping|cutting|knife;board
m|stirring|stir|spoon;pot
m|pouring|pour|jug;glass
m|tasting|taste|spoon;tongue
m|sniffing|smelling|nose;flower
m|peeking|peeping|eye;hole
m|tiptoeing|tiptoe|quiet;sneak
m|sneaking|creeping|tiptoe;quiet
m|marching|march|soldier;band
m|saluting|salute|soldier;flag
m|bowing|bow|stage;audience
m|cheering|cheer|crowd;yay
m|crawling|crawl|baby;knees
m|rolling|roll|ball;floor
m|spinning|spin|dizzy;turn
m|flipping a coin|coin toss|heads;tails
m|blowing candles|blowing out candles|cake;birthday
m|opening a gift|unwrapping|present;box
m|wrapping a gift|gift wrapping|paper;bow
m|making a wish|wishing|star;candles
m|praying|pray|hands;temple
m|sewing|stitching|needle;thread
m|paddling|rowing|canoe;oar
m|sledding|sledging|snow;hill
m|snowball fight|snowball|snow;throw
m|pillow fight|pillows|bed;feathers
m|playing guitar|strumming|guitar;music
m|playing piano|piano|keys;music
m|drumming|drums|beat;sticks
m|conducting|conductor|orchestra;baton
m|limbo|limbo dance|bar;bend
h|tripping over|trip;stumble|fall
h|slipping on a banana|slipping;slip|banana peel
h|sleep talking|talking in sleep|dream
h|stargazing|star gazing|telescope;night
h|birdwatching|bird watching|binoculars;bird
h|cartwheel|cartwheeling|gymnastics;hands
h|somersault|forward roll|flip;tumble
h|handstand|upside down|hands;balance
h|headstand|upside down|yoga;head
h|breakdancing|break dance|spin;music
h|ballet dancing|ballet|tutu;tiptoe
h|tap dancing|tap dance|shoes;rhythm
h|belly flop|flop|pool;splash
h|cannonball|jump|pool;splash
h|arm wrestling|wrestling|table;arms
h|thumb war|thumb wrestling|thumbs
h|rock paper scissors|roshambo|hands;game
h|hide and seek|hiding|seek;count
h|musical chairs|chairs|music;game
h|leapfrog|leap frog|jump;game
h|sack race|potato sack race|sack;jump
h|egg and spoon race|egg race|egg;spoon
h|piggyback ride|piggyback|back;carry
h|tickling|tickle|laugh;feather
h|shivering|shiver|cold;teeth
h|blushing|blush|red;shy
h|fainting|faint|fall;dizzy
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
e|mum|mother;mom|parent;family
e|dad|father|parent;family
e|grandpa|grandfather|old;family
e|boy|kid;child|girl
e|girl|kid;child|boy
e|old man|grandpa|cane;beard
e|family|parents|mum;dad;kids
e|prince|king|crown;castle
e|cook|chef|kitchen
e|postman|mailman;postwoman|letters;bag
e|bus driver|driver|bus
e|shopkeeper|cashier|shop;till
e|painter|artist|brush;paint
m|baker|chef|bread;oven;bakery
m|butcher|meat seller|meat;knife
m|fisherman|angler|rod;boat
m|carpenter|woodworker|wood;saw;hammer
m|tailor|dressmaker|needle;tape
m|sailor|seaman|boat;anchor
m|captain|skipper|ship;hat
m|lawyer|attorney|court;judge
m|vet|veterinarian|animals;dog
m|pharmacist|chemist|medicine;pills
m|surgeon|doctor|operation;mask
m|nanny|babysitter|baby
m|security guard|guard|uniform;door
m|cashier|checkout|shop;money
m|taxi driver|cab driver|taxi
m|truck driver|trucker|truck
m|delivery driver|courier;delivery man|parcel;bike
m|cleaner|janitor|mop;broom
m|janitor|caretaker|mop;keys
m|reporter|journalist|news;microphone
m|news anchor|newsreader|tv;news
m|youtuber|vlogger|camera;video
m|gamer|player|controller;video game
m|dancer|ballerina|dance;stage
m|ballerina|dancer|tutu;ballet
m|cheerleader|cheer|pom poms
m|coach|trainer|whistle;team
m|explorer|adventurer|map;compass
m|hunter|archer|bow;gun
m|thief|robber;burglar|steal;mask;bag
m|spy|secret agent|binoculars;disguise
m|president|leader|country
m|mayor|leader|city
m|traffic police|traffic cop|whistle;cars
m|monk|priest|robe;temple
m|nun|sister|church;habit
m|priest|vicar|church
m|bodybuilder|strongman|muscles;gym
m|umpire|referee|cricket;finger
m|hairdresser|stylist|scissors;hair
m|optician|eye doctor|glasses;eyes
h|architect|designer|building;plans
h|engineer|builder|helmet;bridge
h|programmer|coder;developer|computer;code
h|accountant|bookkeeper|money;calculator
h|librarian|library|books;quiet
h|stuntman|stunt double|fire;jump
h|puppeteer|puppet master|strings;puppet
h|juggler|clown|balls;circus
h|ringmaster|circus master|whip;circus
h|snake charmer|charmer|flute;cobra
h|mountaineer|climber|rope;peak
h|surfer|surfboard|waves
h|skydiver|parachutist|plane;parachute
h|deep sea diver|diver|helmet;ocean
h|cyclist|biker|bicycle;helmet
h|jockey|rider|horse;race
h|matador|bullfighter|bull;red cape
h|gladiator|warrior|arena;sword
h|samurai|warrior|sword;japan
h|viking|norseman|horns;boat
h|pharaoh|king|egypt;pyramid
h|sheriff|marshal|badge;cowboy
h|chess player|player|chess
h|weather forecaster|weatherman|map;rain
h|tightrope walker|acrobat|rope;balance
h|street performer|busker|music;hat
h|crossing guard|lollipop lady|children;road
h|bride and groom|newlyweds|wedding
h|groom|bridegroom|wedding;suit
h|toddler|baby|walk;nappy
h|teenager|teen|phone;school
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
e|ball|football|round;bounce
e|net|goal net|goal;tennis
e|goal|goalpost|net;score;football
e|race|running race|finish line;run
e|jump rope|skipping rope|jump;rope
e|seesaw|teeter totter|playground
e|sandpit|sandbox|sand;bucket;spade
e|marbles|marble|glass;roll
e|yo-yo|yoyo|string;toy
e|puzzle|jigsaw|pieces
e|drum|drums|sticks;beat
e|guitar|ukulele|strings;music
e|piano|keyboard|keys;music
e|violin|fiddle|bow;strings
e|trumpet|horn|brass;blow
e|flute|recorder|blow;music
m|boxing gloves|gloves|boxing;punch
m|punching bag|boxing bag|boxing;punch
m|ice skates|skates|ice;rink
m|skis|ski|snow;mountain
m|sled|sledge;toboggan|snow;hill
m|baseball bat|bat|baseball;hit
m|cricket bat|bat|cricket;ball
m|stumps|wicket|cricket;bails
m|tennis racket|racket;racquet|tennis;ball
m|shuttlecock|birdie|badminton
m|golf club|club|golf;ball
m|golf ball|ball|golf;tee
m|hockey stick|stick|hockey;puck
m|puck|hockey puck|ice hockey
m|bow and arrow|archery|target;arrow
m|target|bullseye|darts;arrow
m|scoreboard|score|points;stadium
m|stopwatch|timer|race;time
m|podium|winners podium|medal;first
m|finish line|tape|race;win
m|starting gun|pistol|race;bang
m|relay race|relay|baton;run
m|hurdles|hurdle|jump;race
m|long jump|jump|sand;run
m|high jump|jump|bar;mat
m|javelin|spear|throw;field
m|weightlifting|lifting|barbell;gym
m|wrestling|wrestler|ring;mat
m|kayak|canoe|paddle;river
m|sailing|sailboat|wind;sail
m|kitesurfing|kite surfing|kite;waves
m|skateboarding|skating|skateboard;ramp
m|roller skating|rollerblading|skates
m|bowling pins|skittles|bowling
m|pool table|snooker|cue;balls
m|ping pong|table tennis|paddle;ball
m|treasure hunt|scavenger hunt|map;clues
m|crossword|crossword puzzle|clues;grid
m|sudoku|number puzzle|grid;numbers
m|pottery|ceramics|clay;wheel
m|magic trick|magic|wand;hat
h|parkour|free running|jump;wall
h|polo|horse polo|horse;mallet
h|lacrosse|stick ball|net;stick
h|curling|curling stone|ice;broom
h|bobsleigh|bobsled|ice;team
h|ski jump|ski jumping|skis;fly
h|synchronized swimming|artistic swimming|pool;team
h|triathlon|race|swim;bike;run
h|decathlon|athletics|events
h|shot put|throw|ball;heavy
h|discus|disc|throw
h|hammer throw|hammer|throw;spin
h|balance beam|beam|gymnastics
h|pommel horse|horse|gymnastics
h|uneven bars|bars|gymnastics
h|bungee|bungee cord|jump;rope
h|paragliding|parasailing|wing;sky
h|windsurfing|sailboard|sail;waves
h|white water rafting|rafting|river;raft
h|snorkeling|snorkel|mask;fish
h|kickboxing|boxing|kick
h|judo|martial arts|belt;throw
h|taekwondo|martial arts|kick;belt
h|stamp collecting|stamps|album
h|dominoes|domino|tiles;fall
h|bingo|lotto|numbers;card
h|run out|out|cricket;stumps
h|sixer|six|cricket;boundary
h|offside|off side|football;flag
h|yellow card|card|referee;foul
h|red card|card|referee;sent off
h|free kick|kick|wall;football
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
e|Peppa Pig|peppa|pig;muddy puddles
e|Paw Patrol|paw|puppies;rescue
e|Bluey|bluey heeler|dog;australia
e|Winnie the Pooh|pooh;pooh bear|honey;bear
e|Garfield|garfield cat|lasagna;cat;orange
e|Snoopy|peanuts|dog;charlie brown
e|Bambi|deer|fawn;forest
e|Dumbo|elephant|ears;fly;circus
e|Tarzan|jungle man|jungle;vine;apes
e|Teletubbies|teletubby|tv;sun baby
e|Sesame Street|elmo;cookie monster|muppets
e|Elmo|sesame street|red;muppet
e|Kermit|kermit the frog|muppets;frog
e|Spirited Away|ghibli|bath house
e|Stitch|lilo and stitch|alien;blue
e|Olaf|frozen|snowman
e|Elsa|frozen|ice;queen
e|Buzz Lightyear|buzz|toy story;space
e|Woody|toy story|cowboy;sheriff
m|Lilo and Stitch|stitch|alien;hawaii
m|The Grinch|grinch|christmas;green
m|Minecraft|minecraft movie|blocks;steve
m|Sonic|sonic the hedgehog|hedgehog;fast;rings
m|Wicked|elphaba|witch;green;oz
m|Wednesday|wednesday addams|addams family;hand
m|The Addams Family|addams|thing;spooky
m|Black Panther|wakanda|marvel;cat
m|Captain America|cap|shield;marvel
m|Thor|thor hammer|hammer;lightning;marvel
m|Wonder Woman|diana|lasso;dc
m|Aquaman|arthur curry|ocean;trident
m|Deadpool|wade wilson|marvel;red
m|Ant-Man|antman|small;ant
m|Doctor Strange|strange|magic;marvel
m|Guardians of the Galaxy|guardians|groot;space
m|Groot|i am groot|tree;guardians
m|Joker|the joker|batman;clown
m|The Flash|flash|lightning;fast
m|Hotel Transylvania|dracula|hotel;monsters
m|How to Train Your Dragon|toothless|dragon;viking
m|Puss in Boots|puss|cat;boots;sword
m|Bolt|dog|lightning
m|Tangled|rapunzel|hair;tower
m|Brave|merida|bow;bear;scotland
m|Mulan|warrior|china;sword
m|Pocahontas|disney princess|feather;river;colors of the wind
m|Hercules|hero|greek;strong
m|Alice in Wonderland|alice|rabbit;tea party
m|101 Dalmatians|dalmatians|spots;cruella
m|Planet of the Apes|apes|monkeys
m|Night at the Museum|museum|t rex;night
m|Free Willy|whale|orca
m|Jurassic World|jurassic park|dinosaurs
m|The Smurfs|smurf|blue;mushroom
m|Doraemon|robot cat|gadgets;pocket
m|Pikachu|pokemon|yellow;electric
m|Ben 10|ben ten|watch;alien
m|Power Rangers|rangers|team;colors
m|Ninja Turtles|tmnt;teenage mutant ninja turtles|pizza;turtles
m|Looney Tunes|bugs bunny|cartoon
m|Bugs Bunny|looney tunes|carrot;rabbit
m|Pink Panther|panther|pink;detective
m|Masterchef|cooking show|chef;kitchen
m|Doctor Who|tardis|police box;time
m|Wallace and Gromit|gromit|cheese;dog
h|Dune|arrakis|sand;worm;desert
h|The Godfather|godfather|mafia
h|Rocky|boxer|steps;boxing
h|Psycho|hitchcock|shower
h|The Shining|shining|axe;hotel
h|Forrest Gump|forrest|bench;chocolates;run
h|The Truman Show|truman|tv;dome
h|Top Gun|maverick|jet;pilot
h|Cast Away|wilson|island;volleyball
h|Finding Dory|dory|fish;blue
h|Life of Pi|pi|tiger;boat
h|Avengers Endgame|endgame;avengers|thanos
h|Thanos|infinity gauntlet|snap;marvel
h|The Mandalorian|mando|baby yoda;star wars
h|Baby Yoda|grogu|star wars;green
h|Darth Vader|vader|star wars;lightsaber
h|Yoda|jedi|star wars;green
h|Lord of the Rings|lotr|ring;hobbit
h|The Hobbit|bilbo|ring;shire
h|Gollum|smeagol|precious;ring
h|The Mask|mask|green;jim carrey
h|Men in Black|mib|aliens;sunglasses
h|Ghost Rider|rider|fire;skull
h|Shaun the Sheep|shaun|sheep;farm
h|Mr Potato Head|potato head|toy story
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
e|Hello Kitty|kitty|cat;bow;pink
e|Angry Birds|angry bird|slingshot;pigs
e|Pac-Man|pacman|ghosts;dots;yellow
e|Tetris|blocks|falling;game
e|Uno|uno cards|cards;game
e|Jenga|tower game|blocks;tower
e|Cadbury|dairy milk|chocolate;purple
e|Maggi|noodles|instant;two minute
e|Kinder Joy|kinder|egg;toy;chocolate
e|M&M's|mms;m and ms|chocolate;candy
e|Skittles|candy|rainbow;sweets
e|Ferrero Rocher|ferrero|chocolate;gold
e|Fanta|orange soda|orange;fizzy
e|Sprite|lemon soda|green;fizzy
e|Nescafe|coffee|instant;mug
e|Lipton|tea|tea bag;yellow
m|Roblox|roblox game|blocks;game
m|Fortnite|battle royale|game;dance
m|Among Us|amongus|impostor;crewmate;space
m|Candy Crush|candy|game;match
m|Scrabble|word game|tiles;letters
m|Play-Doh|playdough|clay;colors
m|Hot Wheels|toy car|track;cars
m|Nerf|nerf gun|darts;foam
m|Hershey's|hersheys|chocolate;kisses
m|Doritos|chips|triangle;nachos
m|Cheetos|cheese puffs|orange;cheese
m|Mountain Dew|dew|green;soda
m|7 Up|seven up|lemon;soda
m|Nestle|nestlé|chocolate;milk
m|Kellogg's|kelloggs|cereal;rooster
m|Colgate|toothpaste|teeth;smile
m|Dettol|antiseptic|soap;germs
m|Pampers|diapers|baby
m|Gillette|razor|shave
m|Canon|camera|printer;photo
m|Nikon|camera|photo;lens
m|GoPro|action camera|helmet;video
m|JBL|speaker|music;bluetooth
m|Bose|headphones|speaker
m|iPhone|apple phone|phone;apple
m|iPad|tablet|apple
m|MacBook|laptop|apple
m|AirPods|earbuds|apple;ears
m|Alexa|echo|amazon;speaker
m|Siri|voice assistant|apple;phone
m|ChatGPT|chatbot|ai;openai
m|Flipkart|online shop|shopping;delivery
m|Swiggy|food delivery|delivery;scooter
m|Zomato|food delivery|delivery;red
m|Royal Enfield|bullet|motorcycle;bike
m|Harley-Davidson|harley|motorcycle
m|Audi|car|rings
m|Rolls-Royce|rolls|luxury;car
m|Bugatti|car|fast;luxury
m|Ford|car|truck;mustang
m|Boeing|airplane|plane;jet
m|Airbus|plane|jet
m|Emirates|airline|plane;dubai
m|Air India|airline|plane;maharaja
m|FedEx|courier|delivery;parcel
m|DHL|courier|delivery;yellow
m|H&M|h and m|clothes;fashion
m|Reebok|shoes|sneakers
m|Ray-Ban|sunglasses|aviators
m|Casio|watch|calculator
m|Titan|watch|time
m|Fevicol|glue|sticky
h|Mini Cooper|mini|car;small
h|Volvo|car|safe
h|Nokia|old phone|phone;snake game
h|Dyson|vacuum|hair dryer
h|Tupperware|lunch box|plastic;box
h|Post-it|sticky note|yellow;note
h|Sharpie|marker|pen
h|Crayola|crayons|colors
h|Faber-Castell|pencils|colors
h|Parker|pen|ink
h|Zippo|lighter|flame
h|Swiss Army knife|pocket knife|tools;red
h|Velcro|hook and loop|stick;shoes
h|Jacuzzi|hot tub|bubbles;bath
h|Uber Eats|food delivery|delivery
h|Telegram|messenger|paper plane;chat
h|Discord|chat app|gaming;chat
h|Twitch|streaming|live;games;purple
h|PayPal|payment|money
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
e|sky|blue sky|clouds;sun
e|hill|mound|grass;climb
e|rock|stone;boulder|hard;ground
e|stone|pebble;rock|ground
e|sand|sand dune|beach;desert
e|mud|dirt|puddle;pig
e|stick|twig;branch|tree;wood
e|branch|twig|tree;leaf
e|log|tree trunk|wood;fire
e|seed|seeds|plant;grow
e|bush|shrub|garden;leaves
e|daisy|flower|white;petals
e|apple tree|tree|apples;orchard
e|raindrop|drop|rain;water
e|icicle|ice spike|cold;winter
e|sunrise|dawn|morning;sun
e|full moon|moon|night;wolf
e|half moon|crescent moon|night
e|storm|thunderstorm|rain;wind
m|lotus|water lily|pond;pink;flower
m|lily|lily pad|flower;pond
m|dandelion|weed|blow;seeds;wish
m|bamboo|bamboo shoot|panda;green
m|fern|plant|leaves;forest
m|vine|creeper|jungle;climb
m|moss|lichen|green;rock
m|ivy|vine|wall;climb
m|weed|weeds|garden;pull
m|thorn|prickle|rose;sharp
m|petal|petals|flower
m|root|roots|tree;ground
m|tree stump|stump|tree;axe
m|pine tree|fir tree;evergreen|christmas;cone
m|oak tree|oak|acorn;tree
m|willow tree|willow|tree;river
m|cherry blossom|sakura|pink;japan;tree
m|autumn leaves|fall leaves|orange;tree
m|valley|vale|mountains;river
m|canyon|gorge|rocks;deep
m|glacier|ice|mountain;cold
m|swamp|marsh|frog;crocodile
m|meadow|field|grass;flowers
m|riverbank|bank|river;grass
m|stream|brook|water;rocks
m|geyser|hot spring|steam;water
m|lava|magma|volcano;hot
m|dust storm|sandstorm|desert;wind
m|drizzle|light rain|rain
m|thunder|thunderclap|lightning;storm
m|frost|ice|cold;window
m|hail|hailstones|ice;storm
m|sleet|wet snow|cold
m|snowstorm|blizzard|snow;cold
m|heatwave|heat wave|hot;sun
m|flood|flooding|water;rain
m|drought|dry|cracked;sun
m|wildfire|forest fire|fire;smoke
m|crater|hole|moon;meteor
m|meteor|meteorite|space;crater
m|asteroid|space rock|space;meteor
m|Saturn|planet|rings;space
m|Mars|red planet|planet;space
m|Earth|planet earth;world|globe;planet
m|galaxy|milky way|stars;space
m|ripple|wave|water;pond
h|equator|line|earth;hot
h|horizon|skyline|sunset;sea
h|tide|high tide|sea;moon
h|low tide|tide|beach;sea
h|peninsula|cape|sea;land
h|delta|river mouth|river;sea
h|fjord|inlet|norway;sea
h|atoll|island|coral;ring
h|lagoon|lake|beach;blue
h|plateau|tableland|flat;mountain
h|sand dune|dune|desert;sand
h|venus flytrap|flytrap|plant;fly
h|tumbleweed|weed|desert;wind
h|seaweed|kelp|ocean;green
h|driftwood|wood|beach;sea
h|fossil|dinosaur bone|rock;bones
h|crystal|gem|cave;shiny
h|amber|resin|fossil;orange
h|gold nugget|nugget|gold;mine
h|lunar eclipse|eclipse|moon;shadow
h|solar system|planets|sun;orbit
h|Milky Way|galaxy|stars
h|ozone layer|ozone|sky;earth
h|global warming|climate change|hot;earth
h|evaporation|vapour|water;sun
h|water cycle|rain cycle|clouds;rain
h|echo|reflection|cave;sound
h|shadow|silhouette|sun;dark
h|reflection|mirror image|water;mirror
h|dew|morning dew|grass;drops
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
e|ship|boat;liner|sea;anchor
e|airplane|aeroplane;jet|sky;wings
e|wheel|tyre;tire|car;round
e|tyre|tire;wheel|car;rubber
e|luggage|suitcase;baggage|travel;airport
e|train track|railway;rails|train
e|car key|key|car;lock
e|petrol|fuel;gas|car;pump
e|horn|car horn|beep;honk
e|trolley|cart|shopping;wheels
e|pram|stroller;buggy|baby;push
e|go kart|go-kart;kart|race;track
e|race car|racing car|f1;fast
e|digger|excavator|dig;construction
m|auto rickshaw|rickshaw;tuk tuk|three wheeler;taxi
m|rickshaw|cycle rickshaw|pedal;passenger
m|bullock cart|cart|bull;village
m|horse and cart|carriage|horse;wheels
m|carriage|stagecoach|horses;wheels
m|double decker bus|double decker|bus;london
m|minibus|van|bus
m|camper van|motorhome;rv|camping;road trip
m|caravan|trailer|camping;car
m|pickup truck|pickup|truck;load
m|dump truck|tipper|dirt;construction
m|cement mixer|concrete mixer|truck;cement
m|forklift|lift truck|pallets;warehouse
m|tow truck|breakdown truck|tow;car
m|garbage truck|bin lorry;rubbish truck|trash;bins
m|ice cream truck|ice cream van|ice cream;music
m|tram|streetcar;trolley|rails;city
m|metro|subway;underground|train;city
m|bullet train|high speed train|fast;japan
m|freight train|goods train|cargo;wagons
m|railway station|train station|platform;train
m|platform|railway platform|train;wait
m|ferry|boat|cars;river
m|yacht|sailboat|rich;sea
m|speedboat|motorboat|fast;water
m|raft|life raft|river;logs
m|rowing boat|rowboat|oars;lake
m|paddle boat|pedal boat|lake;pedal
m|houseboat|boat house|river;home
m|glider|sailplane|wings;sky
m|jet plane|jet|plane;fast
m|fighter jet|jet|plane;military
m|seaplane|float plane|water;plane
m|blimp|airship;zeppelin|sky;balloon
m|ski lift|chairlift|mountain;skiing
m|sidecar|motorcycle sidecar|motorcycle
m|traffic jam|gridlock|cars;honking
m|car wash|carwash|soap;bubbles
m|parking meter|meter|coins;parking
m|signpost|road sign|arrows;directions
m|map pin|pin|map;location
h|cockpit|flight deck|pilot;plane
h|runway|airstrip|plane;airport
h|control tower|tower|airport;radar
h|baggage claim|carousel|suitcases;airport
h|customs|border control|passport;airport
h|jetway|air bridge|plane;gate
h|life jacket|life vest|boat;float
h|rudder|tiller|boat;steer
h|oar|paddle|row;boat
h|sail|mainsail|boat;wind
h|mast|ship mast|sail;flag
h|crow's nest|lookout|ship;mast
h|port hole|porthole|ship;window
h|lifebuoy|life ring|boat;float
h|hovercraft|air cushion vehicle|water;fan
h|catamaran|boat|two hulls
h|aircraft carrier|carrier|ship;planes
h|rocket launch|launch|countdown;space
h|lunar module|moon lander|moon;space
h|moon buggy|lunar rover|moon;wheels
h|Mars rover|rover|mars;robot
h|space capsule|capsule|astronaut
h|sled dogs|dog sled|husky;snow
h|snowmobile|skidoo|snow;engine
h|segway|scooter|wheels;balance
h|electric scooter|e-scooter|scooter
h|penny farthing|old bicycle|big wheel
h|speedometer|speed dial|car;fast
h|odometer|mileage|car
h|windscreen wiper|wiper|rain;car
h|rear view mirror|mirror|car
h|number plate|license plate|car;numbers
h|road trip|journey|car;travel
h|level crossing|railway crossing|gate;train
h|traffic cone|cone|road;orange
h|overpass|flyover|road;bridge
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
e|pumpkin|jack o lantern|halloween;orange
e|broomstick|broom|witch;fly
e|cauldron|pot|witch;potion
e|black cat|cat|witch;halloween
e|magic lamp|genie lamp|genie;wish
e|toy soldier|soldier|toy;drum
m|ogre|giant|shrek;green
m|dwarf|gnome|axe;beard;mine
m|gnome|garden gnome|hat;garden
m|fairy godmother|godmother|wand;cinderella
m|evil queen|queen|mirror;apple
m|magic mirror|mirror|queen;talk
m|poisoned apple|apple|snow white
m|glass slipper|slipper|cinderella;shoe
m|pumpkin carriage|carriage|cinderella
m|frog prince|frog|kiss;crown
m|three little pigs|little pigs|wolf;houses
m|big bad wolf|wolf|huff;puff
m|Peter Rabbit|rabbit|carrot;jacket
m|Cheshire Cat|cat|grin;wonderland
m|Mad Hatter|hatter|tea party;hat
m|White Rabbit|rabbit|watch;late
m|Tinker Bell|tinkerbell|fairy;peter pan
m|Captain Hook|hook|pirate;crocodile
m|Robin Hood|archer|bow;sherwood
m|King Arthur|arthur|sword;round table
m|Merlin|wizard|magic;beard
m|sea monster|kraken|ocean;tentacles
m|sea serpent|sea monster|ocean;snake
m|yeti|abominable snowman|snow;mountain
m|ghost ship|phantom ship|pirates;fog
m|witch hat|witch's hat|pointy;black
m|wizard hat|pointy hat|stars;moon
m|spell|magic spell|wand;words
m|curse|hex|witch;spell
m|enchanted forest|magic forest|fairies;trees
m|dragon egg|egg|dragon;hatch
m|treasure map|map|x marks the spot;pirate
m|castle drawbridge|drawbridge|castle;moat
m|moat|ditch|castle;water
m|throne|royal seat|king;crown
m|sceptre|scepter|king;staff
m|jester|joker;fool|king;bells
m|banshee|ghost|scream
m|grim reaper|death|scythe;skull
m|scarecrow|straw man|field;crows
h|chimera|monster|lion;goat
h|hydra|many headed serpent|heads;snake
h|basilisk|serpent|snake;stare
h|fairy dust|pixie dust|sparkle;fly
h|elixir|potion|bottle;magic
h|philosopher's stone|stone|harry potter
h|sorting hat|hat|hogwarts;harry potter
h|Hogwarts|wizard school|harry potter;castle
h|Gandalf|wizard|staff;beard
h|Dracula|vampire|castle;fangs
h|Thor's hammer|mjolnir|thor;lightning
h|Zeus|god|lightning;greek
h|Poseidon|neptune|trident;sea
h|Atlantis|lost city|underwater;sea
h|Aladdin's cave|cave of wonders|treasure
h|Pandora's box|box|curse;open
h|Achilles heel|achilles|heel;arrow
h|golden goose|goose|golden egg
h|Rumpelstiltskin|rumpel|spinning;straw
h|Hansel and Gretel|gretel;hansel|candy house;witch
h|Ugly Duckling|duckling|swan
h|Tortoise and the Hare|hare and tortoise|race
h|Princess and the Pea|pea|mattresses;princess
h|Thumbelina|tiny girl|flower;small
h|Headless Horseman|horseman|pumpkin;horse
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
e|mobile phone|cell phone;smartphone|call;app
e|telephone|landline|ring;call
e|light|lamp|bulb;switch
e|video camera|camcorder|film;record
e|cable|wire|plug;charger
e|torch|flashlight|light;dark
e|fan|table fan|wind;cool
e|walkie talkie|two way radio|radio;talk
e|alarm|siren|ring;wake
e|monitor|screen;display|computer
m|earphones|earbuds|music;ears
m|smart speaker|speaker|voice;music
m|webcam|camera|computer;video
m|router|wifi router|internet;lights
m|hard drive|hdd|data;storage
m|memory card|sd card|camera;storage
m|floppy disk|diskette|save;old
m|cd|compact disc;disc|music;shiny
m|cassette tape|tape|music;old
m|record player|turntable|vinyl;music
m|jukebox|music box|songs;coins
m|game console|console|games;controller
m|handheld console|game boy|games
m|e-reader|kindle|books;screen
m|smart tv|tv|internet;apps
m|projector|beamer|screen;movie
m|scanner|copier|paper
m|photocopier|copier;xerox|paper;copy
m|fax machine|fax|paper;phone
m|typewriter|keyboard|letters;old
m|pager|beeper|old
m|antenna|aerial|signal;roof
m|satellite dish|dish|tv;roof
m|radar|sonar|screen;plane
m|metal detector|detector|beach;beep
m|lie detector|polygraph|truth
m|x-ray|xray|bones;doctor
m|stethoscope|doctor|heart
m|thermostat|temperature|heat
m|smoke alarm|alarm|fire;beep
m|security camera|cctv|watch;camera
m|doorbell camera|smart doorbell|door;camera
m|robot arm|robotic arm|factory;machine
m|3D printer|printer|plastic
m|circuit board|motherboard|chip;wires
m|microchip|chip|computer;tiny
m|app|application|phone;icon
m|website|web page|internet;browser
m|internet|web|online;wifi
m|selfie|self portrait|phone;smile
m|text message|sms|phone;chat
m|voice note|voice message|phone;mic
m|notification|alert|phone;bell
h|cloud storage|cloud|files;internet
h|download|downloading|arrow;file
h|upload|uploading|arrow;file
h|loading bar|progress bar|wait;percent
h|error message|error|computer;warning
h|blue screen|crash|computer;error
h|computer bug|bug|code;error
h|hacker|hacking|computer;hood
h|coding|programming|computer;code
h|spreadsheet|excel|cells;numbers
h|recycle bin|trash|delete;computer
h|mouse pad|mousepad|mouse;desk
h|touchscreen|touch screen|finger;phone
h|fingerprint scanner|fingerprint|thumb;unlock
h|face recognition|face id|face;unlock
h|GPS|satnav|map;location
h|VR headset|virtual reality headset|goggles;games
h|self driving car|driverless car|robot;car
h|chatbot|bot|chat;ai
h|electric car|ev|charging;car
h|charging station|charger|electric car;plug
h|nuclear power|reactor|atom;energy
h|atom|nucleus|science;electrons
h|magnifying glass|magnifier|detective;zoom
h|test tube|lab tube|science;liquid
h|periodic table|elements|chemistry
h|DNA|double helix|genes;science
h|livestream|live stream|camera;online
h|podcast|show|microphone;talk
h|meme|funny picture|internet;joke
h|unboxing|unbox|box;video
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
e|t-shirt|tee;tshirt|top;sleeves
e|jeans|denim|pants;blue
e|sandals|flip flops|feet;summer
e|coat|jacket;overcoat|winter;warm
e|school uniform|uniform|school;tie
e|vest|waistcoat;tank top|shirt
e|sneakers|trainers;running shoes|shoes;laces
e|handbag|purse|bag;strap
e|earmuffs|ear warmers|cold;ears
e|beanie|woolly hat|winter;knit
e|bib|baby bib|baby;food
e|nappy|diaper|baby
m|blouse|shirt|top;buttons
m|cardigan|sweater|buttons;wool
m|blazer|jacket;suit jacket|suit;office
m|suit|tuxedo|tie;office
m|overalls|dungarees|denim;straps
m|leggings|tights|legs
m|tights|stockings|legs
m|jumpsuit|onesie|zip
m|gown|evening dress|ball;long
m|ball gown|gown|princess;dance
m|nightgown|nightie|sleep;bed
m|bathrobe|dressing gown;robe|bath;towel
m|kimono|robe|japan;belt
m|poncho|cape|rain;mexico
m|cape|cloak|superhero;cloak
m|cloak|cape|hood;wizard
m|veil|wedding veil|bride
m|hijab|headscarf|scarf;head
m|turban|headwrap|head
m|headband|hair band|hair;head
m|bandana|kerchief|head;cowboy
m|visor|sun visor|cap;sun
m|hard hat|safety helmet|construction
m|chef hat|toque|chef;kitchen
m|party hat|cone hat|birthday;party
m|graduation cap|mortarboard|graduate;tassel
m|snow boots|boots|snow;winter
m|wellies|rain boots;wellington boots|rain;puddle
m|ballet shoes|pointe shoes|ballet;tutu
m|football boots|cleats;studs|football
m|clogs|wooden shoes|holland;wood
m|loafers|shoes|leather
m|swimming trunks|trunks|swim;beach
m|bikini|swimsuit|beach;sun
m|goggles|swimming goggles|eyes;swim
m|anklet|ankle bracelet|ankle;jewellery
m|brooch|pin|jewel;coat
m|pearl necklace|pearls|necklace
m|locket|pendant|necklace;photo
m|wristwatch|watch|time;wrist
m|hair clip|hairpin|hair
m|scrunchie|hair tie|hair;ponytail
m|keychain|key ring|keys
m|name tag|badge|name;shirt
h|cummerbund|waistband|tuxedo
h|corset|bodice|tight;dress
h|petticoat|underskirt|dress
h|tracksuit|sweatsuit|sports;jacket
h|wedding ring|ring|marriage;gold
h|diamond ring|ring|diamond;proposal
h|engagement ring|ring|proposal;diamond
h|pocket watch|watch|chain;old
h|bowler hat|derby|hat;round
h|fedora|trilby|hat;detective
h|deerstalker|detective hat|sherlock
h|pirate hat|tricorn|pirate;skull
h|knee pads|pads|skating;knees
h|shin guards|shin pads|football
h|sweatband|headband|sport;sweat
h|lanyard|neck strap|badge;id
h|tie clip|tie bar|tie
h|pocket|pockets|jeans;hand
h|collar|shirt collar|neck;shirt
h|sleeve|arm|shirt
h|hood|hoodie|head;jacket
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
