var init = false;
var isPlaying = false;
var bounded = false;
var p = null;

var bubbles = new Array();
var select = 0;

var scales = new ScaleData();
var guiData = new GuiData();
var currentAxes = new SelectAxes();
var year = new YearData();
var highlight = new HighlightedData();
var load = new LoadingValues();

var entityYearMin = new Array(4);
var entityYearMax = new Array(4);
var dataEntries = new Array(4);

var HistoricalMap = {};
var OverMap = {};

// Enum for the differents axes
var guiAxes = {
    X: 0,
    Y: 1,
    SIZE: 2,
    COLOR: 3
}

/*
 ** Different objects to stores useful data
 */

function    LoadingValues() {
    this.loaded = false;
    this.flagEntities = 0x1;
    this.flagYears = 0x2;
    this.flagValues = 0x4;
}

function    HighlightedData() {
    this.bubble = -1;
    this.inHist = null;
}

function    YearData() {
    this.min = 0;
    this.max = 0;
    this.current = 0;
}

function    ScaleData() {
    this.mins = new Array(4);
    this.maxs = new Array(4);
    this.steps = new Array(2);
}

function    SelectAxes() {
    this.x = 3;
    this.y = 4;
    this.color = 1;
    this.size = 5;
}

// Data shared between core and gui
function    GuiData() {
    this.entries = null;
    this.entities = null;
    this.cursorPos = 0;
    this.cursorSpeed = 25;
}

function	Bubble(posX, posY, size, col, name) {
    this.posX = posX;
    this.posY = posY;
    this.size = size;
    this.col = col;
    this.name = name;
    this.year = 0;
    this.isClicked = false;
    this.crossed = false;
    this.draw = true;
}

function	runProcessing() {
    initProcessing();
}

function	initProcessing() {
    p = Processing.getInstanceById('ProcessingCanvas');
    if (p) {
        bounded = true;
        p.getBubbleDrawer().loadingWindow();
        p.getBubbleDrawer().display();
        p.bindJavascript(this);
        initData();
        launch();
    }
    if (!bounded)
        setTimeout(initProcessing, 250);
}

function    initData() {
    retrieveYearAmpl(guiAxes.X, currentAxes.x);
    retrieveYearAmpl(guiAxes.Y, currentAxes.y);
    retrieveYearAmpl(guiAxes.SIZE, currentAxes.size);
    retrieveYearAmpl(guiAxes.COLOR, currentAxes.color);
    retrieveEntityByIdEntry(guiAxes.X, currentAxes.x);
    retrieveEntityByIdEntry(guiAxes.Y, currentAxes.y);
    retrieveEntityByIdEntry(guiAxes.SIZE, currentAxes.size);
    retrieveEntityByIdEntry(guiAxes.COLOR, currentAxes.color);
    retrieveValueAmpl(guiAxes.X, currentAxes.x);
    retrieveValueAmpl(guiAxes.Y, currentAxes.y);
    retrieveValueAmpl(guiAxes.SIZE, currentAxes.size);
    retrieveValueAmpl(guiAxes.COLOR, currentAxes.color);
    retrieveEntriesFromDB();
    retrieveEntitiesFromDB();
    scales.steps[guiAxes.X] = 10;
    scales.steps[guiAxes.Y] = 10;
}

function    launch() {
    if (guiData.entries != null && guiData.entities != null) {
        createBubbles();
        runApplication();
    }
    else
        setTimeout(launch, 150);
}

function    createBubbles() {
    for (var prop in guiData.entities) {
        bubbles.push(new Bubble(0, 0, 20, 0, guiData.entities[prop]));
    }
}

function	runApplication() {
    setMinMaxYear();
    year.current = year.min;
    init = true;
    build_slider('#timeSlider', year.min, year.max, year.value, 1, 1);

    refreshBubbles();
    refreshDisplay();
}

/*function    loading(axe, idx) {
 // TODO refactor
 if (loading != idx) {
 loading = idx;
 retrieveEntityByIdEntry(axe, idx);
 retrieveValueAmpl(axe, idx);
 retrieveYearAmpl(axe, idx);
 }
 if (loaded & flagEntities && loaded & flagYears && loaded & flagValues) {
 loaded = 0;
 return;
 }
 else {
 setTimeout(loading, 250);
 }
 }
 }*/

function	drawBubbles() {
    // Print historical bubbles
    drawHistoricalBubbles();
    for (i = 0; i < bubbles.length; ++i) {
        if (bubbles[i].draw) {
            if (bubbles[i].isClicked) {
                p.getBubbleDrawer().drawBubble(bubbles[i].posX, bubbles[i].posY, bubbles[i].size, bubbles[i].col, bubbles[i].isClicked, bubbles[i].crossed);
                addToOverMap(bubbles[i]);
            }
            else
                p.getBubbleDrawer().drawBubble(bubbles[i].posX, bubbles[i].posY, bubbles[i].size, bubbles[i].col, bubbles[i].isClicked, bubbles[i].crossed);
        }
    }
    // Print highlitedBubble with coord infos
    if (highlight.inHist != null) {
        var histBubble = HistoricalMap[highlight.inHist][highlight.bubble];
        p.getBubbleDrawer().drawHighlightBubble(histBubble.posX, histBubble.posY, histBubble.size, histBubble.col, histBubble.crossed);
        p.getBubbleDrawer().drawCoordInfos(dataEntries[guiAxes.X][histBubble.name][histBubble.year], histBubble.posX,
                dataEntries[guiAxes.Y][histBubble.name][histBubble.year], histBubble.posY,
                dataEntries[guiAxes.SIZE][histBubble.name][histBubble.year], histBubble.size, dataEntries[guiAxes.COLOR][histBubble.name][histBubble.year], histBubble.col);
    }
    else if (highlight.bubble != -1) {
        p.getBubbleDrawer().drawHighlightBubble(bubbles[highlight.bubble].posX, bubbles[highlight.bubble].posY, bubbles[highlight.bubble].size, bubbles[highlight.bubble].col, bubbles[highlight.bubble].crossed);
        p.getBubbleDrawer().drawCoordInfos(dataEntries[guiAxes.X][bubbles[highlight.bubble].name][year.currentYear], bubbles[highlight.bubble].posX,
                dataEntries[guiAxes.Y][bubbles[highlight.bubble].name][year.currentYear], bubbles[highlight.bubble].posY,
                dataEntries[guiAxes.SIZE][bubbles[highlight.bubble].name][year.currentYear], bubbles[highlight.bubble].size, dataEntries[guiAxes.COLOR][bubbles[highlight.bubble].name][year.currentYear], bubbles[highlight.bubble].col);
    }
}

function    drawHistoricalBubbles() {
    for (var prop in HistoricalMap) {
        for (j = 0; j < HistoricalMap[prop].length; ++j) {
            if (j + 1 < HistoricalMap[prop].length)
                p.getBubbleDrawer().drawLine(HistoricalMap[prop][j].posX, HistoricalMap[prop][j].posY,
                        HistoricalMap[prop][j + 1].posX, HistoricalMap[prop][j + 1].posY, HistoricalMap[prop][j].col);
            p.getBubbleDrawer().drawBubble(HistoricalMap[prop][j].posX, HistoricalMap[prop][j].posY, HistoricalMap[prop][j].size, HistoricalMap[prop][j].col, true, HistoricalMap[prop][j].crossed);
        }
    }
}

function    addToOverMap(b) {
    OverMap[b.name] = (jQuery.extend({}, b));
}

function    drawBubblesNames() {
    var highlightName = null;
    for (var b in OverMap) {
        if (highlight.bubble != -1 && OverMap[b].name == bubbles[highlight.bubble].name)
            highlightName = b;
        else {
            p.getBubbleDrawer().drawBubbleName(OverMap[b].posX - (OverMap[b].size / 2), OverMap[b].posY - (OverMap[b].size / 2), OverMap[b].size,
                    OverMap[b].col, OverMap[b].name);
            delete OverMap[b];
        }
    }
    if (highlightName != null) {
        p.getBubbleDrawer().drawBubbleName(OverMap[highlightName].posX - (OverMap[highlightName].size / 2), OverMap[highlightName].posY - (OverMap[highlightName].size / 2), OverMap[highlightName].size,
                OverMap[highlightName].col, OverMap[highlightName].name);
        delete OverMap[highlightName];
    }
    else if (highlight.inHist) {
        var bubble = HistoricalMap[highlight.inHist][highlight.bubble];
        p.getBubbleDrawer().drawBubbleName(bubble.posX - (bubble.size / 2), bubble.posY - (bubble.size / 2), bubble.size,
                bubble.col, bubble.year);
    }
}

function	overOnPlot(mX, mY) {
    var i;
    var res = -1;
    var resSize = 999999;
    var hist = null;

    for (i = 0; i < bubbles.length; ++i)
        if (bubbles[i].draw && bubbles[i].size < resSize
                && overCircle(mX, mY, bubbles[i].posX, bubbles[i].posY, bubbles[i].size / 2)) {
            res = i;
            resSize = bubbles[res].size;
        }
    if (res == -1) {
        for (var prop in HistoricalMap) {
            for (j = 0; j < HistoricalMap[prop].length; ++j)
                if (HistoricalMap[prop][j].draw && HistoricalMap[prop][j].size < resSize && overCircle(mX, mY, HistoricalMap[prop][j].posX, HistoricalMap[prop][j].posY, HistoricalMap[prop][j].size / 2)) {
                    res = j;
                    resSize = HistoricalMap[prop][j].size;
                    hist = prop;
                }
        }
    }
    // Set infos for highlightedBubble print
    if (res >= 0) {
        highlight.bubble = res;
        if (hist != null) {
            highlight.inHist = hist;
        }
        else {
            highlight.inHist = null;
            addToOverMap(bubbles[highlight.bubble]);
        }
    }
    else {
        highlight.bubble = -1;
        highlight.inHist = null;
    }
}

// Test for mouse over bubble
function	overCircle(mX, mY, x, y, radius) {
    var disX = x - mX;
    var disY = y - mY;
    if (mX < x - radius || mX > x + radius)
        return false;
    if (mY < y - radius || mY > y + radius)
        return false;
    if (Math.sqrt(Math.pow(disX, 2) + Math.pow(disY, 2)) < radius)
        return true;
    return false;
}

// If user click on a bubble
function	clickOnPlot() {
    var i;
    var found = false;
    if (highlight.bubble >= 0) {
        if (highlight.inHist != null) {
            for (i = 0; i < bubbles.length && !found; ++i) {
                if (bubbles[i].name == HistoricalMap[highlight.inHist][highlight.bubble].name) {
                    found = true;
                    break;
                }
            }
            if (found && bubbles[i].isClicked)
                removeFromHistorical(HistoricalMap[highlight.inHist][highlight.bubble].name);
            if (bubbles[i].isClicked)
                --select;
            else
                ++select;
            bubbles[i].isClicked = !bubbles[i].isClicked;
        }
        else {
            if (bubbles[highlight.bubble].isClicked)
                removeFromHistorical(bubbles[highlight.bubble].name);
            if (bubbles[highlight.bubble].isClicked)
                --select;
            else
                ++select;
            bubbles[highlight.bubble].isClicked = !bubbles[highlight.bubble].isClicked;
        }
    }
    if (select > 0)
        p.getBubbleDrawer().bubbleSelected();
    else
        p.getBubbleDrawer().noBubbleSelected();
    refreshDisplay();
}

function    mouveMove() {
    refreshDisplay();
}

function    drawScales() {
    p.getBubbleDrawer().drawScale(guiAxes.X, scales.mins[guiAxes.X], scales.maxs[guiAxes.X], scales.steps[guiAxes.X]);
    p.getBubbleDrawer().drawScale(guiAxes.Y, scales.mins[guiAxes.Y], scales.maxs[guiAxes.Y], scales.steps[guiAxes.Y]);
}

function	unselectAll() {
    for (i = 0; i < bubbles.length; ++i) {
        bubbles[i].isClicked = false;
    }
}

// Update values of bubbles if valid data
// also add bubble to historicalMap if selected
function    refreshBubbles() {
    var i;
    for (i = 0; i < bubbles.length; ++i) {
        if (bubbles[i].isClicked)
            addToHistorical(bubbles[i]);
        if (dataEntries[guiAxes.X][bubbles[i].name][year.currentYear] == null || dataEntries[guiAxes.Y][bubbles[i].name][year.currentYear] == null
                || dataEntries[guiAxes.COLOR][bubbles[i].name][year.currentYear] == null || dataEntries[guiAxes.SIZE][bubbles[i].name][year.currentYear] == null)
            bubbles[i].draw = false;
        else {
            bubbles[i].year = year.currentYear;
            bubbles[i].posX = updateAxeX(dataEntries[guiAxes.X][bubbles[i].name][year.currentYear]);
            bubbles[i].posY = updateAxeY(dataEntries[guiAxes.Y][bubbles[i].name][year.currentYear]);
            bubbles[i].size = updateAxeSize(dataEntries[guiAxes.SIZE][bubbles[i].name][year.currentYear]);
            bubbles[i].col = updateAxeColor(dataEntries[guiAxes.COLOR][bubbles[i].name][year.currentYear]);
        }
    }
    // TMP
    //p.println("SIZE MIN : " + scales.mins[guiAxes.SIZE] + " MAX: " + scales.maxs[guiAxes.SIZE]);
    //p.println("COLOR MIN : " + scales.mins[guiAxes.COLOR] + " MAX: " + scales.maxs[guiAxes.COLOR]);
}

function    updateAxeX(value) {
    return (value - scales.mins[guiAxes.X]) * p.getBubbleWidth() / (scales.maxs[guiAxes.X] - scales.mins[guiAxes.X]);
}

function    updateAxeY(value) {
    return p.getBubbleHeight() - ((value - scales.mins[guiAxes.Y]) * p.getBubbleHeight() / (scales.maxs[guiAxes.Y] - scales.mins[guiAxes.Y]));
}

function    updateAxeSize(value) {
    return 5 + Math.round((value - scales.mins[guiAxes.SIZE]) * 50 / (scales.maxs[guiAxes.SIZE] - scales.mins[guiAxes.SIZE]));
}

function    updateAxeColor(value) {
    return Math.round((value - scales.mins[guiAxes.COLOR]) * 255 / (scales.maxs[guiAxes.COLOR] - scales.mins[guiAxes.COLOR]));
}

function	refreshDisplay() {
    bubbles.sort(sortBubbles);
    sortHistoricalBubbles();
    p.getBubbleDrawer().clear();
    drawScales();
    p.getBubbleDrawer().drawDate(year.currentYear);
    overOnPlot(p.getMouseX(), p.getMouseY());
    drawBubbles();
    drawBubblesNames();
    p.getBubbleDrawer().display();
}

// Sort bubbles by size
function    sortBubbles(b1, b2) {
    if (b1.size >= b2.size)
        return -1;
    else
        return 1;
}

// HISTORICAL METHODS
function    addToHistorical(bubble) {
    if (!(bubble.name in HistoricalMap))
        HistoricalMap[bubble.name] = new Array();
    HistoricalMap[bubble.name].push(jQuery.extend({}, bubble));
}

function    removeFromHistorical(n) {
    delete HistoricalMap[n];
}

function    sortHistoricalBubbles() {
    for (var prop in HistoricalMap)
        HistoricalMap[prop].sort(sortBubbles);
}

/*
 ** DATABASE COMMUNICATIONS
 */

function    retrieveEntriesFromDB() {
    $.ajax(
            {
                dataType: "json",
                data: {idFile: 1},
                type: "GET",
                url: "/src/server/GetEntries.php",
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log("Error on GetEntries [" + errorThrown + "] [" + textStatus + "]");
                    // TODO something for better error handle
                },
                success: function(d) {
                    guiData.entries = d;
                }
            });
}

function    retrieveEntitiesFromDB() {
    $.ajax(
            {
                dataType: "json",
                data: {idFile: 1},
                type: "GET",
                url: "/src/server/GetEntities.php",
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log("Error on GetEntities [" + errorThrown + "] [" + textStatus + "]");
                    // TODO something for better error handle
                },
                success: function(d) {
                    guiData.entities = d;
                    console.log(d);
                }
            });
}

function    retrieveEntityByIdEntry(axe, idx) {
    $.ajax(
            {
                dataType: "json",
                data: {idFile: 1, idEntry: idx},
                type: "GET",
                url: "/src/server/GetDataByIdEntry.php",
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log("Error on GetEntities [" + errorThrown + "] [" + textStatus + "]");
                    // TODO something for better error handle
                },
                success: function(data) {
                    dataEntries[axe] = data;
                    /*for (var prop in data['APEM']) {
                     console.log("prop: " + prop + ": " + data['APEM'][prop]);
                     }*/
                    /*for (var entitie in dataEntries[interfaceAxes.X]) {
                     console.log(entitie + ": ");
                     for (var propDate in dataEntries[interfaceAxes.X][entitie]) {
                     console.log(propDate + "= " + dataEntries[interfaceAxes.X][entitie][propDate]);
                     }
                     }*/
                }
            });
}

function    retrieveYearAmpl(axe, idx) {
    $.ajax(
            {
                dataType: "json",
                data: {idFile: 1, idEntry: idx},
                type: "GET",
                url: "/src/server/GetYearAmplByEntry.php",
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log("Error on GetYearAmplByEntry [" + errorThrown + "] [" + textStatus + "]");
                    // TODO something for better error handle
                },
                success: function(data) {
                    entityYearMin[axe] = parseInt(data.min);
                    entityYearMax[axe] = parseInt(data.max);
                }
            });
}

function    retrieveValueAmpl(axe, idx) {
    $.ajax(
            {
                dataType: "json",
                data: {idFile: 1, idEntry: idx},
                type: "GET",
                url: "/src/server/GetValueAmplByEntry.php",
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log("Error on GetValueAmplByEntry [" + errorThrown + "] [" + textStatus + "]");
                    // TODO something for better error handle
                },
                success: function(data) {
                    var max = parseFloat(data.max);
                    var min = parseFloat(data.min);
                    scales.mins[axe] = Math.ceil(min - (Math.abs(min) * 10 / 100));
                    scales.maxs[axe] = Math.ceil((Math.abs(max) * 10 / 100) + Math.abs(max));
                }
            });
}

// select the highest year value between the two lower
// select the lowest year value between the two higher
function    setMinMaxYear() {
    if (entityYearMin[guiAxes.X] < entityYearMin[guiAxes.Y])
        year.min = entityYearMin[guiAxes.Y];
    else
        year.min = entityYearMin[guiAxes.X];
    if (entityYearMax[guiAxes.X] < entityYearMax[guiAxes.Y])
        year.max = entityYearMax[guiAxes.Y];
    else
        year.max = entityYearMax[guiAxes.X];
}

/*
 ** GUI METHODS
 */

// 0 -> X AXIS || 1 -> Y AXIS
function    changeScale(axe, min, max, step) {
    /*mins[axe] = min;
     maxs[axe] = max;
     steps[axe] = step;*/
    drawScales();
}

function    MoveCursor(pos) {
    guiData.cursorPos = pos;
    $("#sliderDiv").slider("value", pos);
}

function    SetBubbleSize(size) {
    bubbleSize = size;
}

function    SetSpeed(speed) {
    guiData.cursorSpeed = speed;
}

function    SetPlayState() {
    isPlaying = !isPlaying;
    if (!isPlaying)			// STOP
        $("#playButton").attr("value", "Play");
    else {					// PLAY
        $("#playButton").attr("value", "Stop");
        if ($("#sliderDiv").slider("value") == $("#sliderDiv").slider("option", "max"))
            $("#sliderDiv").slider("value", $("#sliderDiv").slider("option", "min"));
        Loop();
    }
}

function    AxeChanged(axe, idx) {
    retrieveEntryFromDB(idx);
    retrieveYearAmpl(idx);
    // TODO
}

/*
 ** Main loop of program
 */

function    Loop() {
    if (isPlaying) {
        if ($("#sliderDiv").slider("value") == $("#sliderDiv").slider("option", "max")) {
            SetPlayState();
            return;
        }
        ++year.currentYear;
        refreshBubbles();
        refreshDisplay();
        $("#sliderDiv").slider("value", $("#sliderDiv").slider("value") + 1);
        setTimeout(Loop, $("#speedSlider").slider("value") * 30 + 100);
    }
}