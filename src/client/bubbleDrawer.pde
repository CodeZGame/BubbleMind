// /!\ IMPORTANT /!\
// EVERY "mouseX" MUST HAVE [- 25] VALUE BECAUSE THE IMAGE
// MOVE BY 25 INCH ON X AXIS FOR THE GRID BUFFER

PGraphics mainBuffer;
PGraphics gridBuffer;
BubbleDrawer bd;
Controller ct;

boolean init = false;
int width = 800;
int height = 600;
int bubbleWidth = width - 25;
int bubbleHeight = height - 25;
int year;
Array bullesList;

interface JavaScript {
	int scriptYear;
	
	ArrayList getBulles();
}

JavaScript javascript = null;

void bindJavascript(JavaScript js) {
	javascript = js;
}

void setup() {
  size(width, height);
  mainBuffer = createGraphics(bubbleWidth, bubbleHeight);
  gridBuffer = createGraphics(width, height);
  bd = new BubbleDrawer();
  ct = new Controller();
  mainBuffer.textFont(createFont("Verdana", 20, true));
  gridBuffer.background(bd._bgColor);
  mainBuffer.ellipseMode(CENTER);
  mainBuffer.stroke(0);
  mainBuffer.smooth(4);
  mainBuffer.strokeWeight(0.5);
  bd.clear();
  frameRate(20);
  //bd.drawDate(year);
  //ct.drawBubbles();
  bd.drawScale(1, 0, 1000, 10);
  bd.drawScale(0, 0, 1000, 10);
  noLoop();
}

void draw() {
	if (init)
		runTest();
	else
		init = true;
}

void mouseClicked() {
  if (mouseButton == LEFT)
	ct.clickOnPlot(mouseX - 25, mouseY);
}

class    BubbleDrawer {
  private color  _bgColor = #FFFFFF;
  private int alphaValue = 220;

  BubbleDrawer() {
  }

  void drawBubble(int posX, int posY, int size, int col, boolean crossed) {
    mainBuffer.fill(col, alphaValue);
    mainBuffer.ellipse(posX, posY, size, size);
  }

  void  drawHighlightBubble(int posX, int posY, int size, int col, boolean crossed) {
    mainBuffer.fill(col, alphaValue);
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
    mainBuffer.fill(col, alphaValue);
    mainBuffer.line(beginX, beginY, endX, endY);
  }

  void	drawScale(int axis, float min, float max, int steps) {
	int	stepSize;
	if (axis == 0) {			// X AXIS
		stepSize = bubbleWidth / steps;
		gridBuffer.strokeWeight(2);
		gridBuffer.line(24, height - 24, width, height - 24);
		gridBuffer.strokeWeight(0.5);
		for (int i = 1; i < steps; ++i) {
			gridBuffer.line(24 + i * stepSize, 0, 24 + i * stepSize, height - 24);
		}
	}
	else {						// Y AXIS
		stepSize = bubbleHeight / steps;
	    gridBuffer.strokeWeight(2);
		gridBuffer.line(24, 0, 24, bubbleHeight);
		gridBuffer.strokeWeight(0.5);
		for (int i = 1; i < steps; ++i) {
			gridBuffer.line(24, i * stepSize, width, i * stepSize);
		}
	}
	gridBuffer.strokeWeight(0.5);
  }
  
  void  clear() {
    mainBuffer.background(this._bgColor, 0);
  }
}

// FOR TEST ONLY (represent jquery UI)
class    Bubble {

  public int  posX;
  public int  posY;
  public int  size;
  public int  col;
  public String name;
  public boolean isClicked = false;

  Bubble(int x, int y, int size, int col, String name) {
    this.posX = x;
    this.posY = y;
    this.size = size;
    this.col = col;
    this.name = name;
  }
}

class    Controller {

  public Bubble[]  _bubbles;
  public int       _nbBubbles = 9;
  private int highlighted = -1;

  Controller() {
    _bubbles = new Bubble[_nbBubbles];
    _bubbles[0] = new Bubble(100, 100, 150, #FF2F2F, "piou");
    _bubbles[1] = new Bubble(200, 200, 180, #33FF33, "gay");
    _bubbles[2] = new Bubble(42, 400, 75, #AAAAFF, "rubik");
    _bubbles[3] = new Bubble(200, 40, 42, #AA22FF, "toto");
    _bubbles[4] = new Bubble(400, 150, 20, #DDDDEE, "foo");
    _bubbles[5] = new Bubble(0, 0, 80, #0000FF, "Chinois");
    _bubbles[6] = new Bubble(123, 190, 110, #2222AA, "TF2");
    _bubbles[7] = new Bubble(50, 300, 60, #AA7777, "Medic!");
    _bubbles[8] = new Bubble(width, height, 100, #AAAAAA, "Ghostbusters");
  }

  void    drawBubbles() {
    int  i;

    for (i = 0; i < _nbBubbles; ++i) {
      if (_bubbles[i].isClicked) {
        bd.drawHighlightBubble(_bubbles[i].posX, _bubbles[i].posY, _bubbles[i].size, _bubbles[i].col, false);
        this.drawName(_bubbles[i]);
      }
      else
        bd.drawBubble(_bubbles[i].posX, _bubbles[i].posY, _bubbles[i].size, _bubbles[i].col, false);
    }
  }

  void    overOnPlot(int mX, int mY) {
    int  i;
    int  res = -1;
    int  resSize = 999999;

    for (i = 0; i < _nbBubbles; ++i)
      if (_bubbles[i].size < resSize
        && overCircle(mX, mY, _bubbles[i].posX, _bubbles[i].posY, _bubbles[i].size / 2))
        res = i;
    if (res >= 0) {
      ct.highlighted = res;
      bd.drawHighlightBubble(_bubbles[res].posX, _bubbles[res].posY, _bubbles[res].size, _bubbles[res].col, false);
      this.drawName(_bubbles[res]);
    }
    else
	  ct.highlighted = -1;
  }

  boolean overCircle(int mX, int mY, int x, int y, int radius) {
    float disX = x - mX;
    float disY = y - mY;
    if (mX < x - radius || mX > x + radius)
      return false;
    if (mY < y - radius || mY > y + radius)
      return false;
    if (sqrt(sq(disX) + sq(disY)) < radius)
      return true;
    return false;
  }

  void  drawName(Bubble b) {
    bd.drawBubbleName(b.posX - (b.size / 2), b.posY - (b.size / 2), 
    b.col, b.name);
  }

  void  clickOnPlot(int mX, int mY) {
    if (ct.highlighted >= 0)
      ct._bubbles[ct.highlighted].isClicked = !ct._bubbles[ct.highlighted].isClicked;
  }
}

void beginTest() {
	if (javascript) {
		year = javascript.scriptYear;
		bullesList = javascript.getBulles();
		}
	else
		year = 2000;
	loop();
}

void  runTest() {
  /*for (int i = 0; i < ct._nbBubbles; ++i) {
    ct._bubbles[i].posX += random(7);
    ct._bubbles[i].posY += random(5);
    if (ct._bubbles[i].posX > width || ct._bubbles[i].posY > height) {
      ct._bubbles[i].posY = 0;
      ct._bubbles[i].posX = 0;
    }
  }*/
  mainBuffer.beginDraw();
  bd.clear();
  bd.drawDate(year);
  
  for (int nb = 0; nb < bullesList.length; ++nb)
	bd.drawBubble(bullesList[nb].posX, bullesList[nb].posY, bullesList[nb].size, bullesList[nb].col, false);
  
  //bd.drawLine(ct._bubbles[6].posX, ct._bubbles[6].posY, ct._bubbles[7].posX, ct._bubbles[7].posY, 0);
  //ct.drawBubbles();
  //ct.overOnPlot(mouseX - 25, mouseY);
  mainBuffer.endDraw();
  image(gridBuffer, 0, 0);
  image(mainBuffer, 25, 0);
}

