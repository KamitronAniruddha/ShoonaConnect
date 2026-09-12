const fs = require('fs');
let code = fs.readFileSync('src/components/games/AdvancedNeverHaveIEver.tsx', 'utf8');

if (!code.includes('useRef')) {
  code = code.replace(/import React, { useState, useEffect } from 'react';/, "import React, { useState, useEffect, useRef } from 'react';");
}

code = code.replace(
  /const \[currentIndex, setCurrentIndex\] = useState\(0\);/,
  `const [currentIndex, setCurrentIndex] = useState(0);
  const questionsRef = useRef(questions);
  useEffect(() => { questionsRef.current = questions; }, [questions]);`
);

code = code.replace(
  /}, \[couple\?\.id, userProfile\?\.uid, questions\]\);/,
  `}, [couple?.id, userProfile?.uid]);`
);

code = code.replace(
  /const idx = questions\.findIndex\(q => q\.id === payload\.questionId\);/,
  `const idx = questionsRef.current.findIndex(q => q.id === payload.questionId);`
);

fs.writeFileSync('src/components/games/AdvancedNeverHaveIEver.tsx', code);
