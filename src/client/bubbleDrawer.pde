// /!\ IMPORTANT /!\
// EVERY "mouseX" MUST HAVE [- 25] VALUE BECAUSE THE IMAGE
// MOVE BY 25 INCH ON X AXIS FOR THE GRID BUFFER

PGraphics mainBuffer;
PGraphics gridBuffer;
BubbleDrawer bd;

int width = 800;
int height = 625;
int bubbleWidth = width - 25;
int bubbleHeight = height - 25;

interface JavaScript {	
	void	clickOnPlot();
}

JavaScript js = null;

void bindJavascript(JavaScript jsBind) {
	js = jsBind;
}

BubbleDrawer getBubbleDrawer() {
	return bd;
}

void setup() {
  size(width, height);
  mainBuffer = createGraphics(bubbleWidth, bubbleHeight);
  gridBuffer = createGraphics(width, height);
  bd = new BubbleDrawer();
  mainBuffer.textFont(createFont("Verdana", 20, true));
  gridBuffer.background(bd._bgColor);
  mainBuffer.ellipseMode(CENTER);
  mainBuffer.stroke(0);
  mainBuffer.smooth(4);
  mainBuffer.strokeWeight(0.5);
  mainBuffer.beginDraw();
  bd.clear();
  noLoop();
}

void draw() {
}

void mouseClicked() {
  if (mouseButton == LEFT)
	js.clickOnPlot();
}

class    BubbleDrawer {
  private color	_bgColor = #FFFFFF;
  private int 	_alphaValue = 220;

  BubbleDrawer() {
  }

  void drawBubble(int posX, int posY, int size, int col, boolean crossed) {
    mainBuffer.fill(col, _alphaValue);
    mainBuffer.ellipse(posX, posY, size, size);
  }

  void  drawHighlightBubble(int posX, int posY, int size, int col, boolean crossed) {
    mainBuffer.fill(col, _alphaValue);
    mainBuffer.ellipse(posX, posY, size, size);
    mainBuffer.strokeWeight(7);
    mainBuffer.stroke(col, 75);
    mainBuffer.noFill();
    mainBuffer.ellipse(posX, posY, size + 15, size + 15);
    mainBuffer.strokeWeight(0.5);
    mainBuffer.stroke(0);
  }

  void  drawDate(int date) {
    mainBuffer.textSize(height * 30 / 100);
    String year = str(date);
    float yearWidth = (width - mainBuffer.textWidth(year)) / 2;
    float yearHeight = (height + mainBuffer.textDescent()) / 2;
    mainBuffer.fill(150);
    mainBuffer.text(year, yearWidth, yearHeight);
  }

  void  drawBubbleName(int posX, int posY, int col, String name) {
    mainBuffer.strokeWeight(3);
    mainBuffer.stroke(col);
    mainBuffer.textSize(20);
    mainBuffer.fill(255);
    float nameHeight = mainBuffer.textAscent() + mainBuffer.textDescent();
    mainBuffer.rect(posX - mainBuffer.textWidth(name) - 5, posY - nameHeight - 5, mainBuffer.textWidth(name) + 8, nameHeight + 10, 10, 10, 0, 10);
    mainBuffer.fill(150);
    mainBuffer.text(name, posX - mainBuffer.textWidth(name), posY);
    mainBuffer.strokeWeight(0.5);
    mainBuffer.stroke(0);
  }

  void  drawLine(int beginX, int beginY, int endX, int endY, int col) {
    mainBuffer.fill(col, _alphaValue);
    mainBuffer.line(beginX, beginY, endX, endY);
  }

  void	drawScale(int axis, float min, float max, int steps) {
	int	stepSize;
	gridBuffer.beginDraw();
	if (axis == 0) {			// X AXIS
		stepSize = bubbleWidth / steps;
		gridBuffer.strokeWeight(2);
		gridBuffer.line(24, height - 24, width, height - 24);
		gridBuffer.strokeWeight(1);
		for (int i = 1; i < steps; ++i) {
			gridBuffer.line(24 + i * stepSize, 0, 24 + i * stepSize, height - 24);
		}
	}
	else {						// Y AXIS
		stepSize = bubbleHeight / steps;
	    gridBuffer.strokeWeight(2);
		gridBuffer.line(24, 0, 24, bubbleHeight);
		gridBuffer.strokeWeight(1);
		for (int i = 1; i < steps; ++i) {
			gridBuffer.line(24, i * stepSize, width, i * stepSize);
		}
	}
	gridBuffer.strokeWeight(0.5);
	gridBuffer.endDraw();
  }
  
  void	display() {
	mainBuffer.endDraw();
	image(gridBuffer, 0, 0);
	image(mainBuffer, 25, 0);
	mainBuffer.beginDraw();
  }
  
  void  clear() {
    mainBuffer.background(this._bgColor, 0);
  }
}