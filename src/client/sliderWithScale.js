function build_slider(slider_id)
{
    var s = $(slider_id);
    s.append('<div id="sliderDiv"></div>');
    s.append('<div id="scaleDiv"></div>');

    $("#sliderDiv").slider(
    {
        value: 0,
        range: "min",
        min: 0,
        max: 100,
        step: 1,
		animate: "fast",
		slide: function( event, ui ) {
                        MoveCursor( ui.value );
						}
    })
    
    var step = 10;

    var nb_step = ($("#sliderDiv").slider( "option" , "max") - $("#sliderDiv").slider( "option" , "min")) / step;

    var gap = $("#sliderDiv").width() / (nb_step);

    s = $(scaleDiv);

    var line = "<span style=\"display:inline-block;text-align:left;width: ";
    line += gap / 2.0;
    line += "px;\">|</br>";
    line += $("#sliderDiv").slider( "option" , "min");
    line += "</span>";
    s.append(line);
    for (i = 1; i < (nb_step); i++) {
        line = "<span style=\"display:inline-block;text-align:center;width: ";
        line += gap;
        line += "px;\">|</br>";
        line += $("#sliderDiv").slider( "option", "min") + i * step;
        line += "</span>";
        s.append(line);
    }
    line = "<span style=\"display:inline-block;text-align:right;width: ";
    line += gap / 2.0;
    line += "px;\">|</br>";
    line += $("#sliderDiv").slider( "option" , "max");
    line += "</span>";
    s.append(line);
}
