const fs = require('fs');
let code = fs.readFileSync('src/components/HomeView.tsx', 'utf8');

const target = `    if (data.myBirthday) {
      await updateUserProfileData({ birthday: data.myBirthday });
      if (myUid) {
        currentBirthdays[myUid] = data.myBirthday;
      }
      updates.partner1Birthday = data.myBirthday;
    }

    if (data.partnerBirthday) {
      if (partnerUid) {
        try {
          await updatePartnerProfileData({ birthday: data.partnerBirthday });
        } catch {
          // ignore if partner profile not initialized yet
        }
        currentBirthdays[partnerUid] = data.partnerBirthday;
      }
      currentBirthdays['partner'] = data.partnerBirthday;
      updates.partner2Birthday = data.partnerBirthday;
    }`;

const replacement = `    // Ensure we correctly map to partner1 / partner2 based on who is creator
    const isCreator = couple?.creatorId === myUid;

    if (data.myBirthday) {
      await updateUserProfileData({ birthday: data.myBirthday });
      if (myUid) {
        currentBirthdays[myUid] = data.myBirthday;
      }
      if (isCreator) {
        updates.partner1Birthday = data.myBirthday;
      } else {
        updates.partner2Birthday = data.myBirthday;
      }
    }

    if (data.partnerBirthday) {
      if (partnerUid) {
        try {
          await updatePartnerProfileData({ birthday: data.partnerBirthday });
        } catch {
          // ignore if partner profile not initialized yet
        }
        currentBirthdays[partnerUid] = data.partnerBirthday;
      } else {
        currentBirthdays['partner'] = data.partnerBirthday;
      }
      
      if (isCreator) {
        updates.partner2Birthday = data.partnerBirthday;
      } else {
        updates.partner1Birthday = data.partnerBirthday;
      }
    }`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/HomeView.tsx', code);
