jQuery(document).ready(function () {

    var scene = new GLVIS.Scene(jQuery('#webgl_canvas_container'));
    
    scene.addCollection(new GLVIS.Collection());
    scene.addCollection(new GLVIS.Collection());
    
    scene.render();
});