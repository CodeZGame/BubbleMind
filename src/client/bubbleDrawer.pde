// /!\ IMPORTANT /!\
// EVERY "mouseX" MUST HAVE [- 25] VALUE BECAUSE THE IMAGE
// MOVE BY 25 INCH ON X AXIS FOR THE GRID BUFFER

PGraphics mainBuffer;
PGraphics gridBuffer;
BubbleDrawer bd;

int width = 800;
int height = 555;
int bubbleWidth = width - 25;
int bubbleHeight = height - 25;

interface JavaScript {
	boolean isPlaying;
	void	mouseMoved();
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
  gridBuffer.textFont(createFont("Verdana", 20, true));
  mainBuffer.ellipseMode(CENTER);
  mainBuffer.stroke(0);
  mainBuffer.smooth(4);
  mainBuffer.strokeWeight(0.5);
  mainBuffer.colorMode(HSB, 255);
  mainBuffer.beginDraw();
  bd.clear();
  noLoop();
}

void draw() {
}

void mouseMoved() {
	if (js.isPlaying != true) {
		js.mouveMove();
	}
}

void mouseClicked() {
  if (mouseButton == LEFT)
	js.clickOnPlot();
}

class    BubbleDrawer {
  private color	_bgColor = #FFFFFF;
  private int 	_alphaValue = 220;
  private int	_defaultSaturation = 255;
  private int	_defaultBrightness = 255;

  BubbleDrawer() {
  }

  void drawBubble(int posX, int posY, int size, int col, boolean crossed) {
    mainBuffer.fill(col, this._defaultSaturation, this._defaultBrightness, this._alphaValue);
    mainBuffer.ellipse(posX, posY, size, size);
  }

  void  drawHighlightBubble(int posX, int posY, int size, int col, boolean crossed) {
    mainBuffer.fill(col, this._defaultSaturation, this._defaultBrightness, this._alphaValue);
    mainBuffer.ellipse(posX, posY, size, size);
    mainBuffer.strokeWeight(7);
    mainBuffer.stroke(col, this._defaultSaturation, this._defaultBrightness, 75);
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
    mainBuffer.fill(180);
    mainBuffer.text(year, yearWidth, yearHeight);
  }

  void  drawBubbleName(int posX, int posY, int size, int col, String name) {
    mainBuffer.strokeWeight(3);
    mainBuffer.stroke(col, this._defaultSaturation, this._defaultBrightness, this._alphaValue);
    mainBuffer.textSize(20);
    mainBuffer.fill(255);
    float nameHeight = mainBuffer.textAscent() + mainBuffer.textDescent();
	//Normal position (upper left corner)
	if (posX - mainBuffer.textWidth(name) - 5 > 0 && posY - nameHeight - 5 > 0) {
		mainBuffer.rect(posX - mainBuffer.textWidth(name) - 5, posY - nameHeight - 5, mainBuffer.textWidth(name) + 8, nameHeight + 10, 10, 10, 0, 10);
		mainBuffer.fill(150);
		mainBuffer.text(name, posX - mainBuffer.textWidth(name), posY);
	}
	//Upper right corner
	else if (posX - mainBuffer.textWidth(name) - 5 < 0 && posY - nameHeight - 5 > 0) {
		mainBuffer.rect(posX + size - 5, posY - nameHeight - 5, mainBuffer.textWidth(name) + 8, nameHeight + 10, 10, 10, 10, 0);
		mainBuffer.fill(150);
		mainBuffer.text(name, posX + size, posY);
	}
	//Downer left corner
	else if (posX - mainBuffer.textWidth(name) - 5 > 0 && posY - nameHeight - 5 < 0) {
		mainBuffer.rect(posX - mainBuffer.textWidth(name) - 5, posY + size - 5, mainBuffer.textWidth(name) + 8, nameHeight + 10, 10, 0, 10, 10);
		mainBuffer.fill(150);
		mainBuffer.text(name, posX - mainBuffer.textWidth(name), posY + size + nameHeight);
	}
	//Downer right corner
	else {
		mainBuffer.rect(posX + size - 5, posY + size - 5, mainBuffer.textWidth(name) + 8, nameHeight + 10, 0, 10, 10, 10);
		mainBuffer.fill(150);
		mainBuffer.text(name, posX + size, posY + size + nameHeight);
	}
    mainBuffer.strokeWeight(0.5);
    mainBuffer.stroke(0);
  }

  void  drawLine(int beginX, int beginY, int endX, int endY) {
    mainBuffer.fill(215);
    mainBuffer.line(beginX, beginY, endX, endY);
  }

  void	drawScale(int axis, float min, float max, int steps) {
	int	stepSize;
	gridBuffer.beginDraw();
	// X AXIS
	if (axis == 0) {
		stepSize = bubbleWidth / steps;
		gridBuffer.strokeWeight(2);
		gridBuffer.line(24, height - 24, width, height - 24);
		gridBuffer.strokeWeight(0.2);
		gridBuffer.fill(215, 30);
		gridBuffer.textSize(20);
		for (int i = 1; i < steps; ++i) {
			gridBuffer.line(24 + i * stepSize, 0, 24 + i * stepSize, height - 24);
			gridBuffer.text("testtttt", 0, 10);
		}
	}
	// Y AXIS
	else {
		stepSize = bubbleHeight / steps;
	    gridBuffer.strokeWeight(2);
		gridBuffer.line(24, 0, 24, bubbleHeight);
		gridBuffer.strokeWeight(0.2);
		gridBuffer.fill(215, 30);
		gridBuffer.textSize(20);
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
	//image(mainBuffer, 25, 0);
	mainBuffer.beginDraw();
  }
  
  void  clear() {
    //mainBuffer.background(this._bgColor, 0);
  }
}