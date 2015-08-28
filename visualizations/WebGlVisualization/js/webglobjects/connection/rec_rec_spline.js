var GLVIS = GLVIS || {};


/**
 * Spline connection between several recommendation-nodes
 */
GLVIS.ConnectionRecRecSpline = function () {
    this.recs = [];

    this.webgl_objects = {
        spline: null
    };

    GLVIS.Debugger.debug("ConnectionRecRecSpline", "Creating a rec-spline", 5);
};


/**
 * Order the recommendations by their collections
 */
GLVIS.ConnectionRecRecSpline.prototype.orderRecs = function () {

    GLVIS.Debugger.debug("ConnectionRecRecSpline", "Ordering recommendations", 7);

    this.recs = _.sortBy(this.recs, function (rec) {
        return rec.getCollection().getId();
    });
};

/**
 * Calculate the spline points and creates an @see{THREE.SplineCurve3} object.
 * If an collection is left untouched, the path will be lead above or below the collection
 * Therefore it will be calculated if the intersection between the line between two recs
 * and the vertical line at the position of the collection is positive or negative.
 */
GLVIS.ConnectionRecRecSpline.prototype.calculateSpline = function () {

    GLVIS.Debugger.debug("ConnectionRecRecSpline", "Calculating the splines", 6);
    var config = GLVIS.config.connection.rec_spline;

    var numPoints = config.num_vertices;

    var vecs = [];
    var last_coll_id_with_rec = 0;

    this.orderRecs();

    var last_rec = null;
    _.each(this.recs, function (rec) {

        /*
         * Checking for missed collections.
         * Only necesary if not the first rec.
         */
        if (last_rec) {
            if ((rec.getCollection().getId() - last_rec.getCollection().getId()) > 1) {

                /*
                 * Calculating the line between the current rec and the last rec
                 */
                var last_x = last_rec.getPosition(true).x;
                var last_y = last_rec.getPosition(true).y;
                var last_z = last_rec.getPosition(true).z;
                var curr_x = rec.getPosition(true).x;
                var curr_y = rec.getPosition(true).y;
                var curr_z = rec.getPosition(true).z;
                var gradient = (curr_y - last_y) / (curr_x - last_x);


                var half_length = (curr_x - last_x) / 2;
                var calculated_y = half_length * gradient + last_y;
                
                var is_top = true;
                if (calculated_y < 0)
                    is_top = false;

                var top_factor = is_top ? 1 : -1;

                var vert_distance = 270 + Math.random() * 30;
                vecs.push(new THREE.Vector3(last_x + half_length, top_factor * vert_distance, last_z));
            }
        }
        var pos = rec.getPosition(true);
        vecs.push(new THREE.Vector3(pos.x, pos.y, pos.z));

        rec.setColor(config.rec_color);

        last_rec = rec;

    }.bind(this));

    var spline = new THREE.SplineCurve3(vecs);

    var material = new THREE.LineBasicMaterial({
        color: config.base_color - parseInt(Math.random() * config.color_diff)
    });

    var geometry = new THREE.Geometry();
    var splinePoints = spline.getPoints(numPoints);

    _.each(splinePoints, function (point) {
        geometry.vertices.push(point);
    });

    var line = new THREE.Line(geometry, material);
    this.webgl_objects.spline = line;
    GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene().add(line);
};

/**
 * Adds a recommendation to the connection-list
 * @param {GLVIS.Recommendation} rec
 */
GLVIS.ConnectionRecRecSpline.prototype.addRec = function (rec) {
    GLVIS.Debugger.debug("ConnectionRecRecSpline", "Adding a recommendation", 6);
    if (rec)
        this.recs.push(rec);

    rec.registerRecSpline(this);
};

/**
 * Returns the current list off recommendations
 * @returns {GLVIS.ConnectionRecRecSpline.recs}
 */
GLVIS.ConnectionRecRecSpline.prototype.getRecs = function () {
    return this.recs;
};

/**
 * Delete all webgl-objects from scene
 */
GLVIS.ConnectionRecRecSpline.prototype.delete = function () {

    GLVIS.Debugger.debug("ConnectionRecRecSpline", "Deleting a rec spline", 5);
    
    var three_scene = GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene();
    three_scene.remove(this.webgl_objects.spline);
    delete this.webgl_objects.spline;

    _.each(this.recs, function (rec) {
        rec.unregisterRecSpline(this);
        rec.setColor(GLVIS.config.collection.recommendation.color);
    });
};
