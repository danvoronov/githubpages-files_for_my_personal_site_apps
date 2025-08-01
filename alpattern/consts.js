var game = false;
var expatime = 0;
var scolkonakru = 56;
var tickwtk = 0;

var leveltimemin = [0, 5, 15, 45, 90, 180, 270, 330, 400, 440];

function maxlevel() { // проверяет какой уровень у пользователя
	for(i = 0; i < 10; i++)
		if (expatime >= leveltimemin[i+1]*60) {}
		else return 9 // i
}

var slovo34 = 'хуй';
var sdvig = [1,2,3]

var nextlevelind = true;

var LEFT = 'L';
var RIGHT = 'R';
var BOTH = 'B';

var alphabet = [
	'A', 'B', 'C', 'D', 'E', 'F', 'G', 
	'H', 'I', 'J', 'K', 'L', 'M', 'N', 
	'O', 'P', 'Q', 'R', 'S', 'T', 'U', 
	'V', 'W', 'X', 'Y', 'Z'
];
var alphabet_glasnie = ['A', 'E', 'I', 'O', 'U'];
var alphabet_color =  [['#000066', '#003366', '#330099', '#333333', '#333300', '#333366', '#25093B', '#160C3C', '#454304', '#022929', '#116940'], ['#990000', '#993333', '#CC0000', '#FF6633', '#CC0033', '#993300','#BA2963', '#E67F12', '#C72AAA', '#AD1822', 'D98D3D']];

var letterIndex = alphabet.length;

var delay_coef = 200; 
var delay_max = 2100;
var delay = 4*delay_coef; // 4 скорость по умолчанию

var LetterTime;
var timerfnctm;
var fixltNmMas = [0,1,2,3,4];
var ficltPlanka = 1;
var probeg, probegM;
var fixMejdu;
var patternMas = [0,1,2,3,4,5,6,7];

var leftpxotstup, topotstup, dw, dh;
var leftpx = 0;
var toppx = 0;
 
var gamebegin = false;
var urovenN = 0;

var fixltNm, fixToppx, fixLeftpx, getNm;
var OldNm = 99;
var LetrHeight;
var povtor = true;

function clearHTML5() {
	localStorage["alpattern.speed"] = 5;
	localStorage["alpattern.sliderpattern"] = 7;
	localStorage["alpattern.radioblock6"] = 4;
	localStorage["alpattern.level"] = 0;
	localStorage["alpattern.expatime"] = 0;
	localStorage["alpattern.scolkonakru"] = scolkonakru;    
	localStorage["alpattern.firstrun"] = 'ne';			
}