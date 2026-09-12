const fs = require('fs');
let code = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

const targetApprove = `    const requesterName =
      coupleData.pendingJoinRequest.requesterNickname ||
      coupleData.pendingJoinRequest.requesterName ||
      'Soulmate';`;

const replacementApprove = `    // Gender/Couple Validation Logic
    const { data: requesterProfileSnap } = await supabase
      .from('profiles')
      .select('gender')
      .eq('id', requesterId)
      .maybeSingle();
      
    const requesterGender = requesterProfileSnap?.gender;
    const hostGender = userProfile.gender;
    
    if (hostGender === 'male' && requesterGender === 'male') {
      throw new Error('This website is for couples.');
    }
    if (hostGender === 'female' && requesterGender === 'female') {
      throw new Error('Lesbian');
    }

    const requesterName =
      coupleData.pendingJoinRequest.requesterNickname ||
      coupleData.pendingJoinRequest.requesterName ||
      'Soulmate';`;

if (code.includes(targetApprove)) {
    code = code.replace(targetApprove, replacementApprove);
    fs.writeFileSync('src/context/AuthContext.tsx', code);
    console.log("Patched approveJoinRequest");
} else {
    console.log("Could not find approve logic");
}
