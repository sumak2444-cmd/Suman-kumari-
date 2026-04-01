import { Level, Skin } from './types';

export const CODING_INTRO = {
  title: "Coding Kya Hai? (What is Coding?)",
  content: "Coding ek aisi language hai jisse hum computer se baat karte hain. Jaise hum aapas mein Hindi ya English mein baat karte hain, waise hi computer ko samjhane ke liye hum 'Code' ka use karte hain.",
  why: [
    "Computer ko instructions dene ke liye.",
    "Games aur Apps banane ke liye.",
    "Bade problems ko solve karne ke liye.",
    "Future mein naye inventions karne ke liye."
  ],
  languages: [
    { name: "Scratch", desc: "Blocks se coding seekhne ke liye (Bachon ke liye best)." },
    { name: "Python", desc: "Sabse easy aur popular text language." },
    { name: "JavaScript", desc: "Websites aur Internet ke liye." },
    { name: "C++", desc: "Bade games aur fast apps ke liye." }
  ]
};

export const LEVELS: Level[] = [
  {
    id: 1,
    title: "Dino's First Step",
    description: "Help Dino find his egg!",
    lessonTitle: "Instructions Kya Hain?",
    lessonContent: "Coding ka matlab hai step-by-step instructions dena. Agar hum Dino ko 'Aage Badho' bolenge, toh woh ek step aage jayega.",
    notes: [
      "Computer ko har ek step batana padta hai.",
      "Instructions hamesha order mein honi chahiye.",
      "Ek galat step se Dino rasta bhatak sakta hai!"
    ],
    hint: "Dino ko egg tak pahunchne ke liye 2 baar 'Move Forward' karna hoga.",
    difficulty: 'Easy',
    gridSize: 5,
    startPos: { x: 0, y: 2 },
    startDir: 'RIGHT',
    goalPos: { x: 2, y: 2 },
    obstacles: [],
    maxCommands: 5,
    allowedCommands: ['MOVE_FORWARD'],
    rewardCoins: 50
  },
  {
    id: 2,
    title: "The Big Turn",
    description: "Dino needs to turn to find the nest.",
    lessonTitle: "Turning and Directions",
    lessonContent: "Coding mein directions bahut important hain. 'Turn Left' aur 'Turn Right' se hum Dino ka rukh badal sakte hain.",
    notes: [
      "Turn karne se Dino apni jagah nahi badalta, sirf face badalta hai.",
      "Face badalne ke baad 'Move Forward' karna zaroori hai aage badhne ke liye."
    ],
    hint: "Pehle aage badho, phir right mudo, phir aage badho!",
    difficulty: 'Easy',
    gridSize: 5,
    startPos: { x: 1, y: 1 },
    startDir: 'RIGHT',
    goalPos: { x: 3, y: 3 },
    obstacles: [{ x: 3, y: 1 }, { x: 1, y: 3 }],
    maxCommands: 6,
    allowedCommands: ['MOVE_FORWARD', 'TURN_RIGHT', 'TURN_LEFT'],
    rewardCoins: 100
  },
  {
    id: 3,
    title: "Typing Master",
    description: "Type the code to help Dino!",
    lessonTitle: "Text-Based Coding",
    lessonContent: "Ab hum blocks ki jagah khud code type karenge. Yeh real programming ki pehli seedhi hai!",
    notes: [
      "Code hamesha lowercase mein likho.",
      "Har command ke baad enter dabao.",
      "Spelling ka dhyaan rakho!"
    ],
    hint: "Type 'move' to move forward, 'left' to turn left, and 'right' to turn right.",
    difficulty: 'Normal',
    gridSize: 6,
    startPos: { x: 0, y: 0 },
    startDir: 'RIGHT',
    goalPos: { x: 5, y: 5 },
    obstacles: [{ x: 2, y: 2 }, { x: 3, y: 3 }],
    maxCommands: 15,
    allowedCommands: ['MOVE_FORWARD', 'TURN_RIGHT', 'TURN_LEFT'],
    rewardCoins: 200,
    isTypingLevel: true
  }
];

export const SKINS: Skin[] = [
  { id: 'classic', name: 'Green Dino', color: 'bg-green-500', price: 0 },
  { id: 'fire', name: 'Fire Dino', color: 'bg-orange-600', price: 500 },
  { id: 'ice', name: 'Ice Dino', color: 'bg-blue-400', price: 1000 },
  { id: 'gold', name: 'Golden Dino', color: 'bg-yellow-500', price: 2500 },
];
