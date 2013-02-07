PGraphics mainBuffer;
BubbleDrawer bd;
Controller ct;

void setup() {
  size(1024, 768);
  mainBuffer = createGraphics(1024, 768);
  bd = new BubbleDrawer();
  ct = new Controller();
  bd.clear();
  frameRate(30);
  bd.drawDate(1956);
  ct.drawBubbles();
  mainBuffer.textFont(createFont("Verdana", 36, true));
  mainBuffer.imageMode(CENTER);
  mainBuffer.ellipseMode(CENTER);
  mainBuffer.stroke(0);
  mainBuffer.smooth(8);
  mainBuffer.strokeWeight(0.5);
  noLoop();

  // FOR JS
  window.setInterval(runTest, 40);
  runTest();
}

// Needed even if empty
void draw() {
}

void mouseClicked() {
  if (mouseButton == LEFT)
	ct.clickOnPlot(mouseX, mouseY);
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
    mainBuffer.textSize(300);
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

  void  clear() {
    mainBuffer.background(this._bgColor);
  }
}

// FOR TEST ONLY (represent jquery UI)
class    Bubble {

  public int  posX;
  public int  posY;
  public int  size;
  public int  col;
  public String name;

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
        && overCircle(mX, mY, _bubbles[i].posX, _bubbles[i].posY, _bubbles[i].size))
        res = i;
    if (res >= 0) {
      ct.highlighted = res;
      bd.drawHighlightBubble(_bubbles[res].posX, _bubbles[res].posY, _bubbles[res].size, _bubbles[res].col, false);
      this.drawName(_bubbles[res]);
    }
    else {
	  ct.highlighted = -1;
      image(mainBuffer, 0, 0);
	  }
  }

  boolean overCircle(int mX, int mY, int x, int y, int diameter) {
    float disX = x - mX;
    float disY = y - mY;
    if (mX < x - (diameter / 2) || mX > x + (diameter / 2))
      return false;
    if (mY < y - (diameter / 2) || mY > y + (diameter / 2))
      return false;
    if (sqrt(sq(disX) + sq(disY)) < diameter / 2)
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

void  runTest() {
  for (int i = 0; i < ct._nbBubbles; ++i) {
    ct._bubbles[i].posX += random(7);
    ct._bubbles[i].posY += random(5);
    if (ct._bubbles[i].posX > width || ct._bubbles[i].posY > height) {
      ct._bubbles[i].posY = 0;
      ct._bubbles[i].posX = 0;
    }
  }
  mainBuffer.beginDraw();
  bd.clear();
  bd.drawDate(1956);
  bd.drawLine(ct._bubbles[6].posX, ct._bubbles[6].posY, ct._bubbles[7].posX, ct._bubbles[7].posY, 0);
  ct.drawBubbles();
  ct.overOnPlot(mouseX, mouseY);
  mainBuffer.endDraw();
  image(mainBuffer, 0, 0);
  redraw();
}

