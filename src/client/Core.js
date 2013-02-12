var scriptYear = 1955;
var bounded = false;
var bullesList = new Array();
 
 function Bulle(posX, posY, size, col, name) {
	this.posX = posX;
	this.posY = posY;
	this.size = size;
	this.col = col;
	this.name = name;
 }
 
 function runProcessingTest() {
	bullesList.push(new Bulle(100, 100, 100, 100, "Bubble1"));
	bullesList.push(new Bulle(50, 10, 25, 25, "Foo"));
	bullesList.push(new Bulle(70, 40, 35, 75, "Fu"));
	bullesList.push(new Bulle(0, 50, 55, 168, "Fui"));
	bullesList.push(new Bulle(50, 10, 70, 215, "Feu"));
	runProcessing();
 }
 
 function runProcessing() {
	var p = Processing.getInstanceById('ProcessingCanvas');
	if (p) {
		p.bindJavascript(this);
		bounded = true;
		p.beginTest();
		}
	if (!bounded)
		setTimeout(runProcessing, 250);	 //send data to timeout ??
}

function getBulles() {
	return bullesList;
}