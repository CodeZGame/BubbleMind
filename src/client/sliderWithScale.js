function build_slider(slider_id, min, max, value, step, scaleStep)
{
    var s = $(slider_id);
    s.append('<div id="sliderDiv"></div>');
    s.append('<div id="scaleDiv"></div>');

    $("#sliderDiv").slider(
            {
                value: value,
                range: "min",
                min: min,
                max: max,
                step: step,
                animate: "fast"
                /*slide: function( event, ui ) {
                 MoveCursor( ui.value );
                 }*/
            })


    var nb_step = ($("#sliderDiv").slider("option", "max") - $("#sliderDiv").slider("option", "min")) / scaleStep;

    var gap = $("#sliderDiv").width() / (nb_step);

    s = $(scaleDiv);

    var line = "<span style=\"display:inline-block;text-align:left;width: ";
    line += gap / 2.0;
    line += "px;\">|</br>";
    line += $("#sliderDiv").slider("option", "min");
    line += "</span>";
    s.append(line);
    for (i = 1; i < (nb_step); i++) {
        line = "<span style=\"display:inline-block;text-align:center;width: ";
        line += gap;
        line += "px;\">|</br>";
        line += $("#sliderDiv").slider("option", "min") + i * scaleStep;
        line += "</span>";
        s.append(line);
    }
    line = "<span style=\"display:inline-block;text-align:right;width: ";
    line += gap / 2.0;
    line += "px;\">|</br>";
    line += $("#sliderDiv").slider("option", "max");
    line += "</span>";
    s.append(line);
}
