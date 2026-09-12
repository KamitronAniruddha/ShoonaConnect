const fs = require('fs');
let code = fs.readFileSync('src/utils/numberGuessingService.ts', 'utf8');

code = code.replace(`  status: 'in_progress' | 'completed';`, `  status: 'waiting' | 'in_progress' | 'completed';`);
// Need to also allow player1Uid and player2Uid that are referenced in the UI.
code = code.replace(`  currentTurnPlayerName: string;
  status:`, `  currentTurnPlayerName: string;
  player1Uid?: string;
  player2Uid?: string;
  status:`);

fs.writeFileSync('src/utils/numberGuessingService.ts', code);
