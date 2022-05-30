# ca2hs
Custom Add to Home Screen

## Usage

var js = typeof(ca2h_script) === "undefined" ? document.createElement("script") : ca2h_script;
js.src = "https://cdn.jsdelivr.net/gh/casasoftware/ca2hs@latest/src/core.js";
js.setAttribute("async", "");
js.onload = console.log;
js.onerror = console.error;
document.head.appendChild(js);


var e="undefined"==typeof ca2h_script?document.createElement("script"):ca2h_script;e.src="https://cdn.jsdelivr.net/gh/casasoftware/ca2hs@latest/src/core.js",e.setAttribute("async",""),e.onload=console.log,e.onerror=console.error,document.head.appendChild(e);
