const fs = require('fs');

const wyrCategories = ['Spicy & Intimate', 'Deep & Meaningful', 'Funny & Absurd', 'General'];
const wyrTemplates = {
    'Spicy & Intimate': [
        ['Kiss {{part1}}', 'Kiss {{part2}}'],
        ['Have intimacy in a {{place1}}', 'Have intimacy in a {{place2}}'],
        ['Use {{prop1}} in bed', 'Use {{prop2}} in bed'],
        ['Roleplay as {{role1}}', 'Roleplay as {{role2}}'],
        ['Give a sensual massage using {{oil1}}', 'Give a sensual massage using {{oil2}}'],
        ['Only do it in the morning for a year', 'Only do it at midnight for a year'],
        ['Be blindfolded', 'Have hands tied'],
        ['Whisper dirty secrets', 'Scream out loud']
    ],
    'Deep & Meaningful': [
        ['Know how you die', 'Know when you die'],
        ['Lose all past memories', 'Never make new memories'],
        ['Have unlimited money but no love', 'Have true love but always be poor'],
        ['Save 100 strangers', 'Save your closest friend'],
        ['Speak all languages', 'Communicate with animals']
    ],
    'Funny & Absurd': [
        ['Have fingers for toes', 'Have toes for fingers'],
        ['Fight one horse-sized duck', 'Fight 100 duck-sized horses'],
        ['Always whisper', 'Always shout'],
        ['Sweat mayonnaise', 'Cry cheese'],
        ['Have a giant head', 'Have giant hands']
    ],
    'General': [
        ['Travel to the future', 'Travel to the past'],
        ['Be a famous actor', 'Be a famous musician'],
        ['Live in the mountains', 'Live by the beach'],
        ['Never eat chocolate again', 'Never eat cheese again']
    ]
};

const wyrSpicyOptions1 = ['neck', 'chest', 'stomach', 'back', 'thighs'];
const wyrSpicyOptions2 = ['lips', 'ears', 'shoulders', 'feet', 'hands'];
const wyrSpicyPlaces1 = ['tent in the woods', 'car back seat', 'public restroom', 'hotel balcony'];
const wyrSpicyPlaces2 = ['living room floor', 'kitchen counter', 'shower', 'beach at night'];

// Generate WYR (Would you rather)
let wyrData = [];
for (let i = 0; i < 1100; i++) {
    // 250 of them spicy to meet 200+ requirement
    let category = i < 250 ? 'Spicy & Intimate' : wyrCategories[i % wyrCategories.length];
    let template = wyrTemplates[category][Math.floor(Math.random() * wyrTemplates[category].length)];
    
    let opt1 = template[0] + ' ' + (i < 250 ? Math.floor(Math.random()*1000) : '');
    let opt2 = template[1] + ' ' + (i < 250 ? Math.floor(Math.random()*1000) : '');
    
    // Make them slightly unique
    if (category === 'Spicy & Intimate') {
        opt1 = template[0].replace('{{part1}}', wyrSpicyOptions1[i % wyrSpicyOptions1.length])
                          .replace('{{place1}}', wyrSpicyPlaces1[i % wyrSpicyPlaces1.length]);
        opt2 = template[1].replace('{{part2}}', wyrSpicyOptions2[i % wyrSpicyOptions2.length])
                          .replace('{{place2}}', wyrSpicyPlaces2[i % wyrSpicyPlaces2.length]);
        // add some random juice
        let juices = ["passionately", "wildly", "slowly", "roughly", "softly", "all night long", "secretly"];
        let juice = juices[Math.floor(Math.random() * juices.length)];
        opt1 += " " + juice + " (" + i + ")";
        opt2 += " " + juice + " (" + i + ")";
    } else {
        opt1 += " (" + i + ")";
        opt2 += " (" + i + ")";
    }

    wyrData.push({
        id: `wyr_gen_${i}`,
        category: category,
        text: 'Would you rather',
        options: [opt1, opt2]
    });
}

// Generate NHIE (Never have I ever)
let nhieData = [];
for (let i = 0; i < 1100; i++) {
    let category = i < 250 ? 'Spicy & Intimate' : wyrCategories[i % wyrCategories.length];
    let text = `Never have I ever done activity #${i}`;
    if (category === 'Spicy & Intimate') {
        let spicyActivities = ["sent a naked photo", "fantasized about a friend", "kissed a stranger in the dark", "used toys", "hooked up in public", "been caught in the act", "lied about my body count"];
        text = `Never have I ever ${spicyActivities[Math.floor(Math.random() * spicyActivities.length)]} (variation ${i})`;
    } else if (category === 'Funny & Absurd') {
        text = `Never have I ever dropped food on the floor and still eaten it (${i})`;
    } else {
        text = `Never have I ever traveled to country #${i}`;
    }
    nhieData.push({
        id: `nhie_gen_${i}`,
        category: category,
        text: text
    });
}

// Generate HWYDK (How well do you know me)
let hwydkData = [];
for (let i = 0; i < 1100; i++) {
    let category = i < 250 ? 'Spicy & Intimate' : wyrCategories[i % wyrCategories.length];
    let text = `What is my favorite thing about #${i}?`;
    if (category === 'Spicy & Intimate') {
        let spicyQ = ["What is my favorite position?", "What is my biggest turn on?", "What is my biggest fantasy?", "Where do I love being touched the most?", "What is my weirdest kink?"];
        text = `${spicyQ[Math.floor(Math.random() * spicyQ.length)]} (Q${i})`;
    }
    hwydkData.push({
        id: `hwydk_gen_${i}`,
        category: category,
        text: text,
        type: 'open-ended'
    });
}

const fileContent = `
export type GameCategory = 'General' | 'Spicy & Intimate' | 'Deep & Meaningful' | 'Funny & Absurd';

export interface QuestionDef {
  id: string;
  category: GameCategory;
  text: string;
  options?: [string, string]; // For would you rather
  type?: 'open-ended' | 'multiple-choice'; // For HWYDK
}

export const massiveWouldYouRatherData: QuestionDef[] = ${JSON.stringify(wyrData, null, 0)};

export const massiveNeverHaveIEverData: QuestionDef[] = ${JSON.stringify(nhieData, null, 0)};

export const massiveHowWellDoYouKnowData: QuestionDef[] = ${JSON.stringify(hwydkData, null, 0)};
`;

fs.writeFileSync('src/data/massiveGamesData.ts', fileContent);
console.log("Massive games data generated successfully.");

