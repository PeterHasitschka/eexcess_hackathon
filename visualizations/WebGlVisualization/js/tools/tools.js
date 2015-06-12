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