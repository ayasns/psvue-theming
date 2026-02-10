// PSN bypass or use np payload by earthonion
// include('../download0/themes/bypassPSN.js');

// Send log to log_server.py
function log(msg) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://s3.amazonaws.com/_log", true);
    xhr.send(msg);
}
// Clear all elements
jsmaf.root.children.length = 0;

function restartVue() {
    try {
        debugging.restart();
    } catch (e) { log(e) }
}

try {

    // ============================================================================
    // Global variables
    // ============================================================================
    var download0 = "file:///../download0/";
    var assets = "file:////assets/img/"
    var background = "themes/default/imgs/background.png";
    var pslogo = "themes/default/imgs/ps-logo.png";
    var goldhenLogo = "themes/default/imgs/goldhen.png";
    var ps4henLogo = "themes/default/imgs/ps4hen.png";
    var themes = JSON.parse(localStorage.getItem("themes")) || ["default"];

    var currentScene = 0;       // Current displayed scene
    var screenWidth = 1920;
    var henFlavor = localStorage.getItem('defaultHen') || 0;
    var autoLoadTimer = 3;      // Countdown timer

    // Settings Object
    var Settings = {
        Southbridge: parseInt(localStorage.getItem('Southbridge')) || 0,
        ps4Type: parseInt(localStorage.getItem('ps4Type')) || 0,
        sliderType: parseInt(localStorage.getItem('sliderType')) >= 0 ? parseInt(localStorage.getItem('sliderType')) : 1,
        theme: parseInt(localStorage.getItem('theme')) || 0,
    };
    // Possition to start displaying menu items
    var menuY = 250;
    var menuX = 90;

    /**
     * Displays an Image using jsmaf.Image()
     * @param {int} x - X coordinate to display.
     * @param {int} y - Y coordinate to display.
     * @param {int} width - Image's width.
     * @param {int} height - Image's height.
     * @param {bool} push - Weather to push it directly to jsmaf or return an Object.
     * @param {string} src - Image source.
     */
    function displayImage(x, y, width, height, push, src) {
        var image = new jsmaf.Image();
        image.src = src;
        image.x = x;
        image.y = y;
        image.width = width;
        image.height = height;
        if (push) {
            jsmaf.root.children.push(image);
        } else return image;
    }
    /**
     * 
     * @param {string} str The text to display.
     * @param {int} x X coordinates.
     * @param {int} y Y coordinates.
     * @param {int} width Text's width.
     * @param {int} height Text's height.
     * @param {string} style a string from a jsmaf.Style().
     * @param {string} background background color in rgba format.
     * @param {bool} visibility visible?
     * @param {object} object optional, a container to put the text element in.
     */
    function displayText(str, x, y, width, height, style, background, visibility, push) {
        var t = new jsmaf.Text();

        t.width = width;
        t.height = height;
        t.x = x;
        t.y = y;

        t.text = str || "(empty)";
        t.style = style || 'white';
        t.background = background || 'rgba(0,0,0,0)';
        t.visible = (visibility !== undefined) ? visibility : true;

        // Push directly to jsmaf if needed
        if (push) {
            jsmaf.root.children.push(t);
        }

        return t;
    }
    // Create styles
    new Style({ name: 'white', color: 'white' });
    new Style({ name: 'title', color: 'white' });
    new Style({ name: 'heading', color: 'white' });
    new Style({ name: 'body', color: 'white' });
    new Style({ name: 'bodyDim', color: 'rgba(255, 255, 255, 0.6)' });
    new Style({ name: 'wheat', color: 'rgba(255, 255, 255, 0.4)' });

    // ============================================================================
    // Layout Manager for persistent UI
    // ============================================================================
    var Layout = {
        elements: [],
        header: {
            titleObj: null,
            subtitleObj: null,
            logoObj: null,
            tabs: [],
        },
        footer: {
            bgObj: null,
            hints: [] // Array of { buttonObj, labelObj }
        },
        backgroundObj: null,

        init: function () {
            this.elements = [];

            // 1. Background first to keep it behind everything
            this.backgroundObj = displayImage(0, 0, 1920, 1080, false, download0 + background);
            this.elements.push(this.backgroundObj);

            // 2. Header
            this.header.logoObj = displayImage(80, 30, 60, 60, false, download0 + pslogo);
            this.header.titleObj = displayText("", 150, 50, 800, 60, 'title', 'rgba(0,0,0,0)', true, false);
            this.header.subtitleObj = displayText("", 1840 - 200, 50, 280, 40, 'wheat', 'rgba(0,0,0,0)', true, false);
            this.elements.push(this.header.logoObj, this.header.titleObj, this.header.subtitleObj);
            // We could also add footer here
        },

        setTitle: function (text) {
            if (this.header.titleObj) this.header.titleObj.text = text;
        },

        setSubtitle: function (text) {
            if (this.header.subtitleObj) this.header.subtitleObj.text = text;
        },

        setHeaderTabs: function (tabs) {
            this.header.tabs = [];

            // Calculate dynamic widths for each tab
            var tabWidths = [];
            var totalWidth = 0;
            var iconWidth = 50; // L2/R2 icon width
            var tabSpacing = 40; // Space between tabs

            for (var i = 0; i < tabs.length; i++) {
                // Calculate width based on text length
                var estWidth = (tabs[i].length * 15) + 40; // 15px per char + padding
                tabWidths.push(estWidth);
                totalWidth += estWidth;
            }

            // Add spacing between tabs and icons
            totalWidth += (tabs.length - 1) * tabSpacing + iconWidth;

            // Calculate startX position to center everything
            var startX = (screenWidth - totalWidth) / 2;

            // Add L2 icon on the left
            var l2 = displayImage(startX - tabSpacing - iconWidth, 45, 50, 40, false, assets + "icon_ltwo.png");
            this.header.tabs.push(l2);

            // Position for first tab
            var tabsX = startX + iconWidth;

            // Create tabs with calculated widths
            for (var i = 0; i < tabs.length; i++) {
                var h = tabs[i];
                var btn = displayText(h, tabsX, 50, tabWidths[i], 40, 'wheat', undefined, true, false);
                this.header.tabs.push(btn);
                tabsX += tabWidths[i] + tabSpacing;
            }

            // Add R2 icon on the right
            var r2 = displayImage(tabsX - tabSpacing, 45, 45, 40, false, assets + "icon_rtwo.png");
            this.header.tabs.push(r2);
        },

        setFooter: function (hintData) {
            this.footer.hints = [];
            var startX = 80;

            for (var i = 0; i < hintData.length; i++) {
                var h = hintData[i];
                var btn = displayImage(startX, 1023, 40, 40, false, assets + h.button);

                var estWidth = (h.label.length * 15) + 20;
                var lbl = displayText(h.label, startX + 50, 1030, estWidth, 35, 'bodyDim', undefined, true, false);

                this.footer.hints.push(btn, lbl);

                // Dynamic spacing: Start + ButtonWidth(50) + LabelWidth + Padding(40)
                startX += 50 + estWidth + 40;
            }
        },

        // Collects all persistent elements to be added to the scene
        getElements: function () {
            var all = this.elements.slice(); // Copy base
            // Add footer elements
            for (var i = 0; i < this.footer.hints.length; i++) {
                all.push(this.footer.hints[i]);
            }
            // Add tab items
            for (var i = 0; i < this.header.tabs.length; i++) {
                // Color the current scene white.
                if (i === currentScene + 1) { // Plus 1 because of L2 Button
                    this.header.tabs[i].style = "white";
                } else {
                    this.header.tabs[i].style = "wheat";
                }
                all.push(this.header.tabs[i]);
            }
            return all;
        }
    };

    // ============================================================================
    // Scene Management
    // ============================================================================

    var Scene = {
        sceneList: ["Main Menu", "Settings Menu"],  // Add the scenes here for header tabs. currentScene++/-- to switch scenes.
        lastId: -1,             // Used to to either rebuild the scene or update it (Makes it snappy).

        // Main Menu scene items
        mainMenu: {
            init: false,
            mainMenuIndex: 0,   // Current menu selection
            goldHen: null,      // GoldHen image object
            ps4Hen: null,       // PS4Hen image object
            // I preload goldhen and ps4hen logos for seamless switching between the two, otherwise you'll get black backgorund flicker.
            timer: null,        // Timer object
            menuObjects: [],    // Container for menu item objects (Visual view)
            items: [            // Menu items (Data)
                { text: "Load The Jailbreak" },
                { text: "Linux Payloads" },
                { text: "FTP" },
                { text: "BinLoader" },
                { text: "Other Payloads" },
                { text: "Settings" },
            ]
        },

        // Settings Menu scene items
        settingsMenu: {
            init: false,
            settingsMenuIndex: 0,
            menuObjects: [],
            // selected: LocalStorage value, else 0.
            // localstorage: LocalStorage key for future use.
            items: [
                { text: "Southbridge", options: ["Aeolia", "Belize", "Baikal"], selected: Settings.Southbridge, localstorage: "Southbridge" },
                { text: "PS4 Type", options: ["FAT", "Slim", "Pro"], selected: Settings.ps4Type, localstorage: "ps4Type" },
                { text: "Slider Type", options: ["None", "Side", "Bottom"], selected: Settings.sliderType, localstorage: "sliderType" },
                { text: "Theme", options: themes, selected: Settings.theme, localstorage: "theme" },
            ]
        },
    };

    // Initialize Layout once
    Layout.init();
    Layout.setTitle("VUE2");
    Layout.setSubtitle("Second theme");
    // Place for 15 Characters in header, any higher will line break.
    Layout.setHeaderTabs(Scene.sceneList);
    Layout.setFooter([
        { button: "icon_cross.png", label: "Select" },
        { button: "icon_circle.png", label: "Back" },
        { button: "icon_rone.png", label: "Change HEN" },
        { button: "icon_triangle.png", label: "Run HEN" },
        { button: "icon_rthree.png", label: "Restart (Save)" },
    ]);

    // ============================================================================
    // MAIN MENU SCENE
    // ============================================================================
    function initMainMenu() {
        // Create elements once

        // Logos
        Scene.mainMenu.goldHen = displayImage(1370, 360, 300, 300, false, download0 + goldhenLogo);
        Scene.mainMenu.ps4Hen = displayImage(1370 - 10, 360 - 20, 350, 350, false, download0 + ps4henLogo);

        Scene.mainMenu.timer = displayText("", 50, 950, 400, 40, 'heading', undefined, true, false);

        // Clear Menu Items
        Scene.mainMenu.menuObjects = [];

        // Loop through the items and display the list
        for (var i = 0; i < Scene.mainMenu.items.length; i++) {
            var itemY = menuY + (i * 70);

            // ===================
            // Types of indicators
            // ===================
            // 1. Indicator (Left border)
            // Change header tab mainMenu to white

            var indicator = displayText("|", menuX, itemY - 7, 6, 70, 'white', undefined, true, false);

            // 2. Item Text
            var itemText = displayText(Scene.mainMenu.items[i].text, menuX + 24, itemY + 20, 650, 40, 'body', undefined, true, false);

            // 3. Underline (hidden)
            var underline = displayText("__", menuX + 24, itemY + 35, 650, 3, 'white', undefined, false, false);

            // Store as a group/structure to update easily
            Scene.mainMenu.menuObjects.push({
                indicator: indicator,
                text: itemText,
                underline: underline
            });
        }
    }

    function updateMainMenu() {
        // 1. Update Menu Selection for all menuObjects
        for (var i = 0; i < Scene.mainMenu.menuObjects.length; i++) {
            var obj = Scene.mainMenu.menuObjects[i];
            // If pointer is at this index, show the indicator/underline + white color instead of wheat
            var isSelected = (i === Scene.mainMenu.mainMenuIndex);

            // Decide which indicator to show based on slider type
            // 0. None
            // 1. Indicator (Custom Left border)
            // 2. Underline (Custom Bottom border)
            obj.indicator.visible = isSelected && Settings.sliderType == 1;
            obj.underline.visible = isSelected && Settings.sliderType == 2;

            if (isSelected) {
                // obj.text.background = "rgba(0, 150, 255, 0.3)";  // If you wish to add a background, uncomment this.
                obj.text.style = "white"
            } else {
                // obj.text.background = "rgba(0, 0, 0, 0)";
                obj.text.style = "wheat"
            }
        }

        // 2. HEN switcher Visibility (I preload both images to keep it smooth, just change visibility)
        Scene.mainMenu.goldHen.visible = (henFlavor == 0);
        Scene.mainMenu.ps4Hen.visible = (henFlavor == 1);

        // 3. Update Timer
        if (autoLoadTimer !== null && autoLoadTimer >= 0) {
            Scene.mainMenu.timer.text = "Auto-jailbreak in: " + autoLoadTimer;
            Scene.mainMenu.timer.visible = true;
        } else {
            Scene.mainMenu.timer.visible = false;
        }
    }

    function initSettingsMenu() {
        // Menu Items for one time loading
        Scene.settingsMenu.menuObjects = []; // Clear current

        // Loop through the items and display the list
        for (var i = 0; i < Scene.settingsMenu.items.length; i++) {
            var itemY = menuY + (i * 70);
            // ===================
            // Types of indicators
            // ===================
            // TODO: Another style
            // 1. Indicator (Left border)
            var indicator = displayText("|", menuX, itemY - 7, 6, 70, 'white', undefined, true, false);

            // 2. Item Text
            var itemText = displayText(Scene.settingsMenu.items[i].text, menuX + 24, itemY + 20, 650, 40, 'body', undefined, true, false);

            // 3. Underline
            var underline = displayText("__", menuX + 24, itemY + 35, 650, 3, 'white', undefined, true, false);

            // Store as a group/structure to update easily
            Scene.settingsMenu.menuObjects.push({
                indicator: indicator,
                text: itemText,
                underline: underline
            });
        }
    }

    function updateSettingsMenu() {
        // 1. Update Menu Selection
        for (var i = 0; i < Scene.settingsMenu.menuObjects.length; i++) {
            var obj = Scene.settingsMenu.menuObjects[i];
            var isSelected = (i === Scene.settingsMenu.settingsMenuIndex);

            obj.indicator.visible = isSelected && Settings.sliderType == 1;
            obj.underline.visible = isSelected && Settings.sliderType == 2;

            // Update text for options
            var item = Scene.settingsMenu.items[i];
            if (item.options) {
                var opt = item.options[item.selected];
                // one more space if isSelected to make it move to the right
                if (isSelected) {
                    obj.text.text = item.text + ":  " + opt; // Additional space for UX :)
                    obj.text.style = "white";
                } else {
                    obj.text.text = item.text + ": " + opt;
                    obj.text.style = "wheat";
                }
            } else {
                obj.text.text = item.text;
                obj.text.style = isSelected ? "white" : "wheat";
            }

            // Changing the background or adding border is also possible instead of using the indicator.
        }
    }

    // Rest of function each has init and update + scene name

    function render() {
        var rebuildScene = (currentScene !== Scene.lastId);

        if (rebuildScene) {
            // Collect all elements for the new frame
            // On first run or scene switch, we reconstruct the display list
            var displayList = Layout.getElements();

            // Scenes based compared to Scene.sceneList
            switch (currentScene) {
                // if scene is main menu
                case 0:
                    if (!Scene.mainMenu.init) {
                        initMainMenu(); // Create objects if not exists
                        Scene.mainMenu.init = true;
                    }
                    displayList.push(Scene.mainMenu.goldHen, Scene.mainMenu.ps4Hen, Scene.mainMenu.timer);

                    // Add Menu Items
                    if (Scene.mainMenu.menuObjects) {
                        for (var i = 0; i < Scene.mainMenu.menuObjects.length; i++) {
                            displayList.push(Scene.mainMenu.menuObjects[i].indicator);
                            displayList.push(Scene.mainMenu.menuObjects[i].text);
                            displayList.push(Scene.mainMenu.menuObjects[i].underline);
                        }
                    }
                    break;
                // if scene is settings menu
                case 1:
                    if (!Scene.settingsMenu.init) {
                        initSettingsMenu(); // Create objects if not exists
                        Scene.settingsMenu.init = true;
                    }

                    // Add Menu Items
                    if (Scene.settingsMenu.menuObjects) {
                        for (var i = 0; i < Scene.settingsMenu.menuObjects.length; i++) {
                            displayList.push(Scene.settingsMenu.menuObjects[i].indicator);
                            displayList.push(Scene.settingsMenu.menuObjects[i].text);
                            displayList.push(Scene.settingsMenu.menuObjects[i].underline);
                            // or in one line by adding commas
                        }
                    }
                    break;
            }
            // Push everything to jsmaf to display
            jsmaf.root.children = displayList;
            // update Scene last id for future scene updates/reconstruction
            Scene.lastId = currentScene;
        }

        // Per-frame updates
        if (currentScene === 0) {
            updateMainMenu();
        }
        if (currentScene === 1) {
            updateSettingsMenu();
        }
    }

    // Initial render
    render();


    // ============================================================================
    // INPUT HANDLING
    // ============================================================================

    jsmaf.onkeydown = function (keyCode) {
        log("Key: " + keyCode + " in scene: " + currentScene);

        // Main Menu Navigation
        if (currentScene === 0) {
            switch (keyCode) {
                case 4: // Up
                    if (Scene.mainMenu.mainMenuIndex > 0) {
                        Scene.mainMenu.mainMenuIndex--;
                        updateMainMenu(); // Update visual selection instantly
                    } else {
                        Scene.mainMenu.mainMenuIndex = Scene.mainMenu.items.length - 1; // -1 because array is 0-indexed
                        updateMainMenu();
                    }
                    break;
                case 6: // Down
                    if (Scene.mainMenu.mainMenuIndex < Scene.mainMenu.items.length - 1) {
                        Scene.mainMenu.mainMenuIndex++;
                        updateMainMenu();
                    } else {
                        Scene.mainMenu.mainMenuIndex = 0;
                        updateMainMenu();
                    }
                    break;

                case 11:  // R1
                    henFlavor = henFlavor == 1 ? 0 : 1;
                    // Save choice
                    localStorage.setItem('defaultHen', henFlavor);
                    log("HEN updated to " + henFlavor);
                    render();
                    break;

                case 13:  // Circle
                    try {
                        clearInterval(circleTimeout);
                        autoLoadTimer = null; // Hide timer
                        render();
                        log("Timer cancelled");
                    } catch (error) {
                        alert(error);
                    }
                    break;
                case 14:  // X
                    if (Scene.mainMenu.mainMenuIndex == 5) {
                        // Settings
                        currentScene = 1; // Switch to settings
                        render();
                    }
                    break;
            }
        }
        // SETTINGS MENU INPUT
        else if (currentScene === 1) {
            var settingsMenuIndex = Scene.settingsMenu.settingsMenuIndex;

            var sItem = Scene.settingsMenu.items[settingsMenuIndex];

            switch (keyCode) {
                case 4: // UP
                    if (Scene.settingsMenu.settingsMenuIndex > 0) {
                        Scene.settingsMenu.settingsMenuIndex--;
                        updateSettingsMenu();
                    }
                    break;
                case 6: // DOWN
                    if (Scene.settingsMenu.settingsMenuIndex < Scene.settingsMenu.items.length - 1) {
                        Scene.settingsMenu.settingsMenuIndex++;
                        updateSettingsMenu();
                    }
                    break;
                case 5: // RIGHT
                case 11: // R1
                    scrollItems(sItem, true);
                    break;
                case 7: // LEFT
                case 10: //L1
                    scrollItems(sItem, false);
                    break;
                case 13: // Circle - Back
                    currentScene = 0; // Go back to main
                    render();
                    break;
                case 14: // X - Enter
                    // Do whatever
                    alert("Selected: " + sItem.text + (sItem.options ? " [" + sItem.options[sItem.selected] + "]" : ""));
                    break;
            }
        }
        if (keyCode == 12) {
            jailbreak();
        }
        if (keyCode === 2) {
            restartVue();
        }
        // R2 / L2
        if (keyCode == 9 || keyCode == 8) {
            changeScene(keyCode);
        }

    };

} catch (error) {
    alert(error);
}

// Auto load jailbreak
var circleTimeout = setInterval(function () {
    if (autoLoadTimer !== null) {
        autoLoadTimer--;
        if (autoLoadTimer < 0) {
            clearInterval(circleTimeout);
            autoLoadTimer = null;
            jailbreak();
        }
        render();
    } else {
        clearInterval(circleTimeout);
    }
}, 1000);

function changeScene(keyCode) {
    try {
        if (keyCode === 8) { // L2 - Previous Scene
            currentScene = (currentScene > 0) ? currentScene - 1 : Scene.sceneList.length - 1;
        } else if (keyCode === 9) { // R2 - Next Scene
            currentScene = (currentScene < Scene.sceneList.length - 1) ? currentScene + 1 : 0;
        }
        render(); // Will trigger rebuild due to ID change
    } catch (error) {
        log("Change Scene Error: " + error);
    }
}

function scrollItems(sItem, forward) {
    if (sItem.options && sItem.options.length > 0) {
        var len = sItem.options.length;
        // Cycling through options with the help of Modulo.
        sItem.selected = (sItem.selected + (forward ? 1 : -1) + len) % len;

        // Update localStorage
        if (sItem.localstorage) {
            localStorage.setItem(sItem.localstorage, sItem.selected);

            // update Settings object in memory too.
            if (Settings.hasOwnProperty(sItem.localstorage)) {
                Settings[sItem.localstorage] = sItem.selected;
            }
        }

        // Update the menu.
        render();
    }
}

function jailbreak() {
    var henName = (henFlavor == 0 ? "GoldHEN" : "PS4HEN");
    alert("Loaded " + henName);
    autoLoadTimer = null;
    // clear timeout if exists
    if (circleTimeout) {
        clearInterval(circleTimeout);
        render();
    }
}