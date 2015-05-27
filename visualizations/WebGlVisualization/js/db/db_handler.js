var GLVIS = GLVIS || {};


GLVIS.DbHandler = function(){  
    GLVIS.DbHandler.current_db_handler_ = this;

    this.query_data_ = [];
};


GLVIS.DbHandler.prototype.loadQueries = function(callback_ready){
    
    
    
    
    if (callback_ready)
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