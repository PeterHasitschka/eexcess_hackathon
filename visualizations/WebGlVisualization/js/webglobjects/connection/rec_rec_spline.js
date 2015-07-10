var GLVIS = GLVIS || {};



GLVIS.ConnectionRecRecSpline = function () {

    this.recs = [];



};


GLVIS.ConnectionRecRecSpline.prototype.calculateSpline = function () {
    var numPoints = 100;

    var vecs = [];

    var last_coll_id_with_rec = 0;
    _.each(this.recs, function (rec) {

        var coll_id = rec.getCollection().getId();

        var coll_count = last_coll_id_with_rec;


        if (vecs.length) {


            /**
             * @type THREE.Vector3
             */
            var last_vec = vecs[vecs.length - 1];

            var last_x = last_vec.x;
            var last_y = last_vec.y;
            var curr_x = rec.getPosition().x;
            var curr_y = rec.getPosition().y;
            var gradient = (curr_y - last_y) / (curr_x - last_x);


            console.log(last_x, last_y, curr_x, curr_y);

            console.log("CURR: " + coll_id);
            while (coll_count < coll_id - 1) {
                coll_count++;
                var missing_col = GLVIS.Scene.getCurrentScene().getCollection(coll_count);
                var coll_pos = missing_col.getPosition();

                var calculated_y = (coll_pos.x - last_x) * gradient + last_y;

                var is_top = true;
                if (calculated_y < 0)
                    is_top = false;


                /*
                 * @TODO
                 * Calculate if line between recs goes on positive or negative y
                 * at the x pos of the current collection
                 */

                var top_factor = is_top ? 1 : -1;
                vecs.push(new THREE.Vector3(coll_pos.x, top_factor * 500, -5));


            }
        }


        var pos = rec.getPosition();
        vecs.push(new THREE.Vector3(pos.x, pos.y, -5));

        rec.setColor(0xFF0000);

        last_coll_id_with_rec = coll_id;

    });


    var spline = new THREE.SplineCurve3(vecs);

    var material = new THREE.LineBasicMaterial({
        color: 0xff0000
    });

    var geometry = new THREE.Geometry();
    var splinePoints = spline.getPoints(numPoints);



    for (var i = 0; i < splinePoints.length; i++) {
        geometry.vertices.push(splinePoints[i]);
    }

    var line = new THREE.Line(geometry, material);
    GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene().add(line);

};


GLVIS.ConnectionRecRecSpline.prototype.addRec = function (rec) {

    this.recs.push(rec);


};
