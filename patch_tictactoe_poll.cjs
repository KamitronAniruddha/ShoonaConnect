const fs = require('fs');
let code = fs.readFileSync('src/utils/tictactoeService.ts', 'utf8');

code = code.replace(
  /const channel = createSafeChannel\(\`tictactoe:\$\{coupleId\}\`\)/,
  `const pollInterval = setInterval(fetchGames, 3500); // Fallback if postgres_changes fails
  const channel = createSafeChannel(\`tictactoe:\${coupleId}\`)`
);

code = code.replace(
  /supabase\.removeChannel\(channel\);\n\s*};\n}/,
  `supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
}`
);

fs.writeFileSync('src/utils/tictactoeService.ts', code);
