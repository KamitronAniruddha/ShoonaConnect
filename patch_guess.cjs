const fs = require('fs');
let code = fs.readFileSync('src/components/games/GuessTheNumberGame.tsx', 'utf8');

const target = `          }

          setGame(receivedGame);
          setIncomingGameInvitation(null);`;

const replacement = `          }

          if (receivedGame.status === 'waiting' && receivedGame.player1Uid !== userProfile?.uid) {
            setIncomingGameInvitation(receivedGame);
            return;
          }

          setGame(receivedGame);
          setIncomingGameInvitation(null);`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/games/GuessTheNumberGame.tsx', code);
