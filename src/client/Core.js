var init = false;
var isPlaying = false;
var bounded = false;
var p = null;

var rawEntities = null;

var bubbles = new Array();
var select = 0;

var scales = new ScaleData();
var guiData = new GuiData();
var currentAxes = new SelectAxes();
var year = new YearData();
var highlight = new HighlightedData();
var load = new LoadingValues();

var entityYearMin = new Array(null, null, null, null);
var entityYearMax = new Array(null, null, null, null);
var dataEntries = new Array(null, null, null, null);

var HistoricalMap = {};
var OverMap = {};

// Enum for the differents axes
var guiAxes = {
    X: 0,
    Y: 1,
    SIZE: 2,
    COLOR: 3
}

Array.prototype.unset = function(val) {
    var idx = this.indexOf(val);
    if (idx > -1) {
        this.splice(idx, 1);
    }
}

/*
 ** Different objects to stores useful data
 */

function    LoadingValues() {
    this.loaded = false;
    this.loading = false;
    this.axe = -1;
    this.idx = -1;
}

function    HighlightedData() {
    this.bubble = -1;
    this.inHist = null;
}

function    YearData() {
    this.min = 0;
    this.max = 0;
    this.current = 0;
    this.step = 0;
}

function    ScaleData() {
    this.mins = new Array(null, null, null, null);
    this.maxs = new Array(null, null, null, null);
    this.steps = new Array(null, null);
}

function    SelectAxes() {
    this.x = 1;
    this.y = 2;
    this.color = 3;
    this.size = 4;
}

// Data shared between core and gui
function    GuiData() {
    this.entries = null;
    this.entities = null;
    this.cursorPos = 0;
    this.cursorSpeed = 20;
    this.colorActivated = true;
    this.sizeActivated = true;
    this.cursorSize = 55;
    this.opacity = 70;
}

function	Bubble(posX, posY, size, col, name, year) {
    this.posX = posX;
    this.posY = posY;
    this.size = size;
    this.col = col;
    this.name = name;
    this.year = year;
    this.isClicked = false;
    this.crossed = false;
    this.draw = true;
}

Bubble.prototype.print = function() {
    p.println("bubble: x->" + this.posX + " y->" + this.posY + " size->" + this.size
            + " col->" + this.col + " name->" + this.name + " year->" + this.year
            + " clicked->" + this.isClicked);
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
    retrieveEntriesFromDB();
    retrieveEntitiesFromDB();
    initAxes();
    setBeginAxes();
    scales.steps[guiAxes.X] = 10;
    scales.steps[guiAxes.Y] = 10;
}

function    initAxes() {
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
}

// To change if no color or no size
function    setBeginAxes() {
    var k = 0;
    var nbEntries = 0;
    if (guiData.entries != null) {
        for (var entry in guiData.entries) {
            nbEntries = entry;
        }
        currentAxes.x = k++;
        currentAxes.y = k;
        if (k + 1 < nbEntries)
            ++k;
        currentAxes.color = k;
        if (k + 1 < nbEntries)
            ++k;
        currentAxes.size = k;
    }
    else
        setTimeout(setBeginAxes, 250);
}

function    launch() {
    if (guiData.entries != null && rawEntities != null && dataEntries[guiAxes.X] != null
            && dataEntries[guiAxes.Y] != null && dataEntries[guiAxes.SIZE] != null && dataEntries[guiAxes.COLOR] != null
            && entityYearMin[guiAxes.X] != null && entityYearMin[guiAxes.Y] != null && entityYearMin[guiAxes.SIZE] != null && entityYearMin[guiAxes.COLOR] != null
            && scales.mins[guiAxes.X] != null && scales.mins[guiAxes.Y] != null && scales.mins[guiAxes.SIZE] != null && scales.mins[guiAxes.COLOR] != null) {
        setMinMaxYear();
        setGuiEntities();
        createBubbles();
        s = $(entityDiv);
        for (var b in guiData.entities) {
            var cb = "<input type=\"checkbox\" id=\"entity[";
            cb += guiData.entities[b];
            cb += "]\" value=\"";
            cb += escape(guiData.entities[b]);
            cb += "\" onClick=\"selectBubbleCheckBox('";
            cb += escape(guiData.entities[b]);
            cb += "');\" onMouseOver=\"mouseOverCheckBox('";
            cb += escape(guiData.entities[b]);
            cb += "');\" /><label for=\"entity[";
            cb += guiData.entities[b];
            cb += "]\" onMouseOver=\"mouseOverCheckBox('";
            cb += escape(guiData.entities[b]);
            cb += "');\">";
            cb += guiData.entities[b];
            cb += "</label><br>";
            s.append(cb);
        }
        var a = new Array();
        for (var b in guiData.entries) {
            a.push({value: guiData.entries[b], id: b});
        }
        var k = 0;
        $("#selectAxeXValue").next("input").autocomplete({source: a});
        $("#selectAxeXValue").next("input").attr("value", a[k].value);

        if (a.length > k + 1)
            ++k;
        $("#selectAxeYValue").next("input").autocomplete("option", "source", a);
        $("#selectAxeYValue").next("input").attr("value", a[k].value);
        if (a.length > k + 1)
            ++k;
        $("#selectColorValue").next("input").autocomplete("option", "source", a);
        $("#selectColorValue").next("input").attr("value", a[k].value);
        if (a.length > k + 1)
            ++k;
        $("#selectSizeValue").next("input").autocomplete("option", "source", a);
        $("#selectSizeValue").next("input").attr("value", a[k].value);
        runApplication();
    }
    else
        setTimeout(launch, 250);
}

function    setGuiEntities() {
    guiData.entities = jQuery.extend({}, rawEntities);
}

function    createBubbles() {
    for (var prop in guiData.entities) {
        bubbles.push(new Bubble(0, 0, 0, 0, guiData.entities[prop], 0));
    }
}

function	runApplication() {
    year.current = year.min;
    init = true;
    build_slider('#timeSlider', year.min, year.max, year.value, 1, 1);
    refreshBubbles();
    refreshDisplay();
}

// MAY NEED RESET OF SOME VAR TO CHECK SQL REQUEST IS OK
function    loading(axe, idx) {
    if (!load.loading) {
        DisableUI();
        load.idx = idx;
        load.axe = axe;
        load.loading = true;
        p.getBubbleDrawer().clear();
        p.getBubbleDrawer().loadingWindow();
        p.getBubbleDrawer().display();
        clearDataForLoading(axe);
        retrieveEntityByIdEntry(axe, idx);
        retrieveValueAmpl(axe, idx);
        retrieveYearAmpl(axe, idx);
        retrieveValueAmpl(axe, idx);
    }
    if (dataEntries[load.axe] != null && entityYearMin[load.axe] != null && scales.mins[load.axe] != null) {
        refreshBubbles();
        refreshDisplay();
        load.loading = false;
        load.idx = -1;
        load.axe = -1;
        EnableUI();
    }
    else {
        setTimeout(loading, 250);
    }
}

function    clearDataForLoading(axe) {
    delete dataEntries[axe];
    entityYearMin[axe] = null;
    scales.mins[axe] = null;
    entityYearMax[axe] = null;
    scales.maxs[axe] = null;
}

function    drawBubbles() {
    // Print historical bubbles
    drawHistoricalBubbles();
    bubbles.sort(sortBubblesSize);
    for (i = 0; i < bubbles.length; ++i) {
        if (bubbles[i].draw) {
            if (bubbles[i].isClicked) {
                p.getBubbleDrawer().drawBubble(bubbles[i].posX, bubbles[i].posY, bubbles[i].size,
                        bubbles[i].col, bubbles[i].isClicked, bubbles[i].crossed);
                addToOverMap(bubbles[i]);
            }
            else {
                p.getBubbleDrawer().drawBubble(bubbles[i].posX, bubbles[i].posY, bubbles[i].size,
                        bubbles[i].col, bubbles[i].isClicked, bubbles[i].crossed);
            }
        }
    }
    // Print highlitedBubble with coord infos
    if (highlight.inHist != null && highlight.bubble != -1) {
        var histBubble = HistoricalMap[highlight.inHist][highlight.bubble];
        p.getBubbleDrawer().drawHighlightBubble(histBubble.posX, histBubble.posY, histBubble.size, histBubble.col, histBubble.crossed);
        p.getBubbleDrawer().drawCoordInfos(dataEntries[guiAxes.X][histBubble.name][histBubble.year], histBubble.posX,
            dataEntries[guiAxes.Y][histBubble.name][histBubble.year], histBubble.posY,
            dataEntries[guiAxes.SIZE][histBubble.name][histBubble.year], histBubble.size,
            dataEntries[guiAxes.COLOR][histBubble.name][histBubble.year], histBubble.col);
    }
    else if (highlight.bubble != -1) {
        p.getBubbleDrawer().drawHighlightBubble(bubbles[highlight.bubble].posX, bubbles[highlight.bubble].posY, bubbles[highlight.bubble].size, bubbles[highlight.bubble].col, bubbles[highlight.bubble].crossed);
        if (bubbles[highlight.bubble].crossed) {
            p.getBubbleDrawer().drawCoordInfos(dataEntries[guiAxes.X][bubbles[highlight.bubble].name][bubbles[highlight.bubble].year], bubbles[highlight.bubble].posX,
                dataEntries[guiAxes.Y][bubbles[highlight.bubble].name][bubbles[highlight.bubble].year], bubbles[highlight.bubble].posY,
                dataEntries[guiAxes.SIZE][bubbles[highlight.bubble].name][bubbles[highlight.bubble].year], bubbles[highlight.bubble].size,
                dataEntries[guiAxes.COLOR][bubbles[highlight.bubble].name][bubbles[highlight.bubble].year], bubbles[highlight.bubble].col);
        }
        else {
            p.getBubbleDrawer().drawCoordInfos(coordInfosTranslated(dataEntries[guiAxes.X][bubbles[highlight.bubble].name][year.current], dataEntries[guiAxes.X][bubbles[highlight.bubble].name][year.current + 1]),
                bubbles[highlight.bubble].posX,
                coordInfosTranslated(dataEntries[guiAxes.Y][bubbles[highlight.bubble].name][year.current], dataEntries[guiAxes.Y][bubbles[highlight.bubble].name][year.current + 1]),
                bubbles[highlight.bubble].posY,
                coordInfosTranslated(dataEntries[guiAxes.SIZE][bubbles[highlight.bubble].name][year.current], dataEntries[guiAxes.SIZE][bubbles[highlight.bubble].name][year.current + 1]),
                bubbles[highlight.bubble].size,
                coordInfosTranslated(dataEntries[guiAxes.COLOR][bubbles[highlight.bubble].name][year.current], dataEntries[guiAxes.COLOR][bubbles[highlight.bubble].name][year.current + 1]),
                bubbles[highlight.bubble].col);
        }
    }
}

function    coordInfosTranslated(currVal, nextVal) {
    if (year.step == 0)
        return parseInt(currVal);
    else
        return parseInt(currVal) + ((parseInt(nextVal) - parseInt(currVal)) * year.step);
}

// If bubbles is no longer an array, can optimize this without having to look for id in array
function    drawHistoricalBubbles() {
    var pos = 0;
    for (var prop in HistoricalMap) {
        HistoricalMap[prop].sort(sortBubblesYear);
        for (j = 0; j < HistoricalMap[prop].length; ++j) {
            for (pos = 0; pos < bubbles.length && bubbles[pos].name != HistoricalMap[prop][j].name; ++pos)
                ;
            if (j + 1 < HistoricalMap[prop].length) {
                p.getBubbleDrawer().drawLine(HistoricalMap[prop][j].posX, HistoricalMap[prop][j].posY,
                        HistoricalMap[prop][j + 1].posX, HistoricalMap[prop][j + 1].posY, HistoricalMap[prop][j].col);
            }
            else if (bubbles[pos].draw) {
                p.getBubbleDrawer().drawLine(HistoricalMap[prop][j].posX, HistoricalMap[prop][j].posY,
                        bubbles[pos].posX, bubbles[pos].posY, HistoricalMap[prop][j].col);
            }
        }
        HistoricalMap[prop].sort(sortBubblesSize);
        for (j = 0; j < HistoricalMap[prop].length; ++j) {
            p.getBubbleDrawer().drawBubble(HistoricalMap[prop][j].posX, HistoricalMap[prop][j].posY, HistoricalMap[prop][j].size,
                    HistoricalMap[prop][j].col, true, HistoricalMap[prop][j].crossed);
        }
    }
}

function    addToOverMap(b) {
    OverMap[b.name] = (jQuery.extend({}, b));
}

function    drawBubblesNames() {
    var highlightName = null;
    for (var b in OverMap) {
        if (highlight.inHist == null && highlight.bubble != -1 && OverMap[b].name == bubbles[highlight.bubble].name)
            highlightName = b;
        else {
            p.getBubbleDrawer().drawBubbleName(OverMap[b].posX, OverMap[b].posY, OverMap[b].size, OverMap[b].col, OverMap[b].crossed ? OverMap[b].name + ": " + OverMap[b].year : OverMap[b].name);
            delete OverMap[b];
        }
    }
    if (highlightName != null) {
        p.getBubbleDrawer().drawBubbleName(OverMap[highlightName].posX, OverMap[highlightName].posY, OverMap[highlightName].size,
                OverMap[highlightName].col, OverMap[highlightName].crossed ? OverMap[highlightName].name + ": " + OverMap[highlightName].year : OverMap[highlightName].name);
        delete OverMap[highlightName];
    }
    else if (highlight.inHist != null) {
        var bubble = HistoricalMap[highlight.inHist][highlight.bubble];
        p.getBubbleDrawer().drawBubbleName(bubble.posX, bubble.posY, bubble.size, bubble.col, bubble.year);
    }
}

function	overOnPlot(mX, mY) {
    var i;
    var res = -1;
    var resSize = 999999;
    var hist = null;

    //if (guiData.opacity != 0) {
        for (i = 0; i < bubbles.length; ++i)
            if (bubbles[i].draw && bubbles[i].size < resSize
                && overCircle(mX, mY, bubbles[i].posX, bubbles[i].posY, bubbles[i].size / 2)) {
                res = i;
                resSize = bubbles[res].size;
            }
    //}
    if (res == -1) {
        for (var prop in HistoricalMap) {
            for (j = 0; j < HistoricalMap[prop].length; ++j)
                if (HistoricalMap[prop][j].draw && HistoricalMap[prop][j].size < resSize
                        && overCircle(mX, mY, HistoricalMap[prop][j].posX, HistoricalMap[prop][j].posY, HistoricalMap[prop][j].size / 2)) {
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
            if (select != 0 && guiData.opacity == 0 && !bubbles[highlight.bubble].isClicked)
                highlight.bubble = -1;
            else
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
            if (bubbles[i].isClicked) {
                document.getElementById("entity[" + [bubbles[i].name] + "]").checked = false;
                --select;
            }
            else {
                document.getElementById("entity[" + [bubbles[i].name] + "]").checked = true;
                ++select;
            }
            bubbles[i].isClicked = !bubbles[i].isClicked;
        }
        else {
            if (bubbles[highlight.bubble].isClicked)
                removeFromHistorical(bubbles[highlight.bubble].name);
            if (bubbles[highlight.bubble].isClicked) {
                document.getElementById("entity[" + [bubbles[highlight.bubble].name] + "]").checked = false;
                --select;
            }
            else {
                document.getElementById("entity[" + [bubbles[highlight.bubble].name] + "]").checked = true;
                ++select;
            }
            bubbles[highlight.bubble].isClicked = !bubbles[highlight.bubble].isClicked;
        }
    }
    updateSelectBubble();
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

function    updateSelectBubble() {
    if (select > 0) {
        $("#opacitySlider").slider("enable");
        p.getBubbleDrawer().bubbleSelected();
    }
    else {
        $("#opacitySlider").slider("disable");
        p.getBubbleDrawer().noBubbleSelected();
    }
}

// Update values of bubbles if valid data
// also add bubble to historicalMap if selected
function    refreshBubbles() {
    var i;
    var x;
    var y;
    var size;
    var col;
    removeYearFromHistorical(year.current);
    for (i = 0; i < bubbles.length; ++i) {
        if (dataEntries[guiAxes.X][bubbles[i].name][year.current] == null || dataEntries[guiAxes.Y][bubbles[i].name][year.current] == null
                || dataEntries[guiAxes.COLOR][bubbles[i].name][year.current] == null || dataEntries[guiAxes.SIZE][bubbles[i].name][year.current] == null) {
            if (!updateBubbleToLastAvailableYear(bubbles[i])) {
                if (bubbles[i].crossed == false || bubbles[i].year > year.current) {
                    bubbles[i].draw = false;
                    document.getElementById("entity[" + bubbles[i].name + "]").disabled = true;
                }
            }
            else {
                bubbles[i].draw = true;
                bubbles[i].crossed = true;
            }
        }
        else {
            x = updateAxeX(dataEntries[guiAxes.X][bubbles[i].name][year.current]);
            y = updateAxeY(dataEntries[guiAxes.Y][bubbles[i].name][year.current]);
            size = updateAxeSize(dataEntries[guiAxes.SIZE][bubbles[i].name][year.current]);
            col = updateAxeColor(dataEntries[guiAxes.COLOR][bubbles[i].name][year.current]);
            if (year.step == 0) {
                document.getElementById("entity[" + bubbles[i].name + "]").disabled = false;
                bubbles[i].crossed = false;
                bubbles[i].draw = true;
                bubbles[i].year = year.current;
                bubbles[i].posX = x;
                bubbles[i].posY = y;
                bubbles[i].size = size;
                bubbles[i].col = col;
            }
            else {
                if (bubbles[i].draw && bubbles[i].isClicked && bubbles[i].year == year.current)
                    addToHistorical(bubbles[i]);
                if (year.current + 1 < year.max && dataEntries[guiAxes.X][bubbles[i].name][year.current + 1] == null || dataEntries[guiAxes.Y][bubbles[i].name][year.current + 1] == null
                        || dataEntries[guiAxes.COLOR][bubbles[i].name][year.current + 1] == null || dataEntries[guiAxes.SIZE][bubbles[i].name][year.current + 1] == null) {
                    if (bubbles[i].draw) {
                        bubbles[i].crossed = true;
                    }
                    bubbles[i].draw = true;
                    updateBubbleToLastAvailableYear(bubbles[i]);
                }
                else {
                    document.getElementById("entity[" + bubbles[i].name + "]").disabled = false;
                    bubbles[i].crossed = false;
                    bubbles[i].draw = true;
                    bubbles[i].year = -1;
                    bubbles[i].posX = x + (updateAxeX(dataEntries[guiAxes.X][bubbles[i].name][year.current + 1]) - x) * year.step;
                    bubbles[i].posY = y + (updateAxeY(dataEntries[guiAxes.Y][bubbles[i].name][year.current + 1]) - y) * year.step;
                    bubbles[i].size = size + (updateAxeSize(dataEntries[guiAxes.SIZE][bubbles[i].name][year.current + 1]) - size) * year.step;
                    bubbles[i].col = col + (updateAxeColor(dataEntries[guiAxes.COLOR][bubbles[i].name][year.current + 1]) - col) * year.step;
                }
            }
        }
    }
    addPreviousYearToHistory();
}

function    updateAxeX(value) {
    return (value - scales.mins[guiAxes.X]) * p.getBubbleWidth() / (scales.maxs[guiAxes.X] - scales.mins[guiAxes.X]);
}

function    updateAxeY(value) {
    return p.getBubbleHeight() - ((value - scales.mins[guiAxes.Y]) * p.getBubbleHeight() / (scales.maxs[guiAxes.Y] - scales.mins[guiAxes.Y]));
}

function    updateAxeSize(value) {
    return (guiData.cursorSize / 10) + (value - scales.mins[guiAxes.SIZE]) * guiData.cursorSize / (scales.maxs[guiAxes.SIZE] - scales.mins[guiAxes.SIZE]);
}

function    updateAxeColor(value) {
    return (value - scales.mins[guiAxes.COLOR]) * 255 / (scales.maxs[guiAxes.COLOR] - scales.mins[guiAxes.COLOR]);
}

function    updateBubbleToLastAvailableYear(b) {
    for (var y = year.current; y > year.min; --y) {
        if ((dataEntries[guiAxes.X][b.name][y] && dataEntries[guiAxes.X][b.name][y] != null)
                && (dataEntries[guiAxes.Y][b.name][y] && dataEntries[guiAxes.Y][b.name][y] != null)
                && (dataEntries[guiAxes.COLOR][b.name][y] && dataEntries[guiAxes.COLOR][b.name][y] != null)
                && (dataEntries[guiAxes.SIZE][b.name][y] && dataEntries[guiAxes.SIZE][b.name][y] != null)) {
            b.posX = updateAxeX(dataEntries[guiAxes.X][b.name][y]);
            b.posY = updateAxeY(dataEntries[guiAxes.Y][b.name][y]);
            b.size = updateAxeSize(dataEntries[guiAxes.SIZE][b.name][y]);
            b.col = updateAxeColor(dataEntries[guiAxes.COLOR][b.name][y]);
            b.year = y;
            return true;
        }
    }
    return false;
}

// select the highest year value between the two lower
// select the lowest year value between the two higher
function    setMinMaxYear() {
    if (entityYearMin[guiAxes.X] < entityYearMin[guiAxes.Y])
        year.min = entityYearMin[guiAxes.Y];
    else
        year.min = entityYearMin[guiAxes.X];
    if (entityYearMax[guiAxes.X] < entityYearMax[guiAxes.Y])
        year.max = entityYearMax[guiAxes.X];
    else
        year.max = entityYearMax[guiAxes.Y];
}

function	refreshDisplay() {
    p.getBubbleDrawer().clear();
    drawScales();
    p.getBubbleDrawer().drawDate(year.current);
    overOnPlot(p.getMouseX(), p.getMouseY());
    drawBubbles();
    drawBubblesNames();
    p.getBubbleDrawer().display();
}

function    refreshDisplayNoOver() {
    p.getBubbleDrawer().clear();
    drawScales();
    p.getBubbleDrawer().drawDate(year.current);
    drawBubbles();
    drawBubblesNames();
    p.getBubbleDrawer().display();
}


function    sortBubblesSize(b1, b2) {
    return b2.size - b1.size;
}

function    sortBubblesYear(b1, b2) {
    return b1.year - b2.year;
}

/*
 ** HISTORICAL METHODS
 */

function    addToHistorical(bubble) {
    if (!(bubble.name in HistoricalMap))
        HistoricalMap[bubble.name] = new Array();
    for (var i = 0; i < HistoricalMap[bubble.name].length; ++i)
        if (HistoricalMap[bubble.name][i].year == bubble.year)
            return;
    HistoricalMap[bubble.name].push(jQuery.extend({}, bubble));
}

function    addPreviousYearToHistory() {
    var     i;
    var     j;
    var     found = false;
    var years = {};
    for (var i = 0; i < bubbles.length; ++i) {
        if (bubbles[i].isClicked && bubbles[i].year != -1) {
            addToHistorical(bubbles[i]);
        }
    }
    for (var b in HistoricalMap) {
        if (HistoricalMap[b].length > 0) {
            for (j = year.min; j <= year.current; ++j) {
                years[j] = 0;
            }
            for (j = 0; j < HistoricalMap[b].length; ++j) {
                delete years[HistoricalMap[b][j].year];
            }
            for (var yearToAdd in years) {
                if (dataEntries[guiAxes.X][HistoricalMap[b][0].name][yearToAdd] != null && dataEntries[guiAxes.Y][HistoricalMap[b][0].name][yearToAdd] != null
                        && dataEntries[guiAxes.COLOR][HistoricalMap[b][0].name][yearToAdd] != null && dataEntries[guiAxes.SIZE][HistoricalMap[b][0].name][yearToAdd] != null) {
                    HistoricalMap[b].push(new Bubble(updateAxeX(dataEntries[guiAxes.X][HistoricalMap[b][0].name][yearToAdd]), updateAxeY(dataEntries[guiAxes.Y][HistoricalMap[b][0].name][yearToAdd]),
                            updateAxeSize(dataEntries[guiAxes.SIZE][HistoricalMap[b][0].name][yearToAdd]), updateAxeColor(dataEntries[guiAxes.COLOR][HistoricalMap[b][0].name][yearToAdd]), HistoricalMap[b][0].name, yearToAdd));
                }
            }
        }
    }
}

function    removeYearFromHistorical(y) {
    for (var b in HistoricalMap) {
        for (var i = 0; i < HistoricalMap[b].length; ++i) {
            if (HistoricalMap[b][i].year > y)
                HistoricalMap[b].splice(i, 1);
        }
    }
}

function    removeFromHistorical(n) {
    delete HistoricalMap[n];
}

function    sortHistoricalBubblesBySize() {
    for (var prop in HistoricalMap)
        HistoricalMap[prop].sort(sortBubblesSize);
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
                url: "../server/GetEntries.php",
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
                url: "../server/GetEntities.php",
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log("Error on GetEntities [" + errorThrown + "] [" + textStatus + "]");
                    // TODO something for better error handle
                },
                success: function(d) {
                    rawEntities = d;
                }
            });
}

function    retrieveEntityByIdEntry(axe, idx) {
    $.ajax(
            {
                dataType: "json",
                data: {idFile: 1, idEntry: idx},
                type: "GET",
                url: "../server/GetDataByIdEntry.php",
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log("Error on GetEntities [" + errorThrown + "] [" + textStatus + "]");
                    // TODO something for better error handle
                },
                success: function(data) {
                    dataEntries[axe] = data;
                }
            });
}

function    retrieveYearAmpl(axe, idx) {
    $.ajax(
            {
                dataType: "json",
                data: {idFile: 1, idEntry: idx},
                type: "GET",
                url: "../server/GetYearAmplByEntry.php",
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
                url: "../server/GetValueAmplByEntry.php",
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

/*
 ** GUI METHODS
 */

// 0 -> X AXIS || 1 -> Y AXIS
function    MoveCursor(pos, step) {
    guiData.cursorPos = pos;
    year.current = pos;
    year.step = step;
    refreshBubbles();
    refreshDisplay();
}

function    selectBubbleCheckBox(name) {
    if (!load.loading) {
        name = unescape(name);
        for (var i = 0; i < bubbles.length; ++i) {
            if (bubbles[i].name == name) {
                bubbles[i].isClicked = !bubbles[i].isClicked;
                if (bubbles[i].isClicked)
                    ++select;
                else {
                    removeFromHistorical(bubbles[i].name);
                    --select;
                }
                updateSelectBubble();
                refreshDisplay();
                return;
            }
        }
    }
}

function    mouseOverCheckBox(name) {
    if (!load.loading) {
        name = unescape(name);
        for (var i = 0; i < bubbles.length; ++i) {
            if (bubbles[i].name == name) {
                if (!bubbles[i].draw)
                    return;
                highlight.bubble = i;
                highlight.inHist = null;
                addToOverMap(bubbles[highlight.bubble]);
                refreshDisplayNoOver();
                return;
            }
        }
    }
}

function    mouveLeaveCheckBoxes() {
    highlight.bubble = -1;
    highlight.inHist = null;
    refreshDisplay();
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

function    ChangeOpacity(value) {
    guiData.opacity = value;
    p.getBubbleDrawer().adjustOpacity(value);
    if (!isPlaying)
        refreshDisplay();
}

function    ChangeSize(value) {
    guiData.cursorSize = value;
    if (!isPlaying) {
        refreshBubbles();
        refreshDisplay();
    }
}

function    AxeChanged(axe, idx) {
    if (isPlaying) {
        isPlaying = false;
        $("#playButton").attr("value", "Play");
    }
    $("#sliderDiv").slider("value", $("#sliderDiv").slider("option", "min"));
    p.getBubbleDrawer().clear();
    p.getBubbleDrawer().loadingWindow();
    p.getBubbleDrawer().display();
    loading(axe, idx);
}

function    ColorCheckBox(e) {
    guiData.colorActivated = !guiData.colorActivated;
    p.getBubbleDrawer().useColor(guiData.colorActivated);
    if (guiData.colorActivated)
    {
        $("#selectColorValue").next("input").autocomplete("enable");
    }
    else
    {
        $("#selectColorValue").next("input").autocomplete("disable");
    }
    if (!isPlaying)
        refreshDisplay();
}

function    SizeCheckBox() {
    guiData.sizeActivated = !guiData.sizeActivated;
    p.getBubbleDrawer().useSize(guiData.sizeActivated);
    if (guiData.sizeActivated)
    {
        $("#selectSizeValue").next("input").autocomplete("enable");
    }
    else
    {
        $("#selectSizeValue").next("input").autocomplete("disable");
    }
    if (!isPlaying)
        refreshDisplay();
}

function    DisableUI() {
    $("#sliderDiv").slider("disable");
    $("#speedSlider").slider("disable");
    $("#opacitySlider").slider("disable");
    $("#selectAxeXValue").next("input").autocomplete("disable");
    $("#selectAxeYValue").next("input").autocomplete("disable");
    $("#selectColorValue").next("input").autocomplete("disable");
    $("#selectSizeValue").next("input").autocomplete("disable");
}

function    EnableUI() {
    $("#sliderDiv").slider("enable");
    $("#speedSlider").slider("enable");
    $("#opacitySlider").slider("enable");
    $("#selectAxeXValue").next("input").autocomplete("enable");
    $("#selectAxeYValue").next("input").autocomplete("enable");
    $("#selectColorValue").next("input").autocomplete("enable");
    $("#selectSizeValue").next("input").autocomplete("enable");
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
        $("#sliderDiv").slider("value", $("#sliderDiv").slider("value") + nbsteps);
        refreshBubbles();
        refreshDisplay();
        var speed = ($("#speedSlider").slider("option", "max") - $("#speedSlider").slider("value"));
        setTimeout(Loop, speed * speed / 2);
    }
}