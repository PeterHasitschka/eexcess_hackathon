


GLVIS = GLVIS || {};



GLVIS.AnimationHelper = {};

/**
 * 
 * @param {type} curr Current value
 * @param {type} goal Goal Value
 * @param {type} root 2,3, ...
 * @param {type} speedfactor e.g. 3
 * @param {type} threshold e.g. 0.0001
 * @returns {Number} calculated step value
 */
GLVIS.AnimationHelper.getStepRoot = function (curr, goal, root, speedfactor, threshold) {

    if (Math.abs(Math.max(curr, goal) - Math.min(curr, goal)) > threshold) {

        if (goal !== 0)
            var delta = 1.0 - ((parseFloat(curr) / parseFloat(goal)));
        else
            var delta = 1.0 - (parseFloat(curr));

        var delta_calc = Math.pow(Math.abs(delta), 1 / root) * speedfactor;
        if (delta < 0)
            delta_calc *= -1;

        if (goal <= 0) {
            delta_calc *= -1;
        }
        
        
        //console.log(curr, goal, delta_calc);
        //Insert time diff for smooth animation independent from performance
        var time_diff_fact = GLVIS.Scene.getCurrentScene().getTimeDelta() / 10;
        delta_calc *= time_diff_fact;


        return delta_calc;
    }
    else {
        return 0;
    }

};

