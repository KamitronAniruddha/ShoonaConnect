const fs = require('fs');
let code = fs.readFileSync('src/utils/useSaathiAchievementsData.ts', 'utf8');

const target = `    const hasBothBirthdays = Boolean(
      (userProfile?.birthday || couple.partner1Birthday || couple.birthdays?.[userProfile?.uid || '']) &&
      (partnerProfile?.birthday || couple.partner2Birthday || couple.birthdays?.['partner'])
    )`;

const replacement = `    const isCreator = couple.creatorId === userProfile?.uid;
    const myBirthdayStr = userProfile?.birthday || couple.birthdays?.[userProfile?.uid || ''] || (isCreator ? couple.partner1Birthday : couple.partner2Birthday);
    const partnerBirthdayStr = partnerProfile?.birthday || couple.birthdays?.['partner'] || couple.birthdays?.[partnerProfile?.uid || ''] || (isCreator ? couple.partner2Birthday : couple.partner1Birthday);
    
    const hasBothBirthdays = Boolean(myBirthdayStr && partnerBirthdayStr);`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/utils/useSaathiAchievementsData.ts', code);
    console.log("Patched achievements successfully");
} else {
    console.log("Could not find exact match for achievements");
}
