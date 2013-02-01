/* Joseph Harrington  *
 * <dev@jharring.com> *
 * March 2012         */

$(function() {
  $("#slider_selectedLetter").slider({                   // create the slider:
    value: uivars.selectedLetter,                          // set the initial slider position.
    min: 0, max: uivars.theWord.length - 1, step: 1,     
    slide: function(event, ui) {                           // whenever the slider is adjusted...
      uivars.selectedLetter = ui.value;                      // update the selected letter variable,
      $("#label_selectedLetter").text("Letter: " +           // and update the slider label text.
        uivars.theWord.charAt(uivars.selectedLetter)); 
    }
  });
  
  $("#word_textbox").keyup(function () {                 // whenever text is entered into input box...
    uivars.theWord = $(this).val();                          // update word variable,
    $("#slider_selectedLetter").                             
      slider("option", "max", uivars.theWord.length - 1);    // update slider max value to word length,
    var p = Processing.getInstanceById('Processing_textdemo');
    if (p) p.updateWord();                                   // and call updateWord function in pjs sketch.
  });
  
  $("#word_textbox").val(uivars.theWord);                // initialize input textbox contents.
  $("#label_selectedLetter").                            // initialize slider label text.
    text("Letter: " + uivars.theWord.charAt(uivars.selectedLetter)); 
});