var GLVIS = GLVIS || {};


GLVIS.DbHandler = function () {
    GLVIS.DbHandler.current_db_handler_ = this;

    this.db_ = null;
    this.query_data_ = [];
};


GLVIS.DbHandler.prototype.loadQueries = function (callback_ready) {

    this.initDb_(function () {

        if (GLVIS.config.debug)
            console.log("DBHANDLER: Init DB ready.");





        if (callback_ready)
            callback_ready();
    });


};

GLVIS.DbHandler.prototype.initDb_ = function (callback_ready) {

    if (!callback_ready)
        throw("No valid callback");

    if (this.db_ !== null) {
        callback_ready();
        return;
    }

    console.log("GO ON HERE AFTER INTEGRATION IN REC-DASHBOARD");


    callback_ready();


};




/******************
 * 
 * Static functions
 * 
 ******************/


GLVIS.DbHandler.current_db_handler_ = null;

/**
 * Get current DB-Handler
 * @returns {GLVIS.DbHandler}
 */
GLVIS.DbHandler.getCurrentDbHandler = function () {
    if (!this.current_db_handler_)
        throw("ERROR: NO CURRENT DB-HANDLER!");

    return this.current_db_handler_;
};