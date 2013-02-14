var year = 1955;
var bounded = false;
var bubbles = new Array();
var p = null;
var highlightedBubble = -1;
 
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
	bubbles.push(new Bubble(100, 100, 12, 100, "Bubble1"));
	bubbles.push(new Bubble(50, 10, 15, 25, "Ghostbusters"));
	bubbles.push(new Bubble(70, 40, 20, 75, "Toto"));
	bubbles.push(new Bubble(0, 50, 14, 168, "TF2"));
	bubbles.push(new Bubble(30, 30, 18, 130, "Medic!"));
	bubbles.push(new Bubble(50, 10, 16, 180, "Mmhhh!"));
	bubbles.push(new Bubble(50, 10, 19, 55, "Over 9000!"));
	bubbles.push(new Bubble(15, 10, 29, 235, "Wei Shen"));
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
	changeScale(1, 0, 1000, 10);
	changeScale(0, 0, 1000, 10);
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
	// NEED CHECK FOR WINDOW BORDER
    p.getBubbleDrawer().drawBubbleName(b.posX - (b.size / 2), b.posY - (b.size / 2), 
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
  
  function	unselectAll() {
	for (i = 0; i < bubbles.length; ++i) {
		bubbles[i].isClicked = false;
	}
  }
  
  function	refreshDisplay() {
	// TMP MOVE BUBBLES RANDOMLY
	for (i = 0; i < bubbles.length; ++i) {
		bubbles[i].posX += Math.floor(Math.random() * 7 + 1);
		bubbles[i].posY += Math.floor(Math.random() * 5 + 1);
		if (bubbles[i].posX > p.width || bubbles[i].posY > p.height) {
			bubbles[i].posY = 0;
			bubbles[i].posX = 0;
		}
	}
	
	bubbles.sort(sortBubbles);
	p.getBubbleDrawer().clear();
	p.getBubbleDrawer().drawDate(year);
	drawBubbles();
	overOnPlot(p.mouseX - 25, p.mouseY);
	p.getBubbleDrawer().display();
	setTimeout(refreshDisplay, 30);
  }
  
  function sortBubbles(b1, b2) {
	if (b1.size > b2.size)
		return -1;
	else
		return 1;
  }

  function changeScale(axe, min, max, steps) {
	p.getBubbleDrawer().drawScale(axe, min, max, steps);
  }