const fs = require('fs');

let onboarding = fs.readFileSync('src/components/OnboardingView.tsx', 'utf8');
let settings = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

// In OnboardingView, remove non_binary and prefer_not_to_say
onboarding = onboarding.replace(`                    { id: 'female', label: 'Female', pronoun: 'She/Her', emoji: '👩' },
                    { id: 'male', label: 'Male', pronoun: 'He/Him', emoji: '👨' },
                    { id: 'non_binary', label: 'Non-Binary', pronoun: 'They/Them', emoji: '🌈' },
                    { id: 'prefer_not_to_say', label: 'Private/Other', pronoun: 'Heart', emoji: '✨' },`, 
`                    { id: 'female', label: 'Female', pronoun: 'She/Her', emoji: '👩' },
                    { id: 'male', label: 'Male', pronoun: 'He/Him', emoji: '👨' },`);

// Default state if 'prefer_not_to_say' is found
onboarding = onboarding.replace(`useState<string>(userProfile?.gender || 'prefer_not_to_say');`, `useState<string>(userProfile?.gender && userProfile.gender !== 'prefer_not_to_say' && userProfile.gender !== 'non_binary' ? userProfile.gender : 'female');`);

fs.writeFileSync('src/components/OnboardingView.tsx', onboarding);

settings = settings.replace(`                    { id: 'female', label: 'Female ✨' },
                    { id: 'male', label: 'Male ✨' },
                    { id: 'non_binary', label: 'Non-Binary ✨' },
                    { id: 'prefer_not_to_say', label: 'Private ✨' },`, 
`                    { id: 'female', label: 'Female ✨' },
                    { id: 'male', label: 'Male ✨' },`);

settings = settings.replace(`useState<string>(userProfile?.gender || 'prefer_not_to_say');`, `useState<string>(userProfile?.gender && userProfile.gender !== 'prefer_not_to_say' && userProfile.gender !== 'non_binary' ? userProfile.gender : 'female');`);

fs.writeFileSync('src/components/SettingsView.tsx', settings);

console.log("Patched gender selections in UI");
