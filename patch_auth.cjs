const fs = require('fs');
let code = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

const targetJoin = `    if (coupleData.creatorId === currentUser.uid) {
      throw new Error('You cannot request to join your own space.');
    }

    const now = new Date().toISOString();`;

const replacementJoin = `    if (coupleData.creatorId === currentUser.uid) {
      throw new Error('You cannot request to join your own space.');
    }

    // Gender/Couple Validation Logic
    const { data: creatorProfileSnap } = await supabase
      .from('profiles')
      .select('gender')
      .eq('id', coupleData.creatorId)
      .maybeSingle();
      
    const creatorGender = creatorProfileSnap?.gender;
    const myGender = profileOverride?.gender || userProfile.gender;
    
    if (creatorGender === 'male' && myGender === 'male') {
      throw new Error('This website is for couples.');
    }
    if (creatorGender === 'female' && myGender === 'female') {
      // User requirement: "If both are female, show Lesbian and delete data"
      await supabase.from('profiles').delete().eq('id', currentUser.uid);
      await supabase.auth.signOut();
      throw new Error('Lesbian (Your data has been deleted per validation rules)');
    }

    const now = new Date().toISOString();`;

if (code.includes(targetJoin)) {
    code = code.replace(targetJoin, replacementJoin);
    fs.writeFileSync('src/context/AuthContext.tsx', code);
    console.log("Patched AuthContext join logic");
} else {
    console.log("Could not find join logic");
}

