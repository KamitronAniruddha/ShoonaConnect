const fs = require('fs');
let code = fs.readFileSync('src/utils/numberGuessingService.ts', 'utf8');

code = code.replace(`  player1Uid?: string;
  player2Uid?: string;
  status: 'waiting' | 'in_progress' | 'completed';`, `  status: 'waiting' | 'in_progress' | 'completed';`);

fs.writeFileSync('src/utils/numberGuessingService.ts', code);
