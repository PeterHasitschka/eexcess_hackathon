var my_scene, db_handler;

jQuery(document).ready(function () {
    
    my_scene = new GLVIS.Scene(jQuery('#webgl_canvas_container'));
    
    /*
    db_handler = new GLVIS.DbHandler();
    db_handler.loadQueries(function(){
        console.log("DB Load queries ready");
    });
    */
    

    createRandomCollections();



    my_scene.initCollectionNetwork();
    animate();
});



function loadCollectionsFromDb() {
    
    
    
}



function setRadius(r) {
    var coll = my_scene.getCollections()[0];
    var r1 = coll.getRecommendations()[0];
    r1.setRadius(r);
}
function setOpacity(o) {
    var coll = my_scene.getCollections()[0];
    var r1 = coll.getRecommendations()[0];
    r1.setOpacity(o);
}

function animate() {

    requestAnimationFrame(animate);
    my_scene.render();
}




function createRandomCollections() {
    var parents = {
        0: null,
        1: 0,
        2: 1,
        3: 0,
        4: 5,
        5: 3,
        6: 4,
        7: 8,
        8: 6,
        9: 7
    };

    for (var c_count = 0; c_count < 10; c_count++) {
        var c = new GLVIS.Collection();

        c.setParentId(parents[c_count]);


        for (var r_count = 0; r_count < 5; r_count++) {
            var r = new GLVIS.Recommendation();

            c.addRecommendation(r);
        }

        my_scene.addCollection(c);
    }
}
