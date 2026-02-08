include("themes/bypassPSN.js");
// All theme folders
var themes = ["default", "psfree"];
// put them in localStorage
localStorage.setItem("themes", JSON.stringify(themes));

// Load theme index from localStorage, default to 0
var themeIndex = parseInt(localStorage.getItem("theme"));
if (isNaN(themeIndex) || themeIndex < 0 || themeIndex >= themes.length) {
    themeIndex = 0;
}

var themeName = themes[themeIndex];

// main.js is required for each theme as a main file.
// Files should be on ps4 /mnt/sandbox/CUSA00960_000/download0
include("themes/" + themeName + "/main.js");
