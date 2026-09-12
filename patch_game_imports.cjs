const fs = require('fs');

function patchFile(file, searchStr, replaceStr) {
    let code = fs.readFileSync(file, 'utf8');
    if (code.includes(searchStr)) {
        code = code.replace(searchStr, replaceStr);
        fs.writeFileSync(file, code);
        console.log(`Patched ${file}`);
    } else {
        console.log(`Could not find search string in ${file}`);
    }
}

patchFile('src/components/games/AdvancedWouldYouRather.tsx', 
    "import { extendedWouldYouRatherData, GameCategory } from '../../data/coupleGamesData';", 
    "import { massiveWouldYouRatherData as extendedWouldYouRatherData, GameCategory } from '../../data/massiveGamesData';");

patchFile('src/components/games/AdvancedNeverHaveIEver.tsx', 
    "import { neverHaveIEverData, GameCategory } from '../../data/coupleGamesData';", 
    "import { massiveNeverHaveIEverData as neverHaveIEverData, GameCategory } from '../../data/massiveGamesData';");

patchFile('src/components/games/AdvancedHowWellDoYouKnow.tsx', 
    "import { GameCategory } from '../../data/coupleGamesData';", 
    "import { massiveHowWellDoYouKnowData, GameCategory } from '../../data/massiveGamesData';");

