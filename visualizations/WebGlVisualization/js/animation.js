var GLVIS = GLVIS || {};


/**
 * All-mighty animation handler.
 * Calculates at any animation step a relative movement of values that may be
 * registered.
 */
GLVIS.Animation = function () {
    this.animations_ = [];
};

/**
 * Perform all registered animations
 */
GLVIS.Animation.prototype.animate = function () {

    for (var a_count = 0; a_count < this.animations_.length; a_count++) {

        var curr_anim = this.animations_[a_count];
        var curr_val = curr_anim.getter_fct(curr_anim.object);

        if (curr_anim.max_diff === null)
            curr_anim.max_diff = curr_anim.goal - curr_val;

        var delta = this.getStepByExpSlowdown_(curr_val,
                curr_anim.goal,
                curr_anim.max_diff,
                curr_anim.factor,
                curr_anim.pow,
                curr_anim.threshold
                );

        if (delta !== 0.0) {
            var val_to_set = delta;
            if (curr_anim.add_to_current)
                val_to_set = curr_val + delta;
        }
        else {
            //Set value to the final difference
            val_to_set = curr_anim.goal - curr_val;

            //If absolute values -> Set to goal
            if (curr_anim.add_to_current)
                val_to_set = curr_anim.goal;
        }

        //Build parameter array for setter function
        var params_for_setting = [];
        
        if (curr_anim.object)
            params_for_setting.push(curr_anim.object);

        for (var param_count = 0; param_count < curr_anim.setter_fct_param_num; param_count++)
            params_for_setting.push(null);
        params_for_setting.push(val_to_set);

        //Call setter fct
        curr_anim.setter_fct.apply(null, params_for_setting);


        //Animation ready
        if (delta === 0.0) {
            GLVIS.Debugger.debug("Animation", "Animation '" +
                    curr_anim.identifier + "' ready", 5);

            this.unregister(curr_anim.identifier);
            curr_anim.callback_fct();
            return;
        }
    }
};

/**
 * 
 * Register an animation that will be performed automatically.
 * 
 * @param {string} identifier String to identify same animation if already exists
 * @param {float} goal Goal value
 * @param {object | null} object Object to perform getter and setter. If not null it will be the FIRST PARAM of getter and setter.
 * @param {function} getter_fct Function to get the current value
 * @param {function} setter_fct Function to set the new value
 * @param {integer} setter_fct_param_num Number of parameter to use. Starts with 0. Others are set to null. If Obj is set it will be prepended
 * @param {float} factor for Speed
 * @param {float} pow Exponent for calculating speed
 * @param {float} threshold Threshold > 0 when animation stops
 * @param {type} callback_fct Function to call after finishing animation
 * @param {boolean} add_to_current If true, not the delta but the value added to current will be set
 */
GLVIS.Animation.prototype.register = function (identifier, goal, object, getter_fct, setter_fct,
        setter_fct_param_num, factor, pow, threshold, callback_fct, add_to_current) {

    //Check if already exists. If is so, remove old from list
    this.unregister(identifier);

    if (!add_to_current)
        add_to_current = false;

    if (setter_fct_param_num === null) {
        setter_fct_param_num = 1;
    }
    
    var anim_obj = {
        identifier: identifier,
        goal: goal,
        max_diff: null, //Will be set at first animation call
        object: object,
        getter_fct: getter_fct,
        setter_fct: setter_fct,
        setter_fct_param_num: setter_fct_param_num,
        factor: factor,
        pow: pow,
        threshold: threshold,
        callback_fct: callback_fct,
        add_to_current: add_to_current
    };

    this.animations_.push(anim_obj);
    GLVIS.Debugger.debug("Animation", "Registered animation '" + identifier + "'", 5);
};

/**
 * Unregisters a animation by passing its id
 * @param {string} identifier
 * @returns {undefined}
 */
GLVIS.Animation.prototype.unregister = function (identifier) {
    for (var i = 0; i < this.animations_.length; i++) {
        if (this.animations_[i].identifier === identifier) {
            this.animations_.splice(i, 1);
            break;
        }
    }
};

/**
 * Calculate a delta for animations
 * 
 * @param {float} curr Current value
 * @param {float} goal Goal value
 * @param {float} max_diff Maximal calculated difference
 * @param {float} factor Speed factor
 * @param {float} pow Exponent for calculation
 * @param {float} threshold Value > 0 to stop animation
 * @returns {float} DELTA for animation
 */
GLVIS.Animation.prototype.getStepByExpSlowdown_ = function (curr, goal, max_diff, factor, pow, threshold) {

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

        var power = Math.pow(Math.abs(normalized_diff), pow);
        power /= 2;

        GLVIS.Debugger.debug("Animation",
                [max_diff, diff, normalized_diff, pow, power, factor],
                8);

        return power * diff * factor;
    }
    else {
        return 0.0;
    }

};



