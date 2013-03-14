$(function() {
    runProcessing();
    build_slider('#timeSlider');
    $("#speedSlider").slider({
        orientation: "vertical",
        min: 1,
        max: 25,
        value: 5,
        animate: "slow"
    });




    $("#selectAxeXValue").combobox();
    $("#selectAxeXType").combobox();
    $("#selectAxeYValue").combobox();
    $("#selectAxeYType").combobox();

    $("#selectColorValue").combobox();
    $("#selectSizeValue").combobox();
    $("#opacitySlider").slider();
    $("#sizeSlider").slider();

});
