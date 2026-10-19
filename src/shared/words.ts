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
e|ladybird|ladybug|spots;red;bug
e|bunny|rabbit;bunnies|carrot;ears;hop
e|lion cub|cub|lion;mane
e|dachshund|sausage dog;wiener dog|long;dog
e|chihuahua|small dog|tiny;mexico
e|pug|dog|wrinkly;flat face
e|husky|sled dog|snow;sled;wolf
e|golden retriever|retriever;labrador|dog;fetch
e|sheepdog|collie;border collie|sheep;farm
e|gerbil|hamster|pet;cage
e|cub|bear cub;lion cub|baby
e|swan lake|swan|lake;white
e|bluebird|blue bird|bird;blue
e|bumblebee|bee;bumble bee|honey;buzz
e|moth|butterfly|light;night;wings
e|tick|ticks|bug;bite
e|slug|snail|slime;garden
e|oyster|clam;mussel|pearl;shell
e|clam|oyster;mussel|shell;beach
e|orca|killer whale|whale;black and white
e|fishbowl|fish bowl;aquarium|goldfish;water
e|bird cage|birdcage;cage|parrot;bird
e|dog house|doghouse;kennel|dog
e|paw print|paw;footprint|dog;cat
e|feather|feathers;quill|bird;wing
e|spider web|web;cobweb|spider
e|tail|tails|dog;cat
e|antlers|antler|deer;moose
e|beak|bill|bird
e|claws|claw|cat;bear
e|fins|fin|fish;shark
e|whiskers|whisker|cat
e|mane|lion mane|lion;horse
e|hoof|hooves|horse
e|toad|frog|warts;pond
e|kiwi bird|kiwi|new zealand;bird
e|raven|crow|black;bird
e|swallow|martin|bird;swoop
e|ram|sheep|horns;wool
e|ox|bull;oxen|plow;cart
e|alpaca|llama|wool;fluffy
e|buffalo|bison;water buffalo|horns
e|jackal|coyote|desert
e|coyote|jackal;wolf|howl;desert
e|baboon|monkey;mandrill|red bottom
e|chimpanzee|chimp;ape|banana
e|gibbon|ape|swing;arms
e|koala bear|koala|eucalyptus
e|wallaby|kangaroo|hop;australia
e|kookaburra|bird|laugh;australia
e|dingo|wild dog|australia
e|possum|opossum|tail;hang
e|mink|weasel|fur
e|lynx|bobcat|ears;cat
e|bobcat|lynx|wild cat
e|cougar|puma;mountain lion|cat
e|panther|black panther;jaguar|black;cat
e|white tiger|tiger|white;stripes
e|red panda|panda|red;tail
e|antelope|gazelle|horns;savanna
e|wildebeest|gnu|migration;herd
e|capybara|giant rodent|water;chill
e|chinchilla|rodent|fluffy;soft
e|alligator|crocodile;gator|swamp;teeth
e|rattlesnake|rattler|rattle;desert
e|python|snake;boa|squeeze
e|anaconda|snake|squeeze;jungle
e|newt|salamander|pond
e|salamander|newt|lizard;wet
e|coral|coral reef|reef;sea
e|barnacle|barnacles|boat;rock
e|sand dollar|sea biscuit|beach
e|vampire bat|bat|blood;fangs
e|fruit bat|bat|fruit
e|locust|grasshopper|swarm
e|tarantula|spider|hairy
e|black widow|spider|red;venom
e|falcon|hawk|fast;bird
e|condor|vulture|bird;big
e|crane bird|crane|legs;bird
e|heron|egret|legs;pond
e|cardinal|redbird|red;bird
e|blue jay|jay|blue;bird
e|magpie|crow|shiny
e|canary|songbird|yellow;sing
e|cockatoo|parrot|crest;white
e|macaw|parrot|colorful
e|road runner|roadrunner|desert;fast
e|turkey vulture|vulture|bald
m|great white shark|shark|teeth;jaws
m|blue whale|whale|biggest;ocean
m|humpback whale|whale|song;ocean
m|beluga|white whale|whale;arctic
m|manta ray|stingray|ocean;wings
m|lionfish|fish|spikes;stripes
m|angelfish|fish|tropical
m|catfish|fish|whiskers
m|blowfish|pufferfish|balloon;spikes
m|goldfinch|finch|yellow;bird
m|sparrow|finch|bird;small
m|starling|bird|flock
m|nightingale|bird|sing;night
m|ibis|bird|beak
m|seal pup|seal|baby;ice
m|fawn|baby deer|deer;bambi
m|foal|baby horse|horse
m|joey|baby kangaroo|pouch
m|cygnet|baby swan|swan
m|chrysalis|cocoon|butterfly
m|frogspawn|frog eggs|pond
m|earwig|bug|pincers
m|stick insect|walking stick|twig;bug
m|leaf insect|stick insect|leaf
m|dung beetle|scarab;beetle|ball;poo
m|stag beetle|beetle|horns
m|silkworm|caterpillar|silk
m|honeycomb|comb|honey;bee
m|bird feeder|feeder|seeds;bird
m|horseshoe crab|crab|ancient
m|king cobra|cobra|snake
m|garter snake|snake|garden
m|tree frog|frog|red eyes
m|poison dart frog|frog|colorful;poison
m|bullfrog|frog|croak
m|mudskipper|fish|mud
m|sea slug|nudibranch|colorful
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
e|melon|cantaloupe;honeydew|fruit
e|pepper|bell pepper|vegetable;red
e|spinach|kale|popeye;green
e|fries|french fries;chips|potato;ketchup
e|ham|gammon|pig;sandwich
e|chicken leg|drumstick|chicken;meat
e|water|glass of water|drink
e|oatmeal|porridge|bowl;oats
e|nuts|nut;almonds|squirrel
e|mac and cheese|macaroni|pasta;cheese
e|grilled cheese|cheese toastie|sandwich
e|fried chicken|chicken wings|bucket
e|turkey dinner|roast turkey|thanksgiving
e|mashed potato|mash|potato
e|candy apple|toffee apple|apple;stick
e|apple core|core|apple
e|banana peel|banana skin|slip
e|watermelon slice|watermelon|seeds
e|orange slice|orange|segment
e|pizza slice|pizza|cheese
e|picnic|picnic basket|blanket;park
e|egg carton|egg box|eggs
m|pita|pitta|bread;pocket
m|tortilla|wrap|mexico
m|curry|curry rice|spicy;india
m|scrambled eggs|eggs|breakfast
m|trifle|dessert|layers
m|milk carton|milk|carton
m|lobster dinner|lobster|claws
m|caviar|fish eggs|fancy
m|oysters|oyster|shell
m|clam chowder|chowder|soup
m|ramen bowl|ramen|noodles
m|bento box|bento|japan;lunch
m|onigiri|rice ball|japan
m|artichoke|artichokes|vegetable
m|leek|leeks|onion
m|cinnamon|cinnamon stick|spice
m|vanilla|vanilla pod|ice cream
m|olive oil|oil|bottle
m|soy sauce|soya sauce|bottle;sushi
m|whipped cream|cream|can
m|cheese board|cheese platter|crackers
m|cracker|crackers|cheese
m|granola bar|cereal bar|snack
m|trail mix|nuts|hiking
m|jelly bean|jellybeans|candy
m|candy bar|chocolate bar|wrapper
m|cannoli|pastry|italy
m|churro|churros|cinnamon
m|pierogi|dumplings|poland
m|risotto|rice|creamy
m|ravioli|pasta|square
m|tortellini|pasta|ring
m|pesto|sauce|basil
m|gravy|sauce|boat
m|stew|casserole|pot
m|chili con carne|chili|beans
m|pot roast|roast|meat
m|ribs|spare ribs|bbq
m|hot pot|hotpot|broth
m|sashimi|raw fish|sushi
m|tempura|fried|japan
m|pad thai|noodles|thai
m|pho|noodle soup|vietnam
m|samosa|samosas|triangle
m|naan|naan bread|curry
m|poutine|fries|gravy;cheese
m|lemon meringue|meringue|pie
m|pecan pie|pie|nuts
m|key lime pie|pie|lime
m|strawberry shortcake|shortcake|cake
m|ice cream sandwich|ice cream|cookie
m|root beer float|float|ice cream
m|iced coffee|cold brew|ice
m|latte|coffee|milk
m|energy drink|drink|can
m|wine glass|wine|glass
m|champagne|bubbly|cheers
m|beer mug|beer|foam
m|fruit punch|punch|bowl
h|beef wellington|wellington|pastry
h|baked alaska|dessert|meringue
h|creme brulee|crème brûlée|torch
h|charcuterie|meat board|salami
h|bruschetta|toast|tomato
h|gnocchi|dumplings|potato
h|calzone|pizza|folded
h|stromboli|pizza roll|bread
h|empanada|pasty|pastry
h|cornish pasty|pasty|pastry
h|scotch egg|egg|sausage
h|haggis|scotland|sheep
h|sauerkraut|cabbage|sour
h|kimchi|cabbage|korea;spicy
h|miso soup|miso|tofu
h|tofu|bean curd|white
h|tamale|tamales|corn husk
h|enchilada|tortilla|sauce
h|gazpacho|cold soup|tomato
h|goulash|stew|hungary
h|borscht|beet soup|red
h|couscous|grain|morocco
h|quinoa|grain|healthy
h|dragon fruit|pitaya|pink;spiky
h|passion fruit|passionfruit|seeds
h|lychee|litchi|fruit
h|durian|stinky fruit|spiky
h|star fruit|carambola|star
h|date|dates|palm
h|persimmon|sharon fruit|orange
h|gooseberry|gooseberries|green
h|turnip|swede|root
h|parsnip|parsnips|root
h|brussels sprout|sprouts|christmas
h|kohlrabi|cabbage|vegetable
h|okra|ladyfinger|vegetable
h|bok choy|pak choi|cabbage
h|truffle|truffles|mushroom
h|saffron|spice|yellow
h|nutmeg|spice|grater
h|cardamom|spice|pod
h|peppercorn|black pepper|grinder
h|wasabi|horseradish|green;spicy
h|anchovy|anchovies|fish;pizza
h|sardine|sardines|can;fish
h|kebab skewer|skewer|grill
h|lollipop chicken|chicken|drumstick
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
e|couch|sofa;settee|cushion;tv
e|pillowcase|pillow cover|pillow;bed
e|bed sheet|sheet|bed
e|duvet|quilt;comforter|bed;warm
e|quilt|patchwork|blanket;bed
e|lampshade|lamp shade|lamp
e|wall clock|clock|time;wall
e|doorknob|door knob;handle|door
e|keyhole|key hole|key;lock
e|lock|padlock|key
e|shelf|shelves|books;wall
e|cabinet|cupboard|kitchen
e|freezer|deep freeze|ice;cold
e|fridge magnet|magnet|fridge
e|wine bottle|bottle|cork
e|cork|bottle cork|wine
e|bottle opener|opener|bottle
e|can opener|tin opener|can
e|tin can|can|soup
e|saucepan|pot|stove
e|wok|pan|stir fry
e|baking tray|tray|oven
e|oven mitt|oven glove|hot;oven
e|cookbook|recipe book|recipe
e|salt shaker|shaker|salt
e|pepper grinder|pepper mill|pepper
e|butter knife|knife|butter
e|steak knife|knife|steak
e|wooden spoon|spoon|stir
e|measuring cup|cup|baking
e|mixing bowl|bowl|baking
e|colander|strainer;sieve|pasta
e|sieve|strainer|flour
e|funnel|cone|pour
e|ice tray|ice cube tray|freezer
e|lunch bag|bag|lunch
e|straw|drinking straw|drink
e|paper cup|cup|drink
e|paper plate|plate|party
e|toothpick|toothpicks|teeth
e|tissue box|tissues|nose;sneeze
e|toilet paper|loo roll;toilet roll|bathroom
e|toilet brush|brush|toilet
e|bath towel|towel|bath
e|soap dish|soap|bathroom
e|bar of soap|soap|wash
e|hand soap|soap dispenser|pump
e|rubber gloves|gloves|cleaning
e|bucket and mop|mop|clean
e|dustbin|bin|trash
e|recycling bin|recycle|plastic
e|trash bag|bin bag;garbage bag|trash
e|laundry|washing|clothes
e|clothespin|clothes peg|line
e|sock drawer|drawer|socks
e|front door|door|house
e|back door|door|garden
e|garden shed|shed|tools
e|garden hose|hose|water
e|lawn mower|mower|grass
e|rake|garden rake|leaves
e|shovel|spade|dig
e|wheelbarrow|barrow|garden
e|flower pot|pot|plant
e|bird bath|birdbath|bird;water
e|swing set|swings|garden
e|sandbox|sandpit|sand;kids
e|paddling pool|kiddie pool|water
e|barbecue|bbq;grill|sausages
e|deck chair|lawn chair|garden
e|patio|terrace|garden
e|house number|number|door
e|fire alarm|smoke alarm|fire
e|candle holder|candlestick|candle
e|matches|matchbox;match|fire
e|lighter|cigarette lighter|flame
e|ashtray|ash tray|cigarette
e|photo album|album|pictures
e|family photo|photograph|frame
e|poster|posters|wall
e|clock radio|alarm|radio
e|bed frame|bed|frame
e|mattress|bed|sleep
e|bunk|bunk bed|ladder
e|cot|crib|baby
e|high chair|baby chair|baby
e|baby bottle|bottle|milk
e|pacifier|dummy;soother|baby
e|rattle|baby rattle|baby
e|toy box|toybox|toys
e|building blocks|blocks|toys
e|marble|marbles|glass
e|sticker|stickers|paper
e|coloring book|colouring book|crayons
e|crayon box|crayons|color
e|glue stick|glue|paper
e|pencil case|pencil box|pencils
e|pencil sharpener|sharpener|pencil
e|highlighter|marker|yellow
e|marker|felt tip|pen
e|chalk|chalk stick|board
e|whiteboard|board|marker
e|blackboard|chalkboard|chalk
e|clipboard|board|paper
e|folder|file|papers
e|binder|ring binder|papers
e|hole punch|puncher|paper
e|rubber band|elastic band|stretch
e|push pin|thumbtack|board
e|notice board|cork board|pins
e|paper|sheet of paper|write
e|paper airplane|paper plane|fold
e|cardboard box|box|moving
e|shoebox|shoe box|shoes
e|gift box|present|bow
e|wrapping paper|gift wrap|present
e|ribbon|bow|gift
e|string|twine|tie
e|rope|cord|tie
e|tape|sellotape;scotch tape|stick
e|duct tape|gaffer tape|silver
e|bubble wrap|bubblewrap|pop
e|torch light|torch|dark
e|lantern|lamp|light
e|plug socket|socket|plug
e|power strip|extension lead|plugs
e|batteries|battery|power
e|remote|remote control|tv
e|tv stand|tv cabinet|tv
e|coffee table|table|living room
e|footstool|stool|feet
e|bean bag chair|beanbag|sit
e|floor lamp|lamp|tall
e|desk lamp|lamp|desk
e|office chair|swivel chair|desk
e|filing cabinet|cabinet|files
e|safe|vault|money;lock
e|coin|coins;penny|money
e|bank note|banknote;bill|money
e|purse|wallet|money
e|keys|key|door
e|spare key|key|mat
e|pet bed|dog bed|dog
e|cat flap|pet door|cat
e|dog bowl|bowl|dog
e|litter box|litter tray|cat
e|fish tank|aquarium|fish
e|hamster wheel|wheel|hamster
m|ceiling light|light|ceiling
m|skylight|roof window|light
m|window blind|blinds|window
m|venetian blind|blinds|slats
m|window box|planter|flowers
m|shutters|window shutters|window
m|chimney pot|chimney|roof
m|gutter|rain gutter|roof
m|drainpipe|downpipe|rain
m|weather vane|weathervane|rooster;roof
m|sprinkler|lawn sprinkler|water
m|garden gnome|gnome|garden
m|bird house|birdhouse|bird
m|flower bed|bed|flowers
m|compost bin|compost|garden
m|clothes line|washing line|clothes
m|clothes horse|drying rack|laundry
m|tumble dryer|dryer|laundry
m|laundry detergent|detergent|washing
m|fabric softener|softener|laundry
m|bleach|bleach bottle|clean
m|spray bottle|spray|clean
m|scrubbing brush|brush|clean
m|dish soap|washing up liquid|dishes
m|tea towel|dish towel|dry
m|dish cloth|cloth|wash
m|kitchen roll|paper towel|kitchen
m|cling film|plastic wrap|food
m|tin foil|aluminium foil|food
m|freezer bag|ziplock bag|food
m|tupperware box|container|food
m|bread knife|knife|bread
m|cutting board|chopping board|knife
m|potato peeler|peeler|potato
m|tongs|kitchen tongs|grab
m|can crusher|crusher|can
m|nutcracker|nut cracker|nuts
m|garlic press|press|garlic
m|pizza cutter|cutter|pizza
m|ice cream scoop|scoop|ice cream
m|egg cup|cup|egg
m|egg beater|whisk|eggs
m|stand mixer|mixer|baking
m|food processor|processor|chop
m|juicer|juice maker|juice
m|slow cooker|crock pot|stew
m|rice cooker|cooker|rice
m|air fryer|fryer|fries
m|deep fryer|fryer|oil
m|waffle maker|waffle iron|waffle
m|sandwich maker|toastie maker|sandwich
m|popcorn maker|popcorn machine|popcorn
m|coffee grinder|grinder|beans
m|french press|cafetiere|coffee
m|water filter|filter jug|water
m|water cooler|cooler|office
m|dish drainer|drying rack|dishes
m|sink plug|plug|sink
m|bath plug|plug|bath
m|shower head|showerhead|water
m|towel rail|towel rack|towel
m|medicine cabinet|cabinet|pills
m|first aid kit|first aid box|bandage
m|bandage|plaster;band aid|cut
m|pill bottle|medicine|pills
m|cotton bud|q tip|ear
m|nail clippers|clippers|nails
m|tweezers|tweezer|pluck
m|weighing scale|scales|weight
m|kitchen scale|scales|baking
m|hot water bottle|bottle|warm
m|electric blanket|blanket|warm
m|sleeping bag|bag|camping
m|air mattress|airbed|inflate
m|futon|sofa bed|sleep
m|four poster bed|bed|curtains
m|canopy bed|bed|net
m|mosquito net|net|bed
m|dressing table|vanity|mirror
m|full length mirror|mirror|tall
m|shoe rack|rack|shoes
m|umbrella stand|stand|umbrella
m|key holder|key hook|keys
m|room divider|screen|room
m|bookcase|bookshelf|books
m|magazine rack|rack|magazines
m|record collection|records|music
m|wallpaper|wall paper|wall
m|paint roller|roller|paint
m|paint tray|tray|paint
m|step ladder|ladder|climb
m|tool belt|belt|tools
m|pliers|pincers|grip
m|spirit level|level|bubble
m|hacksaw|saw|metal
m|chisel|tool|wood
m|sandpaper|sand paper|rough
m|nail gun|gun|nails
m|stud finder|finder|wall
m|caulk gun|gun|seal
m|allen key|hex key|ikea
m|workbench|bench|tools
m|vice|vise|clamp
m|clamp|g clamp|hold
m|sewing kit|kit|needle
m|tape dispenser|dispenser|tape
m|letter opener|opener|envelope
m|rubber stamp|stamp|ink
m|ink pad|stamp pad|ink
m|desk organizer|organizer|pens
m|pen pot|pot|pens
m|in tray|tray|papers
m|shredder|paper shredder|paper
m|laminator|machine|paper
h|dumbwaiter|lift|food
h|bidet|toilet|wash
h|trivet|pot stand|hot
h|mortar and pestle|pestle|grind
h|mandoline|slicer|vegetables
h|cheese cloth|muslin|cheese
h|piping bag|icing bag|cake
h|cookie cutter|cutter|shapes
h|bundt pan|cake tin|ring
h|ramekin|dish|souffle
h|gravy boat|jug|gravy
h|butter dish|dish|butter
h|cake stand|stand|cake
h|lazy susan|turntable|table
h|sugar bowl|bowl|sugar
h|milk jug|jug|milk
h|decanter|carafe|wine
h|corkscrew|cork screw|wine
h|ice bucket|bucket|ice
h|cocktail shaker|shaker|drinks
h|candelabra|candle stand|candles
h|sconce|wall light|candle
h|chaise longue|lounge chair|sofa
h|grandfather chair|wingback|chair
h|davenport|desk|writing
h|credenza|sideboard|cabinet
h|armoire|wardrobe|cabinet
h|hope chest|chest|blanket
h|vanity mirror|mirror|makeup
h|bath caddy|caddy|bath
h|loofah|sponge|bath
h|pumice stone|stone|feet
h|toilet roll holder|holder|toilet paper
h|squeegee|wiper|window
h|feather pillow|pillow|feathers
h|draught excluder|draft stopper|door
h|keypad lock|lock|code
h|intercom|entry phone|door
h|burglar alarm|alarm|thief
h|sump pump|pump|basement
h|water heater|boiler|hot water
h|boiler|furnace|heating
h|thermostat dial|thermostat|heat
h|wood stove|stove|logs
h|log basket|basket|logs
h|fire poker|poker|fireplace
h|fireplace bellows|bellows|fire
h|fire screen|fireguard|fireplace
h|mantelpiece|mantel|fireplace
h|skirting board|baseboard|wall
h|banister|railing|stairs
h|trapdoor|trap door|floor
h|loft ladder|ladder|attic
h|dormer window|window|roof
h|bay window|window|seat
h|french doors|doors|garden
h|revolving door|door|spin
h|sliding door|door|slide
h|cat tree|scratching post|cat
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
e|home|house;my house|family;roof
e|apartment|flat;apartment block|building;city
e|cottage|small house|country;garden
e|mansion|big house;estate|rich;butler
e|shed|hut|garden;tools
e|fort|fortress;pillow fort|castle;walls
e|tower block|high rise|flats
e|town|village|houses
e|seaside|coast;shore|beach;waves
e|shore|coast;beach|sea;sand
e|coast|coastline|sea
e|bay|cove|sea;boats
e|harbor|harbour;port|boats
e|port|harbor|ships
e|dock|wharf;quay|boats
e|boardwalk|promenade|beach
e|forest path|trail;path|trees
e|path|trail;footpath|walk
e|field|meadow|grass;farm
e|farmyard|farm|animals
e|chicken coop|hen house;coop|chickens
e|pigsty|pig pen|pigs;mud
e|cowshed|barn|cows
e|duck pond|pond|ducks
e|hilltop|summit|hill
e|mountain top|summit;peak|climb
e|riverside|riverbank|river
e|camp|campground|tent;fire
e|picnic spot|picnic area|blanket
e|garden centre|nursery|plants
e|flower shop|florist|flowers
e|toy store|toy shop|toys
e|candy store|sweet shop|sweets
e|ice cream shop|ice cream parlour|cone
e|pizza place|pizzeria|pizza
e|burger joint|burger bar|burger
e|coffee shop|cafe|coffee
e|book shop|bookstore|books
e|shoe shop|shoe store|shoes
e|clothes shop|boutique|clothes
e|butcher shop|butcher|meat
e|fish market|market|fish
e|farmers market|market|vegetables
e|grocery store|grocer|food
e|corner shop|convenience store|shop
e|pharmacy|chemist;drugstore|medicine
e|vet clinic|vet;animal hospital|pets
e|dentist office|dentist|teeth
e|doctor's office|clinic;surgery|doctor
e|school yard|playground|school
e|kindergarten|nursery|kids
e|university|college|students
e|office|workplace|desk
e|hair salon|hairdresser|hair
e|nail salon|salon|nails
e|laundromat|launderette|washing
e|bus station|bus depot|buses
e|subway station|metro station|trains
e|taxi rank|taxi stand|taxi
e|sports hall|gym|sport
e|skate park|skatepark|skateboard
e|soccer field|football pitch|goal
e|basketball court|court|hoop
e|golf course|golf links|golf
e|baseball field|ballpark|baseball
e|running track|track|race
e|ski slope|piste|skiing
e|beach hut|hut|beach
e|sand dunes|dunes|desert
e|rainforest|jungle|trees
e|savanna|grassland|lions
e|arctic|north pole|ice
e|countryside|country|fields
e|town square|square|statue
e|fountain|water fountain|coins
e|statue|sculpture|park
e|clock tower|tower|clock
e|bell tower|tower|bells
e|castle tower|tower|princess
e|rope bridge|bridge|jungle
e|tunnel entrance|tunnel|dark
e|cave entrance|cave|bats
e|mine|mine shaft|gold;miners
e|quarry|pit|rocks
e|junkyard|scrapyard|cars
e|dump|landfill|trash
e|petting zoo|farm|animals
e|safari|safari park|animals
e|theme park|amusement park|rides
e|fairground|funfair|rides
e|carnival|fair|rides
e|haunted mansion|haunted house|ghosts
e|ghost town|abandoned town|empty
e|space|outer space|stars
e|moon base|moon|astronaut
e|underwater city|atlantis|sea
e|wedding chapel|chapel|wedding
e|birthday party|party|cake
e|sleepover|slumber party|pajamas
m|parliament|parliament house|government
m|town hall|city hall|mayor
m|embassy|consulate|flag
m|courthouse|court|judge
m|jail cell|prison cell;cell|bars
m|army base|military base|soldiers
m|airfield|airstrip|planes
m|helipad|heliport|helicopter
m|shipyard|dockyard|ships
m|warehouse|storehouse|boxes
m|car factory|factory|cars
m|chocolate factory|factory|chocolate
m|brewery|beer|vats
m|winery|vineyard|wine
m|recording studio|studio|music
m|film studio|studio|movies
m|tv studio|studio|camera
m|newsroom|news|reporters
m|call centre|call center|phones
m|data centre|server farm|computers
m|hospital ward|ward|beds
m|operating theatre|operating room|surgery
m|waiting room|lobby|chairs
m|reception|front desk|hotel
m|hotel lobby|lobby|hotel
m|elevator lobby|lift lobby|elevator
m|rooftop|roof|city
m|penthouse|top floor|luxury
m|backyard|back garden|grass
m|front yard|front garden|lawn
m|driveway|drive|car
m|cul-de-sac|dead end|street
m|alley|alleyway|narrow
m|sidewalk|pavement|walk
m|crosswalk|pedestrian crossing|zebra
m|intersection|junction|traffic
m|motorway|freeway|cars
m|toll road|toll|cars
m|service station|rest stop|fuel
m|truck stop|rest stop|trucks
m|drive-thru|drive through|food
m|drive-in cinema|drive-in|movie
m|food court|court|food
m|night market|market|lights
m|flea market|market|second hand
m|antique shop|antiques|old
m|pawn shop|pawnbroker|money
m|jewelry store|jewellers|rings
m|bank vault|vault|money
m|casino|gambling|cards
m|nightclub|club|dancing
m|bar|pub|drinks
m|concert hall|hall|music
m|opera house|opera|singing
m|ballroom|dance hall|dance
m|arcade|game arcade|games
m|escape room|puzzle room|clues
m|bowling green|green|bowls
m|tennis club|club|tennis
m|yacht club|marina|yachts
m|golf clubhouse|clubhouse|golf
m|stables|stable|horses
m|racecourse|horse racing|horses
m|velodrome|track|bikes
m|boxing ring|ring|boxing
m|wrestling ring|ring|wrestling
m|dojo|martial arts school|karate
m|spa|day spa|massage
m|sauna|steam room|hot
m|hot spring|onsen|steam
m|beach resort|resort|pool
m|holiday camp|camp|summer
m|youth hostel|hostel|backpackers
m|bed and breakfast|b and b|guest house
m|guest house|inn|rooms
m|inn|tavern|travelers
m|monastery|abbey|monks
m|convent|nunnery|nuns
m|synagogue|temple|jewish
m|shrine|altar|prayer
m|cemetery|graveyard|graves
m|crypt|tomb|underground
m|tomb|grave|mummy
m|ruins|ancient ruins|old
m|archaeological dig|dig site|fossils
m|lookout point|viewpoint|view
m|fishing village|village|boats
m|mountain village|village|hills
m|ski lodge|lodge|snow
m|bunker|shelter|underground
m|bomb shelter|bunker|safe
m|control room|room|screens
m|engine room|room|ship
m|boiler room|basement|pipes
m|cellar|basement|wine
m|wine cellar|cellar|bottles
m|pantry|larder|food
m|utility room|laundry room|washing
m|playroom|nursery|toys
m|nursery room|baby room|cot
m|study|home office|desk
m|walk-in closet|closet|clothes
m|guest room|spare room|bed
m|dining room|room|table
m|conservatory|sunroom|glass
m|courtyard|yard|square
h|amphitheater|arena|stage
h|acropolis|parthenon|greece
h|Parthenon|acropolis|greece;columns
h|Notre Dame|cathedral|paris
h|Buckingham Palace|palace|london;queen
h|Louvre|museum|paris;pyramid
h|Mona Lisa|painting|louvre
h|Golden Temple|temple|amritsar
h|Forbidden City|palace|china
h|Chichen Itza|pyramid|mexico
h|Alhambra|palace|spain
h|Sagrada Familia|church|barcelona
h|Neuschwanstein|castle|germany
h|Edinburgh Castle|castle|scotland
h|Brandenburg Gate|gate|berlin
h|Berlin Wall|wall|germany
h|Hagia Sophia|mosque|istanbul
h|Uluru|ayers rock|australia
h|Great Barrier Reef|reef|australia
h|Victoria Falls|waterfall|africa
h|Kilimanjaro|mountain|africa
h|Dead Sea|sea|salt
h|Bermuda Triangle|triangle|ships
h|Area 51|base|aliens
h|Silicon Valley|valley|tech
h|Wall Street|stock market|money
h|Las Vegas|vegas|casino
h|Hollywood|movies|stars
h|Broadway|theatre|new york
h|Central Park|park|new york
h|Empire State Building|skyscraper|new york
h|Space Needle|tower|seattle
h|CN Tower|tower|toronto
h|Marina Bay Sands|hotel|singapore
h|Petronas Towers|towers|malaysia
h|Charminar|monument|hyderabad
h|Qutub Minar|tower|delhi
h|Hawa Mahal|palace|jaipur
h|Mysore Palace|palace|india
h|Kedarnath|temple|mountains
h|Alcatraz|prison|island
h|Galapagos|islands|tortoise
h|Mount Olympus|mountain|gods
h|Pompeii|ruins|volcano
h|Vatican|vatican city|pope
h|Sistine Chapel|chapel|ceiling
h|Trevi Fountain|fountain|rome
h|Grand Bazaar|bazaar|market
h|Wailing Wall|western wall|jerusalem
h|Kaaba|mecca|pilgrimage
h|Mount Kailash|mountain|tibet
h|Potala Palace|palace|tibet
h|Ha Long Bay|bay|vietnam
h|Terracotta Army|statues|china
h|Moai|easter island heads|statues
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
e|sitting down|sit;sitting|chair
e|lying down|lie down;lying|bed
e|waking up|wake up|alarm;bed
e|getting dressed|dressing|clothes
e|tying a tie|tie|knot
e|combing hair|comb|hair
e|shaving|shave|razor;beard
e|putting on makeup|makeup|lipstick
e|blow drying|blow dry|hairdryer
e|washing face|wash face|sink
e|bathing|bath|tub
e|brushing a dog|grooming|dog
e|walking the dog|dog walking|leash
e|feeding the cat|feeding|cat;bowl
e|feeding ducks|feeding|ducks;bread
e|milking a cow|milking|cow;bucket
e|riding a horse|horse riding|saddle
e|riding a camel|camel ride|desert
e|riding an elephant|elephant ride|elephant
e|skateboarding trick|ollie|skateboard
e|skiing downhill|skiing|snow
e|snowboarding|snowboard|snow
e|sledging|sledding|snow
e|building a snowman|snowman|snow
e|making snow angels|snow angel|snow
e|throwing a snowball|snowball|snow
e|building a sandcastle|sandcastle|beach
e|flying|fly|wings
e|floating|float|water
e|sinking|sink|water
e|drowning|drown|water
e|splashing|splash|water
e|fishing with a net|net fishing|net
e|kicking a ball|kick|ball
e|throwing a ball|throw|ball
e|catching a ball|catch|ball
e|bouncing a ball|bounce|ball
e|hitting|hit;punch|fist
e|punching|punch|fist
e|slapping|slap|hand
e|biting|bite|teeth
e|chewing|chew|gum
e|licking|lick|ice cream
e|sipping|sip|drink
e|slurping|slurp|noodles
e|burping|burp|drink
e|coughing|cough|sick
e|spitting|spit|mouth
e|blowing nose|nose blowing|tissue
e|scratching|scratch|itch
e|itching|itch|scratch
e|nodding|nod|head;yes
e|shaking head|no|head
e|shrugging|shrug|shoulders
e|frowning|frown|sad
e|pouting|pout|lips
e|crossing arms|arms folded|angry
e|facepalm|face palm|hand;face
e|thumbs up|thumb up|like
e|thumbs down|thumb down|dislike
e|fist bump|bump|fist
e|peace sign|v sign|fingers
e|counting|count|fingers;numbers
e|measuring|measure|ruler
e|weighing|weigh|scales
e|cutting|cut|scissors
e|folding|fold|paper
e|gluing|glue|paper
e|drawing a picture|drawing|pencil
e|coloring|colouring|crayons
e|writing a letter|letter writing|pen
e|posting a letter|mailing|postbox
e|reading a map|map reading|map
e|reading a newspaper|newspaper|news
e|watching tv|tv;watching television|couch
e|watching a movie|movie|popcorn
e|listening to music|music|headphones
e|playing video games|gaming|controller
e|talking on the phone|phone call|phone
e|making a phone call|calling|phone
e|taking a photo|photographing|camera
e|recording a video|filming|camera
e|knocking on a door|knocking|door
e|opening a door|open door|handle
e|closing a door|close door|door
e|locking a door|lock|key
e|ringing a bell|bell ringing|bell
e|climbing a ladder|ladder|climb
e|climbing a tree|tree climbing|tree
e|climbing stairs|stairs|steps
e|sliding down|slide|playground
e|swinging on a swing|swing|playground
e|carrying|carry|bag
e|lifting|lift|heavy
e|dragging|drag|pull
e|pushing a cart|cart|shopping
e|pushing a pram|pram|baby
e|rocking a baby|rocking|baby
e|feeding a baby|bottle feeding|baby
e|changing a nappy|diaper change|baby
e|giving a gift|giving|present
e|sharing|share|friends
e|helping|help|friend
e|cleaning|clean|mop
e|dusting|dust|duster
e|mopping|mop|floor
e|scrubbing|scrub|brush
e|tidying up|tidy|room
e|making the bed|bed making|bed
e|folding clothes|folding|laundry
e|hanging laundry|laundry|line
e|doing laundry|washing clothes|machine
e|taking out the trash|trash|bin
e|raking leaves|raking|leaves
e|mowing the lawn|mowing|grass
e|chopping wood|wood chopping|axe
e|hammering a nail|hammering|hammer
e|sawing|saw|wood
e|drilling|drill|hole
e|painting a wall|painting|roller
e|fixing|repair|tools
e|building|build|bricks
e|washing a car|car wash|sponge
e|fixing a bike|bike repair|wheel
e|pumping a tyre|pumping|pump
e|filling up|refuelling|petrol
e|parking|park|car
e|honking|horn|car
e|braking|brake|car
e|speeding|speed|fast
e|crashing|crash|car
e|hailing a taxi|taxi|wave
e|waiting|wait|queue
e|queuing|queue;line|wait
e|ordering food|ordering|menu
e|paying|pay|money
e|counting money|money|cash
e|saving money|saving|piggy bank
e|spending money|spending|shop
e|winning|win|trophy
e|losing|lose|sad
e|racing|race|finish line
e|chasing|chase|run
e|seeking|seek;searching|find
e|searching|search|look
e|finding|find|look
e|looking|look;watching|eyes
e|staring|stare|eyes
e|blinking|blink|eyes
e|listening|listen|ears
e|smelling|smell|nose
e|touching|touch|hand
e|tasting food|taste|tongue
e|talking|talk;chat|mouth
e|yelling|yell;scream|loud
e|screaming|scream|scared
e|growling|growl|angry
e|barking|bark|dog
e|meowing|meow|cat
e|roaring|roar|lion
m|juggling balls|juggle|balls
m|spinning a plate|plate spinning|plate
m|doing a magic trick|magic|wand
m|pulling a rabbit out of a hat|magic|hat;rabbit
m|sawing a person in half|magic trick|box
m|walking on stilts|stilts|tall
m|riding a unicycle|unicycle|wheel
m|walking a tightrope|tightrope|balance
m|balancing|balance|beam
m|lifting a car|strong|car
m|flexing muscles|flexing|biceps
m|doing sit ups|sit ups|abs
m|doing yoga|yoga|mat
m|stretching legs|stretch|legs
m|doing the splits|splits|legs
m|kicking a door|kick|door
m|breaking a board|karate chop|wood
m|sword fighting|swordfight|swords
m|fencing match|fencing|sword
m|shooting an arrow|archery|bow
m|throwing a dart|darts|board
m|bowling a strike|strike|pins
m|serving a tennis ball|serve|racket
m|scoring a goal|goal|net
m|saving a goal|save|goalkeeper
m|celebrating|celebrate|party
m|toasting|cheers|glasses
m|clinking glasses|cheers|glasses
m|making a toast|speech|glass
m|giving a speech|speech|podium
m|presenting|presentation|slides
m|teaching|teach|blackboard
m|studying|study|books
m|taking an exam|exam|test
m|cheating|cheat|test
m|raising a hand|hand up|question
m|asking a question|asking|question mark
m|answering|answer|reply
m|explaining|explain|talk
m|arguing|argue|fight
m|fighting|fight|punch
m|making up|apology|hug
m|apologizing|sorry|apology
m|forgiving|forgive|hug
m|complaining|complain|moan
m|gossiping|gossip|whisper
m|lying|lie|nose
m|bragging|showing off|boast
m|teasing|tease|tongue
m|sticking out tongue|tongue out|tongue
m|pulling a face|funny face|face
m|making faces|faces|funny
m|imitating|copying|mimic
m|mimicking|imitate|copy
m|doing a backflip|backflip|flip
m|doing a frontflip|flip|jump
m|flipping pancakes|flip|pancake
m|tossing a pizza|pizza toss|dough
m|kneading dough|kneading|bread
m|rolling dough|rolling pin|dough
m|icing a cake|decorating|cake
m|blowing up a balloon|inflating|balloon
m|popping a balloon|pop|balloon
m|popping bubble wrap|pop|bubble wrap
m|opening a present|unwrapping|gift
m|setting the table|table setting|plates
m|clearing the table|clearing|plates
m|doing dishes|washing up|sink
m|drying dishes|drying|towel
m|loading the dishwasher|dishwasher|plates
m|grocery shopping|shopping|cart
m|unpacking|unpack|suitcase
m|packing a suitcase|packing|suitcase
m|moving house|moving|boxes
m|checking in|check in|hotel
m|boarding a plane|boarding|plane
m|missing the bus|late|bus
m|running late|late|clock
m|oversleeping|sleep in|alarm
m|hitting snooze|snooze|alarm
m|stubbing a toe|stub toe|ouch
m|stepping on lego|lego|ouch
m|getting a haircut|haircut|scissors
m|getting a tattoo|tattoo|needle
m|getting a shot|injection|needle
m|taking medicine|medicine|pill
m|checking temperature|thermometer|fever
m|bandaging|bandage|wound
m|giving CPR|cpr|chest
m|calling for help|help|shout
m|rescuing|rescue|save
m|escaping|escape|run
m|sneaking out|sneak|window
m|robbing a bank|robbery|mask;bag
m|stealing|steal|thief
m|arresting|arrest|handcuffs
m|surrendering|surrender|hands up
m|hands up|surrender|arms
m|pulling a cracker|christmas cracker|bang
m|lighting fireworks|fireworks|bang
m|lighting a candle|candle|match
m|roasting marshmallows|marshmallows|campfire
m|telling a ghost story|ghost story|torch
m|singing around a campfire|campfire|guitar
m|pitching a tent|tent|camping
m|reading a bedtime story|bedtime story|book
m|tucking in|bedtime|blanket
m|counting sheep|sheep|sleep
m|having a nightmare|nightmare|scared
m|daydream|dreaming|clouds
h|levitating|floating|magic
h|teleporting|teleport|magic
h|time travelling|time travel|clock
h|shapeshifting|transform|change
h|hypnotizing|hypnosis|swinging watch
h|ventriloquism|dummy|puppet
h|beatboxing|beatbox|mouth;music
h|air guitar|pretend guitar|rock
h|crowd surfing|stage diving|concert
h|headbanging|head bang|rock
h|moshing|mosh pit|concert
h|lip syncing|lip sync|music
h|vlogging|vlog|camera
h|livestreaming|streaming|camera
h|binge watching|binge|tv
h|doomscrolling|scrolling|phone
h|ghosting|ignore|phone
h|catfishing|fake profile|phone
h|bargaining|haggling|price
h|haggling|bargain|market
h|negotiating|negotiate|deal
h|auctioning|auction|gavel
h|bidding|bid|auction
h|gambling|bet|casino
h|bluffing|bluff|poker
h|shuffling cards|shuffle|deck
h|dealing cards|deal|cards
h|rolling dice|dice roll|dice
h|flipping a table|table flip|angry
h|rage quitting|quit|angry
h|sulking|sulk|moody
h|eye rolling|roll eyes|annoyed
h|sighing|sigh|tired
h|panicking|panic|scared
h|freaking out|panic|scream
h|hyperventilating|breathing|panic
h|stalking|follow|creepy
h|tailgating|follow|car
h|jaywalking|crossing|road
h|loitering|hanging around|street
h|trespassing|trespass|fence
h|vandalizing|graffiti|spray can
h|spray painting|graffiti|wall
h|juggling chainsaws|juggle|chainsaw
h|fire breathing|breathing fire|flame
h|sword swallowing|swallow|sword
h|walking on hot coals|fire walk|coals
h|lying on a bed of nails|bed of nails|nails
h|escaping a straitjacket|escape|straitjacket
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
e|man|guy;gentleman|person
e|woman|lady|person
e|child|kid|small
e|kids|children|play
e|baby boy|baby|boy
e|baby girl|baby|girl
e|mother|mom;mum;mommy|parent
e|father|dad;daddy|parent
e|brother|bro;sibling|family
e|sister|sis;sibling|family
e|uncle|aunt|family
e|aunt|auntie|family
e|cousin|cousins|family
e|grandparents|grandma;grandpa|old
e|granny|grandma|knitting
e|neighbor|neighbour|next door
e|friend|best friend;buddy|hug
e|best friends|bff|friends
e|couple|lovers|heart
e|husband|spouse|wedding
e|wife|spouse|wedding
e|newborn|baby|crib
e|schoolboy|student;pupil|school
e|schoolgirl|student;pupil|school
e|classmate|student|class
e|principal|headteacher;headmaster|school
e|tutor|teacher|lesson
e|boss|manager|office
e|office worker|worker|desk
e|worker|labourer|hard hat
e|construction worker|builder|hard hat
e|road worker|workman|cones
e|miner|coal miner|helmet;pickaxe
e|fireman|firefighter|hose
e|policeman|police officer;cop|badge
e|policewoman|police officer;cop|badge
e|cop|police|badge
e|paramedic|ambulance worker|ambulance
e|patient|sick person|hospital
e|milkman|milk man|bottles
e|paperboy|newspaper boy|bike
e|ice cream man|ice cream seller|van
e|street vendor|hawker|cart
e|chai wala|tea seller|tea
e|bus conductor|conductor|ticket
e|train driver|engine driver|train
e|ship captain|captain|ship
e|flight attendant|air hostess;steward|plane
e|cabin crew|flight attendant|plane
e|tourist|traveller|camera;map
e|backpacker|traveller|backpack
e|hiker|walker|boots
e|camper|scout|tent
e|scout|boy scout;girl scout|badge
e|swimmer|swimmer|pool
e|runner|jogger|race
e|footballer|soccer player|ball
e|basketball player|baller|hoop
e|cricketer|cricket player|bat
e|tennis player|tennis|racket
e|golfer|golf player|club
e|boxer|fighter|gloves
e|wrestler|wrestling|ring
e|weightlifter|lifter|barbell
e|gymnast|gymnastics|leotard
e|skater|skateboarder|board
e|skier|skiing|snow
e|goalie|goalkeeper|gloves
e|audience|crowd|clapping
e|crowd|people|many
e|rock star|rockstar|guitar
e|pop star|popstar|microphone
e|guitarist|guitar player|guitar
e|drummer|drum player|drums
e|pianist|piano player|piano
e|violinist|violin player|violin
e|band|music band|instruments
e|choir|singers|singing
e|orchestra|band|music
e|actor|actress|movie
e|movie star|celebrity|famous
e|celebrity|star;famous person|autograph
e|model|supermodel|catwalk
e|influencer|youtuber|phone
e|comedian|stand up comedian|jokes
e|storyteller|narrator|book
e|writer|author|book
e|poet|writer|poem
e|cartoonist|illustrator|drawing
e|sculptor|artist|statue
e|potter|ceramicist|clay
e|florist|flower seller|flowers
e|waitress|waiter;server|tray
e|pizza chef|pizzaiolo|pizza
e|sushi chef|chef|sushi
e|bartender|barman|drinks
e|barista|coffee maker|coffee
e|shop assistant|salesperson|shop
e|salesman|salesperson|suit
e|banker|bank worker|money
e|businessman|business person|briefcase
e|millionaire|rich person|money
e|beggar|homeless person|cup
e|king and queen|royals|crowns
e|royal family|royals|crown
e|emperor|king|throne
e|empress|queen|throne
e|duke|nobleman|castle
e|bodyguard|guard|sunglasses
e|guard|security|uniform
e|army|soldiers|tank
e|navy|sailors|ship
m|alien hunter|ufo hunter|aliens
m|ghost hunter|ghostbuster|ghosts
m|treasure hunter|explorer|map
m|bounty hunter|hunter|reward
m|pirate captain|captain|pirate ship
m|cowgirl|cowboy|hat;horse
m|rancher|farmer|ranch
m|shepherd|herder|sheep
m|goatherd|herder|goats
m|cowherd|herder|cows
m|fruit picker|picker|fruit
m|fishmonger|fish seller|fish
m|greengrocer|grocer|vegetables
m|blacksmith|smith|anvil;hammer
m|locksmith|lock maker|keys
m|glassblower|glass maker|glass
m|watchmaker|clockmaker|watch
m|cobbler|shoemaker|shoes
m|seamstress|tailor|sewing
m|dressmaker|tailor|dress
m|weaver|weaving|loom
m|knitter|knitting|wool
m|candlestick maker|candle maker|candles
m|butler|servant|tray
m|maid|housekeeper|duster
m|housekeeper|maid|cleaning
m|chauffeur|driver|limo
m|valet|car parker|keys
m|porter|bellboy|luggage
m|bellhop|porter|hotel
m|doorman|door man|hotel
m|receptionist|front desk|phone
m|secretary|assistant|typing
m|interpreter|translator|languages
m|translator|interpreter|languages
m|diplomat|ambassador|flag
m|ambassador|diplomat|embassy
m|politician|mp|speech
m|prime minister|pm|government
m|senator|politician|vote
m|voter|citizen|ballot
m|protester|demonstrator|sign
m|activist|campaigner|protest
m|volunteer|helper|charity
m|social worker|caseworker|help
m|counselor|therapist|talk
m|psychologist|therapist|couch
m|therapist|counsellor|couch
m|dietitian|nutritionist|food
m|physiotherapist|physio|exercise
m|chiropractor|back doctor|spine
m|midwife|nurse|baby
m|paediatrician|child doctor|kids
m|vet nurse|vet|animals
m|dog walker|walker|dogs
m|dog groomer|groomer|dog
m|animal trainer|trainer|animals
m|lion tamer|tamer|lion;whip
m|trapeze artist|acrobat|swing
m|fire eater|fire breather|flame
m|sword swallower|performer|sword
m|strongman|strong man|weights
m|human cannonball|cannonball|circus
m|stilt walker|stilts|tall
m|unicyclist|unicycle|circus
m|mime|mime artist|invisible box
m|busker|street musician|guitar
m|rapper|mc|microphone
m|opera singer|soprano|opera
m|composer|songwriter|music
m|film director|director|camera
m|cameraman|camera operator|camera
m|stunt double|stuntman|action
m|makeup artist|makeup|brush
m|costume designer|designer|clothes
m|fashion designer|designer|clothes
m|interior designer|designer|room
m|graphic designer|designer|computer
m|game developer|developer|games
m|web developer|developer|code
m|data scientist|scientist|charts
m|astronomer|stargazer|telescope
m|astrologer|horoscope|stars
m|geologist|rock scientist|rocks
m|botanist|plant scientist|plants
m|biologist|scientist|cells
m|chemist|scientist|test tube
m|physicist|scientist|atoms
m|inventor|creator|invention
m|mad scientist|crazy scientist|lab
m|professor|lecturer|university
m|historian|history|books
m|paleontologist|fossil hunter|dinosaurs
m|marine biologist|biologist|ocean
m|meteorologist|weatherman|weather
m|weatherman|weather presenter|map
m|news reporter|reporter|microphone
m|journalist|reporter|notepad
m|editor|journalist|newspaper
h|tax collector|taxman|money
h|auctioneer|auction|gavel
h|stockbroker|trader|stocks
h|bookkeeper|accountant|ledger
h|notary|lawyer|stamp
h|bailiff|court officer|court
h|jury|jurors|court
h|witness|eyewitness|court
h|suspect|criminal|lineup
h|prisoner|inmate;convict|jail
h|escaped convict|escapee|stripes
h|pickpocket|thief|wallet
h|burglar|robber|mask;bag
h|smuggler|criminal|boat
h|secret agent|spy|sunglasses
h|double agent|spy|secret
h|private investigator|private eye;detective|magnifying glass
h|forensic scientist|scientist|fingerprints
h|coroner|medical examiner|body
h|undertaker|funeral director|coffin
h|gravedigger|digger|shovel
h|town crier|crier|bell
h|knight in armour|knight|armour
h|squire|page|knight
h|archer|bowman|bow
h|peasant|farmer|old
h|noblewoman|lady|dress
h|monarch|king;queen|crown
h|sultan|king|palace
h|maharaja|king|india
h|geisha|japanese woman|kimono
h|sumo wrestler|sumo|japan
h|shaolin monk|monk|kung fu
h|yogi|yoga master|meditation
h|guru|teacher|wise
h|shaman|medicine man|spirits
h|nomad|wanderer|tent
h|hermit|recluse|cave
h|stowaway|hidden passenger|ship
h|refugee|migrant|boat
h|pilgrim|traveller|journey
h|missionary|preacher|church
h|choirboy|choir|singing
h|altar boy|server|church
h|bishop|priest|mitre
h|pope|holy father|vatican
h|rabbi|teacher|synagogue
h|imam|prayer leader|mosque
h|sommelier|wine waiter|wine
h|food critic|critic|restaurant
h|taste tester|tester|food
h|lollipop lady|crossing guard|sign
h|parking warden|traffic warden|ticket
h|dog catcher|animal control|net
h|exterminator|pest control|bugs
h|window cleaner|cleaner|ladder
h|steeplejack|climber|chimney
h|lighthouse keeper|keeper|lighthouse
h|park ranger|ranger|forest
h|forest ranger|ranger|trees
h|coast guard|guard|boat
h|air traffic controller|controller|planes
h|crash test dummy|dummy|car
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
e|soccer|football|goal;ball
e|sprint|sprinting|fast
e|hiking|hike|mountain
e|boating|boat|lake
e|canoeing|canoe|paddle
e|kayaking|kayak|paddle
e|bmx|bmx bike|tricks
e|mountain biking|mountain bike|trail
e|scooter ride|scooter|kick
e|roller blades|inline skates|skating
e|ice skating rink|ice rink|skates
e|tag|tig;it|chase
e|tic tac toe|noughts and crosses|x;o
e|connect four|connect 4|discs
e|snakes and ladders|chutes and ladders|dice
e|ludo|parcheesi|dice
e|checkers|draughts|board
e|chess knight|knight|horse
e|card game|cards|deck
e|playing card|card|ace
e|ace of spades|ace|cards
e|joker card|joker|cards
e|deck of cards|cards|shuffle
e|dice game|dice|roll
e|toy|toys|play
e|action figure|figure|toy
e|toy train|train set|tracks
e|toy robot|robot|toy
e|spinning top|top|spin
e|paper boat|boat|paper
e|water gun|squirt gun;water pistol|water
e|water balloon|balloon|splash
e|bubble wand|bubbles|blow
e|swing ride|swing|playground
e|merry go round|carousel|horses
e|ferris wheel|big wheel|fair
e|bumper cars|dodgems|fair
e|carousel|merry go round|horses
e|log flume|water ride|splash
e|water slide|slide|pool
e|climbing frame|jungle gym|playground
e|monkey bars|bars|playground
e|zip line|zipline|wire
e|bouncy castle|bounce house|jump
e|ball pit|balls|play
e|tennis ball|ball|tennis
e|basketball hoop|hoop|net
e|football goal|goal|net
e|baseball glove|glove;mitt|catch
e|gold medal|medal|winner
e|silver medal|medal|second
e|bronze medal|medal|third
e|first place|winner|podium
e|cheerleading|cheerleader|pompoms
e|pompoms|pom poms|cheer
e|mascot|team mascot|costume
e|team|teammates|jersey
e|jersey|shirt|number
e|sports shoes|trainers|running
e|push up|pushup;press up|arms
e|sit up|situp;crunch|abs
e|squat|squats|legs
e|plank|planking|abs
e|jumping jack|star jump|exercise
e|skipping|skip rope|rope
e|aerobics|exercise class|music
e|zumba|dance fitness|dance
e|pilates|exercise|mat
e|spin class|spinning|bike
e|exercise bike|stationary bike|gym
e|gym bag|bag|gym
e|barbell|weights|lift
e|kettlebell|weight|swing
e|yoga mat|mat|yoga
e|photography|photos|camera
e|jigsaw|jigsaw puzzle|pieces
e|model train|train set|tracks
e|model airplane|airplane model|glue
m|beach volleyball|volleyball|sand
m|dodgeball|dodge ball|throw
m|netball|net ball|hoop
m|handball|hand ball|goal
m|field hockey|hockey|stick
m|softball|baseball|bat
m|kabaddi|kabbadi|tag
m|kho kho|tag|india
m|gilli danda|stick game|india
m|carrom|carrom board|striker
m|snooker|pool|cue
m|billiards|pool|cue
m|cue stick|cue|pool
m|eight ball|8 ball|pool
m|air hockey|hockey|puck
m|foosball|table football|rods
m|mini golf|crazy golf;putt putt|windmill
m|golf cart|buggy|golf
m|golf tee|tee|golf ball
m|hole in one|ace|golf
m|caddy|golf caddie|bag
m|archery target|target|arrow
m|bullseye|bull's eye|target;darts
m|dartboard|darts board|darts
m|clay pigeon shooting|skeet|gun
m|shooting range|range|target
m|paintball|paintball gun|splat
m|laser tag|lazer tag|vest
m|go-karting|karting|race
m|motocross|dirt bike|mud
m|rally driving|rally|car
m|formula one|f1|race car
m|pit stop|pit crew|tyres
m|checkered flag|chequered flag|finish
m|drag race|race|cars
m|horse racing|race|jockey
m|show jumping|equestrian|horse
m|dressage|horse dance|horse
m|rodeo|bull riding|cowboy
m|bull riding|rodeo|bull
m|lasso|lariat|rope
m|fishing net|net|fish
m|fly fishing|fishing|river
m|ice fishing|fishing|hole
m|spear fishing|spear|fish
m|deep sea fishing|fishing|boat
m|metal detecting|detector|beach
m|treasure hunting|treasure|map
m|geocaching|treasure hunt|gps
m|orienteering|map|compass
m|scrapbooking|scrapbook|photos
m|calligraphy|handwriting|pen
m|embroidery|stitching|needle
m|crochet|hook|yarn
m|quilting|quilt|patches
m|woodworking|carpentry|wood
m|wood carving|whittling|knife
m|candle making|candles|wax
m|soap making|soap|bars
m|jewellery making|beads|necklace
m|beading|beads|string
m|flower arranging|ikebana|vase
m|bonsai|tiny tree|pot
m|beekeeping|bees|hive
m|coin collecting|coins|album
m|card collecting|trading cards|album
m|trading cards|cards|collect
m|comic books|comics|superheroes
m|cosplay|costume|convention
m|board game night|board games|dice
m|trivia night|quiz|questions
m|pub quiz|quiz|answers
m|charades|acting game|mime
m|pictionary|drawing game|guess
m|twister|twister game|spinner
m|hangman|word game|letters
m|word search|puzzle|letters
m|mahjong|tiles|china
m|backgammon|board game|dice
m|poker|cards|chips
m|blackjack|21|cards
m|roulette|wheel|casino
m|slot machine|fruit machine|casino
m|pinball|pinball machine|flippers
m|arcade game|arcade|joystick
m|claw machine|crane game|toy
m|whack a mole|mole game|hammer
m|skee ball|ball game|ramp
m|ring toss|hoopla|rings
m|coconut shy|throwing game|coconut
m|duck pond game|hook a duck|ducks
m|three legged race|race|legs
m|wheelbarrow race|race|legs
m|obstacle course|course|climb
m|assault course|obstacle|army
m|egg toss|throwing|eggs
m|apple bobbing|bobbing|apples
m|pin the tail on the donkey|party game|blindfold
m|pass the parcel|party game|music
m|musical statues|freeze|music
m|simon says|game|copy
m|red light green light|game|stop
m|duck duck goose|game|circle
m|hot potato|game|pass
m|limbo stick|limbo|bend
m|piñata|pinata|candy;stick
h|steeplechase|race|hurdles
h|modern pentathlon|pentathlon|five sports
h|biathlon|skiing shooting|rifle
h|heptathlon|athletics|seven
h|luge|sled|ice
h|skeleton sled|skeleton|ice
h|speed skating|skating|ice
h|ice dancing|dance|ice
h|half pipe|ramp|skate
h|freestyle skiing|skiing|tricks
h|cross country skiing|skiing|snow
h|snowshoeing|snowshoes|snow
h|ice climbing|climbing|ice axe
h|bouldering|climbing|wall
h|abseiling|rappelling|rope
h|caving|potholing|cave
h|canyoning|canyon|water
h|base jumping|parachute|cliff
h|wingsuit flying|wingsuit|fly
h|hang gliding|glider|fly
h|zorbing|zorb|ball
h|sandboarding|sand|board
h|bodyboarding|boogie board|wave
h|paddleboarding|paddle board|lake
h|wakeboarding|wakeboard|boat
h|water skiing|skis|boat
h|jet skiing|jet ski|water
h|free diving|diving|breath
h|cliff diving|diving|cliff
h|synchronised diving|diving|pair
h|artistic swimming|synchronized swimming|pool
h|rowing eight|rowing|boat
h|dragon boat racing|dragon boat|drum
h|sailing regatta|regatta|boats
h|sepak takraw|kick volleyball|asia
h|jai alai|pelota|basket
h|hurling|irish sport|stick
h|gaelic football|irish sport|ball
h|aussie rules|australian football|ball
h|kendo|sword art|bamboo
h|aikido|martial art|throw
h|capoeira|martial art|brazil
h|muay thai|thai boxing|kick
h|jiu jitsu|bjj|grapple
h|sambo|wrestling|russia
h|kung fu|martial arts|china
h|tai chi|martial art|slow
h|chess clock|clock|chess
h|stalemate|draw|chess
h|grand slam|tennis|title
h|tie break|tiebreak|tennis
h|match point|point|tennis
h|deuce|tennis|score
h|birdie|golf|one under
h|bogey|golf|one over
h|home run|homer|baseball
h|strike out|strikeout|baseball
h|touchdown|td|american football
h|field goal|kick|american football
h|quarterback|qb|football
h|scrum|rugby|push
h|lbw|leg before wicket|cricket
h|googly|cricket|spin
h|yorker|cricket|bowl
h|maiden over|over|cricket
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
e|Mario|super mario|plumber;mushroom
e|Luigi|mario brother|green;plumber
e|Princess Peach|peach|princess;mario
e|Bowser|koopa king|mario;dragon
e|Yoshi|green dinosaur|mario
e|Donkey Kong|dk|gorilla;barrels
e|Kirby|pink puff|nintendo
e|Link|zelda|sword;green
e|Zelda|legend of zelda|link
e|Sonic the Hedgehog|sonic|blue;rings
e|Tails|fox|sonic
e|Lightning McQueen|mcqueen|cars
e|Mater|tow mater|cars
e|Nemo|clownfish|finding nemo
e|Dory|blue fish|finding nemo
e|Simba|lion cub|lion king
e|Mufasa|lion|lion king
e|Pumbaa|warthog|lion king
e|Timon|meerkat|lion king
e|Rafiki|baboon|lion king
e|Scar|lion|lion king
e|Ariel|little mermaid|mermaid
e|Sebastian|crab|little mermaid
e|Flounder|fish|little mermaid
e|Belle|beauty|beast
e|Beast|monster|belle
e|Mrs Potts|teapot|beauty and the beast
e|Lumiere|candlestick|beauty and the beast
e|Jasmine|princess|aladdin
e|Abu|monkey|aladdin
e|Jafar|villain|aladdin
e|Anna|frozen sister|frozen
e|Kristoff|frozen|reindeer
e|Sven|reindeer|frozen
e|Maui|demigod|moana;hook
e|Hei Hei|chicken|moana
e|Mirabel|encanto|glasses
e|Bruno|encanto|we don't talk
e|Miguel|coco|guitar
e|Remy|rat|ratatouille;chef
e|Carl|old man|up;balloons
e|Russell|scout|up
e|Dug|dog|up
e|EVE|robot|wall-e
e|Mike Wazowski|mike|monsters inc;eye
e|Sulley|monster|monsters inc
e|Boo|girl|monsters inc
e|Mr Incredible|bob parr|incredibles
e|Elastigirl|helen parr|stretch
e|Dash|incredibles|fast
e|Jack-Jack|baby|incredibles
e|Edna Mode|edna|no capes
e|Jessie|cowgirl|toy story
e|Rex|dinosaur|toy story
e|Hamm|piggy bank|toy story
e|Slinky Dog|slinky|toy story
e|Bo Peep|shepherdess|toy story
e|Little Green Men|aliens|toy story;claw
e|Forky|spork|toy story
e|Joy|inside out|yellow
e|Sadness|inside out|blue
e|Anger|inside out|red;fire
e|Fear|inside out|purple
e|Disgust|inside out|green
e|Po|panda|kung fu panda
e|Tigress|tiger|kung fu panda
e|Shifu|master|kung fu panda
e|Fiona|princess|shrek;ogre
e|Puss|cat|boots
e|Gingy|gingerbread man|shrek
e|Sid|sloth|ice age
e|Manny|mammoth|ice age
e|Scrat|squirrel|acorn;ice age
e|Marty|zebra|madagascar
e|King Julien|lemur|madagascar
e|Gru|despicable me|bald;minions
e|Kevin|minion|banana
e|Judy Hopps|bunny cop|zootopia
e|Nick Wilde|fox|zootopia
e|Toothless|night fury|dragon
e|Baymax|big hero 6|robot
e|Ralph|wreck it ralph|giant hands
e|Vanellope|racer|candy
e|Pooh Bear|winnie the pooh|honey
e|Tigger|tiger|bounce
e|Eeyore|donkey|sad
e|Christopher Robin|boy|pooh
e|Minnie Mouse|minnie|bow
e|Donald Duck|donald|duck;sailor
e|Daisy Duck|daisy|duck
e|Goofy|dog|disney
e|Pluto|dog|disney
e|Chip and Dale|chipmunks|disney
e|Captain Jack Sparrow|jack sparrow|pirate
e|Hermione|granger|harry potter
e|Ron Weasley|ron|harry potter
e|Dumbledore|wizard|beard
e|Voldemort|you know who|wand;no nose
e|Hagrid|giant|harry potter
e|Dobby|elf|sock
e|Hedwig|owl|harry potter
e|Snape|potions master|harry potter
e|Quidditch|broom game|snitch
e|Golden Snitch|snitch|quidditch
e|Platform 9 3/4|platform|trolley
e|Chewbacca|wookiee|star wars
e|R2-D2|droid|star wars
e|C-3PO|droid|gold
e|Luke Skywalker|luke|lightsaber
e|Princess Leia|leia|buns
e|Han Solo|solo|falcon
e|Stormtrooper|trooper|white
e|Lightsaber|light sword|star wars
e|Death Star|space station|star wars
e|Millennium Falcon|ship|star wars
e|BB-8|droid|ball
e|Ewok|teddy|star wars
e|Jabba the Hutt|jabba|slug
e|Patrick Star|patrick|starfish
e|Squidward|squid|clarinet
e|Mr Krabs|crab|money
e|Plankton|tiny villain|spongebob
e|Gary the snail|gary|meow
e|Krabby Patty|burger|spongebob
e|Homer Simpson|homer|donut
e|Bart Simpson|bart|skateboard
e|Marge Simpson|marge|blue hair
e|Lisa Simpson|lisa|saxophone
e|Maggie Simpson|maggie|dummy
e|Tom cat|tom|jerry
e|Jerry mouse|jerry|tom
e|Tweety|bird|sylvester
e|Sylvester|cat|tweety
e|Daffy Duck|daffy|duck
e|Wile E Coyote|coyote|road runner
e|Porky Pig|porky|that's all folks
e|Fred Flintstone|flintstones|yabba dabba doo
e|The Flintstones|flintstones|stone age
e|The Jetsons|jetsons|future
e|Yogi Bear|yogi|picnic
e|Popeye|sailor|spinach
e|Casper|friendly ghost|ghost
e|Shaggy|scooby|sandwich
e|Scooby snack|snack|scooby
e|Mystery Machine|van|scooby-doo
e|Bob the Builder|builder|can we fix it
e|Thomas the Tank Engine|thomas|train
e|Postman Pat|postman|cat
e|Fireman Sam|fireman|fire
e|Noddy|toyland|car
e|Peppa|pig|muddy puddles
e|George Pig|george|dinosaur
e|Chase|paw patrol|police
e|Marshall|paw patrol|fire
e|Dora the Explorer|dora|backpack;map
e|Barney|purple dinosaur|dinosaur
e|Big Bird|sesame street|yellow
e|Cookie Monster|monster|cookies
e|Oscar the Grouch|oscar|trash can
e|Miss Piggy|muppets|pig
e|The Muppets|muppets|kermit
e|Clifford|big red dog|dog
e|Curious George|monkey|man in yellow hat
e|Arthur|aardvark|glasses
e|Caillou|bald kid|cartoon
e|Chhota Bheem|bheem|laddoo
e|Motu Patlu|motu|samosa
e|Shin-chan|shinchan|cartoon
e|Oggy|cat|cockroaches
m|Hogwarts Express|train|harry potter
m|Marauder's Map|map|harry potter
m|Nimbus 2000|broom|harry potter
m|Deathly Hallows|triangle|harry potter
m|Sauron|eye|lord of the rings
m|The One Ring|ring|lord of the rings
m|Frodo|hobbit|ring
m|Legolas|elf|bow
m|Aragorn|king|sword
m|Infinity Gauntlet|gauntlet|thanos
m|Mjolnir|thor's hammer|thor
m|Captain Marvel|marvel|space
m|Hawkeye|archer|avengers
m|Loki|god of mischief|horns
m|Venom|symbiote|black
m|Catwoman|cat burglar|batman
m|Batmobile|car|batman
m|Bat signal|signal|batman
m|Harley Quinn|harley|joker
m|Kryptonite|green rock|superman
m|Daily Bugle|newspaper|spider-man
m|Spider-Verse|miles morales|spider-man
m|Teenage Mutant Ninja Turtles|tmnt|pizza
m|Optimus Prime|transformer|truck
m|Megatron|transformer|villain
m|Velociraptor|raptor|jurassic park
m|DeLorean|time machine|back to the future
m|Marty McFly|marty|hoverboard
m|Doc Brown|scientist|time machine
m|Neo|the one|matrix
m|Red pill|pill|matrix
m|Agent Smith|agent|matrix
m|RoboCop|robot cop|police
m|Predator|alien hunter|jungle
m|Slimer|ghost|green
m|Stay Puft Marshmallow Man|marshmallow man|giant
m|Gremlins|gremlin|water
m|Gizmo|mogwai|gremlins
m|The Goonies|goonies|treasure
m|Willy Wonka|wonka|chocolate factory
m|Oompa Loompa|oompa loompas|wonka
m|Golden ticket|ticket|wonka
m|Matilda|girl|books
m|The BFG|big friendly giant|giant
m|James and the Giant Peach|giant peach|peach
m|Fantastic Mr Fox|mr fox|fox
m|Coraline|button eyes|other mother
m|The Nightmare Before Christmas|jack skellington|halloween
m|Jack Skellington|pumpkin king|skeleton
m|Corpse Bride|bride|skeleton
m|Edward Scissorhands|scissor hands|scissors
m|Beetlejuice|ghost|stripes
m|Wednesday Addams|wednesday|braids
m|Thing|hand|addams family
m|Gomez Addams|gomez|addams
m|Morticia|addams|black dress
m|Uncle Fester|fester|bald
m|Cruella de Vil|cruella|dalmatians
m|Maleficent|witch|horns
m|Ursula|sea witch|octopus
m|Mowgli|man cub|jungle book
m|Baloo|bear|jungle book
m|Bagheera|panther|jungle book
m|Shere Khan|tiger|jungle book
m|Kaa|snake|jungle book
m|Jiminy Cricket|cricket|pinocchio
m|Geppetto|toymaker|pinocchio
m|Mushu|dragon|mulan
m|Hades|god|hercules
m|Flynn Rider|eugene|tangled
m|Pascal|chameleon|tangled
m|Merida|archer|brave
m|Tiana|princess|frog
m|Raya|warrior|dragon
m|Luca|sea monster|italy
m|Turning Red|red panda|mei
m|Elemental|fire;water|pixar
m|Soul|jazz|pixar
m|Onward|elves|pixar
m|Lightyear|buzz|space
m|Wish|star|disney
h|Citizen Kane|rosebud|classic
h|Casablanca|classic|bogart
h|Gone with the Wind|classic|scarlett
h|The Sound of Music|von trapp|alps;singing
h|Singin' in the Rain|umbrella|dancing
h|West Side Story|musical|sharks;jets
h|Grease|musical|danny;sandy
h|Mamma Mia|abba|musical
h|The Greatest Showman|circus|musical
h|La La Land|musical|dance
h|Les Miserables|musical|france
h|The Phantom of the Opera|phantom|mask
h|Hamilton|musical|founding fathers
h|Chicago|musical|jazz
h|Pulp Fiction|tarantino|dance
h|Kill Bill|yellow jumpsuit|sword
h|Fight Club|tyler durden|soap
h|The Dark Knight|batman|joker
h|Braveheart|scotland|blue face
h|Saving Private Ryan|war|soldiers
h|Schindler's List|war|list
h|A Quiet Place|quiet|monsters
h|Get Out|horror|teacup
h|It|pennywise|clown;balloon
h|Pennywise|clown|red balloon
h|The Exorcist|horror|priest
h|Scream|ghostface|mask
h|Chucky|killer doll|doll
h|Annabelle|doll|creepy
h|The Ring|samara|tv;well
h|Friday the 13th|jason|hockey mask
h|A Nightmare on Elm Street|freddy|claws
h|The Silence of the Lambs|hannibal|mask
h|Twilight|vampire|edward
h|The Hunger Games|katniss|arrow
h|Divergent|factions|tris
h|Maze Runner|maze|glade
h|Fast and Furious|cars|family
h|John Wick|dog|assassin
h|The Bourne Identity|bourne|spy
h|Ocean's Eleven|heist|casino
h|The Italian Job|minis|heist
h|Mad Max|desert|cars
h|Blade Runner|replicant|rain
h|2001 A Space Odyssey|hal|monolith
h|The Martian|mars|potatoes
h|Apollo 13|houston|rocket
h|Everything Everywhere All at Once|multiverse|hot dog fingers
h|Parasite|korean|basement
h|Slumdog Millionaire|quiz show|india
h|Lagaan|cricket|bollywood
h|Sholay|bollywood|gabbar
h|Dilwale Dulhania Le Jayenge|ddlj|train
h|3 Idiots|bollywood|college
h|RRR|naatu naatu|india
h|Baahubali|bollywood|kingdom
h|Kantara|bollywood|forest
h|Sherlock|detective|bbc
h|Downton Abbey|period drama|servants
h|The Crown|queen|netflix
h|Peaky Blinders|cap|gangsters
h|Money Heist|dali mask|red jumpsuit
h|Narcos|escobar|drugs
h|The Walking Dead|zombies|apocalypse
h|Lost|island|plane crash
h|Prison Break|tattoo|escape
h|Grey's Anatomy|doctors|hospital
h|House of the Dragon|dragons|targaryen
h|Rick and Morty|cartoon|portal
h|Family Guy|peter griffin|cartoon
h|South Park|cartoon|kenny
h|Futurama|bender|cartoon
h|Avatar The Last Airbender|aang|elements
h|Naruto|ninja|ramen
h|One Piece|luffy|pirates
h|Dragon Ball|goku|super saiyan
h|Attack on Titan|titans|walls
h|Death Note|notebook|anime
h|My Neighbor Totoro|totoro|catbus
h|Howl's Moving Castle|castle|walking
h|Princess Mononoke|wolf|forest
h|Kiki's Delivery Service|witch|broom;cat
h|Ponyo|fish girl|ghibli
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
e|Happy Meal|mcdonalds|toy;box
e|Big Mac|burger|mcdonalds
e|Whopper|burger|burger king
e|Frappuccino|starbucks|coffee
e|iPod|apple|music
e|Apple Watch|smartwatch|apple
e|Kindle|e-reader|amazon
e|Echo Dot|alexa|amazon
e|Barbie doll|barbie|pink
e|Ken doll|ken|barbie
e|Lego minifigure|minifig|lego
e|Rubik's|rubik's cube|puzzle
e|Game Boy|gameboy|nintendo
e|Nintendo Switch|switch|console
e|Wii|nintendo wii|remote
e|Pokeball|poke ball|pokemon
e|Tamagotchi|virtual pet|egg
e|Furby|toy|eyes
e|Slinky|spring|stairs
e|Etch A Sketch|drawing toy|knobs
e|Mr Men|little miss|books
e|Gatorade|sports drink|bottle
e|Monster Energy|energy drink|claw
e|Snickers|chocolate bar|peanuts
e|Mars bar|chocolate|bar
e|Twix|chocolate|two bars
e|Milky Way bar|chocolate|bar
e|Dairy Milk|cadbury|chocolate
e|Mentos|mints|cola
e|Tic Tac|mints|box
e|Haribo|gummy bears|sweets
e|Kinder Surprise|egg|toy
e|Ben and Jerry's|ice cream|cows
e|Magnum|ice cream|stick
e|Cornetto|ice cream|cone
e|Pez|candy dispenser|head
e|Frosties|cereal|tiger
e|Coco Pops|cereal|monkey
e|Cheerios|cereal|rings
e|Pop-Tarts|toaster pastry|frosting
e|Ritz|crackers|round
e|Tabasco|hot sauce|bottle
e|Campbell's Soup|soup can|warhol
e|Quaker Oats|oats|man
e|Uncle Ben's|rice|box
e|Pillsbury Doughboy|doughboy|dough
e|Michelin Man|tyre man|tyres
e|Ronald McDonald|clown|mcdonalds
e|Colonel Sanders|kfc|beard
e|Tony the Tiger|frosties|tiger
e|Duracell Bunny|bunny|battery
e|Energizer Bunny|bunny|drum
e|Geico Gecko|gecko|insurance
e|Mr Clean|bald man|cleaning
e|Jolly Green Giant|giant|green
e|Puma logo|cat|shoes
e|Nike swoosh|tick|nike
e|Adidas stripes|three stripes|adidas
e|Apple logo|bitten apple|apple
e|Twitter bird|bird|tweet
e|X logo|x|twitter
e|Starbucks mermaid|siren|coffee
e|Shell logo|shell|petrol
e|Walmart|supermarket|store
e|Costco|warehouse store|bulk
e|7-Eleven|convenience store|slurpee
e|Tesco|supermarket|uk
e|Aldi|supermarket|cheap
e|eBay|auction site|online
e|Etsy|crafts|online shop
e|Shopify|online store|bag
e|Paytm|payment|india
e|Google Pay|gpay|payment
e|Apple Pay|payment|phone
e|Venmo|payment|app
e|Chrome|google chrome|browser
e|Firefox|browser|fox
e|Safari browser|safari|compass
e|Windows|microsoft windows|window
e|Excel|spreadsheet|microsoft
e|PowerPoint|slides|microsoft
e|Word|microsoft word|document
e|Photoshop|adobe|editing
e|Canva|design|app
e|Google Maps|maps|pin
e|Waze|navigation|map
e|Tinder|dating app|swipe
e|Shazam|music app|song
e|Pokemon Go|pokemon|phone
e|Clash of Clans|game|barbarian
e|Subway Surfers|game|train
e|Temple Run|game|running
e|Flappy Bird|bird|pipes
e|Fruit Ninja|game|slice
e|Call of Duty|cod|soldier
e|Grand Theft Auto|gta|cars
e|FIFA|football game|ea
e|The Sims|sims|diamond
e|Animal Crossing|island|nintendo
e|Street Fighter|fighting|hadouken
e|Space Invaders|aliens|arcade
m|Rolex watch|rolex|crown
m|Louis Vuitton|lv|handbag
m|Chanel|chanel no 5|perfume
m|Prada|fashion|devil
m|Versace|medusa|fashion
m|Burberry|check|trench coat
m|Tommy Hilfiger|tommy|flag
m|Lacoste|crocodile|polo
m|Ralph Lauren|polo|horse
m|Calvin Klein|ck|underwear
m|Under Armour|sportswear|logo
m|New Balance|shoes|n
m|Skechers|shoes|comfort
m|Timberland|boots|tree
m|Dr Martens|docs|boots
m|UGG|boots|sheepskin
m|North Face|jacket|mountain
m|Patagonia|outdoor|mountain
m|Uniqlo|clothing|japan
m|Primark|clothes|cheap
m|Gap|clothing|jeans
m|Swatch|watch|colorful
m|Pandora|charm bracelet|jewelry
m|Tiffany|blue box|jewelry
m|Cartier|watch|panther
m|Hermes|orange box|handbag
m|Fiat|small car|italy
m|Mazda|car|japan
m|Honda|car|motorbike
m|Hyundai|car|korea
m|Kia|car|korea
m|Nissan|car|japan
m|Suzuki|car|motorbike
m|Maruti|car|india
m|Tata|car|india
m|Mahindra|jeep|india
m|Bajaj|scooter|india
m|Vespa|scooter|italy
m|Yamaha|motorbike|piano
m|Ducati|motorbike|red
m|Kawasaki|motorbike|green
m|Aston Martin|car|james bond
m|Bentley|luxury car|wings
m|Maserati|car|trident
m|McLaren|supercar|orange
m|Land Rover|4x4|jeep
m|Range Rover|suv|luxury
m|Chevrolet|chevy|car
m|Cadillac|luxury car|america
m|Dodge|car|ram
m|Mustang|ford mustang|horse
m|Lufthansa|airline|crane
m|British Airways|airline|uk
m|Qantas|airline|kangaroo
m|Ryanair|airline|cheap
m|IndiGo|airline|india
m|Singapore Airlines|airline|singapore
m|Hilton|hotel|paris
m|Marriott|hotel|chain
m|Taj Hotel|hotel|mumbai
m|Expedia|travel|booking
m|Booking.com|hotels|travel
m|Tripadvisor|owl|reviews
m|Yelp|reviews|stars
m|Deliveroo|delivery|kangaroo
m|DoorDash|delivery|food
m|Grubhub|delivery|food
m|Lyft|ride|pink
m|Ola|cab|india
m|Rapido|bike taxi|india
m|Jio|telecom|india
m|Airtel|telecom|india
m|Vodafone|telecom|red
m|Verizon|telecom|tick
m|AT&T|telecom|globe
m|Intel|chips|processor
m|AMD|chips|processor
m|Nvidia|graphics card|gpu
m|Qualcomm|chips|snapdragon
m|Dell|laptop|computer
m|HP|printer|laptop
m|Lenovo|laptop|thinkpad
m|Asus|laptop|computer
m|Acer|laptop|computer
m|Xiaomi|phone|mi
m|OnePlus|phone|red
m|Huawei|phone|china
m|Oppo|phone|china
m|Vivo|phone|china
m|Realme|phone|china
m|Motorola|phone|moto
m|Fitbit|fitness tracker|steps
m|Garmin|gps|watch
m|Philips|electronics|razor
m|LG|electronics|tv
m|Panasonic|electronics|japan
m|Sharp|electronics|japan
m|Hitachi|electronics|japan
m|Bosch|tools|appliances
m|Black and Decker|drill|tools
m|Stanley|tape measure|tools
m|3M|tape|post-it
m|Scotch tape|tape|roll
m|Bic|pen|lighter
m|Staedtler|pencil|stationery
m|Pilot pen|pen|ink
m|Moleskine|notebook|black
m|Kleenex|tissues|box
m|Band-Aid|plaster|cut
m|Vaseline|petroleum jelly|lips
m|Nivea|cream|blue tin
m|Lux|soap|beauty
m|Head and Shoulders|shampoo|dandruff
m|Pantene|shampoo|hair
m|L'Oreal|because you're worth it|makeup
m|Maybelline|makeup|mascara
m|MAC|makeup|lipstick
m|Sephora|makeup store|beauty
m|Lush|bath bombs|soap
m|Old Spice|deodorant|sailor
m|Axe|lynx|deodorant
m|Listerine|mouthwash|bottle
m|Oral-B|toothbrush|electric
m|Sensodyne|toothpaste|sensitive
m|Pepsodent|toothpaste|teeth
h|Peugeot|lion|car
h|Alfa Romeo|car|snake
h|Subaru|stars|car
h|Mitsubishi|three diamonds|car
h|Lexus|luxury car|toyota
h|Skoda|car|arrow
h|Renault|diamond|car
h|Citroen|car|chevrons
h|Seat|car|spain
h|Opel|car|lightning
h|Polaroid|instant camera|photo
h|Kodak|film|camera
h|Fujifilm|film|camera
h|Leica|camera|red dot
h|Hasbro|toys|games
h|Mattel|toys|barbie
h|Fisher-Price|baby toys|toys
h|Meccano|construction toy|nuts
h|K'nex|construction toy|rods
h|Sylvanian Families|animals|toys
h|Beyblade|spinning top|battle
h|Bakugan|ball|monsters
h|Yu-Gi-Oh|cards|duel
h|Magic The Gathering|cards|magic
h|Dungeons and Dragons|d and d|dice
h|Warhammer|miniatures|paint
h|Cluedo|clue|murder
h|Battleship|game|ships
h|Operation|game|tweezers
h|Guess Who|game|faces
h|Hungry Hungry Hippos|game|marbles
h|Kerplunk|game|sticks
h|Buckaroo|game|donkey
h|Trivial Pursuit|game|pie
h|Catan|settlers|hexagons
h|Ticket to Ride|game|trains
h|Pandemic|game|virus
h|Exploding Kittens|cards|cats
h|Cards Against Humanity|cards|black and white
h|Dobble|spot it|symbols
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
e|sunshine|sunny|sun
e|cloudy|clouds|grey
e|windy|wind|kite
e|snowy|snow|cold
e|storm cloud|thundercloud|rain
e|rain cloud|cloud|drops
e|crescent moon|new moon|night
e|starry night|stars|sky
e|night sky|sky|stars
e|blue sky|sky|clouds
e|beach sunset|sunset|sea
e|mountain range|mountains|peaks
e|flower field|field|flowers
e|grass field|field|green
e|lily pad|water lily|frog
e|water drop|drop|water
e|melting snowman|snowman|sun
e|snowball|snow|throw
e|snow drift|snow|deep
e|frozen lake|ice|lake
e|leaf pile|leaves|autumn
e|fallen leaf|leaf|autumn
e|green leaf|leaf|tree
e|maple leaf|leaf|canada
e|palm leaf|leaf|tropical
e|tree trunk|trunk|bark
e|tree bark|bark|tree
e|tree roots|roots|tree
e|christmas tree|xmas tree|lights;star
e|coconut tree|palm tree|coconut
e|banana tree|tree|bananas
e|orange tree|tree|oranges
e|flower bud|bud|bloom
e|blossom|flowers|spring
e|bouquet|bunch of flowers|flowers
e|daffodil|narcissus|yellow
e|poppy|poppies|red
e|bluebell|flower|blue
e|orchid|flower|purple
e|violet|flower|purple
e|marigold|flower|orange
e|hibiscus|flower|red
e|carnation|flower|pink
e|lavender|flower|purple;smell
e|clover|three leaf clover|green
e|weeds|weed|garden
e|hay|straw|farm
e|haystack|hay bale|farm
e|pebble|pebbles|stone
e|boulder|big rock|rock
e|rocks|stones|ground
e|brook|creek|stream
e|mud puddle|mud|dirty
e|ocean wave|wave|sea
e|big wave|wave|surf
e|sea foam|foam|waves
e|seashore|shore|beach
e|volcano eruption|eruption|lava
e|smoke|fumes|fire
e|flame|flames|fire
e|campfire|fire|logs
e|embers|coals|fire
e|ash|ashes|fire
e|steam|vapour|hot
e|wind gust|gust|wind
e|breeze|wind|gentle
e|lightning bolt|bolt|storm
e|rain drops|raindrops|rain
e|double rainbow|rainbow|two
e|sun rays|sunbeam|sun
e|sunbeam|sun ray|light
e|moonlight|moonbeam|night
e|starlight|stars|night
e|planet earth|earth|globe
e|world|earth;globe|map
m|Jupiter|planet|giant;red spot
m|Neptune|planet|blue
m|Uranus|planet|tilted
m|Mercury|planet|closest
m|sun spot|sunspot|sun
m|nebula|space cloud|stars
m|supernova|exploding star|space
m|orbit|path|planet
m|moon crater|crater|moon
m|moon phases|phases|moon
m|blood moon|red moon|eclipse
m|blue moon|moon|rare
m|harvest moon|moon|autumn
m|aurora|northern lights|sky
m|cumulus cloud|cloud|fluffy
m|cirrus cloud|cloud|wispy
m|cloud nine|cloud|happy
m|fog bank|fog|mist
m|mist|haze|fog
m|smog|pollution|city
m|acid rain|rain|pollution
m|dust devil|whirlwind|dust
m|waterspout|tornado|sea
m|cyclone|hurricane|wind
m|typhoon|hurricane|asia
m|blizzard|snowstorm|white
m|black ice|ice|road
m|frostbite|frost|cold
m|snow day|snow|school
m|four seasons|seasons|year
m|day and night|day;night|sun;moon
m|dawn|daybreak|morning
m|dusk|twilight|evening
m|midnight|night|twelve
m|noon|midday|sun
m|rock pool|tide pool|crabs
m|mudslide|landslide|mud
m|landslide|rockfall|mountain
m|sinkhole|hole|ground
m|hot springs|spring|steam
m|marsh|wetland|reeds
m|bog|peat|marsh
m|reed|bulrush|pond
m|bulrushes|reeds|pond
m|lily of the valley|flower|bells
m|forget-me-not|flower|blue
m|snowdrop|flower|white
m|foxglove|flower|purple
m|thistle|flower|prickly
m|nettle|stinging nettle|sting
m|poison ivy|ivy|itch
m|mistletoe|plant|kiss
m|holly|holly leaf|berries
m|sunflower seed|seed|sunflower
m|seedling|sprout|grow
m|sprout|shoot|seed
m|compost|soil|garden
m|soil|dirt;earth|plants
m|bark beetle|beetle|tree
m|bird's nest|nest|eggs
m|spider's web|web|dew
m|termite mound|mound|termites
m|beaver dam|dam|beaver
m|rabbit hole|burrow|rabbit
m|fox den|den|fox
m|bear cave|cave|bear
m|tree hollow|hollow|owl
m|redwood|sequoia|tall tree
m|baobab|tree|africa
m|banyan tree|tree|roots
m|weeping willow|willow|droopy
m|birch tree|birch|white bark
m|maple tree|maple|syrup
m|palm grove|palms|beach
m|bamboo forest|bamboo|panda
m|conker|horse chestnut|tree
m|sycamore seed|helicopter seed|spin
m|dandelion clock|dandelion|blow
m|tree rings|rings|age
h|stalagmite|cave rock|cave
h|geode|crystal rock|purple
h|obsidian|volcanic glass|black
h|magma|lava|underground
h|tectonic plates|plates|earthquake
h|fault line|fault|earthquake
h|rift valley|valley|crack
h|archipelago|islands|sea
h|isthmus|land bridge|narrow
h|estuary|river mouth|sea
h|tributary|river branch|river
h|watershed|basin|river
h|oxbow lake|lake|river bend
h|moraine|glacier rocks|ice
h|permafrost|frozen ground|arctic
h|tundra|arctic|cold
h|taiga|forest|snow
h|steppe|grassland|plains
h|prairie|plains|grass
h|pampas|grassland|argentina
h|mangrove|swamp tree|roots
h|kelp forest|seaweed|ocean
h|coral bleaching|coral|white
h|bioluminescence|glow|sea
h|red tide|algae|sea
h|el nino|weather|pacific
h|jet stream|wind|high
h|trade winds|wind|sailing
h|doldrums|calm|sea
h|equinox|day equal night|sun
h|solstice|longest day|sun
h|leap year|february|calendar
h|time zone|clock|world
h|meteor shower|shooting stars|night
h|Halley's comet|comet|tail
h|red giant|star|big
h|white dwarf|star|small
h|wormhole|tunnel|space
h|big bang|universe|explosion
h|dark matter|space|invisible
h|zero gravity|weightless|float
h|magnetism|magnet|north;south
h|static electricity|static|hair
h|condensation|droplets|glass
h|erosion|wear away|rock
h|weathering|rock|wear
h|pollination|bee|pollen
h|pollen|dust|flower;sneeze
h|hay fever|allergy|sneeze
h|germination|seed|sprout
h|migration|birds|fly south
h|hibernation|sleep|bear
h|camouflage|hide|chameleon
h|metamorphosis|butterfly|change
h|life cycle|cycle|frog
h|ecosystem|nature|balance
h|biodiversity|species|life
h|deforestation|cut trees|forest
h|pollution|smoke|dirty
h|recycling|recycle|bins
h|compost heap|compost|garden
h|carbon footprint|footprint|co2
h|greenhouse effect|earth|heat
h|endangered species|rare animal|extinct
h|extinction|dinosaurs|gone
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
e|bike|bicycle;cycle|pedal;wheels
e|tricycle|trike|three wheels
e|balance bike|bike|kids
e|motorbike|motorcycle|helmet
e|moped|scooter|small
e|van|delivery van|boxes
e|lorry|truck|road
e|convertible|cabriolet|roof down
e|sports car|race car|fast
e|old car|vintage car;classic car|old
e|police van|van|police
e|fire engine|fire truck|ladder
e|bin lorry|garbage truck|trash
e|milk float|milk truck|milk
e|mail truck|post van|letters
e|ice cream van|van|ice cream
e|car seat|seat|baby
e|bike helmet|helmet|cycling
e|bike bell|bell|ring
e|bike lock|lock|chain
e|bike pump|pump|tyre
e|kickstand|stand|bike
e|handlebars|handlebar|bike
e|pedals|pedal|bike
e|bike chain|chain|bike
e|training wheels|stabilisers|bike
e|row boat|rowboat|oars
e|pedalo|paddle boat|lake
e|fishing boat|trawler|nets
e|banana boat|inflatable|sea
e|inflatable boat|dinghy|rubber
e|dinghy|small boat|sail
e|sailing ship|tall ship|sails
e|viking ship|longship|vikings
e|steamboat|paddle steamer|river
e|ocean liner|liner|ship
e|container ship|cargo ship|containers
e|oil tanker|tanker|oil
e|icebreaker|ship|ice
e|buoy|float|sea
e|ship wheel|helm|captain
e|ship's bell|bell|ship
e|biplane|old plane|two wings
e|jumbo jet|747|big plane
e|private jet|jet|rich
e|cargo plane|plane|freight
e|air ambulance|helicopter|hospital
e|rescue helicopter|helicopter|rescue
e|police helicopter|helicopter|police
e|parachute jump|skydive|plane
e|plane window|window|clouds
e|plane wing|wing|plane
e|airplane seat|seat|plane
e|seat belt sign|sign|plane
e|departure board|board|flights
e|security check|security|airport
e|duty free|shop|airport
e|travel pillow|neck pillow|plane
e|carry on|hand luggage|bag
e|road map|map|car
e|souvenir|keepsake|travel
e|postcard|card|holiday
e|hotel key|key card|hotel
e|holiday|vacation|beach
e|motorway sign|sign|road
e|stop sign|stop|red
e|give way sign|yield sign|road
e|speed limit sign|speed limit|road
e|one way sign|one way|arrow
e|no entry sign|no entry|red
e|railway crossing|level crossing|train
e|train carriage|carriage|train
e|train ticket|ticket|train
e|sleeper train|night train|bed
e|train whistle|whistle|steam
e|engine|locomotive|train
e|locomotive|engine|train
e|caboose|guard's van|train
e|street lamp|lamp post|light
e|road cone|traffic cone|orange
e|potholes|pothole|road
e|car park barrier|barrier|parking
e|bus ticket|ticket|bus
e|bus shelter|bus stop|waiting
e|tour bus|bus|tourists
e|open top bus|bus|sightseeing
m|cable railway|funicular|hill
m|chairlift|ski lift|mountain
m|gondola lift|cable car|mountain
m|zip wire|zipline|fast
m|tuk tuk|auto rickshaw|thailand
m|cycle rickshaw|rickshaw|pedal
m|jeepney|jeep|philippines
m|camel caravan|caravan|desert
m|dog sled|sled|husky
m|reindeer sleigh|sleigh|santa
m|horse drawn carriage|carriage|horse
m|stagecoach|coach|wild west
m|wagon|covered wagon|horses
m|chariot|roman chariot|horses
m|palanquin|litter|carry
m|quad bike|atv|mud
m|dune buggy|buggy|sand
m|golf buggy|golf cart|golf
m|monster truck|truck|big wheels
m|lowrider|car|bounce
m|hearse|funeral car|coffin
m|armoured car|armored truck|money
m|military jeep|jeep|army
m|humvee|military vehicle|army
m|stealth bomber|bomber|plane
m|drone delivery|drone|parcel
m|air taxi|flying taxi|future
m|flying car|car|future
m|jetpack|rocket pack|fly
m|space rocket|rocket|launch
m|space elevator|elevator|space
m|Concorde|supersonic jet|plane
m|Mayflower|ship|pilgrims
m|Noah's Ark|ark|animals
m|yellow submarine|submarine|beatles
m|pontoon|floating dock|boats
m|lock gate|canal lock|boats
m|narrowboat|canal boat|canal
m|punt|boat|pole
m|junk boat|chinese boat|sails
m|dhow|sailing boat|arabia
m|trireme|warship|oars
m|galleon|ship|treasure
m|pirate flag|jolly roger|skull
m|gangplank|plank|pirate
m|walk the plank|plank|pirate
m|message in a bottle|bottle|sea
m|shipwreck|wreck|sea
m|deck|ship deck|boat
m|cabin|ship cabin|bed
m|captain's hat|hat|captain
m|ticket inspector|inspector|tickets
m|turnstile|gate|station
m|ticket machine|machine|tickets
m|oyster card|travel card|london
m|bike lane|cycle lane|road
m|bike rack|cycle stand|bikes
m|bike sharing|rental bike|docking
m|car sharing|carpool|cars
m|car rental|hire car|keys
m|roadside assistance|tow|breakdown
m|breakdown|broken down car|smoke
m|jump leads|jumper cables|battery
m|spare tyre|tyre|boot
m|car jack|jack|tyre
m|car boot|trunk|luggage
m|exhaust pipe|exhaust|smoke
m|gear stick|gearshift|car
m|handbrake|parking brake|car
m|dashboard|dash|car
m|headlights|lights|car
m|indicator|blinker|turn
m|airbag|safety|car
m|sat nav|gps|map
m|cruise control|car|speed
m|road rage|angry driver|honk
m|speed camera|camera|flash
m|toll gate|toll|booth
m|fuel pump|petrol pump|nozzle
m|charging cable|charger|electric car
m|carburettor|engine|fuel
h|maglev train|magnetic train|fast
h|hyperloop|tube|fast
h|rack railway|cog railway|mountain
h|signal box|signals|railway
h|railway signal|signal|train
h|points|track switch|railway
h|turntable|train turntable|engine
h|roundhouse|engine shed|trains
h|coal tender|tender|steam train
h|dining car|restaurant car|train
h|observation car|dome car|train
h|cog wheel|gear|machine
h|gearbox|transmission|car
h|crankshaft|engine|piston
h|piston|engine|cylinder
h|spark plug|engine|spark
h|radiator grille|grille|car
h|hubcap|wheel cover|car
h|mud flap|flap|truck
h|roof rack|rack|car
h|tow bar|towbar|caravan
h|trailer|trailer hitch|tow
h|articulated lorry|semi truck|trailer
h|road train|truck|australia
h|tanker truck|tanker|fuel
h|car transporter|car carrier|cars
h|cherry picker|lift|crane
h|scissor lift|lift|platform
h|steamroller|road roller|flat
h|snowplough|snow plow|snow
h|gritter|salt truck|ice
h|street sweeper|sweeper|road
h|zamboni|ice resurfacer|rink
h|airship|zeppelin|blimp
h|zeppelin|airship|blimp
h|autogyro|gyrocopter|rotor
h|tiltrotor|osprey|helicopter
h|ekranoplan|ground effect|sea
h|hydrofoil|boat|wings
h|amphibious vehicle|duck boat|land;water
h|tracked vehicle|tracks|tank
h|lunar lander|lander|moon
h|space probe|probe|planet
h|re-entry capsule|capsule|parachute
h|mission control|control room|nasa
h|black box|flight recorder|plane
h|air traffic control tower|control tower|airport
h|windsock|wind sock|airport
h|jet bridge|airbridge|plane
h|baggage carousel|carousel|bags
h|passport stamp|stamp|travel
h|visa stamp|visa|passport
h|currency exchange|money exchange|travel
h|jet engine|turbine|plane
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
e|princess tower|tower|princess
e|prince charming|prince|horse
e|baby dragon|dragon|egg
e|friendly ghost|ghost|boo
e|vampire fangs|fangs|vampire
e|witch's broom|broomstick|witch
e|witch's cat|black cat|witch
e|wizard's staff|staff|wizard
e|magic hat|top hat|rabbit
e|magic beans|beans|beanstalk
e|beanstalk|giant beanstalk|jack
e|golden egg|egg|goose
e|gingerbread witch|witch|candy house
e|candy house|gingerbread house|witch
e|glass coffin|coffin|snow white
e|seven dwarfs|dwarfs|snow white
e|spinning wheel|wheel|sleeping beauty
e|red hood|red riding hood|wolf
e|three bears|bears|goldilocks
e|straw house|house of straw|pigs
e|brick house|house of bricks|pigs
e|fairy wings|wings|fairy
e|fairy ring|mushroom circle|fairies
e|fairy house|toadstool house|fairy
e|toadstool|mushroom|fairy
e|magic mushroom|mushroom|fairy
e|unicorn horn|horn|unicorn
e|rainbow unicorn|unicorn|rainbow
e|flying horse|pegasus|wings
e|mermaid tail|tail|mermaid
e|merman|mermaid|trident
e|trident|fork|neptune
e|sea king|neptune|trident
e|treasure island|island|treasure
e|buried treasure|treasure|x marks the spot
e|x marks the spot|x|treasure map
e|gold coins|coins|treasure
e|jewels|gems|treasure
e|gem|jewel;gemstone|shiny
e|diamond|jewel|shiny
e|ruby|gem|red
e|emerald|gem|green
e|crystal cave|cave|crystals
e|dragon's lair|lair|treasure
e|monster under the bed|monster|bed
e|bogeyman|monster|scary
e|boogeyman|monster|dark
e|ghost costume|sheet ghost|halloween
e|halloween|trick or treat|pumpkin
e|trick or treat|halloween|candy
e|haunted forest|forest|spooky
e|cobwebs|spider web|spooky
e|coffin|casket|vampire
e|gravestone|tombstone|grave
e|skull|skeleton head|bones
e|bones|skeleton|dog
e|alien spaceship|ufo|aliens
e|ufo|flying saucer|alien
e|little green man|alien|green
e|robot dog|robodog|robot
e|superhero cape|cape|hero
e|super strength|strong|hero
e|invisible man|invisible|bandages
e|x-ray vision|x ray|eyes
e|laser eyes|lasers|eyes
e|flying superhero|superhero|fly
e|villain|bad guy|evil
e|evil laugh|mwahaha|villain
e|secret lair|lair|villain
e|magic carpet ride|carpet|flying
e|three wishes|wishes|genie
e|wishing star|star|wish
e|fairy tale|story|once upon a time
e|once upon a time|story|fairy tale
e|happily ever after|ending|fairy tale
e|storybook|book|stories
e|nutcracker soldier|nutcracker|christmas
e|Santa's sleigh|sleigh|reindeer
e|Rudolph|red nosed reindeer|reindeer
e|elf on the shelf|elf|christmas
e|Santa's workshop|workshop|elves
e|stocking|christmas stocking|presents
e|Easter egg|egg|chocolate
e|Easter basket|basket|eggs
e|cupid|cherub|arrow;heart
e|angel|halo|wings
e|halo|ring|angel
e|devil|demon|horns;pitchfork
e|pitchfork|fork|devil
e|demon|devil|horns
m|manticore|monster|lion
m|harpy|bird woman|wings
m|siren|sea nymph|song
m|nymph|fairy|forest
m|dryad|tree spirit|tree
m|satyr|faun|goat legs
m|faun|satyr|goat
m|pixie|fairy|small
m|wraith|ghost|shadow
m|poltergeist|ghost|objects
m|spirit|ghost|soul
m|ghoul|zombie|graveyard
m|lich|undead wizard|skull
m|necromancer|dark wizard|skeletons
m|warlock|wizard|dark
m|sorcerer|wizard|magic
m|sorceress|witch|magic
m|enchantress|witch|spell
m|oracle|seer|future
m|prophecy|prediction|future
m|amulet|charm|necklace
m|talisman|charm|luck
m|lucky charm|charm|luck
m|magic ring|ring|power
m|cloak of darkness|cloak|dark
m|seven league boots|boots|giant steps
m|flying broom|broom|witch
m|potion bottle|potion|bottle
m|love potion|potion|heart
m|poison bottle|poison|skull
m|magic spell|spell|wand
m|magic circle|circle|ritual
m|pentagram|star|magic
m|rune|symbol|stone
m|scroll|paper scroll|old
m|ancient map|map|old
m|hidden door|secret door|bookcase
m|secret passage|tunnel|castle
m|labyrinth|maze|minotaur
m|ice palace|palace|ice
m|snow queen|ice queen|snow
m|Jack Frost|frost|winter
m|Father Time|old man|hourglass
m|Mother Nature|nature|earth
m|sandman|sleep|sand
m|Krampus|christmas demon|horns
m|Baba Yaga|witch|chicken legs house
m|chupacabra|monster|goats
m|mothman|moth man|wings
m|jackalope|rabbit|antlers
m|kitsune|fox spirit|tails
m|tengu|bird demon|japan
m|kappa|water demon|japan
m|oni|demon|japan
m|golem|clay giant|stone
m|gargoyle|statue|church
m|imp|small demon|mischief
m|djinn|genie|lamp
m|naga|snake person|cobra
m|rakshasa|demon|india
m|Hanuman|monkey god|ramayana
m|Ravana|ten heads|ramayana
m|Ganesha|elephant god|india
m|Shiva|god|trident
m|Anubis|jackal god|egypt
m|Ra|sun god|egypt
m|Odin|norse god|one eye
m|Valhalla|hall|vikings
m|Valkyrie|warrior maiden|vikings
m|Asgard|realm|thor
m|Yggdrasil|world tree|norse
m|Fenrir|wolf|norse
m|Jormungandr|world serpent|norse
m|Cerberus|three headed dog|hades
m|Athena|goddess|owl
m|Aphrodite|goddess|love
m|Apollo|sun god|lyre
m|Artemis|goddess|bow
m|Ares|war god|spear
h|Icarus|wings|sun
h|Prometheus|fire|titan
h|Atlas|titan|globe
h|Sisyphus|boulder|hill
h|Narcissus|reflection|pool
h|Midas touch|midas|gold
h|Odysseus|ulysses|ship
h|Perseus|hero|medusa
h|Theseus|hero|minotaur
h|Jason and the Argonauts|argo|golden fleece
h|golden fleece|fleece|ram
h|Holy Grail|grail|cup
h|Round Table|knights|arthur
h|Lady of the Lake|lady|sword
h|Camelot|castle|arthur
h|Avalon|island|arthur
h|Sword in the Stone|sword|stone
h|Green Knight|knight|green
h|Beowulf|hero|grendel
h|Grendel|monster|beowulf
h|Rip Van Winkle|sleep|beard
h|Sleepy Hollow|headless|horseman
h|Bluebeard|beard|wife
h|The Snow Queen|snow queen|ice
h|Little Match Girl|matches|cold
h|Emperor's New Clothes|naked king|clothes
h|Twelve Dancing Princesses|princesses|dancing
h|The Steadfast Tin Soldier|tin soldier|ballerina
h|Bremen Town Musicians|animals|music
h|Hare and Tortoise|race|slow and steady
h|Boy Who Cried Wolf|wolf|lie
h|Ant and the Grasshopper|ant|winter
h|Fox and the Grapes|sour grapes|fox
h|Lion and the Mouse|lion|mouse
h|Thirsty Crow|crow|pebbles;pot
h|Monkey and the Crocodile|monkey|crocodile
h|Panchatantra|stories|india
h|Vikram and Betaal|ghost|king
h|Tenali Raman|jester|wise
h|Akbar and Birbal|birbal|wise
h|Aladdin and the lamp|lamp|genie
h|Ali Baba|forty thieves|open sesame
h|Open Sesame|cave|ali baba
h|Sinbad|sailor|voyages
h|Arabian Nights|scheherazade|stories
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
e|smartphone|phone;mobile|apps
e|cell phone|mobile phone|call
e|flip phone|phone|old
e|phone charger|charger|cable
e|phone case|case|phone
e|headset|headphones|microphone
e|earbuds|earphones|music
e|computer screen|monitor;screen|computer
e|desktop computer|pc|computer
e|tv screen|television|remote
e|full battery|battery|charged
e|signal bars|signal|phone
e|no signal|signal|phone
e|wifi signal|wifi|internet
e|play button|play|video
e|pause button|pause|video
e|power button|on off|switch
e|volume|sound|speaker
e|mute|silent|sound
e|comment|reply|post
e|share button|share|post
e|profile picture|avatar|photo
e|video game controller|controller|game
e|arcade machine|arcade|game
e|digital clock|clock|numbers
e|space bar|spacebar|keyboard
e|enter key|enter|keyboard
e|mouse click|click|mouse
e|double click|click|mouse
e|copy paste|copy|paste
e|undo|ctrl z|back
e|zoom in|magnify|bigger
e|log in|login|password
e|sign up|register|account
e|online shopping|shopping|cart
e|wifi password|password|wifi
e|smart home|home|automation
e|robot cleaner|robot vacuum|floor
e|video chat|video call|camera
e|group chat|chat|messages
e|selfie camera|front camera|selfie
e|photo filter|filter|photo
e|dog filter|snapchat filter|dog ears
m|password lock|lock|password
m|captcha|robot check|letters
m|cookie popup|cookies|website
m|pop up ad|advert|popup
m|software update|update|install
m|restart|reboot|computer
m|crash|freeze|computer
m|buffering|loading|video
m|lag|slow|game
m|pixel|pixels|screen
m|pixel art|8 bit|retro
m|emoji face|emoji|smiley
m|gif|animated image|loop
m|sticker pack|stickers|chat
m|viral video|viral|views
m|trending|trend|hashtag
m|followers|follow|social
m|subscribe button|subscribe|youtube
m|like button|like|thumbs up
m|online class|zoom class|students
m|work from home|wfh|laptop
m|keyboard warrior|troll|typing
m|bot|robot|automated
m|algorithm|code|feed
m|server|server rack|data
m|motherboard|board|chips
m|graphics card|gpu|games
m|CPU|processor|chip
m|SSD|drive|storage
m|ethernet cable|cable|internet
m|HDMI cable|cable|tv
m|USB cable|cable|charge
m|wireless charger|charging pad|phone
m|smart glasses|glasses|tech
m|smart ring|ring|health
m|fitness tracker|tracker|steps
m|step counter|pedometer|walking
m|heart rate monitor|monitor|heart
m|baby monitor|monitor|baby
m|electric toothbrush|toothbrush|electric
m|robot lawnmower|mower|garden
m|smart fridge|fridge|screen
m|voice assistant|assistant|speak
m|translator app|translate|languages
m|map app|maps|location
m|location pin|pin|map
m|qr scanner|scanner|code
m|contactless payment|tap to pay|card
m|credit card|card|money
m|chip and pin|card reader|payment
m|card machine|card reader|pay
m|self checkout|checkout|shop
m|cryptocurrency|crypto|coin
m|bitcoin|crypto|coin
m|NFT|digital art|crypto
m|metaverse|virtual world|vr
m|game over|over|game
m|level up|level|game
m|high score|score|arcade
m|extra life|life|game
m|boss fight|boss|game
m|respawn|spawn|game
m|cheat code|code|game
m|speedrun|fast|game
m|esports|gaming|tournament
h|binary code|ones and zeros|computer
h|source code|code|programmer
h|bug fix|debugging|code
h|stack overflow|questions|code
h|open source|code|free
h|cloud computing|cloud|servers
h|blockchain|chain|crypto
h|machine learning|ai|data
h|neural network|brain|ai
h|deepfake|fake video|ai
h|quantum computer|computer|qubits
h|supercomputer|computer|fast
h|semiconductor|chip|silicon
h|transistor|chip|electronics
h|resistor|component|circuit
h|capacitor|component|circuit
h|soldering iron|solder|circuit
h|oscilloscope|wave|screen
h|multimeter|meter|volts
h|breadboard|circuit|wires
h|raspberry pi|computer|tiny
h|arduino|board|electronics
h|tesla coil|lightning|electricity
h|particle accelerator|collider|physics
h|nuclear reactor|reactor|power
h|wind farm|turbines|energy
h|hydroelectric dam|dam|energy
h|power grid|electricity|pylons
h|pylon|electricity tower|wires
h|transformer box|transformer|electricity
h|fiber optic|cable|light
h|data cable|cable|data
h|encryption|lock|code
h|two factor authentication|2fa|code
h|phishing|scam|email
h|malware|virus|computer
h|ransomware|virus|lock
h|dark web|hidden internet|hackers
h|ip address|address|internet
h|bandwidth|internet speed|data
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
e|cap|hat|head
e|woolly hat|beanie|winter
e|sun hat|hat|summer
e|straw hat|hat|farmer
e|bucket hat|hat|fishing
e|winter coat|coat|cold
e|rain boots|wellies|puddles
e|trainers|sneakers|shoes
e|running shoes|trainers|run
e|school shoes|shoes|school
e|stripy socks|socks|stripes
e|tie dye|tie-dye|shirt
e|polo shirt|polo|collar
e|tank top|vest|sleeveless
e|crop top|top|short
e|sweatshirt|jumper|warm
e|jumper|sweater|wool
e|christmas jumper|ugly sweater|christmas
e|fleece|jacket|warm
e|puffer jacket|puffa|winter
e|denim jacket|jacket|jeans
e|leather jacket|jacket|biker
e|life vest|life jacket|boat
e|pinafore|dress|apron
e|sundress|dress|summer
e|party dress|dress|party
e|prom dress|gown|dance
e|princess dress|dress|princess
e|fairy costume|costume|wings
e|costume|fancy dress|party
e|superhero costume|costume|cape
e|pirate costume|costume|pirate
e|animal onesie|onesie|animal
e|dinosaur costume|costume|dinosaur
e|mask|face mask|face
e|face mask|mask|covid
e|masquerade mask|mask|ball
e|wig|hairpiece|hair
e|fake mustache|mustache|disguise
e|clown nose|red nose|clown
e|crown jewels|crown|king
e|school bag|backpack|school
e|tote bag|bag|shopping
e|shopping bag|bag|shopping
e|briefcase|case|business
e|clutch bag|purse|evening
e|coin purse|purse|coins
e|rucksack|backpack|hiking
e|earring|earrings|ear
e|nose ring|nose stud|nose
e|bangle|bracelet|wrist
e|charm bracelet|bracelet|charms
e|friendship bracelet|bracelet|friends
e|beads|bead necklace|necklace
e|chain|necklace|gold
e|gold chain|chain|gold
e|pendant|necklace|locket
e|sunglasses case|case|glasses
e|reading glasses|glasses|book
e|contact lens|contacts|eye
e|makeup|cosmetics|lipstick
e|nail polish|nail varnish|nails
e|mascara|makeup|eyelashes
e|eyeshadow|makeup|eyes
e|blush|makeup|cheeks
e|hair gel|gel|hair
e|hair spray|hairspray|hair
e|hair band|hair tie|ponytail
e|plait|braid|hair
e|braid|plait|hair
e|pigtails|bunches|hair
e|mohawk|haircut|punk
e|afro|hair|curly
e|bald head|bald|shiny
e|beard|facial hair|chin
m|cravat|ascot|neck
m|neckerchief|scarf|neck
m|shawl|wrap|shoulders
m|pashmina|shawl|wool
m|stole|shawl|fur
m|fur coat|coat|fur
m|trench coat|coat|detective
m|duffle coat|coat|toggles
m|parka|coat|hood
m|anorak|raincoat|hood
m|waistcoat|vest|suit
m|dinner jacket|tuxedo|bow tie
m|tailcoat|coat|formal
m|morning suit|suit|wedding
m|three piece suit|suit|vest
m|pinstripe suit|suit|stripes
m|tracksuit bottoms|joggers|sweatpants
m|joggers|sweatpants|run
m|cargo pants|pants|pockets
m|dungarees|overalls|denim
m|chinos|trousers|smart
m|culottes|trousers|wide
m|bermuda shorts|shorts|knee
m|board shorts|shorts|surf
m|hot pants|shorts|short
m|miniskirt|skirt|short
m|maxi dress|dress|long
m|pencil skirt|skirt|office
m|pleated skirt|skirt|school
m|ballgown skirt|skirt|big
m|saree|sari|india
m|lehenga|skirt|india
m|kurta|shirt|india
m|salwar kameez|suit|india
m|sherwani|coat|wedding
m|dhoti|cloth|india
m|lungi|wrap|india
m|dupatta|scarf|india
m|bindi|dot|forehead
m|mehndi|henna|hands
m|sarong|wrap|beach
m|hanbok|dress|korea
m|qipao|cheongsam|china
m|dirndl|dress|germany
m|lederhosen|shorts|germany
m|toga|robe|rome
m|tunic|top|long
m|robe|gown|long
m|smock|shirt|art
m|lab coat|white coat|scientist
m|scrubs|medical uniform|doctor
m|hi vis vest|safety vest|yellow
m|wetsuit|diving suit|surf
m|spacesuit|space suit|astronaut
m|hazmat suit|suit|chemical
m|diving helmet|helmet|deep sea
m|armour|armor;suit of armour|knight
m|chainmail|armour|knight
m|gauntlet|glove|armour
m|leotard|bodysuit|gymnast
m|ballet slippers|ballet shoes|dance
m|tap shoes|shoes|dance
m|roller boots|skates|roller
m|flippers|fins|swim
m|snowshoes|shoes|snow
m|stilettos|heels|tall
m|platform shoes|platforms|tall
m|wedges|shoes|heel
m|espadrilles|shoes|summer
m|moccasins|shoes|soft
m|brogues|shoes|smart
m|cowboy boots|boots|cowboy
m|ankle boots|boots|short
m|thigh high boots|boots|tall
m|gumboots|wellies|rain
m|slides|sliders|sandals
h|spats|shoe covers|gentleman
h|garter|band|leg
h|bustle|dress|victorian
h|crinoline|hoop skirt|dress
h|ruff|collar|elizabethan
h|doublet|jacket|tudor
h|breeches|trousers|knee
h|pantaloons|trousers|baggy
h|bloomers|underwear|frilly
h|bodysuit|onesie|tight
h|sash|band|pageant
h|epaulettes|shoulder|uniform
h|medal ribbon|ribbon|military
h|balaclava|ski mask|face
h|snood|scarf|neck
h|fascinator|headpiece|wedding
h|bonnet|hat|baby
h|cloche|hat|1920s
h|panama hat|hat|summer
h|trilby|hat|brim
h|stetson|cowboy hat|west
h|fez|hat|red;tassel
h|pith helmet|helmet|safari
h|busby|bearskin|guard
h|mitre|hat|bishop
h|kufi|cap|prayer
h|kippah|yarmulke|cap
h|Ushanka|fur hat|russia
h|signet ring|ring|seal
h|toe ring|ring|toe
h|ankle bracelet|anklet|ankle
h|nose stud|stud|nose
h|belly button ring|piercing|belly
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
