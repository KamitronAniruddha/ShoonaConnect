const fs = require('fs');
let code = fs.readFileSync('src/components/HomeView.tsx', 'utf8');

const target = `  const myBirthday =
    userProfile?.birthday ||
    (myUid ? couple?.birthdays?.[myUid] : undefined) ||
    couple?.partner1Birthday;
  const partnerBirthday =
    partnerProfile?.birthday ||
    (partnerUid ? couple?.birthdays?.[partnerUid] : undefined) ||
    couple?.birthdays?.['partner'] ||
    couple?.partner2Birthday;`;

const replacement = `  const isCreator = couple?.creatorId === myUid;
  
  const myBirthday =
    userProfile?.birthday ||
    (myUid ? couple?.birthdays?.[myUid] : undefined) ||
    (isCreator ? couple?.partner1Birthday : couple?.partner2Birthday);
    
  const partnerBirthday =
    partnerProfile?.birthday ||
    (partnerUid ? couple?.birthdays?.[partnerUid] : undefined) ||
    couple?.birthdays?.['partner'] ||
    (isCreator ? couple?.partner2Birthday : couple?.partner1Birthday);`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/HomeView.tsx', code);
