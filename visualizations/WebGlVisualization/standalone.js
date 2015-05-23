var my_scene;

jQuery(document).ready(function () {

    my_scene = new GLVIS.Scene(jQuery('#webgl_canvas_container'));
    
    var g1 = new GLVIS.Collection();
    var g2 = new GLVIS.Collection();
    
    var r1 = new GLVIS.Result();
    var r2 = new GLVIS.Result();
    var r3 = new GLVIS.Result();
    
    my_scene.addCollection(g1);
    my_scene.addCollection(g2);
    
    animate();
});


function animate() {

    requestAnimationFrame(animate);
    my_scene.render();
}