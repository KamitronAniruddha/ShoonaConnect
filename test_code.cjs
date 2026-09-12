const fs = require('fs');
let code = fs.readFileSync('src/components/HomeView.tsx', 'utf8');

// I want to see how partner1Birthday and partner2Birthday are assigned, or how the ID mapping works
console.log(code.match(/handleSaveBirthdays[\s\S]{0,1000}/)[0]);
