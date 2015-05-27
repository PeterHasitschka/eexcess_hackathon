


GLVIS = GLVIS || {};



GLVIS.AnimationHelper = {};



GLVIS.AnimationHelper.getStepByExpSlowdown = function (curr, goal, max_diff, factor, pow, threshold) {

    curr = parseFloat(curr);
    goal = parseFloat(goal);
    max_diff = parseFloat(max_diff);
    var diff = goal - curr;

    var max_val = Math.max(curr, goal);
    var min_val = Math.min(curr, goal);

    var abs_diff = max_val - min_val;



    if (abs_diff > threshold) {

        //Normalize to a small value
        var normalized_diff = diff / max_diff;

        // 1 if goal > curr | -1 else
        var direction = normalized_diff / Math.abs(normalized_diff);

        var power = Math.pow(Math.abs(normalized_diff), pow);
        power /= 2;

        //console.log(max_diff, diff, normalized_diff, pow, power, direction);
        return power * diff * factor;
    }
    else {
        return 0.0;
    }

};



