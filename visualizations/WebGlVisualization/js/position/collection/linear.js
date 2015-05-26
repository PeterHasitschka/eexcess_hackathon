var GLVIS = GLVIS || {};

/**
 * This position handler sets all collections in a line next to their parents.
 * This means that only one child per collections is supported.
 * @returns {undefined}
 */
GLVIS.CollectionPosLinear = function(){
    
    /** @type {GLVIS.Scene} **/
    this.scene_ = GLVIS.Scene.getCurrentScene();
    
};


GLVIS.CollectionPosLinear.prototype.calculatePositions = function(){
    
    if (GLVIS.config.debug)
        console.log("COLLECTION POS HANDLER: Recalculating positions");
    var collections = this.scene_.getCollections();
    
    var parent_mapping = [];
    for (var coll_key in collections) {
        
        /** @type{GLVIS.Collection} **/
        var current_collection = collections[coll_key];
        
        var coll_id = current_collection.getId();
        var coll_parent_id = current_collection.getParentId();
        
        parent_mapping[coll_key] = coll_parent_id;
    }
    
    console.log("TODO: SORT PARENTS ETC...",parent_mapping);
};