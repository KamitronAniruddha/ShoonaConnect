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

patchFile('src/components/games/AdvancedNeverHaveIEver.tsx', 
    "import { extendedNeverHaveIEverData, GameCategory, QuestionDef } from '../../data/coupleGamesData';", 
    "import { massiveNeverHaveIEverData as extendedNeverHaveIEverData, GameCategory, QuestionDef } from '../../data/massiveGamesData';");

patchFile('src/components/games/AdvancedHowWellDoYouKnow.tsx', 
    "import { extendedHowWellDoYouKnowMeData, GameCategory } from '../../data/coupleGamesData';", 
    "import { massiveHowWellDoYouKnowData as extendedHowWellDoYouKnowMeData, GameCategory } from '../../data/massiveGamesData';");

