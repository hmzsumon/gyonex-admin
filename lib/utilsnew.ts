export const cn = (...classes: (string|undefined|null|false)[]) => classes.filter(Boolean).join(' ');
export const formatUSD  = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
export const formatNum  = (v: number) => v.toLocaleString('en-US');
export const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
export const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
