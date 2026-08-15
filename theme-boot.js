// Applies the saved theme before first paint, so the page never flashes the wrong
// one. Loaded as a blocking <script src> in <head>: deferring it would reintroduce
// the flash. Lives in a file rather than inline so the CSP can refuse inline script.
try{var t=localStorage.getItem('careerai-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}
