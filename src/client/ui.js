$(function() {
    runProcessing();

    $("#speedSlider").slider({
        orientation: "vertical",
        min: 1,
        max: 25,
        value: 20,
        animate: "slow"
    });




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
            });

    $("#selectSizeValue").combobox();
    $("#selectSizeValue").next("input").on("autocompleteselect",
            function(event, ui) {
                AxeChanged(guiAxes.SIZE, ui.item.id);
            });

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

function showlayer(layer) {
    var myLayer = document.getElementById(layer);
    if (myLayer.style.display == "none" || myLayer.style.display == "") {
        myLayer.style.display = "block";
    } else {
        myLayer.style.display = "none";
    }
}
