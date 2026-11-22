// Copy / cut / right-click / text select band (inputs me type aur paste chalta rahe)
const isField = (t) => !!t?.closest?.('input, textarea, select, [contenteditable="true"]');

export function disableCopy(root = document) {
  ['copy', 'cut', 'contextmenu', 'dragstart'].forEach((ev) => root.addEventListener(ev, (e) => e.preventDefault(), true));
  root.addEventListener('selectstart', (e) => { if (!isField(e.target)) e.preventDefault(); }, true);
  root.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && ['c', 'x'].includes(e.key.toLowerCase())) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && !isField(e.target)) e.preventDefault();
  }, true);
}
