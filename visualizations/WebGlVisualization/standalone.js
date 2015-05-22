var my_scene;

jQuery(document).ready(function () {

    my_scene = new GLVIS.Scene(jQuery('#webgl_canvas_container'));
    
    my_scene.addCollection(new GLVIS.Collection());
    my_scene.addCollection(new GLVIS.Collection());
    
    animate();
});


function animate() {

    requestAnimationFrame(animate);
    my_scene.render();
}