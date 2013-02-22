//var defaults = {
//    animate: false,
//    disabled: false,
//    max: 100,
//    min: 0,
//    orientation: "horizontal",
//    range: false,
//    step: 1,
//    value: 0,
//    values: null
//}

function build_slider(slider_id)
{
    var s = $(slider_id);
    s.append('<div id="slider"></div>');
    s.append('<div id="scale"></div>');

    $("#slider").slider(
    {
        value: 0,
        range: "min",
        min: 0,
        max: 100,
        step: 1,
		animate: "fast",
		/*slide: function( event, ui ) {
                        MoveCursor( ui.value );
						}*/
    })
    
    var step = 10;

    var nb_step = ($("#slider").slider( "option" , "max") - $("#slider").slider( "option" , "min")) / step;

    var gap = $("#slider").width() / (nb_step);

    s = $(scale);

    var line = "<span style=\"display:inline-block;text-align:left;width: ";
    line += gap / 2.0;
    line += "px;\">|</br>";
    line += $("#slider").slider( "option" , "min");
    line += "</span>";
    s.append(line);
    for (i = 1; i < (nb_step); i++) {
        line = "<span style=\"display:inline-block;text-align:center;width: ";
        line += gap;
        line += "px;\">|</br>";
        line += $("#slider").slider( "option", "min") + i * step;
        line += "</span>";
        s.append(line);
    }
    line = "<span style=\"display:inline-block;text-align:right;width: ";
    line += gap / 2.0;
    line += "px;\">|</br>";
    line += $("#slider").slider( "option" , "max");
    line += "</span>";
    s.append(line);
}
