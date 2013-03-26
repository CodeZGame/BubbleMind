var totalsteps;
var nbsteps;

function build_slider(slider_id, min, max, value, step, scaleStep)
{
    var s = $(slider_id);
    s.append('<div id="sliderDiv"></div>');
    s.append('<div id="scaleDiv"></div>');

    totalsteps = (max - min > 50) ? (max - min) : (50);
    nbsteps = totalsteps / (max - min);
    $("#sliderDiv").slider(
            {
                value: value,
                range: "min",
                min: min * totalsteps,
                max: max * totalsteps,
                step: nbsteps,
                animate: "fast",
                change: function(event, ui) {
                    var year = (ui.value / totalsteps) | 0;
                    var percent = (ui.value - year * totalsteps) / (totalsteps + 0.0);
                    MoveCursor(year, percent);
                },
                slide: function(event, ui) {
                    var year = (ui.value / totalsteps) | 0;
                    var percent = (ui.value - year * totalsteps) / (totalsteps + 0.0);
                    MoveCursor(year, percent);
                }
            });

    var nb_step = (max - min) / step;

    var gap = $("#sliderDiv").width() / (nb_step);

    s = $(scaleDiv);

    var line = "<span style=\"display:inline-block;text-align:left;width: ";
    line += gap / 2.0;
    line += "px;\">|</br>";
    line += min;
    line += "</span>";
    s.append(line);
    for (i = 1; i < (nb_step); i++) {
        line = "<span style=\"display:inline-block;text-align:center;width: ";
        line += gap;
        line += "px;\">|</br>";
        line += min + i * scaleStep;
        line += "</span>";
        s.append(line);
    }
    line = "<span style=\"display:inline-block;text-align:right;width: ";
    line += gap / 2.0;
    line += "px;\">|</br>";
    line += max;
    line += "</span>";
    s.append(line);
}
