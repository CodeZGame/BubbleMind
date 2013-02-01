/* Joseph Harrington  *
 * <dev@jharring.com> *
 * March 2012         */

float[] letterSizes = new float[uivars.theWord.length()];
color white = color(255);
color blue = color(100, 200, 255);

void setup() {
  size(600, 300);                                     // set up the canvas size
  smooth();                                           // make edges nice and pretty
  textFont(createFont("serif", 100), 100);            // setup the font with size 100
}

void draw() {
  background(25);                                     // clear and redraw entire canvas each frame
  translate(5, 200);                                  // start drawing letters at point (5,220)
 
  for (int i = 0; i < uivars.theWord.length(); i++){  // iterate through each letter in the word
  
    if (i == uivars.selectedLetter) {                 // if this letter is the selected letter...
      fill(blue);                                        // change fill color to blue, 
      letterSizes[i] = 2 - 0.85*(2-letterSizes[i]);      // adjust scale of letter towards 2.0
    }
    else {                                            // else if this letter is not the selected letter,
      fill(white);                                       // change fill color to white,
      letterSizes[i] = 1 - 0.90*(1-letterSizes[i]);      // adjust scale of letter towards 1.0
    }
    
    scale( letterSizes[i] );                          // set the drawing scale for this letter
    text( uivars.theWord.charAt(i), 0, 0 );                 // draw this letter
    translate( textWidth(uivars.theWord.charAt(i)), 0 );    // translate to position for next letter
    scale( 1 / letterSizes[i] );                      // revert scale to previous value
  }
}

void updateWord() {
  if (uivars.theWord.length() > letterSizes.length)
    letterSizes = expand(letterSizes);                // reset scale of each character
}