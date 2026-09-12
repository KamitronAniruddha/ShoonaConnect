const fs = require('fs');
let code = fs.readFileSync('src/components/CoupleGamesView.tsx', 'utf8');

// Remove the wrongly placed imports
code = code.replace(/import { AdvancedWouldYouRather } from "\.\/games\/AdvancedWouldYouRather";\n/g, '');
code = code.replace(/import { AdvancedNeverHaveIEver } from "\.\/games\/AdvancedNeverHaveIEver";\n/g, '');
code = code.replace(/import { AdvancedHowWellDoYouKnow } from "\.\/games\/AdvancedHowWellDoYouKnow";\n/g, '');

// Prepend them to the top
const correctImports = `import { AdvancedWouldYouRather } from "./games/AdvancedWouldYouRather";
import { AdvancedNeverHaveIEver } from "./games/AdvancedNeverHaveIEver";
import { AdvancedHowWellDoYouKnow } from "./games/AdvancedHowWellDoYouKnow";\n`;

fs.writeFileSync('src/components/CoupleGamesView.tsx', correctImports + code);
