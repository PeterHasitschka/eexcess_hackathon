

var GLGR = GLGR || {};



GLGR.DbHandler = function () {

};


GLGR.DbHandler.prototype.getCurrentResults = function() {
    
  console.log("GETTING RESULTS");  
    
    var db = EEXCESS.storage.getDb(this.loadDbSuccess_, this.loadDbError_);
};


GLGR.DbHandler.prototype.loadDbSuccess_ = function(data){
    console.log("Success");
    console.log(data);
};


GLGR.DbHandler.prototype.loadDbError_ = function(){
    console.log("Error");
};