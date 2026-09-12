const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const target = `      await updateCoupleSettings({
        coupleName: coupleName.trim(),
        anniversaryDate,
        anniversaryTime,
        datingStartDate: anniversaryDate,
        datingStartTime: anniversaryTime,
        partner1Birthday: myBirthday,
        partner2Birthday: partnerBirthday,
        birthdays: currentBirthdays,
        relationshipStatus: relationshipStatus as any,
        relationshipStory: relationshipStory.trim(),
        favoriteSong: favoriteSong.trim(),
        theme: selectedTheme,
        pinLock: enablePin && pinCode.trim().length === 4 ? pinCode.trim() : null,
      });`;

const replacement = `      const isCreator = couple?.creatorId === userProfile?.uid;
      
      await updateCoupleSettings({
        coupleName: coupleName.trim(),
        anniversaryDate,
        anniversaryTime,
        datingStartDate: anniversaryDate,
        datingStartTime: anniversaryTime,
        partner1Birthday: isCreator ? myBirthday : partnerBirthday,
        partner2Birthday: isCreator ? partnerBirthday : myBirthday,
        birthdays: currentBirthdays,
        relationshipStatus: relationshipStatus as any,
        relationshipStory: relationshipStory.trim(),
        favoriteSong: favoriteSong.trim(),
        theme: selectedTheme,
        pinLock: enablePin && pinCode.trim().length === 4 ? pinCode.trim() : null,
      });`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/SettingsView.tsx', code);
