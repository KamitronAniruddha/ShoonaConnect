const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const target = `  const [myBirthday, setMyBirthday] = useState(
    userProfile?.birthday ||
    (userProfile?.uid ? couple?.birthdays?.[userProfile.uid] : '') ||
    couple?.partner1Birthday ||
    ''
  );
  const [partnerBirthday, setPartnerBirthday] = useState(
    partnerProfile?.birthday ||
    (partnerProfile?.uid ? couple?.birthdays?.[partnerProfile.uid] : '') ||
    couple?.birthdays?.['partner'] ||
    couple?.partner2Birthday ||
    ''
  );`;

const replacement = `  const isCreatorInitial = couple?.creatorId === userProfile?.uid;
  const [myBirthday, setMyBirthday] = useState(
    userProfile?.birthday ||
    (userProfile?.uid ? couple?.birthdays?.[userProfile.uid] : '') ||
    (isCreatorInitial ? couple?.partner1Birthday : couple?.partner2Birthday) ||
    ''
  );
  const [partnerBirthday, setPartnerBirthday] = useState(
    partnerProfile?.birthday ||
    (partnerProfile?.uid ? couple?.birthdays?.[partnerProfile.uid] : '') ||
    couple?.birthdays?.['partner'] ||
    (isCreatorInitial ? couple?.partner2Birthday : couple?.partner1Birthday) ||
    ''
  );`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/SettingsView.tsx', code);
    console.log("Patched successfully");
} else {
    // maybe it doesn't have couple?.birthdays?.['partner'] ? Let's check exactly what's there
    console.log("Could not find exact match for SettingsView read");
}
