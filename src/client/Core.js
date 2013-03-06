var year = 1955;
var bounded = false;
var bubbles = new Array();
var p = null;
var highlightedBubble = -1;
var cursorPos = 0;
var cursorSpeed = 25;
var isPlaying = false;
 
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
    bubbles.push(new Bubble(100, 470, 12, 20, "Shellman"));
    bubbles.push(new Bubble(50, 480, 15, 50, "Ghostbusters"));
    bubbles.push(new Bubble(70, 465, 20, 80, "Toto"));
    bubbles.push(new Bubble(0, 450, 14, 130, "TF2"));
    bubbles.push(new Bubble(30, 480, 18, 150, "Medic!"));
    bubbles.push(new Bubble(50, 500, 16, 180, "Mmhhh!"));
    bubbles.push(new Bubble(50, 500, 19, 220, "Over 9000!"));
    bubbles.push(new Bubble(15, 490, 29, 255, "Wei Shen"));
    initProcessing();
}
 
function	initProcessing() {
    p = Processing.getInstanceById('ProcessingCanvas');
    if (p) {
        p.bindJavascript(this);
        bounded = true;
        runApplication();
    }
    if (!bounded)
        setTimeout(initProcessing, 250);	 //send data to timeout ??
}

function	runApplication() {
    //changeScale(1, 0, 50, 15);
    //changeScale(0, 42, 30563891, 10);
    refreshDisplay();
}

function	drawBubbles() {
    for (i = 0; i < bubbles.length; ++i) {
        if (bubbles[i].isClicked) {
            p.getBubbleDrawer().drawHighlightBubble(bubbles[i].posX, bubbles[i].posY, bubbles[i].size, bubbles[i].col, bubbles[i].crossed);
            drawName(bubbles[i]);
        }
        else
            p.getBubbleDrawer().drawBubble(bubbles[i].posX, bubbles[i].posY, bubbles[i].size, bubbles[i].col, bubbles[i].crossed);
    }
}
  
function  drawName(b) {
    p.getBubbleDrawer().drawBubbleName(b.posX - (b.size / 2), b.posY - (b.size / 2), b.size,
        b.col, b.name);
}
  
function	overOnPlot(mX, mY) {
    var  	i;
    var  	res = -1;
    var  	resSize = 999999;

    for (i = 0; i < bubbles.length; ++i)
        if (bubbles[i].size < resSize
            && overCircle(mX, mY, bubbles[i].posX, bubbles[i].posY, bubbles[i].size / 2))
            res = i;
    if (res >= 0) {
        highlightedBubble = res;
        p.getBubbleDrawer().drawHighlightBubble(bubbles[res].posX, bubbles[res].posY, bubbles[res].size, bubbles[res].col, bubbles[res].crossed);
        drawName(bubbles[res]);
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
    if (highlightedBubble >= 0)
        bubbles[highlightedBubble].isClicked = !bubbles[highlightedBubble].isClicked;
}
  
function mouveMove() {
    refreshDisplay();
    setTimeout(Loop, $("#speedSlider").slider("value"));
}
  
function	unselectAll() {
    for (i = 0; i < bubbles.length; ++i) {
        bubbles[i].isClicked = false;
    }
}
  
function	refreshDisplay() {
    bubbles.sort(sortBubbles);
    p.getBubbleDrawer().clear();

    // TMP CHROME BUG
    changeScale(1, 0, 50, 15);
    changeScale(0, 42, 30563891, 10);
    // END TMP
    p.getBubbleDrawer().drawDate(year);
    drawBubbles();
    overOnPlot(p.getMouseX(), p.getMouseY());
    p.getBubbleDrawer().display();
}
  
function sortBubbles(b1, b2) {
    if (b1.size > b2.size)
        return -1;
    else
        return 1;
}

// Methods from UI
function changeScale(axe, min, max, steps) {
    p.getBubbleDrawer().drawScale(axe, min, max, steps);
}
  
function MoveCursor(pos) {
    cursorPos = pos;
    $("#sliderDiv").slider("value", pos);
}
  
function SetBubbleSize(size) {
    bubbleSize = size;
}
  
function SetSpeed(speed) {
    cursorSpeed = speed;
}
  
function SetPlayState() {
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
  
function AxeChanged(axe, idx) {
// TODO
}
  
function Loop() {
    if (isPlaying) {
        if ($("#sliderDiv").slider("value") == $("#sliderDiv").slider("option", "max")) {
            SetPlayState();
            return ;
        }
		
        // TMP -> Make bubbles to move randomly while playing	
        for (i = 0; i < bubbles.length; ++i) {
            bubbles[i].posX += Math.floor(Math.random() * 7 + 1);
            bubbles[i].posY -= Math.floor(Math.random() * 5 + 1);
            if (bubbles[i].posX > p.width - 50 || bubbles[i].posY < 0) {
                bubbles[i].posY = 525;
                bubbles[i].posX = 0;
            }
        }
        // END TMP
		
        refreshDisplay();
        setTimeout(Loop, $("#speedSlider").slider("value"));
        $("#sliderDiv").slider("value", $("#sliderDiv").slider("value") + 1);
    }
}