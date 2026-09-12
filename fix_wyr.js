const fs = require('fs');
let code = fs.readFileSync('src/components/games/AdvancedWouldYouRather.tsx', 'utf8');

// Add useRef import if missing
if (!code.includes('useRef')) {
  code = code.replace(/import React, { useState, useEffect } from 'react';/, "import React, { useState, useEffect, useRef } from 'react';");
}

// Add refs inside the component
code = code.replace(
  /const \[myVote, setMyVote\] = useState<'a' | 'b' | null>\(null\);/,
  `const [myVote, setMyVote] = useState<'a' | 'b' | null>(null);
  const myVoteRef = useRef(myVote);
  useEffect(() => { myVoteRef.current = myVote; }, [myVote]);
  const questionsRef = useRef(questions);
  useEffect(() => { questionsRef.current = questions; }, [questions]);`
);

// Update useEffect dependencies
code = code.replace(
  /}, \[couple\?\.id, userProfile\?\.uid, myVote, questions\]\);/,
  `}, [couple?.id, userProfile?.uid]);`
);

// Update confetti logic
code = code.replace(
  /if \(myVote && payload\.vote === myVote\) {/,
  `if (myVoteRef.current && payload.vote === myVoteRef.current) {`
);

// Update questions usage inside callback
code = code.replace(
  /const idx = questions\.findIndex\(q => q\.id === payload\.questionId\);/,
  `const idx = questionsRef.current.findIndex(q => q.id === payload.questionId);`
);

fs.writeFileSync('src/components/games/AdvancedWouldYouRather.tsx', code);
