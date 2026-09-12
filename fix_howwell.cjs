const fs = require('fs');
let code = fs.readFileSync('src/components/games/AdvancedHowWellDoYouKnow.tsx', 'utf8');

if (!code.includes('useRef')) {
  code = code.replace(/import React, { useState, useEffect } from 'react';/, "import React, { useState, useEffect, useRef } from 'react';");
}

code = code.replace(
  /const \[myGuess, setMyGuess\] = useState\(''\); \/\/ what I guess about partner/,
  `const [myGuess, setMyGuess] = useState(''); // what I guess about partner
  const questionsRef = useRef(questions);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  const myAnswerRef = useRef(myAnswer);
  useEffect(() => { myAnswerRef.current = myAnswer; }, [myAnswer]);
  const myGuessRef = useRef(myGuess);
  useEffect(() => { myGuessRef.current = myGuess; }, [myGuess]);`
);

code = code.replace(
  /}, \[couple\?\.id, userProfile\?\.uid, questions, myAnswer, myGuess\]\);/,
  `}, [couple?.id, userProfile?.uid]);`
);

code = code.replace(
  /checkReveal\(payload\.answer, myGuess\);/,
  `checkReveal(payload.answer, myGuessRef.current);`
);

code = code.replace(
  /checkReveal\(myAnswer, payload\.guess\);/,
  `checkReveal(myAnswerRef.current, payload.guess);`
);

code = code.replace(
  /const idx = questions\.findIndex\(q => q\.id === payload\.questionId\);/,
  `const idx = questionsRef.current.findIndex(q => q.id === payload.questionId);`
);

fs.writeFileSync('src/components/games/AdvancedHowWellDoYouKnow.tsx', code);
