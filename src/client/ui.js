var colorActivated = true;

$(function() {
    runProcessing();

    $("#speedSlider").slider({
        orientation: "vertical",
        min: 1,
        max: 25,
        value: 20,
        animate: "slow"
    });

//$("#speedSlider").slider().next("ui-slider-handle").css("width" , "2px");

    $("#selectAxeXValue").combobox();
    $("#selectAxeXValue").next("input").on("autocompleteselect",
            function(event, ui) {
                AxeChanged(guiAxes.X, ui.item.id);
            });

    $("#selectAxeXType").combobox();

    $("#selectAxeYValue").combobox();
    $("#selectAxeYValue").next("input").on("autocompleteselect",
            function(event, ui) {
                AxeChanged(guiAxes.Y, ui.item.id);
            });
    $("#selectAxeYType").combobox();

    $("#selectColorValue").combobox();
    $("#selectColorValue").next("input").on("autocompleteselect",
            function(event, ui) {
                AxeChanged(guiAxes.COLOR, ui.item.id);
            }
    );
    $("#selectAxeXValue").next("input").autocomplete("option", "position", {my: "right top", at: "right bottom"});

    $("#selectSizeValue").combobox();
    $("#selectSizeValue").next("input").on("autocompleteselect",
            function(event, ui) {
                AxeChanged(guiAxes.SIZE, ui.item.id);
            });
    $("#selectSizeValue").next("input").autocomplete("option", "position", {my : "right top", at: "right bottom" });

    $("#opacitySlider").slider({
        min: 0,
        max: 255,
        value: 70,
        animate: "fast",
        slide: function(event, ui) {
            ChangeOpacity(ui.value);
        },
        slide: function(event, ui) {
            ChangeOpacity(ui.value);
        }
    });
    $("#opacitySlider").slider("disable");
    $("#sizeSlider").slider();

});

function disableColor()
{
    colorActivated = !colorActivated;

    if (colorActivated)
    {
        p.println("ON");
        $("#selectColorValue").next("input").autocomplete("enable");
    }
    else
    {
        p.println("OFF");
        $("#selectColorValue").next("input").autocomplete("disable");
    }
}
