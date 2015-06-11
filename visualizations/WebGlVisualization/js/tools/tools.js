var GLVIS = GLVIS || {};


GLVIS.Tools = {};


GLVIS.Tools.getRadFromPos = function (x, y) {
    var rad = Math.atan2(y, x);

    while (rad < 0)
        rad += (Math.PI * 2);

    while (rad > Math.PI * 2)
        rad -= Math.PI * 2;

    return rad;
};


GLVIS.Tools.getPosFromRad = function (rad, distance) {

    while (rad < 0)
        rad += (Math.PI * 2);

    while (rad > Math.PI * 2)
        rad -= Math.PI * 2;

    var pos_x = Math.cos(rad) * distance;
    var pos_y = Math.sin(rad) * distance;


    return {x: pos_x, y: pos_y};
};