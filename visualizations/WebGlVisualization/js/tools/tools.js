var GLVIS = GLVIS || {};

/**
 * Some nice little helpers
 */
GLVIS.Tools = {};

/**
 * Getting the angle (radians) of something by passing the coordinates
 * @param {float} x
 * @param {float} y
 * @returns {float}
 */
GLVIS.Tools.getRadFromPos = function (x, y) {
    var rad = Math.atan2(y, x);

    while (rad < 0)
        rad += (Math.PI * 2);

    while (rad > Math.PI * 2)
        rad -= Math.PI * 2;

    return rad;
};

/**
 * Getting the x and y position of something by passing the angle and the distance
 * @param {float} rad Radians
 * @param {float} distance Distance
 * @returns {object} Object holding x and y
 */
GLVIS.Tools.getPosFromRad = function (rad, distance) {

    while (rad < 0)
        rad += (Math.PI * 2);

    while (rad > Math.PI * 2)
        rad -= Math.PI * 2;

    var pos_x = Math.cos(rad) * distance;
    var pos_y = Math.sin(rad) * distance;


    return {x: pos_x, y: pos_y};
};





/**
 * Rotate vecotr via a specific axis
 * @param {integer} axis 1 -> X, 2 -> Y, 3 -> Z
 * @param {float} degree
 * @param {THREE.Vector3} point
 * @return {THREE.Vector3} Rotaded vector
 */
GLVIS.Tools.getRotation = function (axis, degree, point) {

    var rad = degree / 360 * 2 * Math.PI;

    switch (axis) {

        case 2 :
            var axis = new THREE.Vector3(0, 1, 0);
            var rotated_point = point.applyAxisAngle(axis, rad);

            return  rotated_point;

        default:
            throw ("Rotation around this axis not implemented yet!");
    }

};
