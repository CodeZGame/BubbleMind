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
    $("#selectAxeXType").combobox();
    $("#selectAxeYValue").combobox();
    $("#selectAxeYType").combobox();

    $("#selectColorValue").combobox();
    $("#selectSizeValue").combobox();
    $("#opacitySlider").slider({
        min: 0,
        max: 255,
        value: 150,
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

function showlayer(layer){
var myLayer = document.getElementById(layer);
if(myLayer.style.display=="none" || myLayer.style.display==""){
myLayer.style.display="block";
} else {
myLayer.style.display="none";
}
}
