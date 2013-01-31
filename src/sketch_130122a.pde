PGraphics mainBuffer;
PGraphics secondBuffer;
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
  mainBuffer.imageMode(CENTER);
  mainBuffer.ellipseMode(CENTER);
  mainBuffer.stroke(0);
  mainBuffer.smooth(8);
  mainBuffer.strokeWeight(0.5);
  noLoop();

  // FOR JS
  window.setInterval(runTest, 40);
  runTest();

  // FOR JAVA
  //thread("runTest");
}

// Needed even if empty
void draw() {
}

class    BubbleDrawer
{
  private color  _bgColor = #FFFFFF;

  BubbleDrawer() {
  }

  void drawBubble(int posX, int posY, int size, int col, boolean crossed) {
    //mainBuffer.beginDraw();
    mainBuffer.fill(col);
    mainBuffer.ellipse(posX, posY, size, size);
    //mainBuffer.endDraw();
    //image(mainBuffer, 0, 0);
  }

  void  drawHighlightBubble(int posX, int posY, int size, int col, boolean crossed) {
    mainBuffer.beginDraw();
    mainBuffer.fill(col);
    mainBuffer.ellipse(posX, posY, size, size);
    mainBuffer.strokeWeight(7);
    mainBuffer.stroke(col, 75);
    mainBuffer.noFill();
    mainBuffer.ellipse(posX, posY, size + 15, size + 15);
    mainBuffer.strokeWeight(0.5);
    mainBuffer.stroke(0);
    mainBuffer.endDraw();
    image(mainBuffer, 0, 0);
  }

  void copyPixels(PGraphics dest, PGraphics src) {
    int  col = 0;
    src.loadPixels();
    dest.loadPixels();
    for (int y = 0; y < src.height; y++) {
      col = y * src.width;
      for (int x = 0; x < src.width; x++)
        dest.pixels[x + col] = src.pixels[x + col];
    } 
    dest.updatePixels();
  }

  void  drawDate(int date) {
    mainBuffer.beginDraw();
    mainBuffer.textFont(createFont("Verdana", 36, true));
    mainBuffer.textSize(300);
    String year = str(date);
    float yearWidth = (width - mainBuffer.textWidth(year)) / 2;
    float yearHeight = (height + mainBuffer.textDescent()) / 2;
    mainBuffer.fill(150);
    mainBuffer.text(year, yearWidth, yearHeight);
    mainBuffer.endDraw();
    //image(mainBuffer, 0, 0);
    redraw();
  }

  void  clear() {
    //mainBuffer.beginDraw();
    mainBuffer.background(this._bgColor);
    //mainBuffer.endDraw();
  }
}

// FOR TEST ONLY (represent jquery UI)
class    Bubble {

  public int  posX;
  public int  posY;
  public int  size;
  public int  col;

  Bubble(int x, int y, int size, int col) {
    this.posX = x;
    this.posY = y;
    this.size = size;
    this.col = col;
  }
}

class    Controller {

  public Bubble[]  _bubbles;
  public int       _nbBubbles = 9;

  Controller() {
    _bubbles = new Bubble[_nbBubbles];
    _bubbles[0] = new Bubble(100, 100, 150, #FF0000);
    _bubbles[1] = new Bubble(200, 200, 180, #00FF00);
    _bubbles[2] = new Bubble(42, 400, 75, #AAAAFF);
    _bubbles[3] = new Bubble(200, 40, 42, #AA22FF);
    _bubbles[4] = new Bubble(400, 150, 20, #DDDDEE);
    _bubbles[5] = new Bubble(0, 0, 80, #0000FF);
    _bubbles[6] = new Bubble(123, 190, 110, #2222AA);
    _bubbles[7] = new Bubble(50, 300, 60, #AA7777);
    _bubbles[8] = new Bubble(width, height, 100, #AAAAAA);
  }

  void    drawBubbles() {
    int  i;

    mainBuffer.beginDraw();
    bd.clear();
    for (i = 0; i < _nbBubbles; ++i) {
      bd.drawBubble(_bubbles[i].posX, _bubbles[i].posY, _bubbles[i].size, _bubbles[i].col, false);
    }
    mainBuffer.endDraw();
    //image(mainBuffer, 0, 0);
    //redraw();
  }

  void    overOnPlot(int mX, int mY) {
    int  i;
    int  res = -1;
    int  resSize = 999999;

    for (i = 0; i < _nbBubbles; ++i)
      if (_bubbles[i].size < resSize
        && overCircle(mX, mY, _bubbles[i].posX, _bubbles[i].posY, _bubbles[i].size))
        res = i;
    if (res >= 0)
      bd.drawHighlightBubble(_bubbles[res].posX, _bubbles[res].posY, _bubbles[res].size, _bubbles[res].col, false);
    else
      image(mainBuffer, 0, 0);
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
}

// FOR JAVA
/*void  runTest() {
 while (true) {
 for (int i = 0; i < ct._nbBubbles; ++i) {
 ct._bubbles[i].posX += random(7);
 ct._bubbles[i].posY += random(5);
 if (ct._bubbles[i].posX > width || ct._bubbles[i].posY > height) {
 ct._bubbles[i].posY = 0;
 ct._bubbles[i].posX = 0;
 }
 }
 ct.drawBubbles();
 ct.overOnPlot(mouseX, mouseY);
 redraw();
 try {
 Thread.currentThread().sleep(40);
 } 
 catch (InterruptedException e) {
 print("Error thread sleep");
 exit ();
 }
 }
 }*/

// FOR JS
void  runTest() {
  for (int i = 0; i < ct._nbBubbles; ++i) {
    ct._bubbles[i].posX += random(7);
    ct._bubbles[i].posY += random(5);
    if (ct._bubbles[i].posX > width || ct._bubbles[i].posY > height) {
      ct._bubbles[i].posY = 0;
      ct._bubbles[i].posX = 0;
    }
  }
  ct.drawBubbles();
  ct.overOnPlot(mouseX, mouseY);
  redraw();
}

