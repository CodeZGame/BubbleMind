var bounded = false;
var bubbles = new Array();
var p = null;
var highlightedBubble = -1;
var cursorPos = 0;
var cursorSpeed = 25;
var isPlaying = false;
var scales = new scaleData();
var data = new guiData();
var year = new yearData();
var entityYearMin = new Array(2);
var entityYearMax = new Array(2);
var HistoricalMap = {};
var OverMap = {};
var dataEntries = new Array(4);
var flagEntities = 0x1;
var flagYears = 0x2;
var flagValues = 0x4;
var loaded;
var init = false;

var    guiAxes = {
    X : 0,
    Y : 1,
    SIZE : 2,
    COLOR : 3
}

function    yearData() {
    this.min = 0;
    this.max = 0;
    this.current = 0;
}

function    scaleData() {
    this.mins = new Array(2);
    this.maxs = new Array(2);
    this.steps = new Array(2);
}

function    guiData() {
    this.entries = null;
    this.entities = null;
}

function	Bubble(posX, posY, size, col, name) {
    this.posX = posX;
    this.posY = posY;
    this.size = size;
    this.col = col;
    this.name = name;
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
        p.bindJavascript(this);
        bounded = true;
        initData();
        launch();
    }
    if (!bounded)
        setTimeout(initProcessing, 250);
}

function    initData() {
    retrieveYearAmpl(guiAxes.X, 1);
    retrieveYearAmpl(guiAxes.Y, 2);
    retrieveEntityByIdEntry(guiAxes.X, 1);
    retrieveEntityByIdEntry(guiAxes.Y, 2);
    retrieveValueAmpl(guiAxes.X, 1);
    retrieveValueAmpl(guiAxes.Y, 2);
    retrieveEntriesFromDB();
    retrieveEntitiesFromDB();
    scales.steps[guiAxes.X] = 10;
    scales.steps[guiAxes.Y] = 10;
}

function    launch() {
    if (data.entries != null && data.entities != null) {
        createBubbles();
        runApplication();
    }
    else
        setTimeout(launch, 150);
}

function    createBubbles() {
    var     tmpColor = 5;
    for (var prop in data.entities) {
        bubbles.push(new Bubble(0, 0, 20, tmpColor, data.entities[prop]));
        tmpColor += 5;
        if (tmpColor > 255)
            tmpColor = 5;
    }
}

function	runApplication() {
    setMinMaxYear();
    year.currentYear = year.minYear;
    init = true;
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
                p.getBubbleDrawer().drawBubble(bubbles[i].posX, bubbles[i].posY, bubbles[i].size, bubbles[i].col, bubbles[i].crossed);
                addToOverMap(bubbles[i]);
            }
            else
                p.getBubbleDrawer().drawBubble(bubbles[i].posX, bubbles[i].posY, bubbles[i].size, bubbles[i].col, bubbles[i].crossed);
        }
    }
}

function    drawHistoricalBubbles() {
    for (var prop in HistoricalMap) {
        for (j = 0; j < HistoricalMap[prop].length; ++j)
            p.getBubbleDrawer().drawBubble(HistoricalMap[prop][j].posX, HistoricalMap[prop][j].posY, HistoricalMap[prop][j].size, HistoricalMap[prop][j].col, HistoricalMap[prop][j].crossed);
    }
}

function    addToOverMap(b) {
    OverMap[b.name] = (jQuery.extend({}, b));
}

function    drawBubblesNames() {
    var     highligth = null;
    for (var b in OverMap) {
        if (highlightedBubble != -1 && OverMap[b].name == bubbles[highlightedBubble].name)
            highligth = b;
        else {
            p.getBubbleDrawer().drawBubbleName(OverMap[b].posX - (OverMap[b].size / 2), OverMap[b].posY - (OverMap[b].size / 2), OverMap[b].size,
                OverMap[b].col, OverMap[b].name);
            delete OverMap[b];
        }
    }
    if (highlightedBubble != -1) {
        p.getBubbleDrawer().drawBubbleName(OverMap[highligth].posX - (OverMap[highligth].size / 2), OverMap[highligth].posY - (OverMap[highligth].size / 2), OverMap[highligth].size,
            OverMap[highligth].col, OverMap[highligth].name);
        delete OverMap[highligth];
    }
}

function	overOnPlot(mX, mY) {
    var  	i;
    var  	res = -1;
    var  	resSize = 999999;
    var     hist = false;
    var     b = null;

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
                    b = prop;
                }
            }
        }
        if (res >= 0) {
            if (b != null) {
                p.getBubbleDrawer().drawHighlightBubble(HistoricalMap[b][res].posX, HistoricalMap[b][res].posY, HistoricalMap[b][res].size, HistoricalMap[b][res].col, HistoricalMap[b][res].crossed);
                p.getBubbleDrawer().drawCoordInfos(dataEntries[guiAxes.X][HistoricalMap[b][res].name][year.currentYear], HistoricalMap[b][res].posX, dataEntries[guiAxes.Y][HistoricalMap[b][res].name][year.currentYear], HistoricalMap[b][res].posY);
                highlightedBubble = -1;
            }
            else {
                highlightedBubble = res;
                p.getBubbleDrawer().drawHighlightBubble(bubbles[res].posX, bubbles[res].posY, bubbles[res].size, bubbles[res].col, bubbles[res].crossed);
                addToOverMap(bubbles[res]);
                p.getBubbleDrawer().drawCoordInfos(dataEntries[guiAxes.X][bubbles[res].name][year.currentYear], bubbles[res].posX, dataEntries[guiAxes.Y][bubbles[res].name][year.currentYear], bubbles[res].posY);
            }
        }
        else
            highlightedBubble = -1;
    }

    function	overCircle(mX, mY, x, y, radius) {
        var		disX = x - mX;
        var		disY = y - mY;
        if (mX < x - radius || mX > x + radius)
            return false;
        if (mY < y - radius || mY > y + radius)
            return false;
        if (Math.sqrt(Math.pow(disX, 2) + Math.pow(disY, 2)) < radius)
            return true;
        return false;
    }

    function	clickOnPlot() {
        if (highlightedBubble >= 0) {
            if (bubbles[highlightedBubble].isClicked)
                removeFromHistorical(bubbles[highlightedBubble].name);
            bubbles[highlightedBubble].isClicked = !bubbles[highlightedBubble].isClicked;
        }
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

    function    refreshBubbles() {
        var     i;
        for (i = 0; i < bubbles.length; ++i) {
            if (bubbles[i].isClicked)
                addToHistorical(bubbles[i]);
            if (dataEntries[guiAxes.X][bubbles[i].name][year.currentYear] == null || dataEntries[guiAxes.Y][bubbles[i].name][year.currentYear] == null)
                bubbles[i].draw = false;
            else {
                bubbles[i].posX = updateAxeX(dataEntries[guiAxes.X][bubbles[i].name][year.currentYear]);
                bubbles[i].posY = updateAxeY(dataEntries[guiAxes.Y][bubbles[i].name][year.currentYear]);
            }
        }
    }

    function    updateAxeX(value) {
        return (value - scales.mins[guiAxes.X]) * p.getBubbleWidth() / (scales.maxs[guiAxes.X] - scales.mins[guiAxes.X]);
    }

    function    updateAxeY(value) {
        return p.getBubbleHeight() - ((value - scales.mins[guiAxes.Y]) * p.getBubbleHeight() / (scales.maxs[guiAxes.Y] - scales.mins[guiAxes.Y]));
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

    function    sortBubbles(b1, b2) {
        if (b1.size >= b2.size)
            return -1;
        else
            return 1;
    }

// Historical methods
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

//DB communication
function    retrieveEntriesFromDB() {
    $.ajax(
    {
        dataType: "json",
        data : {idFile: 1},
        type: "GET",
        url: "/src/server/GetEntries.php",
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("Error on GetEntries [" + errorThrown + "] [" + textStatus + "]");
            // TODO something for better error handle
        },
        success: function(d) {
            data.entries = d;
        }
    });
}

function    retrieveEntitiesFromDB() {
    $.ajax(
    {
        dataType: "json",
        data : {idFile: 1},
        type: "GET",
        url: "/src/server/GetEntities.php",
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("Error on GetEntities [" + errorThrown + "] [" + textStatus + "]");
            // TODO something for better error handle
        },
        success: function(d) {
            data.entities = d;
            console.log(d);
        }
    });
}

function    retrieveEntityByIdEntry(axe, idx) {
    $.ajax(
    {
        dataType: "json",
        data : {idFile: 1, idEntry: idx},
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
        data : {idFile: 1, idEntry: idx},
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
        data : {idFile: 1, idEntry: idx},
        type: "GET",
        url: "/src/server/GetValueAmplByEntry.php",
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("Error on GetValueAmplByEntry [" + errorThrown + "] [" + textStatus + "]");
            // TODO something for better error handle
        },
        success: function(data) {
            //scales.mins[axe] = parseFloat(data.min);
            //scales.maxs[axe] = parseFloat(data.max);
            var max = parseFloat(data.max);
            var min = parseFloat(data.min);
            scales.mins[axe] = Math.ceil(min - (Math.abs(min) * 10 / 100));
            scales.maxs[axe] = Math.ceil((Math.abs(max) * 10 / 100) + Math.abs(max));
        }
    });
}

function    setMinMaxYear() {
    if (entityYearMin[guiAxes.X] < entityYearMin[guiAxes.Y])
        year.minYear = entityYearMin[guiAxes.Y];
    else
        year.minYear = entityYearMin[guiAxes.X];
    if (entityYearMax[guiAxes.X] < entityYearMax[guiAxes.Y])
        year.maxYear = entityYearMax[guiAxes.Y];
    else
        year.maxYear = entityYearMax[guiAxes.X];
}

// Methods from UI

// 0 -> X AXIS || 1 -> Y AXIS
function    changeScale(axe, min, max, step) {
    /*mins[axe] = min;
    maxs[axe] = max;
    steps[axe] = step;*/
    drawScales();
}

function    MoveCursor(pos) {
    cursorPos = pos;
    $("#sliderDiv").slider("value", pos);
}

function    SetBubbleSize(size) {
    bubbleSize = size;
}

function    SetSpeed(speed) {
    cursorSpeed = speed;
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

function    Loop() {
    if (isPlaying) {
        if ($("#sliderDiv").slider("value") == $("#sliderDiv").slider("option", "max")) {
            SetPlayState();
            return ;
        }

        // TMP -> Make bubbles move randomly while playing	
        /*for (i = 0; i < bubbles.length; ++i) {
            if (bubbles[i].isClicked)
                addToHistorical(bubbles[i]);
            bubbles[i].posX += Math.floor(Math.random() * 15 + 1);
            bubbles[i].posY -= Math.floor(Math.random() * 11 + 1);
            bubbles[i].size += (Math.random() - 0.5) * 3;
            if (bubbles[i].size < 10)
                bubbles[i].size = 10;
            else if (bubbles[i].size > 35)
                bubbles[i].size = 35;
            if (bubbles[i].posX > p.width - 50 || bubbles[i].posY < 0) {
                bubbles[i].posY = 525;
                bubbles[i].posX = 0;
            }
        }*/
        // END TMP
        
        refreshBubbles();
        ++year.currentYear;
        refreshDisplay();
        $("#sliderDiv").slider("value", $("#sliderDiv").slider("value") + 1);
        setTimeout(Loop, $("#speedSlider").slider("value") * 5);
    }
}