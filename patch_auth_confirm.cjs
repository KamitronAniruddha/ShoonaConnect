const fs = require('fs');
let code = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

const targetConfirm = `    if (coupleData.userIds.length >= 2) {
      throw new Error('This couple space is already full.');
    }

    const now = new Date().toISOString();`;

const replacementConfirm = `    if (coupleData.userIds.length >= 2) {
      throw new Error('This couple space is already full.');
    }

    // Gender/Couple Validation Logic
    const { data: creatorProfileSnap } = await supabase
      .from('profiles')
      .select('gender')
      .eq('id', coupleData.creatorId)
      .maybeSingle();
      
    const creatorGender = creatorProfileSnap?.gender;
    const myGender = userProfile.gender;
    
    if (creatorGender === 'male' && myGender === 'male') {
      throw new Error('This website is for couples.');
    }
    if (creatorGender === 'female' && myGender === 'female') {
      await supabase.from('profiles').delete().eq('id', currentUser.uid);
      await supabase.auth.signOut();
      throw new Error('Lesbian');
    }

    const now = new Date().toISOString();`;

if (code.includes(targetConfirm)) {
    code = code.replace(targetConfirm, replacementConfirm);
    fs.writeFileSync('src/context/AuthContext.tsx', code);
    console.log("Patched confirmPairCouple");
} else {
    console.log("Could not find confirm logic");
}

