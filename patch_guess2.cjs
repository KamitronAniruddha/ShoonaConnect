const fs = require('fs');
let code = fs.readFileSync('src/components/games/GuessTheNumberGame.tsx', 'utf8');

const target = `          // If broadcast received from partner or update happens, close waiting modal
          if (receivedGame.player1Uid !== userProfile?.uid) {
             setIsWaitingForPartner(false);
          }`;

const replacement = `          // If broadcast received from partner or update happens, close waiting modal
          if (receivedGame.player1Uid !== userProfile?.uid || receivedGame.status !== 'waiting') {
             setIsWaitingForPartner(false);
          }`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/games/GuessTheNumberGame.tsx', code);
