const fs = require('fs');

function makeStrict(file) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Replace the simple male/male female/female checks with strict male/female pairing
    code = code.replace(`    if (creatorGender === 'male' && myGender === 'male') {
      throw new Error('This website is for couples.');
    }
    if (creatorGender === 'female' && myGender === 'female') {
      await supabase.from('profiles').delete().eq('id', currentUser.uid);
      await supabase.auth.signOut();
      throw new Error('Lesbian');
    }`, 
    `    const isSameGenderMale = creatorGender === 'male' && myGender === 'male';
    const isSameGenderFemale = creatorGender === 'female' && myGender === 'female';
    const isStrictHetero = (creatorGender === 'male' && myGender === 'female') || (creatorGender === 'female' && myGender === 'male');
    
    if (isSameGenderMale) {
      throw new Error('This website is for couples.');
    }
    if (isSameGenderFemale) {
      await supabase.from('profiles').delete().eq('id', currentUser.uid);
      await supabase.auth.signOut();
      throw new Error('Lesbian');
    }
    if (!isStrictHetero) {
      throw new Error('This website is restricted to one male and one female couple configurations.');
    }`);
    
    // For approve Join Request
    code = code.replace(`    if (hostGender === 'male' && requesterGender === 'male') {
      throw new Error('This website is for couples.');
    }
    if (hostGender === 'female' && requesterGender === 'female') {
      throw new Error('Lesbian');
    }`, 
    `    const isSameGenderMale = hostGender === 'male' && requesterGender === 'male';
    const isSameGenderFemale = hostGender === 'female' && requesterGender === 'female';
    const isStrictHetero = (hostGender === 'male' && requesterGender === 'female') || (hostGender === 'female' && requesterGender === 'male');
    
    if (isSameGenderMale) {
      throw new Error('This website is for couples.');
    }
    if (isSameGenderFemale) {
      throw new Error('Lesbian');
    }
    if (!isStrictHetero) {
      throw new Error('This website is restricted to one male and one female couple configurations.');
    }`);
    
    fs.writeFileSync(file, code);
}

makeStrict('src/context/AuthContext.tsx');
console.log("Made AuthContext logic strict hetero");
