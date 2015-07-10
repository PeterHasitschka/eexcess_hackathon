var GLVIS = GLVIS || {};



GLVIS.ConnectionRecRecSpline = function () {



    var recs = [];

    var colls = GLVIS.Scene.getCurrentScene().getCollections();



    recs.push(colls[0].getRecommendations()[parseInt(Math.random() * colls[0].getRecommendations().length)]);
    recs.push(colls[2].getRecommendations()[parseInt(Math.random() * colls[0].getRecommendations().length)]);
    recs.push(colls[4].getRecommendations()[parseInt(Math.random() * colls[0].getRecommendations().length)]);



    var numPoints = 50;

    var vecs = [];


    _.each(recs, function (rec) {

        var pos = rec.getPosition();
        vecs.push(new THREE.Vector3(pos.x, pos.y, -5));
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