<!DOCTYPE html>
<html>
	<head>
		<title>игра Алфавит-паттерн</title>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<script src="http://apps.dan.kiev.ua/js/jquery-1.6.2.min.js"></script>
	<script src="http://apps.dan.kiev.ua/js/jquery-ui-1.8.16.custom.min.js"></script>
	<script src="words.js"></script>
	<script src="consts.js"></script>
	<script src="alpcore.js"></script>
	<script src="alpattern-func.js"></script>
	<script src="alpattern.js"></script>
	
	<link type="text/css" href="http://apps.dan.kiev.ua/js/css/aristo/Aristo.css" rel="stylesheet" />	
	<link type="text/css" href="alpattern.css" rel="stylesheet" />	
	</head>
<body>
<div id="pokazovcont"><div id="pauseind" class="pausefon">ещё <b id=tiker>56</b> шт</div>
</div>
<div id="startcount"></div>
<div id="ingametime">00:00</div>
<div id="maincont"></div>
<div id="botpanel" class="gradround">
	<div id="panelhead" class="gradround">	
		<div id="indicatori">
			<span id="levelind">Уровень: <b id="level">0</b></span>
			&nbsp; <span id=patternhide>Паттерн: &nbsp;&nbsp; <span style="font-size: 10px;">чаще реже</span></span>
			<div id="sliderpattern"></div>
		</div>
		<div id="begendbut"><a id="slide" class="gamebutton">Играться</a></div>
		<div id="indicatori2"><div id="slideri"><div id="sliderspeed"></div></div><span id="speedind">Скорость: <b id="speed">4</b></span></div> 						
	</div>
	<div id="panelcont" style="clear:both;">		
		<div id="alplocl" style="float: left;"><h1 style="margin: 6px;">Алфавит</h1>
		<p style="margin: 6px; text-align: center ">Новый код НЛП</p>
		<p style="margin: 10px; margin-top: 26px;">Игра-процесс, ежесекундно способствующая улучшению осознаности и способностей твоего мозга</p>
		</div>
		<div id="alplocr" style="float: left;">
		<div id="exptimecont">опыт <a id="exptime" title='Суммарное время в игре. Сохраняется в браузер.'>1:60:33</a></div>
		<div id="tabs-container" class="tabcont">
		<div id="showpravila">Правила</div>
		<div id="alptabs">
			<ul>
				<li><a href="#tabs-0" id="tablink0">0</a></li>
				<li><a href="#tabs-1" id="tablink1">1</a></li>
				<li><a href="#tabs-2" id="tablink2">2</a></li>
				<li><a href="#tabs-3" id="tablink3">3</a></li>
				<li><a href="#tabs-4" id="tablink4">4</a></li>
				<li><a href="#tabs-5" id="tablink5">5</a></li>
				<li><a href="#tabs-6" id="tablink6">6</a></li>
				<li><a href="#tabs-7" id="tablink7">7</a></li>
				<li><a href="#tabs-8" id="tablink8">8</a></li>
				<li><a href="#tabs-9" id="tablink9">9</a></li>
			</ul>
	<div id="tabs-0" class="tabcont">	
		<div style="margin: 0; font-size: 40px;">Классический</div>	
		<p>Создает на экране похожую на печатную таблицу алфавита и под каждой буковой выводит букву для рук. Последовательно проходит все буквы алфавита.</p>		
	</div>
	<div id="tabs-1" class="tabcont">
		<div style="margin: 0; font-size: 40px;">Электронный</div>
		<p>Версия Алфавита, получившая название "электронная", заточена под компьютер: на экране удобнее не выводить таблицу алфавита, а случайные буквы в случайном месте экрана. </p>
	</div>
	<div id="tabs-2" class="tabcont">
		<div style="margin: 0; font-size: 40px;">Потоковый</div>
		<p>В версию со случайным появлением букв добавлена плавность путем перемещеиня букв. Теперь взляд должен не просто выискивать на экране буквы, а скользить за ними и выхватывать в движении.</p>
	</div>
	<div id="tabs-3" class="tabcont">
		<div style="margin: 0; font-size: 40px;">Вращающийся</div>
		<p>Теперь кроме движения буква показывающая право-лебо-обе может находиться и вверху пары.</p>
	</div>
	<div id="tabs-4" class="tabcont">
		<div style="margin: 0; font-size: 40px;">Позиционный</div>
		<p>Позиция одной буквы на экране зафиксирована. Задача найти эту букву.</p>
	</div>
	<div id="tabs-5" class="tabcont">
		<div style="margin: 0; font-size: 40px;">Цветной</div>
		<p>Есть теплые и холодные цвета. Есть гласные и согласные буквы. Все гласные и все согласные выводятся своим оттенок. Кроме одной буквы, которая выводится противоположным оттенком. Задача найти эту букву.</p>
	</div>
	<div id="tabs-6" class="tabcont">
		<div style="margin: 0; font-size: 40px;">Последовательности</div>	
		<p>Найти зафиксированную последовательность букв из</p>
		<div id="radioblock6">
			<input type="radio" id="radio4" value="4" name="radioblock6"  checked="checked" />
			<label for="radio4">Четыре</label>
			<input type="radio" id="radio3" value="3" name="radioblock6" />
			<label for="radio3">Три</label>
			<input type="radio" id="radio2" value="2" name="radioblock6" />
			<label for="radio2">Два</label>	
		</div>	
	</div>
	<div id="tabs-7" class="tabcont">
		<div style="margin: 0; font-size: 40px;">Аннаграммы</div>
		<p>Найти последовательность, которая является переставленными буквами какого-либо слова из</p>
		<div id="radioblock7">
			<input type="radio" id="radio74" value="4" name="radioblock7" />
			<label for="radio74">Четыре</label>
			<input type="radio" id="radio73" value="3" name="radioblock7" checked="checked" /><label for="radio73">Три</label>
		</div>			
	</div>
	<div id="tabs-8" class="tabcont">
		<div style="margin: 0; font-size: 40px;">Разнесённые</div>
		<p>Три буквы, но между каждой могу быть другие буквы.</p>
		<div id="radioblock8">
			<input type="radio" id="radio81" value="1" name="radioblock8"  checked="checked" />
			<label for="radio81">Одна</label>
			<input type="radio" id="radio82" value="2" name="radioblock8" />
			<label for="radio82">Две</label>
			<input type="radio" id="radio80" value="0" name="radioblock8" />
			<label for="radio80">То одна, то две</label>				
		</div>			
	</div>
	<div id="tabs-9" class="tabcont">
		<div style="margin: 0; font-size: 40px;">Паттерн</div>	
		<p>зафиксировать буквы номер</p>
		<div id="patternt9">
			<input type="checkbox" id="check8" /><label for="check8">1</label>
			<input type="checkbox" id="check7" /><label for="check7">2</label>
			<input type="checkbox" id="check6" /><label for="check6">3</label>
			<input type="checkbox" id="check5" /><label for="check5">4</label>
			<input type="checkbox" id="check4" /><label for="check4">5</label>
			<input type="checkbox" id="check3" /><label for="check3">6</label>
			<input type="checkbox" id="check2" /><label for="check2">7</label>
			<input type="checkbox" id="check1" /><label for="check1">8</label>
		</div>
	</div>
</div>
</div>

		</div>		
	</div>
	<div style="clear:both;"></div>
</div>
<div id="credits">АЛФАВИТ<br/>ПАТТЕРН<div style="font-size: .6em">2012, Дан</div></div>
		
<div id="dialog-modal-cnt" title="ПАУЗА">
	<div style="float: left; width: 120px;">Показов до автопаузы: <input type='text' id='cntalp' size="4" onClick='this.select();' style="width: 96px;" /><div id="3minin" onClick='setwtbytm(3);' class="minbut">⬆ 3 мин</div><div id="5minin"  onClick='setwtbytm(5);'  class="minbut">⬆ 5 мин</div><div id="10minin" class="minbut" onClick='setwtbytm(10);' >⬆ 10 мин</div><div id="15minin"  onClick='setwtbytm(15);'  class="minbut">⬆ 15 мин</div></div>
	<div style="float: left; width: 180px;"><center>На скорости</center><div id=timefrom></div></div>
	<div style="float: left; width: 160px;" id="pzotvet"></div>
	<div style="clear:both;"></div>
</div>
<div id="dialog-pravila" title="Основы игры «Алфавит»">
	<div id="tabs-container2"> 		
		<div id="alfopistabs">
			<ul>
				<li><a href="#tabs-cel">Цель</a></li>
				<li><a href="#tabs-prav">Правила</a></li>
				<li><a href="#tabs-mis">Важно: про ошибки</a></li>
				<li><a href="#tabs-more">Больше информации</a></li>
			</ul>
			<div id="tabs-cel">
				<p style="margin: 0; font-size: 24px;">Тренировать достижение определенного <b>(HPS) состояния координации процесса</b> работы своего тела, при котором ощущается энергия и поток. Это состояние в котором ты максимально используешь весь свой потенциал.</p>
				 <p style="margin: 0; margin-top: 16px; font-size: 20px;">Ощущение легкости «само меня несёт» - чуть раньше чем появилась буква уже знаю какая будет. Мышечный тонус, активная расслабленность, "танцевальная" грация и плавность движений. Энтузиазм, воодушевление, позитивное отношение к ошибкам, итп. </p>
			</div>
			<div id="tabs-prav">
				   <p style="margin: 0; font-size: 22px;">На экране по очереди появляются две буквы. Для каждой пары <b>одновременно</b>:</p>
				 <ul style="margin: 0; font-size: 22px;"><li>громко читай <b>верхнюю</b> букву;</li>
				   <li>руководствуясь <b>нижней</b> буквой, подними, сгибая в локте под углом 90 градусов, руку: <br/>  <b>П</b>равую, <b>Л</b>евую или <b>О</b>бе.</li>
				   </ul>
				   <p style="margin: 0; margin-top: 16px; font-size: 22px;">Руки стоит поднимать до <b>комфортной</b> высоты и с минимальным мышечным напряжением. Для удобства стоит включить фоновую ритмичную музыку.</p>
				  <p style="margin: 0; margin-top: 20px; font-size: 18px;">Можно вместе с рукой использовать <b>противоположную</b> ногу или другие свои парные органы. (О = присесть, подпрыгнуть)</p>			  
			</div>
			<div id="tabs-mis">
				   <p style="margin: 0; font-size: 22px;">В случае ошибки просто продолжай играть дальше! как будто ничего не произошло.</p>
				   <p style="margin: 0; margin-top: 16px; font-size: 22px;">Если ошибок становиться всё больше, значит слишком <b>усложнил себе задачу - упрости</b> её.</p>		   
				   <p style="margin: 0; margin-top: 16px; font-size: 22px;">Выбери такую скорость на которой сейчас получается играть без ошибок. Из этого ритма можно очень плавно и постепенно ускоряться. </p>
				   <p style="margin: 0; margin-top: 20px;  font-size: 22px;">В состоянии HPS ошибки вызывают позитивное отношение, мол "ух как ошибся :)".</p>				   
			</div>
			<div id="tabs-more">
				<p style="margin: 0; font-size: 22px;">Классический вариант игры был создан Джоном Гриндером в рамках Нового кодирования НЛП.</p>		
			
			
				<p style="margin: 0; font-size: 24px;">Описание техники <a href="http://www.newcode.ru/doku.php/alphabet-game" target="_blank" style="color: #1E458F;">на сайте мск лаборатории неокода</a>, <a
				href="http://nlping.ru/?id=D07A644F-F45C6-85EAD3D8" target="_blank" style="color: #1E458F;">на сайте nlping.ru</a>.<br/><br/>
				Показатели работы мозга на томографе: <a href="http://www.newcode.ru/media/NewCode.Research.2006.pdf" target="_blank" style="color: #1E458F;">исследование (pdf)</a></p>
			</div>			
			
		</div> 
	</div>
</div>
</body></html>
