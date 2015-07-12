var GLVIS = GLVIS || {};


/**
 * Spline connection between several recommendation-nodes
 */
GLVIS.ConnectionRecRecSpline = function () {
    this.recs = [];

    this.webgl_objects = {
        spline: null
    };
};


/**
 * Order the recommendations by their collections
 */
GLVIS.ConnectionRecRecSpline.prototype.orderRecs = function () {

    console.log(this.recs);
    this.recs = _.sortBy(this.recs, function (rec) {
        console.log(rec);
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
    var numPoints = 300;

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

            console.log("DISTANCE: " + (rec.getCollection().getId() - last_rec.getCollection().getId()));
            if ((rec.getCollection().getId() - last_rec.getCollection().getId()) > 1) {

                /*
                 * Calculating the line between the current rec and the last rec
                 */
                var last_x = last_rec.getPosition().x;
                var last_y = last_rec.getPosition().y;
                var curr_x = rec.getPosition().x;
                var curr_y = rec.getPosition().y;
                var gradient = (curr_y - last_y) / (curr_x - last_x);


                var half_length = (curr_x - last_x) / 2;
                var calculated_y = half_length * gradient + last_y;

                console.log(curr_x, last_x, half_length);

                var is_top = true;
                if (calculated_y < 0)
                    is_top = false;

                var top_factor = is_top ? 1 : -1;

                var vert_distance = 270 + Math.random() * 30;
                vecs.push(new THREE.Vector3(last_x + half_length, top_factor * vert_distance, -5));
            }
        }
        var pos = rec.getPosition();
        vecs.push(new THREE.Vector3(pos.x, pos.y, -5));

        rec.setColor(0xFF0000);

        last_rec = rec;

    }.bind(this));


    var spline = new THREE.SplineCurve3(vecs);

    var material = new THREE.LineBasicMaterial({
        color: 0xff0000 - parseInt(Math.random() * 0x1100000)
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

    var three_scene = GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene();
    three_scene.remove(this.webgl_objects.spline);
    delete this.webgl_objects.spline;

    _.each(this.recs, function (rec) {
        rec.unregisterRecSpline(this);
    });
};
