const fs = require('fs');
let code = fs.readFileSync('src/components/PartnerNotificationToasts.tsx', 'utf8');

// Inside game_invitation_declined
code = code.replace(
  /playToastChime\(\);\n\s*const newToast: ToastNotification = {/g,
  `window.dispatchEvent(new CustomEvent('game_invitation_declined', { detail: payload }));
          playToastChime();
          const newToast: ToastNotification = {`
);

// Inside game_invitation_cancelled
code = code.replace(
  /const newToast: ToastNotification = {/g,
  `window.dispatchEvent(new CustomEvent('game_invitation_cancelled', { detail: payload }));
          const newToast: ToastNotification = {`
);

// Just in case, let's also dispatch game_invitation
code = code.replace(
  /playToastChime\(\);\n\s*const newToast: ToastNotification = \{\n\s*id: 'invite_' \+ Date\.now\(\),/g,
  `window.dispatchEvent(new CustomEvent('game_invitation', { detail: payload }));
          playToastChime();
          const newToast: ToastNotification = {
            id: 'invite_' + Date.now(),`
);

fs.writeFileSync('src/components/PartnerNotificationToasts.tsx', code);
