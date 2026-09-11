// Utility to generate Google Calendar links and RFC 5545 .ics files

export function generateGoogleCalendarUrl(event: {
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  location?: string;
}): string {
  const dateClean = event.date.replace(/-/g, '');
  const startTime = event.time ? event.time.replace(/:/g, '') + '00' : '090000';
  const endTime = event.time ? event.time.replace(/:/g, '') + '00' : '100000';

  const startIso = `${dateClean}T${startTime}`;
  const endIso = `${dateClean}T${endTime}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startIso}/${endIso}`,
    details: event.description || 'Special couple milestone saved on Private Couple App.',
    location: event.location || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile(event: {
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
}) {
  const dateClean = event.date.replace(/-/g, '');
  const startTime = event.time ? event.time.replace(/:/g, '') + '00' : '090000';
  const endTime = event.time ? event.time.replace(/:/g, '') + '00' : '100000';

  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Private Couple App//Milestones//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${(event.description || 'Couple milestone').replace(/\n/g, '\\n')}`,
    `DTSTART:${dateClean}T${startTime}`,
    `DTEND:${dateClean}T${endTime}`,
    `LOCATION:${event.location || ''}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/\s+/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
