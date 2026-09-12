const fs = require('fs');
let code = fs.readFileSync('src/components/DatesView.tsx', 'utf8');

const target = `    if (couple.partner1Birthday) {
      const p1Id = couple.creatorId;
      const p1Name = partnerNames[p1Id] || 'Partner 1';
      synthesizedDates.push({
        id: 'birthday-p1',
        coupleId: couple.id,
        title: \`\${p1Name}'s Birthday 🎂\`,
        date: couple.partner1Birthday,
        time: '00:00',
        category: 'birthday',
        isRecurring: true,
        reminderDays: 7,
        description: \`Celebrating the birth of the most beautiful soul: \${p1Name}! 🎉\`,
        createdAt: new Date().toISOString()
      });
    }

    if (couple.partner2Birthday) {
      const p2Id = couple.partnerId || keys.find(k => k !== couple.creatorId);
      const p2Name = p2Id ? partnerNames[p2Id] || 'Partner 2' : 'Partner 2';
      synthesizedDates.push({
        id: 'birthday-p2',
        coupleId: couple.id,
        title: \`\${p2Name}'s Birthday 🎂\`,
        date: couple.partner2Birthday,
        time: '00:00',
        category: 'birthday',
        isRecurring: true,
        reminderDays: 7,
        description: \`Celebrating the birth of the most beautiful soul: \${p2Name}! 🎉\`,
        createdAt: new Date().toISOString()
      });
    }`;

const replacement = `    const p1Id = couple.creatorId;
    const p1Birthday = (couple.birthdays && couple.birthdays[p1Id]) || couple.partner1Birthday;
    
    if (p1Birthday) {
      const p1Name = partnerNames[p1Id] || 'Partner 1';
      synthesizedDates.push({
        id: 'birthday-p1',
        coupleId: couple.id,
        title: \`\${p1Name === userProfile?.displayName ? 'My' : p1Name + "'s"} Birthday 🎂\`,
        date: p1Birthday,
        time: '00:00',
        category: 'birthday',
        isRecurring: true,
        reminderDays: 7,
        description: \`Celebrating the birth of the most beautiful soul: \${p1Name}! 🎉\`,
        createdAt: new Date().toISOString()
      });
    }

    const p2Id = couple.partnerId || keys.find(k => k !== couple.creatorId) || 'partner';
    const p2Birthday = (couple.birthdays && couple.birthdays[p2Id]) || couple.partner2Birthday;

    if (p2Birthday) {
      const p2Name = (p2Id !== 'partner' && partnerNames[p2Id]) ? partnerNames[p2Id] : 'Partner';
      synthesizedDates.push({
        id: 'birthday-p2',
        coupleId: couple.id,
        title: \`\${p2Name === userProfile?.displayName ? 'My' : p2Name + "'s"} Birthday 🎂\`,
        date: p2Birthday,
        time: '00:00',
        category: 'birthday',
        isRecurring: true,
        reminderDays: 7,
        description: \`Celebrating the birth of the most beautiful soul: \${p2Name}! 🎉\`,
        createdAt: new Date().toISOString()
      });
    }`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/DatesView.tsx', code);
