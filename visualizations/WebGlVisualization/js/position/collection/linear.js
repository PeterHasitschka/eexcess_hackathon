var GLVIS = GLVIS || {};

/**
 * This position handler sets all collections in a line next to their parents.
 * This means that only one child per collections is supported.
 * @returns {undefined}
 */
GLVIS.CollectionPosLinear = function () {

    /** @type {GLVIS.Scene} **/
    this.scene_ = GLVIS.Scene.getCurrentScene();

};


GLVIS.CollectionPosLinear.prototype.calculatePositions = function () {

    if (GLVIS.config.debug)
        console.log("COLLECTION POS HANDLER: Recalculating positions");
    var collections = this.scene_.getCollections();

    
    //Store parent-id and key in an array to sort it

    var parent_mapping = [];
    for (var coll_key in collections) {

        /** @type{GLVIS.Collection} **/
        var current_collection = collections[coll_key];

        var coll_id = current_collection.getId();
        var coll_parent_id = current_collection.getParentId();

        parent_mapping.push([coll_key, coll_parent_id]);
    }

    //Sort array
    
    parent_mapping.sort(function (a, b) {
        if (b[1] === null)
            return a;
        
        return a[1] - b[1];
    });
    
    
    
    
    //Use array to get the keys in right order
    
    var x_step = GLVIS.config.collection.init_distance;
    var init_x = 0;
    
    var last_coll = null;
    for (var coll_count in parent_mapping) {
        var collection_key = parent_mapping[coll_count][0];
        
        var curr_x = init_x + coll_count * x_step;
        
        /** @type{GLVIS.Collection} **/
        var current_collection = collections[collection_key];
        
        current_collection.setPosition(curr_x, null);
        
        var last_coll = current_collection;
    }
    
    
    //Focus last collection
    var navigation_handler = GLVIS.Scene.getCurrentScene().getNavigationHandler();
    navigation_handler.focusCollection(last_coll,function(){
        
        //Ready focusing
    });
};