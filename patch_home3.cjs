const fs = require('fs');
let code = fs.readFileSync('src/components/HomeView.tsx', 'utf8');

const target = `  const isCreator = couple?.creatorId === myUid;
  
  const myBirthday =
    userProfile?.birthday ||
    (myUid ? couple?.birthdays?.[myUid] : undefined) ||
    (isCreator ? couple?.partner1Birthday : couple?.partner2Birthday);
    
  const partnerBirthday =
    partnerProfile?.birthday ||
    (partnerUid ? couple?.birthdays?.[partnerUid] : undefined) ||
    couple?.birthdays?.['partner'] ||
    (isCreator ? couple?.partner2Birthday : couple?.partner1Birthday);`;

// Verify if it is present
if (code.includes(target)) {
    console.log("Read patch applied successfully.");
} else {
    console.log("Read patch NOT found!");
}

