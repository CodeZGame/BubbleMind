var scriptYear = 1955;
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
 }
 
 function	runProcessingTest() {
	bubbles.push(new Bubble(100, 100, 100, 100, "Bubble1"));
	bubbles.push(new Bubble(50, 10, 25, 25, "Foo"));
	bubbles.push(new Bubble(70, 40, 35, 75, "Fu"));
	bubbles.push(new Bubble(0, 50, 55, 168, "Fui"));
	bubbles.push(new Bubble(50, 10, 70, 215, "Feu"));
	runProcessing();
 }
 
 function	runProcessing() {
	p = Processing.getInstanceById('ProcessingCanvas');
	if (p) {
		p.bindJavascript(this);
		bounded = true;
		p.beginTest();
		}
	if (!bounded)
		setTimeout(runProcessing, 250);	 //send data to timeout ??
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
      p.getBubbleDrawer().drawHighlightBubble(bubbles[res].posX, bubbles[res].posY, bubbles[res].size, bubbles[res].col, false);
      //p.bd.drawName(bubbles[res]);
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
  
function	getBubbles() {
	return bubbles;
}