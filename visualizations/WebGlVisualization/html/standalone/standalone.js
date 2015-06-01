var canvas1;

jQuery(document).ready(function () {
    GLVIS.InitHandler.init(jQuery('body'), "../../", function () {

        GLVIS.Debugger.debug("standalone", "Finished initializing scene. Callback", 3);

 
 
        var textElm = new GLVIS.Text("Huhu (text from standalone)", 40, "black");

    });





});