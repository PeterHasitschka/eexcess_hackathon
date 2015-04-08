(function(){

	var TestMiniViz = {};

	TestMiniViz.initialize = function(EEXCESSObj){		
		// load CSS
		// load other needed scripts (require.js is available)
	};

	// todo: rename date -> selectedData; add data, 
	TestMiniViz.draw = function(data, hightlightedData, $container, fromYear, toYear){
		var $vis = $container.find('.TestMiniViz');
		if ($vis.length == 0){
			$vis = $('<div class="TestMiniViz">Hallo</div>').css('background-color', 'lightgrey').css('padding-top', '10px').css('padding-bottom', '10px');		
			$container.append($vis);
		}

		$vis.html('Filter: ' + fromYear + " - " + toYear + '<br />Highlighted: ' + hightlightedData.length);
	};

	TestMiniViz.finalize = function(){
	};
	
	PluginHandler.registerFilterVisualisation(TestMiniViz, {
		'displayName' : 'TestMini', 
		'type' : 'time', 
	});
})();
