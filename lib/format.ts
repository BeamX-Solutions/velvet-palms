const tz = 'Africa/Lagos';
export const fmtTime = (d: Date | string) =>
  new Date(d).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz });
export const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz });
export const fmtDateTime = (d: Date | string) =>
  new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: tz });
