$(function() {
    runProcessing();

    /*
     ** Set the speedSlider
     */

    $("#speedSlider").slider({
        orientation: "vertical",
        min: 1,
        max: 25,
        value: 20,
        animate: "slow"
    });

    /*
     ** Set all the comboboxes 
     */

    $("#selectAxeXValue").combobox();
    $("#selectAxeXValue").next("input").on("autocompleteselect",
            function(event, ui) {
                AxeChanged(guiAxes.X, ui.item.id);
            });

    $("#selectFile").combobox();
    $("#selectFile").next("input").autocomplete("option", "position", {my: "right top", at: "right bottom"});

    $("#selectAxeYValue").combobox();
    $("#selectAxeYValue").next("input").on("autocompleteselect",
            function(event, ui) {
                AxeChanged(guiAxes.Y, ui.item.id);
            });

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
    $("#selectSizeValue").next("input").autocomplete("option", "position", {my: "right top", at: "right bottom"});

    $("#selectFile").next("input").on("autocompleteselect",
            function(event, ui) {
                ChangeIdFile(ui.item.id);
            });

    /*
     ** Set the opacity slider
     */

    $("#opacitySlider").slider({
        min: 0,
        max: 255,
        value: 150,
        animate: "fast",
        change: function(event, ui) {
            ChangeOpacity(ui.value);
        },
        slide: function(event, ui) {
            ChangeOpacity(ui.value);
        }
    });

    $("#opacitySlider").slider("disable");
    $("#sizeSlider").slider({
        min: 5,
        max: 100,
        value: 55,
        animate: "fast",
        change: function(event, ui) {
            ChangeSize(ui.value);
        },
        slide: function(event, ui) {
            ChangeSize(ui.value);
        }
    });

});
