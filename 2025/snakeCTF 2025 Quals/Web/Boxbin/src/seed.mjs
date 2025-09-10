// seed.js
import { getDb } from './lib/database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const usersToCreate = [
    { username: 'BoxHater22', password: '' },
    { username: 'CardboardCrusader', password: '' },
    { username: 'AntiBoxxer', password: '' },
    { username: 'ContainerDespiser', password: '' },
    { username: 'SirPacks-a-Lot', password: '' },
    { username: 'ThePackagingPest', password: '' },
    { username: 'CubeScout', password: '' },
];

function getRandomPastDate() {
    const now = new Date();
    const past = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    return past;
}

const pastes = [
    // Batch 1
    {
        user: 'BoxHater22', title: 'A menace in Venice', hidden: false,
        content: `I was trying to have a peaceful moment, watching the gondolas drift by the Rialto Bridge, and what do I see? A cardboard box. It was bobbing in the canal, a soggy, brown insult to the beauty of the city. It had a faded logo, something about "Verona Imports," but the water had bled the ink into a meaningless blue smudge. Dimensions: roughly the size of a fed-up pigeon, maybe a bit larger. Condition: Actively disintegrating. The corners were soft and pulpy. The sheer audacity to be both a box AND soggy is a personal insult. It represents a failure on so many levels. The failure of the person who packed it, the person who shipped it, and the person who let it fall into the water. I watched it for a solid ten minutes. It floated into a wall, spun around, and floated back. A pointless, rectangular journey. A tourist asked if I was okay. I told them I was contemplating the futility of containment. They backed away slowly. I hate this city now.`,
        views: 152, comments: [
            { user: 'CardboardCrusader', text: 'The worst ones are the damp ones. They lose all structural integrity but somehow become MORE offensive.' },
            { user: 'AntiBoxxer', text: 'Did you kick it? Or, I guess, poke it with a stick?' },
            { user: 'BoxHater22', text: 'I wanted to, but it drifted away. A coward, just like the rest of them.' },
            { user: 'ThePackagingPest', text: 'I saw one like that in Amsterdam once. Maybe it\'s the same one, on a grand European tour of disappointment.'}
        ]
    },
    {
        user: 'CardboardCrusader', title: 'This is just insulting.', hidden: false,
        content: `I paid a lot of money to visit the rock garden at Ryōan-ji in Kyoto. It's supposed to be a place of ultimate tranquility and meditation. But there, in the middle of the pristine, raked white gravel, was a box. A perfect, white box. No branding. No dirt. Just pure, geometric arrogance. It wasn't one of the carefully placed stones; it was an intruder. A void of creativity in a sea of tranquility. It weighed almost nothing, which made me hate it more. It felt like it was mocking the very concept of substance. I felt its perfect right angles judging the organic, natural forms of the ancient stones. I wanted to burn it. I wanted to launch it into the sun. But the monks were watching, and they had that serene look on their faces that says "we will absolutely tackle you if you touch our rocks." So I just sat there, my zen utterly shattered. My entire trip to Japan is ruined. Thanks a lot, box.`,
        views: 280, comments: [
            { user: 'ContainerDespiser', text: 'The clean ones are the most sinister. They have an aura of smug superiority.' },
            { user: 'CubeScout', text: 'Are you sure it wasn\'t part of the art? Some kind of commentary on modernism?' },
            { user: 'CardboardCrusader', text: 'If it was, the artist should be in jail.' },
        ]
    },
    {
        user: 'AntiBoxxer', title: 'Metal monstrosity in Berlin', hidden: false,
        content: `I was exploring an abandoned factory near the Spree, looking for cool photo opportunities. Instead, I found this. A heavy steel container, rusted shut, sitting in the middle of the main factory floor. It had 'ACHTUNG!' stenciled on the side in faded red paint. I'm not a small guy, but I tried to push it over and it wouldn't budge. It probably weighs more than my car. It knows what it did. It has the energy of a war criminal. There were scratch marks around the lock, but not from me. Deep gouges in the metal. Something wanted in. Or out. I put my ear to the side and I swear I could hear a faint, rhythmic tapping. I'm a brave man, but I'm not a stupid one. I got out of there. But I can still hear the tapping sometimes, when it's quiet.`,
        views: 451, comments: [
            { user: 'BoxHater22', text: 'Careful with those, they fight back.' },
            { user: 'SirPacks-a-Lot', text: 'I bet there\'s another, smaller, even angrier box inside.' },
            { user: 'AntiBoxxer', text: 'Don\'t even joke about that. That\'s not funny.' },
            { user: 'ThePackagingPest', text: 'You should have left a note on it. "I know what you are."' },
        ]
    },
    {
        user: 'SirPacks-a-Lot', title: 'The Matryoshka Nightmare', hidden: false,
        content: `I have made a terrible mistake. I found a large box on the side of the road. It looked ordinary enough. Inside it? A slightly smaller box. "Curious," I thought. And so on. I'm on box number seven now and they're down to the size of a shoebox. I can't stop. I have to see it to the end. The brand is "Infinite Packaging Solutions." How fitting. I've been at this for hours. My family is worried. My hands are raw from tearing tape and cardboard. The sun has set. The house is dark around me. There is only the box. And the next box. And the next. I think the boxes are getting heavier as they get smaller. Is that possible? Help me.`,
        views: 843, comments: [
            { user: 'BoxHater22', text: 'This is my personal hell. You are living my nightmare.' },
            { user: 'AntiBoxxer', text: 'The final box is just a single atom of cardboard, and inside it is a note that says "Gotcha."' },
            { user: 'ContainerDespiser', text: 'This is a known phenomenon. You have to break the chain. Throw the whole set away before it\'s too late!' },
            { user: 'SirPacks-a-Lot', text: 'I can\'t. I have to know.' },
        ]
    },
    {
        user: 'CubeScout', title: 'The Box That Wasn\'t a Box', hidden: false,
        content: `So it was my nephew's 8th birthday party. He's a good kid, but his parents have terrible taste. They got him a cake. It looked like a box. A hyper-realistic cake made to look like a beat-up cardboard box from 'U-Haul'. I, of course, did not know this. I saw it sitting on the table, a symbol of domestic drudgery and the horrors of moving. And I did what any of us would do. I walked up to it and stomped on it with all my might. My foot went straight through the top. Frosting and vanilla sponge everywhere. The children were screaming. My sister was crying. I tried to explain that I was performing a public service, that I was liberating them from the tyranny of the cube. They didn't understand. Now I'm not allowed at family gatherings anymore. Worth it. The deception was the worst part.`,
        views: 250, comments: [
            { user: 'AntiBoxxer', text: 'The deception IS the worst part! You are a hero and a martyr.' },
            { user: 'ThePackagingPest', text: 'I respect your commitment to the cause.' },
            { user: 'BoxHater22', text: 'So... how did it taste?' },
            { user: 'CubeScout', text: 'Like victory.' },
        ]
    },
    // Batch 2
    {
        user: 'ThePackagingPest', title: 'Cold Spot in the Mojave', hidden: false,
        content: `I was doing some amateur geology work out in the Mojave desert, miles from any road, when my magnetometer started going wild. I followed the readings and found this. Half-buried in the sand was a polished obsidian box, about the size of a car battery. It was perfectly smooth, no seams or lid that I could see. Despite the blistering 110°F heat, the box was intensely cold to the touch. So cold it hurt, like holding dry ice. It felt ancient and wrong. There were no footprints around it but my own. How did it get here? I took some readings, but my equipment just gave static. I left it there, but I think I can still feel the cold spot in my memory. I marked the location on a map, but I'm not sure I should share it.`,
        views: 477, comments: [
            { user: 'CubeScout', text: 'That sounds like a containment unit. You should report the location to... someone? Not sure who.' },
            { user: 'SirPacks-a-Lot', text: 'I would have tried to open it.' },
            { user: 'ThePackagingPest', text: 'With what? A plasma torch? It was seamless!' }
        ]
    },
    {
        user: 'CubeScout', title: 'The Whispering Box of New Orleans', hidden: false,
        content: `I was in New Orleans for a conference and decided to explore the French Quarter. I found this tucked away in a dusty corner of a voodoo shop, between a jar of what I hope was pickled okra and a shrunken head. It was a small, ornate wooden box, intricately carved with symbols I didn't recognize - part astrological, part circuit board. The shopkeeper was this ancient woman who just smiled when I asked about it. She said it was a 'Debate Box'. If you put your ear to it, you can hear faint, overlapping whispers. It's probably just the wood settling in the humidity, but it sounds like a thousand tiny arguments. It's infuriating. I can't stand the sound of unresolved conflict.`,
        views: 321, comments: [
            { user: 'AntiBoxxer', text: 'I would have smashed it just to shut it up.' },
            { user: 'BoxHater22', text: 'You should have bought it and buried it in concrete.' },
            { user: 'CubeScout', text: 'She wanted $5,000 for it. Said it was a "conversation piece." No thanks.' }
        ]
    },
    {
        user: 'CardboardCrusader', title: 'A Box Made of Mirrors', hidden: false,
        content: `This was just cruel. I went to the new modern art exhibit downtown. The main installation was a single object in the center of a huge, white room. A perfect cube, maybe 2x2 feet, sitting on a white pedestal. Every single side was a perfect mirror. You couldn't look at it without seeing your own disgusted face staring back. The artist's statement called it "An Exploration of the Self as a Container." Pretentious garbage. Is this what we've become? People who put boxes on pedestals? I was asked to leave after I 'interacted' with the art too aggressively. My reflection agreed with my methods.`,
        views: 555, comments: [
            { user: 'ThePackagingPest', text: 'The box is mocking you. Classic box behavior.' },
            { user: 'ContainerDespiser', text: 'I hate conceptual art. Especially when it\'s a box.' },
            { user: 'AntiBoxxer', text: 'How aggressive are we talking? Did you leave a mark?' },
            { user: 'CardboardCrusader', text: 'Let\'s just say the cube is slightly less... cubic now.' }
        ]
    },
    {
        user: 'SirPacks-a-Lot', title: 'The Never-Ending Delivery', hidden: false,
        content: `My new neighbor is a weird guy. He gets a single, plain brown box delivered every morning at 8:02 AM. Not 8:01, not 8:03. A small, silent drone drops it on his porch. He immediately takes it inside. The next day, another one arrives. He never seems to throw the old ones out. His lights are on all night, and sometimes I see strange colored flashes from his windows. I used my binoculars. I counted. He has 34 of them now, all stacked in his living room. What is he building in there? Is he building a bigger box out of smaller boxes? The thought keeps me up at night.`,
        views: 489, comments: [
            { user: 'CubeScout', text: 'That\'s not a collection. That\'s an infestation.' },
            { user: 'BoxHater22', text: 'You have a moral obligation to stop him.' },
            { user: 'SirPacks-a-Lot', text: 'I\'m more afraid of what happens when he gets to 100.' }
        ]
    },
    {
        user: 'ThePackagingPest', title: 'Found a Historical Document', hidden: true,
        content: `[SECRET] I'm a researcher by trade, and I was digging through archives at the library for a project on 19th-century shipping manifests. I found a diary from a dock worker in London, dated 1888. He talks about a 'Plague of Cartons'. Describes boxes appearing out of nowhere on the docks, in the streets, even in people's homes. He said they had a strange, sweet smell, like almonds and ozone. The diary entries get more and more erratic. He talks about paranoia, madness, people disappearing. The last entry is barely legible. It just says 'They are not empty'. I checked the official records for that year. There was a spike in unexplained disappearances in that exact district.`,
        views: 33, comments: [
            { user: 'CubeScout', text: 'This is huge. You need to publish this.' },
            { user: 'ThePackagingPest', text: 'And have people think I\'m a lunatic? No, this stays between us.' }
        ]
    },
    // Batch 3
    {
        user: 'ContainerDespiser', title: 'The Most Annoying Sound in the World', hidden: false,
        content: `I was trying to enjoy a quiet afternoon in the park. Reading a book, feeding the pigeons. Then I heard it. A tinny, off-key version of 'Happy Birthday'. It was coming from a musical greeting card box someone had left open on a bench. Every time the wind blew the lid, it would play. For hours. I was two miles away at one point and I swear I could still hear it. It was psychological torture. I eventually found it and performed a mercy killing with a large rock. I have no regrets. The silence that followed was the most beautiful sound I've ever heard.`,
        views: 199, comments: [
            { user: 'AntiBoxxer', text: 'You are a hero. You did what we all would have done.' },
            { user: 'BoxHater22', text: 'I once found a box that played "Baby Shark". I threw it into traffic.' },
            { user: 'ContainerDespiser', text: 'A completely justified response.' }
        ]
    },
    {
        user: 'CubeScout', title: 'Box chained in a park.', hidden: false,
        content: `I'm not making this up. I was walking through Central Park, and I found a solid iron chest, chained to a bench. The chains were thick, the padlock was ancient and covered in verdigris. It looked like a pirate's treasure chest that had taken a wrong turn at the Caribbean. A small, brass plaque on the bench read 'For your own safety, do not attempt to open. Property of the Department of Temporal Anomalies.' I hate it when they're condescending. What's inside? A smaller, more annoying box? A paradox? I spent an hour looking for a key.`,
        views: 812, comments: [
            { user: 'SirPacks-a-Lot', text: 'Challenge accepted. I\'m on my way with bolt cutters.' },
            { user: 'ThePackagingPest', text: 'Dude, don\'t. "Temporal Anomalies" doesn\'t sound like a department you want to mess with.' },
            { user: 'CubeScout', text: 'I poked it with a stick. The stick is now gone. Not broken, just... gone from this timeline.' }
        ]
    },
    {
        user: 'AntiBoxxer', title: 'The Box That Changed Colors', hidden: false,
        content: `I found this at a tech startup's launch party. They were using them as centerpieces. It was a sleek, modern-looking cube made of some kind of iridescent material I've never seen before. Depending on the angle you looked at it, it was a different color. It was mesmerizing, and I hated myself for it. This is how they get you. They distract you with pretty colors while they plot their rectangular takeover. I asked one of the developers what it was. He just smiled and said "It's the future of storage." That's the most terrifying thing I've ever heard. I stole one. It's in my freezer now.`,
        views: 401, comments: [
            { user: 'ContainerDespiser', text: 'The future is bleak, and it is a cube.' },
            { user: 'BoxHater22', text: 'Does the cold stop it from... futuring?' },
            { user: 'AntiBoxxer', text: 'I hope so.' }
        ]
    },
    {
        user: 'BoxHater22', title: 'It\'s full of spiders, isn\'t it?', hidden: false,
        content: `I was cleaning out my attic. I've lived in this house for 10 years. I've never seen this box before. It's a heavy wooden crate, about the size of a microwave. It was tucked away under some old insulation. The wood is dark and smells like cedar. The side is stenciled with faded black letters: 'ARACHNID SPECIMENS - LIVE - HANDLE WITH EXTREME CAUTION'. I haven't opened it. I'm just going to sell the house. I'm not even going to pack. I'm just leaving. The house is the box's problem now. Goodbye.`,
        views: 333, comments: [
            { user: 'ThePackagingPest', text: 'This is the only reasonable response.' },
            { user: 'SirPacks-a-Lot', text: 'But what if they\'re rare spiders? They could be worth a fortune!' },
            { user: 'BoxHater22', text: 'You are welcome to them. I\'ll leave the key under the mat.' }
        ]
    },
    {
        user: 'CardboardCrusader', title: 'A Box That Grows', hidden: true,
        content: `[SECRET] I need help. I found a small, damp cardboard box in my garage a week ago. I thought nothing of it. But I swear it's bigger now. I measured it. It was 6 inches on Monday. It's 6.5 inches today. It's feeding on the ambient humidity and my own growing fear. I tried to put it outside, but it was back in the garage the next morning. It's starting to bulge in the middle. I'm afraid of what will happen when it gets big enough to block the door.`,
        views: 42, comments: [
            { user: 'CubeScout', text: 'You need to document this. This is a new species.' },
            { user: 'CardboardCrusader', text: 'I don\'t want to document it, I want to kill it with fire!' }
        ]
    },
    // Batch 4
    {
        user: 'ThePackagingPest', title: 'Found a box from the future.', hidden: false,
        content: `I was hiking in a remote national park and found this half-buried in a creek bed. It was made of a chrome-like material that was completely seamless and oddly lightweight. It had a small, glowing blue countdown timer on the side, currently at 42 years, 8 months, 3 days, and 12 hours. The only branding was a stylized logo that said 'BoxEx - We Deliver. Yesterday.' I have so many questions and all of them fill me with rage. Is this a threat? A promise? I tried to break the screen but it was harder than diamond.`,
        views: 741, comments: [
            { user: 'CubeScout', text: 'Do NOT interfere with that. You could unravel the entire timeline.' },
            { user: 'AntiBoxxer', text: 'Or you could prevent a future full of boxes. A hero\'s choice.' }
        ]
    },
    {
        user: 'ContainerDespiser', title: 'The Box That Knows', hidden: true,
        content: `[SECRET] I bought a small, metal safe-box at a flea market. It had a simple 4-digit keypad. I tried my birthday. Nothing. I tried 1234. Nothing. I tried every combination I could think of. Out of sheer frustration, I typed in my deepest, darkest secret, a password I've never used for anything. It clicked open. I didn't even look inside. I just slammed it shut, drove to the nearest lake, and threw it in. Some things you don't need to know.`,
        views: 68, comments: [
            { user: 'SirPacks-a-Lot', text: 'I would have looked. I have to know everything.' },
            { user: 'ContainerDespiser', text: 'That\'s why you\'re our greatest warrior and our biggest liability.' }
        ]
    },
    {
        user: 'BoxHater22', title: 'A Box Full of Bees', hidden: false,
        content: `I was at a farmer's market and saw a wooden box, about 2 feet long, sitting on a table. It was buzzing. Loudly. The label, handwritten, said 'Live Bees, Handle With Care. Angry Bees.' I don't know if they were for sale or if it was a warning. I did not handle it with care. I handled it with a long stick and a running start, tipping it into a large fountain. The bees are fine, probably. They seemed to enjoy the water. The box, however, is not fine. It is very, very wet.`,
        views: 482, comments: [
            { user: 'CardboardCrusader', text: 'Sometimes you have to fight fire with fire. Or boxes with bees.' },
            { user: 'ThePackagingPest', text: 'You probably just made them angrier.' }
        ]
    },
    {
        user: 'AntiBoxxer', title: 'The Anti-Box', hidden: false,
        content: `I saw this in a gallery in SoHo. It was a wireframe cube, made of glowing blue light projected from emitters in the ceiling. Technically not a box because it can't contain anything. And yet, it's still a box. It's a philosophical nightmare. It exists only to mock the very concept of containment. It's the ghost of a box, haunting us with its potential. I hate it more than all the others. I threw my shoe at it. The shoe passed right through. Now I'm out a shoe.`,
        views: 512, comments: [
            { user: 'ThePackagingPest', text: 'It\'s the platonic ideal of a box. The ur-box. Terrifying.' },
            { user: 'CubeScout', text: 'You can\'t fight an idea, man.' },
            { user: 'AntiBoxxer', text: 'Watch me.' }
        ]
    },
    {
        user: 'SirPacks-a-Lot', title: 'I have become one of them.', hidden: true,
        content: `[SECRET] I have spent so long staring into the abyss of the box, the box has stared back into me. I have seen the truth. The corners, the flaps, the structural integrity... it's all so beautiful. I now live in a cardboard fort in my living room. It is structurally sound. I am safe here. The corners protect me. The flaps are my shield. I am the Box King. Bow before my corrugated majesty.`,
        views: 100, comments: [
            { user: 'BoxHater22', text: 'We lost a real one today. F in the chat.' },
            { user: 'CardboardCrusader', text: 'He\'s gone. The boxes have him now.' },
            { user: 'AntiBoxxer', text: 'I\'ll come rescue you, buddy! I\'m bringing a spray bottle full of water!' }
        ]
    },
    // Batch 5
    {
        user: 'CubeScout', title: 'The Box That Sings', hidden: false,
        content: `Found this in a shipwreck while scuba diving. A barnacle-encrusted chest that was humming. I brought it to the surface and cleaned it off. It's made of a strange, greenish metal. It doesn't have a lock, but it hums a low, sad song. It's a melody I've never heard before, but it feels ancient. The song gets louder at night. It's actually quite beautiful, which makes me furious. A box has no right to make beautiful music. It's unnatural.`,
        views: 621, comments: [
            { user: 'ThePackagingPest', text: 'It\'s a siren\'s call. It\'s trying to lure you into a false sense of security before it traps you.' },
            { user: 'BoxHater22', text: 'Throw it back into the sea.' }
        ]
    },
    {
        user: 'ContainerDespiser', title: 'A Box That Eats Light', hidden: false,
        content: `This was in the back of a pawn shop. A shoebox covered in what the owner called "the blackest material ever made." He wasn't kidding. It was like looking into a hole in reality. It didn't reflect any light. I put my hand near it and it felt like all the warmth was being sucked out of my fingers. The owner used it to store old watches. What a waste of a perfectly good anomaly. I offered him $20 for it. He told me to get out.`,
        views: 789, comments: [
            { user: 'AntiBoxxer', text: 'You should have stolen it. For the good of mankind.' },
            { user: 'ContainerDespiser', text: 'I thought about it. But I was worried it might eat my soul.' }
        ]
    },
    {
        user: 'CardboardCrusader', title: 'The Origami Box', hidden: false,
        content: `I was at a papercraft convention and saw a master origami artist at work. He took a single, huge sheet of paper and, in a few hours, folded it into a perfect, life-sized cardboard box. It was a masterpiece of engineering and artistry. It was also an abomination. He had used his incredible talent to create the very thing we fight against. I booed him. Loudly. People were very upset. I stand by my actions.`,
        views: 314, comments: [
            { user: 'BoxHater22', text: 'Using art to create evil. The oldest story in the book.' },
            { user: 'SirPacks-a-Lot', text: 'But was it structurally sound? Could it hold weight?' },
            { user: 'CardboardCrusader', text: 'I don\'t know, I was being escorted out by security.' }
        ]
    },
    {
        user: 'ThePackagingPest', title: 'The Box That Tells Jokes', hidden: false,
        content: `I found a child's toy box at a garage sale. It had a pull string. I pulled it. A tinny voice said, "Why did the box go to the gym? To get shredded!" I pulled it again. "What do you call a sad box? A blue bin!" I pulled it a third time. "Knock knock." I refused to answer. I will not be a part of its twisted games. I bought it for a dollar and now it's at the bottom of my pool.`,
        views: 222, comments: [
            { user: 'AntiBoxxer', text: 'The puns... the horror...' },
            { user: 'CubeScout', text: 'I actually think that\'s kind of funny.' },
            { user: 'ThePackagingPest', text: 'You\'re sick.' }
        ]
    },
    {
        user: 'BoxHater22', title: 'The Box in the Painting', hidden: false,
        content: `I was at the Met, looking at a 17th-century Dutch masterpiece. A classic still life with fruit and a lute and a skull. But in the background, almost hidden in the shadows, was a plain cardboard box. It didn't belong. It was historically inaccurate. I told the museum guard. He told me it had always been there. I checked online. Every print of the painting has the box. Has it always been there? Am I losing my mind? Or is it... changing history?`,
        views: 888, comments: [
            { user: 'CardboardCrusader', text: 'The Mandela Effect, but for boxes. The Boxdela Effect.' },
            { user: 'ContainerDespiser', text: 'They\'re insidious. They\'re everywhere. In every time.' }
        ]
    },
    // Batch 6
    {
        user: 'AntiBoxxer', title: 'The Box That Ships Itself', hidden: false,
        content: `I work at a post office. This was a nightmare. A standard brown box came through our sorting facility. The shipping label was addressed TO the box itself. The return address was also the box itself. It had enough postage to go around the world ten times. We didn't know what to do. It's against regulations to throw away mail. It's just stuck in a loop. It's still there, sitting in a bin, haunting the automated sorting machine. It's a paradox with a tracking number.`,
        views: 503, comments: [
            { user: 'SirPacks-a-Lot', text: 'It has achieved self-sufficiency. We are doomed.' },
            { user: 'ThePackagingPest', text: 'What happens if you put it in a bigger box?' }
        ]
    },
    {
        user: 'ContainerDespiser', title: 'The Box That Contains a Single Packing Peanut', hidden: false,
        content: `I ordered a new graphics card. The box that arrived was huge, big enough for a mini-fridge. I opened it. Inside was a sea of packing peanuts. I spent twenty minutes digging through them. At the very bottom was my graphics card, in its own, much smaller box. But that's not the enemy. The enemy was another box, identical in size to the graphics card box, also buried in the peanuts. I opened it. It contained a single, solitary packing peanut. The sheer wastefulness is a crime against humanity.`,
        views: 689, comments: [
            { user: 'BoxHater22', text: 'That single peanut is mocking you. It represents the void.' },
            { user: 'CardboardCrusader', text: 'This is why I buy everything in person. In bags.' }
        ]
    },
    {
        user: 'CubeScout', title: 'The Box That Is Also a Cat', hidden: false,
        content: `My friend adopted a cat from a shelter. The cat's name is "Box". Not "Boxy". Just "Box". Why? Because he will only sit, sleep, and exist in a specific cardboard box. He refuses to leave it. If you take him out, he just gets back in. If you move the box, he follows. Is the cat the box? Is the box the cat? My friend's apartment is essentially a shrine to a single, slightly chewed-up Amazon Prime box. It's deeply unsettling.`,
        views: 411, comments: [
            { user: 'ThePackagingPest', text: 'The box has an accomplice. This is a dangerous escalation.' },
            { user: 'AntiBoxxer', text: 'You have to destroy the box to save the cat. It\'s the only way.' }
        ]
    },
    {
        user: 'SirPacks-a-Lot', title: 'The Box That Contains a Sound', hidden: true,
        content: `[SECRET] I found a lead-lined box at a military surplus store. It took me a week to get it open. There was nothing inside. Nothing I could see, anyway. But when it's open, you can hear a sound. It's not a sound you hear with your ears, it's a sound you hear in your teeth, in your bones. It's the sound of a key turning in a lock that's a million miles away. I closed it. I can still hear it.`,
        views: 77, comments: [
            { user: 'CubeScout', text: 'You should not have opened that.' }
        ]
    },
    {
        user: 'BoxHater22', title: 'The Box That Hates Me Back', hidden: false,
        content: `I have a box in my garage for recycling. A normal, everyday box. But I swear it hates me. Every time I walk past it, a flap will randomly fall open and trip me. When I try to break it down, I get a dozen paper cuts. The other day, a gust of wind blew it off the shelf and it landed perfectly on my foot. It's not just an inanimate object. It's malicious. It has a vendetta. We are mortal enemies.`,
        views: 399, comments: [
            { user: 'CardboardCrusader', text: 'I believe you. I had a filing cabinet like that once.' },
            { user: 'AntiBoxxer', text: 'Fire. It\'s the only way to be sure.' }
        ]
    },
    // Batch 7
    {
        user: 'ThePackagingPest', title: 'The Box That Is a Map', hidden: false,
        content: `I was hiking and found an old, weathered box, but when I unfolded it, it wasn't a box at all. It was a map. The cardboard was creased and folded in such a way that it formed a box, but its true purpose was the map printed on the inside. It was a map of my own neighborhood, but with buildings and streets I've never seen. There was a park labeled "The Fulcrum" and a building marked "Containment." I refolded it. Some things are better left as boxes.`,
        views: 654, comments: [
            { user: 'CubeScout', text: 'You have to go to The Fulcrum. For all of us.' },
            { user: 'ThePackagingPest', text: 'I do not. I absolutely do not.' }
        ]
    },
    {
        user: 'ContainerDespiser', title: 'The Box That Is Perfectly Balanced', hidden: false,
        content: `I found it on a telephone wire. A shoebox, perfectly balanced on the thin wire, not even wobbling in the wind. How did it get there? Who has that kind of skill? It's an act of aggression. It's a display of power. It's a box saying "I can go where you cannot. I am above you." I threw rocks at it for an hour. Couldn't hit it.`,
        views: 432, comments: [
            { user: 'AntiBoxxer', text: 'Get a ladder. Or a very long stick.' },
            { user: 'BoxHater22', text: 'It\'s mocking you. Don\'t give it the satisfaction.' }
        ]
    },
    {
        user: 'CardboardCrusader', title: 'The Box That Smells Like Memories', hidden: false,
        content: `I found a hatbox in my grandmother's attic. When I opened it, a smell came out. It wasn't a bad smell. It smelled like my grandfather's pipe tobacco, my grandmother's baking, and the rain on the tin roof of my childhood home. It was the smell of a perfect, happy memory. And it was trapped in a box. It's a prison for nostalgia. A container for joy that should be free. I left the lid off.`,
        views: 777, comments: [
            { user: 'ThePackagingPest', text: 'That\'s the most poetic and hateful thing I\'ve ever read.' },
            { user: 'SirPacks-a-Lot', text: 'You freed the memory. You\'re a hero.' }
        ]
    },
    {
        user: 'AntiBoxxer', title: 'The Box That Is Also a Door', hidden: true,
        content: `[SECRET] I was in a very strange dream. I was in a long, white hallway with no doors. Except for one. A cardboard box was sitting in the middle of the floor. In the dream, I knew it was a door. I "opened" the flaps, and I wasn't looking into a box, I was looking down into a completely different room. I saw myself, sleeping in my bed. I woke up, and there was a cardboard box on the floor of my bedroom. I haven't touched it.`,
        views: 99, comments: [
            { user: 'CubeScout', text: 'Do not touch that box. I repeat, do not touch that box.' }
        ]
    },
    {
        user: 'BoxHater22', title: 'The Box That Is Too Good at Its Job', hidden: false,
        content: `I bought a new TV. The box was a masterpiece of packaging design. It had reinforced corners, custom-molded foam inserts, a box-within-a-box system. It was so perfectly designed to protect its contents that it took me forty-five minutes to get the TV out. I needed a knife, a screwdriver, and a crowbar. I have several new cuts on my hands. The TV is fine, but I hate the box that brought it to me. It was too good. Too smug.`,
        views: 521, comments: [
            { user: 'ContainerDespiser', text: 'The pinnacle of evil is a box that is good at being a box.' },
            { user: 'CardboardCrusader', text: 'I hope you destroyed it with extreme prejudice.' },
            { user: 'BoxHater22', text: 'It was a glorious bonfire.' }
        ]
    }
];

const flag = process.env.FLAG || 'snakeCTF{f4ke_fl4g_f0r_t3st1ng}';

async function seed() {
    const db = await getDb();

    await db.run('DELETE FROM comments');
    await db.run('DELETE FROM posts');
    await db.run("DELETE FROM users WHERE username != 'admin'");
    await db.run('DELETE FROM user_upgrades');
    
    const userMap = new Map();
    const adminUser = await db.get("SELECT id FROM users WHERE username = 'admin'");
    userMap.set('admin', adminUser.id);

    for (const userData of usersToCreate) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const createdAt = getRandomPastDate();
        await db.run('INSERT OR IGNORE INTO users (username, password, createdAt) VALUES (?, ?, ?)', userData.username, hashedPassword, createdAt.toISOString());
        const newUser = await db.get('SELECT id FROM users WHERE username = ?', userData.username);
        userMap.set(userData.username, newUser.id);
        console.log(`- Created user: ${userData.username}`);
    }

    for (const paste of pastes) {
        const userId = userMap.get(paste.user);
        if (!userId) continue;

        const newPostId = uuidv4();
        const createdAt = getRandomPastDate();
        const content = paste.content.trim().replace(/^    /gm, '');
        await db.run('INSERT INTO posts (id, title, content, userId, hidden, views, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)', newPostId, paste.title, content, userId, paste.hidden, paste.views, createdAt.toISOString());

        let commentDate = new Date(createdAt.getTime() + 60000); // Start comments a minute after post
        for (const comment of paste.comments) {
            const commentUserId = userMap.get(comment.user);
            if (!commentUserId) continue;
            await db.run('INSERT INTO comments (content, postId, userId, createdAt) VALUES (?, ?, ?, ?)', comment.text, newPostId, commentUserId, commentDate.toISOString());
            commentDate = new Date(commentDate.getTime() + Math.random() * 600000); // Add up to 10 mins for next comment
        }
    }

    const flagTitle = "The Box To End All Boxes";
    const flagContent = `
I found it. The one.
It was sitting behind a dumpster in a forgotten corner of the internet, in a subdirectory I swear didn't exist a moment before I stumbled into it.
It hummed with a strange energy, a low thrum that vibrated in my teeth.
I opened it. There was no lock. It seemed to unfold itself for me.
Inside, I found only a single, glowing line of text.
I hate this box more than any other because it feels like an ending. And I don't want the hunt to end.

Condition: Pulsating with a faint, ominous light.
Brand: It has the snake from the logo on it. What does it mean?
Est. Weight: The weight of all my past failures.
Dimensions: It seems to be bigger on the inside.

The text inside read:
${flag}`;
    await db.run('INSERT INTO posts (id, title, content, userId, hidden, createdAt) VALUES (?, ?, ?, ?, ?, ?)', uuidv4(), flagTitle, flagContent.trim().replace(/^    /gm, ''), userMap.get('admin'), true, new Date().toISOString());

    await db.close();
}

seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});