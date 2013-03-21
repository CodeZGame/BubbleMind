PGraphics mainBuffer;
BubbleDrawer bd;

int width = 800;
int height = 555;
int offsetX = 50;
int offsetY = 25;
int bubbleWidth = width - offsetX;
int bubbleHeight = height - offsetY;
float stdStrokeWeight = 0.8;

interface JavaScript {
	boolean isPlaying;
	boolean init;
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

int getBubbleWidth() {
	return bubbleWidth;
}

int getBubbleHeight() {
	return bubbleHeight;
}

void setup() {
	size(width, height);
	frameRate(30);
	mainBuffer = createGraphics(width, height);
	bd = new BubbleDrawer();
	mainBuffer.textFont(createFont("Verdana", 20, true));
	mainBuffer.beginDraw();
	mainBuffer.background(0, 0, 0, 0);
	mainBuffer.textAlign(CENTER, CENTER);
	mainBuffer.ellipseMode(CENTER);
	mainBuffer.stroke(0);
	mainBuffer.smooth(8);
	mainBuffer.strokeWeight(stdStrokeWeight);
	mainBuffer.colorMode(HSB, 255);
	bd.clear();
	noLoop();
}

void draw() {
	mainBuffer.endDraw();
	image(mainBuffer, 0, 0);
	mainBuffer.beginDraw();
}

int getMouseX() {
	return mouseX - offsetX;
}
  
int getMouseY() {
	return mouseY;
}

void mouseMoved() {
	if (init && !js.isPlaying) {
		js.mouveMove();
	}
}

void mouseClicked() {
  if (mouseButton == LEFT)
	js.clickOnPlot();
}

class    BubbleDrawer {
  private int 	_alphaValue = 220;
  private int	_defaultSaturation = 255;
  private int	_defaultBrightness = 255;

  BubbleDrawer() {
  }

  void drawBubble(int posX, int posY, int size, int col, boolean crossed) {
    mainBuffer.fill(col, this._defaultSaturation, this._defaultBrightness, this._alphaValue);
    mainBuffer.ellipse(posX + offsetX, posY, size, size);
  }

  void  drawHighlightBubble(int posX, int posY, int size, int col, boolean crossed) {
    mainBuffer.fill(col, this._defaultSaturation, this._defaultBrightness, this._alphaValue);
    mainBuffer.ellipse(posX + offsetX, posY, size, size);
    mainBuffer.strokeWeight(5);
    mainBuffer.stroke(col, this._defaultSaturation, this._defaultBrightness, 100);
    mainBuffer.noFill();
    mainBuffer.ellipse(posX + offsetX, posY, size + 12, size + 12);
    mainBuffer.strokeWeight(stdStrokeWeight);
    mainBuffer.stroke(0);
  }

  void  drawDate(int date) {
    mainBuffer.textSize(height * 30 / 100);
    String year = str(date);
    float yearWidth = width / 2;
    float yearHeight = height / 2;
    mainBuffer.fill(180);
    mainBuffer.text(year, yearWidth, yearHeight);
  }

  void  drawBubbleName(int posX, int posY, int size, int col, String name) {
  	mainBuffer.textAlign(LEFT, TOP);
    mainBuffer.strokeWeight(3);
    mainBuffer.stroke(col, this._defaultSaturation, this._defaultBrightness, this._alphaValue);
    mainBuffer.textSize(20);
    mainBuffer.fill(255, 255);
    float nameHeight = mainBuffer.textAscent() + mainBuffer.textDescent();
	//Normal position (upper left corner)
	if (posX - offsetX - mainBuffer.textWidth(name) - 5 > 0 && posY - nameHeight - 5 > 0) {
		mainBuffer.rect(posX + offsetX - mainBuffer.textWidth(name) - 5, posY - nameHeight - 5, mainBuffer.textWidth(name) + 8, nameHeight + 10, 10, 10, 0, 10);
		mainBuffer.fill(150);
		mainBuffer.text(name, posX + offsetX - mainBuffer.textWidth(name), posY - offsetY + 4);
	}
	//Upper right corner
	else if (posX - offsetX - mainBuffer.textWidth(name) - 5 < 0 && posY - nameHeight - 5 > 0) {
		mainBuffer.rect(posX + offsetX + size - 5, posY - nameHeight - 5, mainBuffer.textWidth(name) + 8, nameHeight + 10, 10, 10, 10, 0);
		mainBuffer.fill(150);
		mainBuffer.text(name, posX + offsetX + size, posY - offsetY + 4);
	}
	//Downer left corner
	else if (posX - offsetX - mainBuffer.textWidth(name) - 5 > 0 && posY - nameHeight - 5 < 0) {
		mainBuffer.rect(posX + offsetX - mainBuffer.textWidth(name) - 5, posY + size - 5, mainBuffer.textWidth(name) + 8, nameHeight + 10, 10, 0, 10, 10);
		mainBuffer.fill(150);
		mainBuffer.text(name, posX + offsetX - mainBuffer.textWidth(name), posY + size + nameHeight - offsetY + 4);
	}
	//Downer right corner
	else {
		mainBuffer.rect(posX + offsetX + size - 5, posY + size - 5, mainBuffer.textWidth(name) + 8, nameHeight + 10, 0, 10, 10, 10);
		mainBuffer.fill(150);
		mainBuffer.text(name, posX + offsetX + size, posY + size + nameHeight - offsetY + 4);
	}
    mainBuffer.strokeWeight(stdStrokeWeight);
    mainBuffer.stroke(0);
   	mainBuffer.textAlign(CENTER, CENTER);
  }

  void  drawLine(int beginX, int beginY, int endX, int endY) {
    mainBuffer.fill(215);
    mainBuffer.line(beginX, beginY, endX, endY);
  }

  void	drawScale(int axis, float min, float max, int steps) {
	int	stepSize;
	String value;
	//float maxUp = ceil(abs(max) * 5 / 100 + max);
	//float minDown = ceil(min - (abs(min) * 5 / 100));
	float maxUp = max;
	float minDown = min;
	int tmpValueStep = ceil((abs(maxUp) + abs(minDown)) / (steps));
	int valueStep = abs(tmpValueStep);
	mainBuffer.textSize(13);
	mainBuffer.strokeWeight(2);
	mainBuffer.stroke(0, 0, 87, 87);
	// X AXIS -- Y GRID
	if (axis == 0) {
		stepSize = bubbleWidth / steps;
		mainBuffer.line(offsetX - 1, height - offsetY + 1, width, height - offsetY + 1);
		mainBuffer.strokeWeight(stdStrokeWeight);
		mainBuffer.fill(215, 30);
		for (int i = 1; i < steps; ++i) {
			mainBuffer.line(offsetX - 1 + i * stepSize, 0, offsetX - 1 + i * stepSize, height - offsetY - 1);
			value = calcValue(maxUp, valueStep, i, minDown);
			mainBuffer.fill(30, 70);
			if (i == 1)
				mainBuffer.text(minDown, stepSize - mainBuffer.textWidth(minDown) / 2, height - offsetY + textAscent() + 2);
			mainBuffer.text(value, (i + 1) * stepSize - mainBuffer.textWidth(value) / 2, height - offsetY + textAscent() + 2);
		}
	}
	// Y AXIS -- X GRID
	else {
		stepSize = bubbleHeight / steps;
		mainBuffer.line(offsetX - 1, 0, offsetX - 1, bubbleHeight);
		mainBuffer.strokeWeight(stdStrokeWeight);
		mainBuffer.fill(215, 30);
		for (int i = 1; i < steps; ++i) {
			mainBuffer.line(offsetX - 1, i * stepSize, width, i * stepSize);
			value = calcValue(maxUp, valueStep, i, minDown);
			mainBuffer.fill(30, 70);
			mainBuffer.pushMatrix();
			mainBuffer.translate(offsetX - mainBuffer.textWidth(value) / 2 - 5, height - offsetY - stepSize * i);
			mainBuffer.rotate(-0.6);
			mainBuffer.text(value, 0, 0);
			mainBuffer.popMatrix();
			if (i == steps - 1)
			{
				mainBuffer.pushMatrix();
				mainBuffer.translate(offsetX - mainBuffer.textWidth(minDown) / 2 - 5, stepSize * (i + 1));
				mainBuffer.rotate(-0.6);
				mainBuffer.text(minDown, 0, 0);
				mainBuffer.popMatrix();
			}
		}
	}
	mainBuffer.stroke(0);
  }

  void	drawCoordInfos(float xVal, int posX, float yVal, int posY) {
  	mainBuffer.textAlign(LEFT, TOP);
    mainBuffer.strokeWeight(1.5);
    mainBuffer.stroke(0);
    mainBuffer.textSize(13);
    mainBuffer.fill(255);
    float valueHeight = mainBuffer.textAscent() + mainBuffer.textDescent();
	
	mainBuffer.rect(posX + offsetX - (mainBuffer.textWidth(xVal) + 8) / 2, bubbleHeight + mainBuffer.textDescent() - 2, mainBuffer.textWidth(xVal) + 8, valueHeight + 5, 0, 0, 0, 0);
	mainBuffer.fill(0);
	mainBuffer.text(xVal, posX + offsetX - (mainBuffer.textWidth(xVal) + 8) / 2 + 4, bubbleHeight + mainBuffer.textDescent() + 2);
	
	mainBuffer.fill(255);
	mainBuffer.rect(offsetX - mainBuffer.textWidth(yVal) - 10, posY - (valueHeight + 5) / 2, mainBuffer.textWidth(yVal) + 8, valueHeight + 5, 0, 0, 0, 0);
	mainBuffer.fill(0);
	mainBuffer.text(yVal, offsetX - mainBuffer.textWidth(yVal) - 5, posY - (valueHeight + 5) / 2 + 2);
	
	mainBuffer.strokeWeight(stdStrokeWeight);
    mainBuffer.stroke(0);
   	mainBuffer.textAlign(CENTER, CENTER);
  }

  float calcValue(float max, int valueStep, int i, int min) {
  	float value;
  	int valueLength;
  	float tmp;

  	if (max < 100) {
  		value = ceil(min + valueStep * i);
  	}
  	else {
  		value = ceil(min + valueStep * i);
  		valueLength = nbLength(value);
  		tmp = pow(10, ceil(valueLength / 2));
  		value = round(value / tmp) * tmp;
  		value = value;
  	}
  	return value;
  }

  int nbLength(float nb) {
  	float tmp = abs(nb);
  	int number = 1;
  	while (tmp >= 10) {
  		tmp /= 10;
  		++number;
  	}
  	return number;
  }

  void	display() {
	redraw();
  }
  
  void  clear() {
    mainBuffer.background(255, 0, 255, 255); // alpha value to 110 for speed effect
  }
}