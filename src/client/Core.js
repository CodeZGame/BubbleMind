var bounded = false;
var bubbles = new Array();
var p = null;
var highlightedBubble = -1;
var cursorPos = 0;
var cursorSpeed = 25;
var isPlaying = false;
var scales = new scaleData();
var data = new guiData();
var yearMin = new Array(2);
var yearMax = new Array(2);
var HistoricalMap = {};
var dataEntries = new Array(4);
var currentYear;
var minYear;
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
}

function	runProcessing() {
    // TMP
    bubbles.push(new Bubble(100, 470, 12, 20, "Shellman"));
    bubbles.push(new Bubble(50, 480, 15, 50, "Ghostbusters"));
    bubbles.push(new Bubble(70, 465, 20, 80, "Toto"));
    bubbles.push(new Bubble(0, 450, 14, 130, "TF2"));
    bubbles.push(new Bubble(30, 480, 18, 150, "Medic!"));
    bubbles.push(new Bubble(50, 500, 16, 180, "Mmhhh!"));
    bubbles.push(new Bubble(50, 500, 19, 220, "Over 9000!"));
    bubbles.push(new Bubble(15, 490, 29, 255, "Wei Shen"));
    scales.steps[guiAxes.X] = 10;
    scales.steps[guiAxes.Y] = 10;
    // END TMP
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
}

function    launch() {
    if (data.entries != null && data.entities != null)
        runApplication();
    else
        setTimeout(launch, 150);
}

function	runApplication() {
    setMinYear();
    currentYear = minYear;
    init = true;
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
        if (bubbles[i].isClicked) {
            p.getBubbleDrawer().drawHighlightBubble(bubbles[i].posX, bubbles[i].posY, bubbles[i].size, bubbles[i].col, bubbles[i].crossed);
            drawName(bubbles[i]);
        }
        else
            p.getBubbleDrawer().drawBubble(bubbles[i].posX, bubbles[i].posY, bubbles[i].size, bubbles[i].col, bubbles[i].crossed);
    }
}

function    drawHistoricalBubbles() {
    for (var prop in HistoricalMap) {
        for (j = 0; j < HistoricalMap[prop].length; ++j)
            p.getBubbleDrawer().drawBubble(HistoricalMap[prop][j].posX, HistoricalMap[prop][j].posY, HistoricalMap[prop][j].size, HistoricalMap[prop][j].col, HistoricalMap[prop][j].crossed);
    }
}

function    drawName(b) {
    p.getBubbleDrawer().drawBubbleName(b.posX - (b.size / 2), b.posY - (b.size / 2), b.size,
        b.col, b.name);
}
  
function	overOnPlot(mX, mY) {
    var  	i;
    var  	res = -1;
    var  	resSize = 999999;
    var     hist = false;
    var     b = null;

    for (i = 0; i < bubbles.length; ++i)
        if (bubbles[i].size < resSize
            && overCircle(mX, mY, bubbles[i].posX, bubbles[i].posY, bubbles[i].size / 2)) {
            res = i;
            resSize = bubbles[res].size;
        }
    if (res == -1) {
        for (var prop in HistoricalMap) {
            for (j = 0; j < HistoricalMap[prop].length; ++j)
                if (HistoricalMap[prop][j].size < resSize && overCircle(mX, mY, HistoricalMap[prop][j].posX, HistoricalMap[prop][j].posY, HistoricalMap[prop][j].size / 2)) {
                    res = j;
                    resSize = HistoricalMap[prop][j].size;
                    b = prop;
                }
        }
    }
    if (res >= 0) {
        if (b != null) {
            p.getBubbleDrawer().drawHighlightBubble(HistoricalMap[b][res].posX, HistoricalMap[b][res].posY, HistoricalMap[b][res].size, HistoricalMap[b][res].col, HistoricalMap[b][res].crossed);
            //printOverInfos(res);
            highlightedBubble = -1;
        }
        else {
            highlightedBubble = res;
            p.getBubbleDrawer().drawHighlightBubble(bubbles[res].posX, bubbles[res].posY, bubbles[res].size, bubbles[res].col, bubbles[res].crossed);
            drawName(bubbles[res]);
            //printOverInfos(res);
        }
    }
    else
        highlightedBubble = -1;
}

function    printOverInfos(bubbleNum) {

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
        //refreshDisplay();
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
    for (i = 0; i < bubbles.length; ++i) {
        bubbles[i].x = dataEntries[interfaceAxes.X][bubbles[i].name][currentYear];
        bubbles[i].y = dataEntries[interfaceAxes.Y][bubbles[i].name][currentYear];
    }
}

function	refreshDisplay() {
    bubbles.sort(sortBubbles);
    sortHistoricalBubbles();
    p.getBubbleDrawer().clear();
    drawScales();
    p.getBubbleDrawer().drawDate(currentYear);
    drawBubbles();
    overOnPlot(p.getMouseX(), p.getMouseY());
    p.getBubbleDrawer().display();
}

function    adjustValueToWindow() {

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
        }
    });
}

function    retrieveEntityByIdEntry(idx) {
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
            dataEntries[guiAxes.X] = data;
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
            yearMin[axe] = parseInt(data.min);
            yearMax[axe] = parseInt(data.max);
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
            console.log(data);
            scales.mins[axe] = parseFloat(data.min);
            scales.maxs[axe] = parseFloat(data.max);
        }
    });
}

function    setMinYear() {
    if (yearMin[0] < yearMin[1])
        minYear = yearMin[1];
    else
        minYear = yearMin[0];
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
    //isPlaying = playing;

    // TMP
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
        for (i = 0; i < bubbles.length; ++i) {
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
        }
        // END TMP
        
        //refreshBubbles();
        refreshDisplay();
        $("#sliderDiv").slider("value", $("#sliderDiv").slider("value") + 1);
        ++currentYear;
        setTimeout(Loop, $("#speedSlider").slider("value") * 5);
    }
}