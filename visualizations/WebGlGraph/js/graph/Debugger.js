
var GLGR = GLGR || {};

GLGR.Debug = {
    lasttimestamp_: null,
    firsttimestamp_ : Date.now()
};

GLGR.Debug.debugTime = function (text) {

    var curr_time = Date.now();

    var diff = "-";
    if (this.lasttimestamp_ !== null)
        diff = ((curr_time - this.lasttimestamp_) / 1000) + " sec" ;
    this.lasttimestamp_ = curr_time;
    
    var alltime = ((curr_time - this.firsttimestamp_) / 1000) + " sec" ;
    console.log("DEBUG: " + text + " " + diff + "  (insg. " + alltime + ")");
};