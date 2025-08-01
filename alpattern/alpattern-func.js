function writetimein(secu) {
	function pad(number) {
	   var str = '' + number;
	   if (number < 10) str = '0' + str;
	   return str;
	}
	
	var outstr = '';
	if (secu >= 3600) {
		outstr = Math.floor(secu / 3600)+':';
		secu = Math.round(secu%3600);
	};
	
	if (secu >= 60) {
		outstr = outstr + pad(Math.floor(secu / 60)) + ':';
		secu = Math.round(secu%60);
	} else outstr = outstr + '00:';
	
	return outstr + pad(secu);
	
	
	
}

function tickerfortime() { 
	expatime++; if (supports_html5_storage()) localStorage["alpattern.expatime"] = expatime;
	minticker++; $("#ingametime").html(writetimein(minticker));  
	
	if (expatime%60 == 0) // открыть уровень если да
	{ etam = jQuery.inArray(expatime/60, leveltimemin);
	  if (etam > 0) {
	  	$("#glush"+etam).remove(); levelup = etam;
	  	$("#tablink"+etam).css("color", "#4F4F4F"); 
	  	$("#levelind").css("color", "green"); 
	  	}
	}
}


/// ЗАПУСК

function startgame() {
	$("#startcount").css('font-size', ($(document).height()-200)+'px');
	countdw = 4; $('#startcount').html(countdw).css('display','block');
	
	gamebegin = false; timerfnctm = setInterval ("beginGame(false)", 700 );
};

function beginGame(resume){  // основной счетчик от 4 до 1 и запускатель игры
		countdw = countdw -1;
		if (countdw > 0) $('#startcount').html(countdw);
		else { 
			clearInterval(timerfnctm); $('#startcount').css('display','none');	
			minticker = 0; $('#ingametime').html('00:00').css('display','block');
			exptime = setInterval (tickerfortime, 1000 );
			if (resume) nextLetterSelector(parseInt($( "#level" ).html())); // востановить игру
			else InitSelector(parseInt($( "#level" ).html()));  // запустить игру
		}
}

// ПАУЗЕНИЕ

function resumegame() {
	$("#startcount").css('font-size', ($(document).height()-200)+'px');
	countdw = 4; $('#startcount').html(countdw).css('display','block');
	
	timerfnctm = setInterval ("beginGame(true)", 700 );
};

function pausegame() {
	if (gamebegin)  { clearInterval(exptime); clearTimeout(LetterTime); }
	clearInterval(timerfnctm); 
	$('#startcount').html('').css('display','block'); 
};

function pausewinclosegame(setspeed) {
  	testerval = parseInt($('#cntalp').val());		
	if (testerval > 0 && testerval < 10000) {
    	$("#dialog-modal-cnt").dialog( "close" );
    
   	 	scolkonakru = parseInt($('#cntalp').val()); $("#tiker").html(scolkonakru);
    	if (supports_html5_storage()) localStorage["alpattern.scolkonakru"] = scolkonakru;
    	
    	if (newltr) { newltr = false;
    		$("#pzotvetcont").html("<div id=><span id=otvbukva></span><div id=showotv  onClick='SbrosBukvi();' style='position: absolute; width: 150px; top: 170px;  left: 325px;'>Show answer<br/>Replace letter</div></div>"); 	$( "#showotv").button();
    	}
    	
    	$( "#sliderspeed" ).slider( "value", setspeed);
		$( "#speed" ).html( setspeed ); delay = delay_max - setspeed*delay_coef; 
		if (supports_html5_storage()) localStorage["alpattern.speed"] = setspeed;	
    
		if (game) { $("#pauseind").addClass('gamefon').removeClass('pausefon');
		if (gamebegin) resumegame(); else startgame(); };
	}
};



function timecount(tam) {
	function formattime(secu){
		var outstr = '';
		if (secu >= 60)	{
			outstr = Math.floor(secu / 60) + ' min ' + Math.round(secu%60) +' sec';
			}
		else outstr = secu+' sec';
	return outstr;
	}

	    if (tam > 0) {
	    	var txtstrto = '';
	    	if (1 ==  $( "#sliderspeed" ).slider("value")) txtstrto = txtstrto + "<b style='background-color: #DDFAD7;'>";
	    		else  txtstrto = txtstrto + "<a href='#' onClick=pausewinclosegame(1);>";
		    txtstrto = txtstrto + '[<b>1</b>] = '+formattime((delay_max-delay_coef)*tam/1000);
		    if (1 ==  $( "#sliderspeed" ).slider("value")) txtstrto = txtstrto + "</b>";
		    	else txtstrto = txtstrto + "</a>";
		      for(i = 2; i < 10; i++) {
		      	if (i ==  $( "#sliderspeed" ).slider("value")) txtstrto = txtstrto + "<b style='background-color: #DDFAD7'>";
		      		else  txtstrto = txtstrto + "<a href='#' onClick=pausewinclosegame("+i+");>";
		       txtstrto = txtstrto + '<br/>[<b>'+i+'</b>] = '+formattime(((delay_max-i*delay_coef)*tam)/1000);
		       	if (i ==  $( "#sliderspeed" ).slider("value")) txtstrto = txtstrto + "</b>";
		       	else txtstrto = txtstrto + "</a>";
		      }
			$("#timefrom").html(txtstrto);  
		}
};


function setwtbytm(timeToSet) {
	$('#cntalp').val(Math.round(60*timeToSet/(delay_max-$( "#sliderspeed" ).slider( "value" )*delay_coef)*1000));
	timecount(parseInt($('#cntalp').val()));
}

//

function disDialogButton( dialog_selector, button_name, flg )
{
  var buttons = $( dialog_selector + ' .ui-dialog-buttonpane button' );
  for ( var i = 0; i < buttons.length; ++i )
  {
     var jButton = $( buttons[i] );
     if ( jButton.text() == button_name )
     {
         if (flg) jButton.attr('disabled', 'disabled' ).addClass('ui-state-disabled');
         else jButton.removeAttr('disabled').removeClass( 'ui-state-disabled' );
     }
  }

  return null;
}

function dosdvig(){
	sdvig[0] = getRandomInt(0,ficltPlanka-1);
	do sdvig[1] = getRandomInt(0,ficltPlanka-1); 
	while (sdvig[1] == sdvig[0])
	do sdvig[2] = getRandomInt(0,ficltPlanka-1); 
	while (sdvig[2] == sdvig[1] || sdvig[2] == sdvig[0])
	
	if (ficltPlanka == 4){
	do sdvig[3] = getRandomInt(0,ficltPlanka-1); 
	while (sdvig[3] == sdvig[1] || sdvig[3] == sdvig[0] || sdvig[3] == sdvig[2])	
	}
}

// масива позиция через элемент

Array.prototype.findIndex = function(value){
var ctr = "";
for (var i=0; i < this.length; i++) {
	if (this[i] == value.toUpperCase()) {return i;}
}
return ctr;
};
 

// поддержка локалхранилища
function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}
