

jQuery(document).ready(function(){
    
   var db_handler = GLGR.DbHandler.getSingleton();
   db_handler.getAllQueries(function(queries){
       console.log("")
       console.log(queries);
   }); 
   
      db_handler.getAllRecommendations(function(queries){
       console.log(queries);
   }); 
});