/**
 * Игра Алфавит-паттерн (Нового кода НЛП)
 * Автор - Дан Воронов
 */
 
// использование Math.round() даст неравномерное распределение
function getRandomInt(min,max){ return Math.floor(Math.random() * (max - min + 1)) + min; }

// селекторы уровня

function randomBukvi(planko){
	ficltPlanka = planko; probeg = 5-ficltPlanka-1;
	fixltNmMas[5-0] = 99; // что угодно для сравнения 1го
 	for (var i = 1; i <= ficltPlanka; i++)
	     do fixltNmMas[5-i] = getRandomInt(0,alphabet.length-1);
	     while (fixltNmMas[5-i] == fixltNmMas[5-i+1])
}

function InitSelector(uroven){
	dw = $("#maincont").width(); dh = $("#maincont").height() - 80; // 80 панель
	gamebegin = true; urovenN = uroven;
	delay = delay_max - $( "#sliderspeed" ).slider( "value" )*delay_coef; 	
	switch (uroven) {
	   case 0: ClassicInit(); break;
	   case 1: case 2: case 3: ElectroInit(); break;
	   case 4: PatternInit(); fixToppx = getLtPos('top',0); fixLeftpx = getLtPos('left',0); break;
	   case 5: PatternInit(); color_sdvig = getRandomInt(0,1); break;
	   
	   case 6: PatternInit(); 
	 		   randomBukvi($('input[name=radioblock6]:checked').val()); // 2 3 4
	   break;
	   
	   case 7:  ficltPlanka = $('input[name=radioblock7]:checked').val(); // 3 4
	   			probeg = 0;	
	   			slovo34 = getRandomWord(ficltPlanka); 
	   			dosdvig();
				for (var i = 1; i <= ficltPlanka; i++)
	    	 		fixltNmMas[5-i] = alphabet.findIndex(slovo34.charAt(sdvig[i-1]));		
	   			PatternInit();
	   break;
	   
	   case 8: PatternInit(); probegM = 0; randomBukvi(3); // из 3 букв
	   		fixMejdu = $('input[name=radioblock8]:checked').val(); // 1 2 3 0	
	   break;	   
	   
	   case 9: PatternInit(); probeg = 0;	
	   		for(i = 1; i <= 8; i++)
		  		if ($( "#check"+i).prop("checked")) 
		  		patternMas[i] = getRandomInt(0,alphabet.length-1);
		  		else patternMas[i] = 100 //случайно
	   break;	
	   	   	   
	   default: alert('Что-то не так'); break;
	}
	nextLetterSelector(urovenN);
}

function nextLetterSelector(uroven){
	switch (uroven) {
	   case 0: nextLetterClassic(); break;
	   case 1: case 2: case 3: nextElectroLetter(); break;
	   case 4: nextPatternLetter(); break;
	   case 5: nextPatternLetterCol(); break;
	   case 6: 
	   case 7: 
	   case 8: nextPosledLetter(); break;	
	   case 9: next9(); break;		      	   
	   default: alert('Что-то не так'); break;	   
	}
}

// создание новой буквы

var newltr = false;

function SbrosBukvi (){	
	var stro = '';  newltr = true;
	
	switch (urovenN) {
	   case 4:  
	if (fixToppx*3 + LetrHeight*2 > dh) stro = 'bottom '; 
	else if (fixToppx*3 + LetrHeight*2 < dh) stro = 'top ';
	else stro = 'center ';
	if (fixLeftpx*3 + LetrHeight > dw) stro = stro +'right'; 
	else if (fixLeftpx*3 +LetrHeight < dw) stro = stro +'left';
	else stro =  stro +'center';
	
	$("#otvbukva").html("Target letter: <div class='otvbukvacl'>"+alphabet[fixltNm]+"</div><center>"+stro+"</center>"); $( "#showotv").remove();	  
	 
	   	fixToppx = getLtPos('top', 0); fixLeftpx = getLtPos('left',0); 	
	   break;
	   case 5: $("#otvbukva").html("Target letter: <div class='otvbukvacl'>"+alphabet[fixltNm]+"</div>"); $( "#showotv").remove(); color_sdvig = getRandomInt(0,1);
	    break;
	    
	   case 8: case 6: txtout =  "Linked letters: <div class='otvbukvacl4'><b>"+alphabet[fixltNmMas[4]]+"</b>";
	   		for (var i = 2; i <= ficltPlanka; i++) // 2 3 4
	   			txtout = txtout + "<br/>"+alphabet[fixltNmMas[5-i]];
	   		$("#otvbukva").html(txtout+"</div>"); $( "#showotv").remove();    		
	   		randomBukvi(ficltPlanka);
	    break;	 

	   case 7: txtout =  "Hidden word: <div class='otvbukvacl4'>"+alphabet[fixltNmMas[4]];
	   		for (var i = 2; i <= ficltPlanka; i++) // 2 3 4
	   			txtout = txtout + " "+alphabet[fixltNmMas[5-i]];
	   		$("#otvbukva").html(txtout+"</div><div class='otvbukvacl6'>"+slovo34+"</div>"); $( "#showotv").remove(); 
	   		
	   		slovo34 = getRandomWord(ficltPlanka);
	   		probeg = 5-ficltPlanka; dosdvig();
			for (var i = 1; i <= ficltPlanka; i++)
	    	 	fixltNmMas[5-i] = alphabet.findIndex(slovo34.charAt(sdvig[i-1]));
	    break;
	    
	   case 9: $("#otvbukva").html("Pattern: <div class='otvbukvacl4'><span class='smlbukv'>1</span>"+alphabet_prop(patternMas[8])+"&nbsp; <span class='smlbukv'>2</span>"+alphabet_prop(patternMas[7])+"<br/><span class='smlbukv'>3</span>"+alphabet_prop(patternMas[6])+"&nbsp; <span class='smlbukv'>4</span>"+alphabet_prop(patternMas[5])+"<br/><span class='smlbukv'>5</span>"+alphabet_prop(patternMas[4])+"&nbsp; <span class='smlbukv'>6</span>"+alphabet_prop(patternMas[3])+"<br/><span class='smlbukv'>7</span>"+alphabet_prop(patternMas[2])+"&nbsp; <span class='smlbukv'>8</span>"+alphabet_prop(patternMas[1])+"</div>"); $( "#showotv").remove();    		
			probeg = 0;	
	   		for(i = 1; i <= 8; i++)
		  		if ($( "#check"+i).prop("checked")) 
		  		patternMas[i] = getRandomInt(0,alphabet.length-1);
		  		else patternMas[i] = 100 //случайно
	    break;	
	    	       
	   default: alert('Что-то не так'); break;	   
	}

	fixltNm = getRandomInt(0,alphabet.length-1);
}

function alphabet_prop(inmnb){
	if (inmnb == 100) return "*"
	else return alphabet[inmnb];
}

// вспосмогательный функции
function daibukvu(nenado){
	var botlettre = '';
	do {
	    var rand = Math.random();
		if (rand < 0.333) botlettre = 'L';
		else if (rand < 0.666) botlettre = 'B';
		else botlettre = 'R';	
	} while (botlettre == nenado)
	
	return botlettre;
}

function Umensh(){ // сохраняет уменьшение до автопаузы
	scolkonakru--; 
	$("#tiker").html(scolkonakru); 
	if (supports_html5_storage()) localStorage["alpattern.scolkonakru"] = scolkonakru;
}




// Алфавит который выводит буквы последовательно таблицей

function ClassicInit(){
	topotstup = Math.round(dh/24); leftpxotstup = Math.round(dw/22);
	
	$('.letr').remove(); 
	letterIndexClassic = 0; 
	toppx = 0; leftpx = 0; 
	tickwtk = 0;
}

function nextLetterClassic () {
	$('.letr').css('color', 'lightgray').css('text-shadow', '0 0 4px lightgray');
			
	if (toppx < topotstup) toppx = topotstup;			
	if (leftpx < leftpxotstup) leftpx = leftpxotstup;
	else leftpx = leftpx + leftpxotstup*3;	

	if (leftpx+leftpxotstup > dw) {
		leftpx = leftpxotstup;
		toppx =  toppx + topotstup*6;
	}
	
	$('<div id=toplt'+letterIndexClassic+' class="letr">'+alphabet[letterIndexClassic]+'</div>').appendTo($('#maincont')); 
	$('<div id=botlt'+letterIndexClassic+' class="letr">'+daibukvu(alphabet[letterIndexClassic])+'</div>').appendTo($('#maincont')); 
	
	$('#toplt'+letterIndexClassic).css('left', leftpx).css('top', toppx).css('font-size', topotstup*2+'px');
	$('#botlt'+letterIndexClassic).css('left', leftpx).css('top', toppx+topotstup*2).css('font-size', topotstup*2+'px');;	
	
	letterIndexClassic++;  	Umensh();	
	if (scolkonakru > 0)
	{	if (letterIndexClassic < alphabet.length)
		LetterTime = setTimeout(nextLetterClassic, delay)
	else {
		$('.letr').css('color', 'lightgray').css('text-shadow', '0 0 4px lightgray');	
		setTimeout('InitSelector(0)', delay);
	}
	} else {setTimeout('scolkonakru = 1; $("#pauseind").click();', delay)}
}

// Алфавит который выводит буквы случайно

function ElectroInit(){
	LetrHeight = Math.round(dh/4); leftpxotstup = 25;
	
	$('.letr').remove();
	
	$('<div id=toplt0 class="letr"></div>').appendTo($('#maincont'));
	$('<div id=botlt0 class="letr"></div>').appendTo($('#maincont'));
	$('#toplt0').css('color', '#E6E2D8').css('text-shadow', '0 0 4px lightgray').css('font-size', LetrHeight+'px'); 
	$('#botlt0').css('color', '#E6E2D8').css('text-shadow', '0 0 4px lightgray').css('font-size', LetrHeight+'px');
	$('<div id=toplt1 class="letr"></div>').appendTo($('#maincont')); 
	$('<div id=botlt1 class="letr"></div>').appendTo($('#maincont'));	
	$('#toplt1').css('font-size', LetrHeight+'px');
	$('#botlt1').css('font-size', LetrHeight+'px');
	
	$(".letr").click(function () { $("#pauseind").click(); } ); 
	
	ltConteneir = 0; toppx = 0; leftpx = 0; 
}

function nextElectroLetter(){

	oldTopPx = toppx; OldLeftPx = leftpx;
	toppx = getLtPos('top', oldTopPx); leftpx = getLtPos('left',OldLeftPx); 
		
		$('#toplt0').css('left', $('#toplt1').css('left'));
		$('#botlt0').css('left', $('#botlt1').css('left'));
		$('#toplt0').css('top', $('#toplt1').css('top'));
		$('#botlt0').css('top', $('#botlt1').css('top'));
		$('#toplt0').html($('#toplt1').html()); $('#botlt0').html($('#botlt1').html());
			
	bukvaGovorit = alphabet[getRandomInt(0,alphabet.length-1)];
	sdvid1 = 0; sdvid2 = 0;
	if (urovenN == 3) {
		if (Math.random() < 0.5) sdvid1 = LetrHeight;
		else sdvid2 = LetrHeight;
	} else sdvid2 = LetrHeight;
	
	$('#toplt1').html(bukvaGovorit); 
	$('#botlt1').html(daibukvu(bukvaGovorit));
	
	if (urovenN == 1){
		$('#toplt1').css('left', leftpx).css('top', toppx+sdvid1);
		$('#botlt1').css('left', leftpx).css('top', toppx+sdvid2);	
	} else {
		$('#toplt1').animate({left: leftpx, top: toppx+sdvid1 });
		$('#botlt1').animate({left: leftpx, top: toppx+sdvid2 });
	}
	
	Umensh();	
	if (scolkonakru > 0) LetterTime = setTimeout(nextElectroLetter, delay);
	else setTimeout('scolkonakru = 1; $("#pauseind").click();', delay);
}


// Алфавит который выводит буквы по паттерну

function getLtPos(select, delta){
	var retotv = 0;
	do if (select == 'top') retotv = getRandomInt(0,dh-LetrHeight*2)-10; 	
		else if (select == 'left') retotv = getRandomInt(leftpxotstup,dw-leftpxotstup-LetrHeight)	
	while (Math.abs(retotv - delta)*2 < LetrHeight);
	return retotv;
}

function PatternInit(){
	ElectroInit(); newltr = false; fixltNm = getRandomInt(0,alphabet.length-1);
	
	$( "#dialog-modal-cnt" ).dialog('option', "width","500");		 
	$("<div id=pzotvetcont><span id=otvbukva></span><div id=showotv  onClick='SbrosBukvi();' style='position: absolute; width: 150px; top: 170px;  left: 325px;'>Show answer<br/>Replace letter</div></div>").appendTo($('#pzotvet')); 	$( "#showotv").button();
}

function nextPatternLetter(){

	oldTopPx = toppx; OldLeftPx = leftpx;
	
	if (povtor)
	  do getNm = getRandomInt(0,alphabet.length-1);
	  while (getNm == fixltNm);
	else getNm = getRandomInt(0,alphabet.length-1);
	
	if (!povtor && (getNm == fixltNm || getRandomInt(1,$( "#sliderpattern" ).slider("value")) == 3) ){ 
		toppx =  fixToppx; leftpx = fixLeftpx; getNm = fixltNm;
		povtor = true;
	}
	else { toppx = getLtPos('top', oldTopPx); leftpx = getLtPos('left',OldLeftPx); 		
		povtor = false;
	}
	
		$('#toplt0').css('left', $('#toplt1').css('left'));
		$('#botlt0').css('left', $('#botlt1').css('left'));
		$('#toplt0').css('top', $('#toplt1').css('top'));
		$('#botlt0').css('top', $('#botlt1').css('top'));
		$('#toplt0').html($('#toplt1').html()); $('#botlt0').html($('#botlt1').html());
			
	bukvaGovorit = alphabet[getNm];
	sdvid1 = 0; sdvid2 = 0;
	if (urovenN == 3) {
		if (Math.random() < 0.5) sdvid1 = LetrHeight;
		else sdvid2 = LetrHeight;
	} else sdvid2 = LetrHeight;
	
	$('#toplt1').html(bukvaGovorit); $('#botlt1').html(daibukvu(bukvaGovorit));
	$('#toplt1').css('left', leftpx).css('top', toppx+sdvid1);
	$('#botlt1').css('left', leftpx).css('top', toppx+sdvid2);	

	Umensh();	
	if (scolkonakru > 0) LetterTime = setTimeout(nextPatternLetter, delay);
	else setTimeout('scolkonakru = 1; $("#pauseind").click();', delay);
}




function nextPatternLetterCol(){

	oldTopPx = toppx; OldLeftPx = leftpx;
	toppx = getLtPos('top', oldTopPx); leftpx = getLtPos('left',OldLeftPx); 
		$('#toplt0').css('left', $('#toplt1').css('left'));
		$('#botlt0').css('left', $('#botlt1').css('left'));
		$('#toplt0').css('top', $('#toplt1').css('top'));
		$('#botlt0').css('top', $('#botlt1').css('top'));
		$('#toplt0').html($('#toplt1').html()); $('#botlt0').html($('#botlt1').html());
			
	var bukvaGovoritNm = getRandomInt(0,alphabet.length-1);
	var bukvaGovorit = alphabet[bukvaGovoritNm];	
		if (bukvaGovoritNm == fixltNm ) 
			{alphabet_color_index2 = color_sdvig-0; alphabet_color_index1 = Math.abs(color_sdvig-1)}
		else 
			{alphabet_color_index1 = color_sdvig-0; alphabet_color_index2 = Math.abs(color_sdvig-1)}
	
	var bukva_color = alphabet_color[alphabet_color_index1][getRandomInt(0,alphabet_color[alphabet_color_index1].length-1)];
	for(var i = 0; i < alphabet_glasnie.length; i++) 
		if (bukvaGovorit == alphabet_glasnie[i]) 
		bukva_color = alphabet_color[alphabet_color_index2][getRandomInt(0,alphabet_color[alphabet_color_index2].length-1)];

	$('#toplt1').html(bukvaGovorit).css("color", bukva_color); 
	$('#botlt1').html(daibukvu(bukvaGovorit)).css("color", bukva_color);
	$('#toplt1').animate({left: leftpx, top: toppx+0 });
	$('#botlt1').animate({left: leftpx, top: toppx+LetrHeight });

	Umensh(); if (scolkonakru > 0) LetterTime = setTimeout(nextPatternLetterCol, delay);
	else setTimeout('scolkonakru = 1; $("#pauseind").click();', delay);
}


// уровень 6 7 8 - создает последовательности


function nextPosledLetter(){
	oldTopPx = toppx; toppx = getLtPos('top', oldTopPx);
	OldLeftPx = leftpx; leftpx = getLtPos('left',OldLeftPx);
	OldNm = getNm; do 
		if (3 == getRandomInt(1,$("#sliderpattern" ).slider("value"))) 
		getNm = fixltNmMas[4]
		else getNm = getRandomInt(0,alphabet.length-1);	
	while (OldNm == getNm);	

	if (probeg == 5-ficltPlanka-1) { if (getNm == fixltNmMas[4]) probeg = 4-1; }
	else { 	
		if (urovenN == 8) {
			if (fixMejdu == 0)   probegPlanka = getRandomInt(1,2);
							else probegPlanka = fixMejdu;
			if (probegM >= probegPlanka) { 
				getNm = fixltNmMas[probeg]; probeg--;  probegM = 0;
			}  else 	probegM++	
		} else { getNm = fixltNmMas[probeg]; probeg--;  }   		
	}
	
		$('#toplt0').css('left', $('#toplt1').css('left'));
		$('#botlt0').css('left', $('#botlt1').css('left'));
		$('#toplt0').css('top', $('#toplt1').css('top'));
		$('#botlt0').css('top', $('#botlt1').css('top'));
		$('#toplt0').html($('#toplt1').html()); $('#botlt0').html($('#botlt1').html());
	bukvaGovorit = alphabet[getNm];	$('#toplt1').html(bukvaGovorit); 
	$('#botlt1').html(daibukvu(bukvaGovorit));
	sdvid1 = 0; sdvid2 = 0;
	if (urovenN == 6) {
		if (Math.random() < 0.5) sdvid1 = LetrHeight; else sdvid2 = LetrHeight;
	} else sdvid2 = LetrHeight;	
	$('#toplt1').animate({left: leftpx, top: toppx+sdvid1 });
	$('#botlt1').animate({left: leftpx, top: toppx+sdvid2 });
	Umensh();	
	if (scolkonakru > 0) LetterTime = setTimeout(nextPosledLetter, delay);
	else setTimeout('scolkonakru = 1; $("#pauseind").click();', delay);
}

// уровень 9 - создает последовательности


function next9(){
	oldTopPx = toppx; toppx = getLtPos('top', oldTopPx);
	OldLeftPx = leftpx; leftpx = getLtPos('left',OldLeftPx);
	
	if (3 == getRandomInt(1,$("#sliderpattern" ).slider("value")))
		if (probeg == 0) probeg = 8; // запустили круг
	
	if (probeg == 0) {
		OldNm = getNm; do getNm = getRandomInt(0,alphabet.length-1);	
		while (OldNm == getNm);	
	}
	else { 
		if (patternMas[probeg] == 100)  {
			OldNm = getNm; do getNm = getRandomInt(0,alphabet.length-1);	
			while (OldNm == getNm);		
		}
		else getNm = patternMas[probeg]; 
	probeg--}

		$('#toplt0').css('left', $('#toplt1').css('left'));
		$('#botlt0').css('left', $('#botlt1').css('left'));
		$('#toplt0').css('top', $('#toplt1').css('top'));
		$('#botlt0').css('top', $('#botlt1').css('top'));
		$('#toplt0').html($('#toplt1').html()); $('#botlt0').html($('#botlt1').html());
	bukvaGovorit = alphabet[getNm];	$('#toplt1').html(bukvaGovorit); 
	$('#botlt1').html(daibukvu(bukvaGovorit));
	sdvid1 = 0; sdvid2 = 0;
	if (urovenN == 6) {
		if (Math.random() < 0.5) sdvid1 = LetrHeight; else sdvid2 = LetrHeight;
	} else sdvid2 = LetrHeight;	
	$('#toplt1').animate({left: leftpx, top: toppx+sdvid1 });
	$('#botlt1').animate({left: leftpx, top: toppx+sdvid2 });
	Umensh();	
	if (scolkonakru > 0) LetterTime = setTimeout(next9, delay);
	else setTimeout('scolkonakru = 1; $("#pauseind").click();', delay);
}