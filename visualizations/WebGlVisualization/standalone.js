var my_scene;

jQuery(document).ready(function () {

    my_scene = new GLVIS.Scene(jQuery('#webgl_canvas_container'));
    
    var parents = {
      0 : null,
      1 : 3,
      2 : 1,
      3 : 0,
      4 : 6,
      5 : 4,
      6 : 5,
      7 : 9,
      8 : 7,
      9 : 8
    };
    
    for (var c_count=0; c_count < 10; c_count++) {
        var c = new GLVIS.Collection();
        
        c.setParentId(parents[c_count]);
        
        
        for (var r_count=0; r_count < 3; r_count++) {
            var r = new GLVIS.Result();
            
            c.addResult(r);
        }
        
        my_scene.addCollection(c);
    }
    
    
    my_scene.getCollectionPositionHandler().calculatePositions();
    animate();
});


function setRadius(r) {
    var coll = my_scene.getCollections()[0];
    var r1 = coll.getResults()[0];
    r1.setRadius(r);
}
function setOpacity(o) {
    var coll = my_scene.getCollections()[0];
    var r1 = coll.getResults()[0];
    r1.setOpacity(o);
}

function animate() {

    requestAnimationFrame(animate);
    my_scene.render();
}