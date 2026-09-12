const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');

const replacement = `export function sendRealtimeBroadcast(channelName: string, event: string, payload: any): void {
  try {
    const existing = supabase.getChannels().find(
      (c) => c.topic === \`realtime:\${channelName}\` || c.topic === channelName
    );

    if (existing && existing.state === 'joined') {
      existing.send({
        type: 'broadcast',
        event,
        payload,
      });
      return;
    }

    const channel = supabase.channel(channelName);
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event,
          payload,
        });
        
        setTimeout(() => {
          try {
            supabase.removeChannel(channel);
          } catch {}
        }, 1000);
      }
    });
  } catch {
    // Quiet catch
  }
}`;

code = code.replace(/export function sendRealtimeBroadcast[\s\S]*?}\n}/, replacement);
fs.writeFileSync('src/lib/supabase.ts', code);
