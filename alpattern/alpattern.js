$(document).ready(function(){

	$("#pauseind").click(function () {
	   	if (game) pausegame(); 
	   	$("#pauseind").removeClass('gamefon').addClass('pausefon');	
		$('#cntalp').val(scolkonakru); timecount(scolkonakru); 		
		$( "#dialog-modal-cnt" ).dialog( "open" );
		$('#cntalp').focus().select();
	  });
	  
	$("#maincont").click(function () { $("#pauseind").click(); } );  
	  
	$( "#dialog-modal-cnt" ).dialog({
	 	dialogClass : 'dialog1',
		height: 354, width: 340,
		resizable: false,
		autoOpen: false, modal: true,
		buttons: {
			"End Game": function() { 		
				$("#dialog-modal-cnt").dialog( "close" );
				if (game) $("#slide").click(); 			 
		  	},
		  "Continue": function() { 
				pausewinclosegame($( "#sliderspeed" ).slider( "value" ));}	
			}
	});
	
	$( "#dialog-pravila" ).dialog({
		width: 640,
		resizable: false,
		autoOpen: false, modal: false,
		buttons: {
			"Got it": function() {	$("#dialog-pravila").dialog( "close" );			 
		  	}}
	});	
	
	disDialogButton( '.dialog1', 'End Game', true );

    $('#cntalp').bind('keydown', function(e) {
        //var key = (e.keyCode ? e.keyCode : e.charCode);
        var key = e.which;
        if (key == 13) {
            e.preventDefault(); pausewinclosegame($( "#sliderspeed" ).slider( "value" ));  
        }
        else if ( key == 46 || key == 8 || key == 37 || key == 39 ) {        } // стрелки и дел
        else if ( key == 38) { if (parseInt($('#cntalp').val()) < 9998) $('#cntalp').val(parseInt($('#cntalp').val())+1);    } // стрелки вверх
        else if ( key == 40) { if (parseInt($('#cntalp').val()) > 1)  $('#cntalp').val(parseInt($('#cntalp').val())-1);       } // стрелки вниз
        else { if ((key < 48 || key > 57) && (key < 96 || key > 105 )) {event.preventDefault();  } 
		}	
    });   		
    $('#cntalp').bind('keyup', function(e) {	
   	 	if ($('#cntalp').val().length < 5)				
    		timecount(parseInt($('#cntalp').val()));
    		else $("#timefrom").html('');
	}); 

	$( "#alptabs" ).tabs({select: function(e, ui){
		if (ui.index <= maxlevel() ) 
		{ $( "#level" ).html( ui.index );
			if (ui.index > 3) 
			{ $( "#sliderpattern" ).slider("enable");  
			  $( "#patternhide" ).css("color", "black");  }
			else 
			{ $( "#sliderpattern" ).slider("disable"); 
			  $( "#patternhide" ).css("color", "gray"); 
			}
		}
		if (supports_html5_storage()) localStorage["alpattern.level"] = ui.index;
	}});
	
	$( "#alfopistabs" ).tabs({event: "mouseover"});	

	$("#startcount").css('font-size', ($(document).height()-200)+'px');

	$("#slide").click(function(){
		if ($(this).text() == 'Play') {
		$("#botpanel").animate({
		    bottom: '-=388',
		  }, "fast", function() {
		   $("#slide").text('End Game'); $( "#slide").button();
		   $("#pauseind").addClass('gamefon').removeClass('pausefon');
		   	disDialogButton( '.dialog1', 'End Game', false);
		 $( "#sliderspeed" ).hide('fast'); 
		   game = true; paused = false; levelup = 0;
		   startgame();
		  });
		}
		else $("#botpanel").animate({
		    bottom: '+=388',
		  }, "fast", function() {  
		  	$( "#slide").button("destroy"); $("#slide").text('Play');
		    $("#pauseind").removeClass('gamefon').addClass('pausefon');
		    disDialogButton( '.dialog1', 'End Game', true );
		    game = false; paused = true;
		    $('#ingametime').css('display','none');
		    $("#exptime").html(writetimein(expatime)); 
		    pausegame(); 
		    $("#pzotvetcont").remove(); 
		    $( "#dialog-modal-cnt" ).dialog('option', "width","340");
		    if (levelup > 0) {
		    	$("#tablink"+levelup).click(); 
		    	$( "#level" ).html(levelup);
		    	setTimeout('$("#levelind").css("color", "black")',2000);
		    }
		  });
		
		$("#slide").toggleClass('gamebutton').toggleClass('grayButton');
		return false;
		
	});
	
	$( "#sliderspeed" ).slider({
		min: 1, 	max: 9, 	value: 4,
		slide: function( event, ui ) {
			$( "#speed" ).html( ui.value );
			delay = delay_max - ui.value*delay_coef;
			if (supports_html5_storage()) localStorage["alpattern.speed"] = ui.value;
		}
	});

	$("#indicatori2").mouseenter( function () { $( "#sliderspeed" ).show('fast'); });
	$("#indicatori2").mouseleave( function () { $( "#sliderspeed" ).hide('fast'); });
		  
	$( ".minbut").button(); $( "#showpravila").button(); 
	$("#showpravila").click( function () { $( "#dialog-pravila" ).dialog( "open" ); });
		  
	$( "#radioblock6" ).buttonset(); 
	$( "#radioblock7" ).buttonset();
	$( "#radioblock8" ).buttonset();	
	$( "#patternt9" ).buttonset();	
	
	
	$( "#sliderpattern" ).slider({ min: 4, max: 24, value: 7, 
		slide: function( event, ui ) { 
		if (supports_html5_storage()) localStorage["alpattern.sliderpattern"] = ui.value;	} });
		
     $("input[name='radioblock6']").change(function() {
		if (supports_html5_storage()) localStorage["alpattern.radioblock6"] = $('input[name=radioblock6]:checked').val();
      });	
      
     $( "#patternt9" ).click(  function () { 
		$( "#alptabs" ).tabs("refresh"); 
		if (supports_html5_storage()) 
		  for(var i = 1; i <= 8; i++)
		  	if ($( "#check"+i).prop("checked")) 
		  		localStorage["alpattern.pattern"+i] = 1;
		  		else localStorage["alpattern.pattern"+i] = 0;
	} ); 

// востанавливаем хранилище

    if (localStorage["alpattern.firstrun"]  != 'ne') clearHTML5();
    
    if (supports_html5_storage()) { 
 		$( "#sliderpattern" ).slider( "value", localStorage["alpattern.sliderpattern"]);
		$( "#sliderspeed" ).slider( "value", localStorage["alpattern.speed"]);
		 
    	expatime = localStorage["alpattern.expatime"]; 
    	$("#exptime").html(writetimein(expatime)); 
    	
		$( "#alptabs" ).tabs( "select" , localStorage["alpattern.level"] );
		
		maxlv = maxlevel();
		if (localStorage["alpattern.level"] <= maxlv ) 
			levelda = localStorage["alpattern.level"];
			else levelda = maxlv;
			
		$( "#level" ).html( levelda ); 
		if (levelda <= 3) { 
			$( "#sliderpattern" ).slider("disable"); 
			$( "#patternhide" ).css("color", "gray"); 
		}
			
		for(jj = maxlv+1; jj < 10; jj++) 
			{ tudastr = ''; tadatm = leveltimemin[jj];		
			if (tadatm >= 60) {
			if (Math.floor(tadatm / 60) == 1) tudastr = '<b>1</b> hour';
				else tudastr = '<b>' + Math.floor(tadatm / 60) + '</b> hours';
					tadatm = Math.round(tadatm%60);
				} 
			if (tadatm > 0) tudastr = tudastr+" <b>"+tadatm+"</b> minutes";
			$( "#tabs-"+jj).prepend("<div id=glush"+jj+" class=glush><div style='border-left: 1px solid silver; padding-left: 15px;'>To unlock this level you need <br/>"+tudastr+" of game experience.</div></div>");
				$("#tablink"+jj).css("color", "#C9B3BC");
			};

		$( "#speed" ).html( $( "#sliderspeed" ).slider( "value" ) );
		
	$("#radio"+localStorage["alpattern.radioblock6"]).prop("checked",true); 
	$( "#radioblock6" ).buttonset("refresh");
			
 	for (var i = 1; i <= 8; i++) {
	if (parseInt(localStorage["alpattern.pattern"+i]) == 1) 
		$( "#check"+i).prop("checked", true);
	}
	$( "#patternt9" ).buttonset("refresh");	$( "#alptabs" ).tabs("refresh"); 	 	
	
	scolkonakru = localStorage["alpattern.scolkonakru"]; 
	$("#tiker").html(scolkonakru);
	}
	
	// общая высота табов
	
	
	$('#alptabs div.ui-tabs-panel').height(function() {
			return $('#tabs-container').height()
				   - $('#tabs-container #alptabs ul.ui-tabs-nav').outerHeight(true)
				   - ($('#alptabs').outerHeight(true) - $('#alptabs').height())
				   - ($('#alptabs div.ui-tabs-panel:visible').outerHeight(true)  
					  - $('#alptabs div.ui-tabs-panel:visible').height());
		});
	
	
});