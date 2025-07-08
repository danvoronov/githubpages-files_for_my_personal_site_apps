var elements = []; // Массив для хранения элементов {id, text, x, y}
var elementCounter = 0;
var connections = []; // Массив для хранения связей {from: id, to: id}
var selectedElement = null; // Выбранный элемент для создания связи
var workspaceWidth = 0;
var workspaceHeight = 0;

 function balans_list(inpoz, inneg){
	docwd = $(document).width() - 20;
    $("#stcol1").css('width', "25px"); $("#stcol3").css('width', "25px")
 	if ( (inpoz > 0) && (inneg > 0) ) {
 	 	var lng =  parseInt((docwd- 60)/3);
 	 	$("#stcol1").css('width', lng+"px"); $("#stcol2").css('width', lng+"px"); $("#stcol3").css('width', lng+"px");
 	}
 	else if ( (inpoz > 0) || (inneg > 0) ) {
 		    var lng =  parseInt((docwd- 90)/2);
 			$("#stcol2").css('width', lng+"px");
 			if (inpoz > 0) $("#stcol1").css('width', lng+"px");
 			if (inneg > 0) $("#stcol3").css('width', lng+"px");
 		}
 		else {
 			$("#stcol2").css('width',  parseInt(docwd- 110)+"px"  );
 		}
 }
 

$(window).resize(function() {
  if (res_state) {
   var $window = $(this);
    $('#in_list').height(  $window.height()-150);
    $('#in_list').width( parseInt($window.width()*0.6));  
  }  
});

var temasave = false;

 $(document).ready(function() {

 	$('#flowin').hide();
 	
 	// Инициализируем рабочую область
 	initializeWorkspace();
 	
 	// Клик по рабочей области для отмены выбора
 	$('#workspace').click(function() {
 		if (selectedElement !== null) {
 			$('.graph-element').removeClass('selected');
 			selectedElement = null;
 		}
 	});
 
	// Новый обработчик для поля ввода элементов
	$("#element_input").keyup(function(event) {
		var key = event.which; 
		if (key == 13) {  // Enter
			var text = $(this).val().trim();
			if (text !== '') {
				addElementToWorkspace(text);
				$(this).val(''); // Очищаем поле
			}
		}
	});

	// Обработчики для кнопок
	$("#arrange_graph").click(function() {
		arrangeGraph();
	});
 
	$("#in_list").keyup(function(event) {
		var key = event.which; 
		if ((key == 13) || (key == 38) || (key == 40)) {  
		
			var theLines = $.trim($("#in_list").val()).split("\n");
			if (theLines[theLines.length-1]=="") theLines.length--;
			if (saveMindData()) {  
				if ((theLines.length == 0 ) || (temasave)) { 
					$("#list_cnt").hide().html('<font color=#5AA65A>cохранено в браузер:</font> тема потока').fadeIn(); 
					temasave = false
				} else $("#list_cnt").hide().html('<font color=#5AA65A>cохранено в браузер:</font> '+theLines.length+' строк').fadeIn();  
		
			} else $("#list_cnt").html(theLines.length+' строк');  
			
			if ( (theLines[theLines.length-1]=="=") && (theLines.length>2) ) {
				theLines.pop();     	  
				append_list(theLines);
			}
		}
	});

  	$( "#dialog-legend" ).dialog({
			autoOpen: false,
			width: 800,
			buttons: {
				Ok: function() {					$( this ).dialog( "close" );				}
		} });
 	$('#in_tooltip').tipsy({gravity: 'w', fade: true, html: true });
	$('.editabletm').editable(function(value, settings) {
 							document.title = value + ' - MindFlow';   
 							temasave = true;
							$('#element_input').focus();						
 							return(value); }, {
			         tooltip   : 'Нажать для редактирования',
			         			         style: ' display: inline;',
			         select : true,
			     });

   // Инициализируем подсказки
   $('#help_tooltip').tipsy({gravity: 'w', fade: true, html: true });

   // Фокус на новое поле ввода
   $('#element_input').focus();
   
   resumeMindData(); 
 });
 
 //
 
function parse_list(comment_lines) {
	
	$('#in_list').val('');	 
	       
  	   for(i = 0; i < comment_lines.length; i++) {
      	var kuda = 'norm';
      		comment_lines[i] = $.trim(comment_lines[i]);
	 	if (comment_lines[i].length == 0) comment_lines[i] = 'ПУСТАЯ СТРОКА :)';   
	 	
	 	if (comment_lines[i].indexOf(":)") >= 0 ) kuda = 'poz';
	 	else if ((comment_lines[i][comment_lines[i].length-1] == ")" ) || (comment_lines[i][comment_lines[i].length-1] == "+" ))
	 		{ kuda = 'poz'; comment_lines[i] = comment_lines[i].substr(0, comment_lines[i].length-1) }
	 		
	 	if (comment_lines[i].indexOf(":(") >= 0 ) kuda = 'neg';
	 	else if ((comment_lines[i][comment_lines[i].length-1] == "(" ) || (comment_lines[i][comment_lines[i].length-1] == "-" ))
	 		{ kuda = 'neg'; comment_lines[i] = comment_lines[i].substr(0, comment_lines[i].length-1) }
	 		
        $('#sort_'+kuda).append("<li  class='elem ui-corner-all'><span id='coef"+(last_nmb+i+1)+"'></span><span id='line"+(last_nmb+i+1)+"'>[<b>"+(last_nmb+i+1) +"</b>] &nbsp;"+ comment_lines[i] +"</span> &nbsp; &nbsp;   <font color='grey'>--к-&gt;</font>  <span id='totext"+(last_nmb+i+1)+"'></span> <input type='text' id='flow"+(last_nmb+i+1)+"' size=2 class='nmbrimp' onClick='this.select();' /> &nbsp; <span style='display: inline-block; width:45px' id='loop"+(last_nmb+i+1)+"'>&nbsp;</span></li>");
        }
              
      			    last_nmb = last_nmb + comment_lines.length;  
      			    
       $('.nmbrimp').bind('keydown', function(e) {
        //var key = (e.keyCode ? e.keyCode : e.charCode);
        var key = e.which;
        if (key == 13) {
            e.preventDefault();
            var nxtIdx = $('input:text').index(this) + 1;
            if (nxtIdx == last_nmb) {
            		// проверить все ли заполнены
            		make_flow();
            }
            else $(":input:text:eq(" + nxtIdx + ")").focus().select();
            // надо проверку всех чисел
        }
        else if ( key == 46 || key == 8 ) {        }
		else { if ((key < 48 || key > 57) && (key < 96 || key > 105 )) {event.preventDefault(); } }
    });   
    
            balans_list($('#sort_poz').children().size(), $('#sort_neg').children().size()); 
}
 
 
function append_list(inLines) {
    //    $('#block_inp').css('visibility', 'hidden');  
	$('#block_inp').fadeOut(); $('#flowin').hide();
	$('#cappanel').css('bottom','4px');
        	
	$('#flowin').show();
	
  	$( "#sort_neg, #sort_poz, #sort_norm" ).sortable({
		connectWith: ".connectedSortable", placeholder: "ui-state-highlight", start:  function(event, ui) { balans_list(1, 1); }, stop: function(event, ui) { balans_list($('#sort_poz').children().size(), $('#sort_neg').children().size()); }
	}).disableSelection();
	
	 balans_list(0, 0);  		

  $('#in_list').height(25);  	$('#in_list').width( parseInt(($(document).width() - 140)/3));  
  $('#in_list').css('margin-left','5px');
  $('#stcol2').append($("#in_list")); res_state = false;
	
	parse_list(inLines);

    $("#in_list").bind('keypress', function(event) { 
		var key = event.keyCode;
		if (key == 13) { window.event.preventDefault(); parse_list($('#in_list').val().split("\n")); }
	});
	
	clearMindData();

	$('#flowin').fadeIn();	 $('#flow1').focus();	 

}   


function make_flow() {
	var flag_go = true;
    
	for(i = 1; i <  last_nmb+1; i++) {
		if (($('#flow'+i).val() == i) || ($('#flow'+i).val() == '') || ($('#flow'+i).val() > last_nmb) || ($('#flow'+i).val() < 1)) 
		{
		alert('Ошибика в элементе #'+i);
		    $('#flow'+i).focus().select();
			flag_go = false;
			break;
		}
	}

	if (flag_go == true) {

    	$('#in_list').css('visibility', 'hidden');  
    
         var elementov = last_nmb+1; 
         
	var dirgraph=new Array();  	var vesi=new Array(); 
      for(i = 1; i <  elementov; i++) dirgraph[i] = $('#flow'+i).val(); 
      // считали граф в формет 1 -> у[1]

	  for(var j=1;j<elementov;j++){
	    vesi[j] = 0;
	    for(var i=1;i<elementov;i++){
          if (dirgraph[i] == j) vesi[j]++  // повесели сколько ссылок есть на элементы
		}
 	}
 
 	for(var i=1;i<elementov;i++){ 	// раскраска графа по весам
		$("#line"+i).css('color', 'black'); $("#coef"+i).text('');
		$("#line"+i).css('font-size', '12pt'); 
			
		if (vesi[i] == 1) $("#line"+i).css('color', 'green'); 
  		else if (vesi[i] > 1) { 	
  			$("#line"+i).css('color', 'red'); 
  			$("#line"+i).css('font-size', (12+vesi[i]*2)+'pt'); 	
  			$("#coef"+i).text(vesi[i]+'*');  		
  			$("#coef"+i).css('color', 'red'); 
  			}
	}
		
 	var bili=new Array(elementov); for(var j=0;j<elementov;j++) bili[j] = 0; // обнулили
 		 
 	function recur_obhod(kuda) {
 	   if (bili[kuda] < 6) {
 	  	 var nextel = dirgraph[kuda];
 	 	 bili[nextel]++;
 	 	 recur_obhod(nextel);
 	   }
 	 }
 	
 	var nm_petli = 1; var izmenili = false;
		for(var j=1;j<elementov;j++)  	
		  if ((vesi[j] > 0) && (bili[j] == 0)) {
		    bili[j] = 1;  // dirgraph[tostart] - ссылка на след элемен
		      recur_obhod(j)	;
		        izmenili = false
		       	for(var jj=1;jj<elementov;jj++)  
		       	  if ((bili[jj] > 4) && (bili[jj] < 100) ) {
		       	    bili[jj] = 100*nm_petli;
		       	    izmenili = true;
		       	    }
		      if (izmenili) nm_petli++;	      	
		  //     	for(var jj=1;jj<elementov;jj++)  	$('#list_area').append("   ["+jj+"]="+bili[jj]); 
		 //      	$('#list_area').append(" === "+j+"<br/>"); 
		}
 	
 	 	for(var i=1;i<elementov;i++) 	// раскраска графа по весам
 	 		{ 	   $("#loop"+i).html(''); 	
  				if (bili[i] > 99) {
  	    			$("#loop"+i).css('color', 'blue');
	    			$("#loop"+i).html('<img src="img/loop.png" alt="петля" width="24" height="24" style="margin-bottom:-8px;">-'+parseInt(bili[i]/100)+' '); 	
  					}
  			}
  			
  			
	for(var i=1;i<elementov;i++) $("#totext"+i).text($('#flow'+i).val());
	$("#evrclip").css('visibility', 'visible');  	$("#legend-link").css('visibility', 'visible');  
    $("#canvas").css('visibility', 'visible');  
    
    // граф ! 
        var g = new Graph();
  		g.edgeFactory.template.style.directed = true;

  		// var render = function(r, n) {
	   //      var set = r.set().push(
	   //          r.rect(n.point[0]-30, n.point[1]-13, 62, 86)
	   //              .attr({"fill": "#fa8", "stroke-width": 1, r : "5px"}))
	   //              .push(
	   //              	r.text(n.point[0], n.point[1] + 30, n.label)
	   //              );
	   //      return set;
    
	   	let elements = []
	   	for(var i=1;i<elementov;i++) 
	   		elements[i] = $("#line"+i).text().slice(0,20)
     	 for(var i=1;i<elementov;i++) 	// создаем граф
     	 	if (bili[i] > 99) 
     	 	  g.addEdge( elements[i],  elements[dirgraph[i]], { stroke : "#bfa" , fill : "#56f"});
    		else
      		  g.addEdge( elements[i],  elements[dirgraph[i]]);
    		
    var layouter = new Graph.Layout.Ordered(g, topological_sort(g));

    var height = 900;
  	var width = $(document).width() - 100;
  	console.log(width)
    var renderer = new Graph.Renderer.Raphael('canvas', g, width, height);
       layouter.layout(); renderer.draw();
    
	}

}

// Новые функции для рабочей области
function initializeWorkspace() {
    workspaceWidth = $('#workspace').width();
    workspaceHeight = $('#workspace').height();
    
    // Создаем SVG для стрелок
    var svg = $('#connections_svg');
    svg.html('<defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#28a745" /></marker></defs>');
    
    // Обновляем размеры при изменении окна
    $(window).resize(function() {
        workspaceWidth = $('#workspace').width();
        workspaceHeight = $('#workspace').height();
        updateConnections();
    });
}

function addElementToWorkspace(text) {
    if (!text || text.trim() === '') return;
    
    elementCounter++;
    var cleanText = text.trim();
    
    // Случайная позиция для нового элемента
    var x = Math.random() * (workspaceWidth - 150) + 50;
    var y = Math.random() * (workspaceHeight - 100) + 50;
    
    var element = {
        id: elementCounter,
        text: cleanText,
        x: x,
        y: y
    };
    
    elements.push(element);
    createElementDOM(element);
    updateCounters();
    updateElementStates();
    
    // Показываем кнопку выравнивания если элементов больше 2
    if (elements.length >= 3) {
        $('#arrange_graph').show();
    }
}

function createElementDOM(element) {
    var elementDiv = $('<div class="graph-element"></div>');
    elementDiv.attr('data-element-id', element.id);
    
    elementDiv.html(
        '<span class="element-id">' + element.id + '.</span>' +
        '<span class="element-text">' + element.text + '</span>'
    );
    
    // Добавляем в контейнер для измерения размеров
    $('#elements_container').append(elementDiv);
    
    // Получаем реальные размеры после добавления
    var width = elementDiv.outerWidth();
    var height = elementDiv.outerHeight();
    
    // Сохраняем размеры в объекте элемента
    element.width = width;
    element.height = height;
    
    // Проверяем границы экрана и корректируем позицию
    if (element.x + width > workspaceWidth) {
        element.x = workspaceWidth - width - 20;
    }
    if (element.y + height > workspaceHeight) {
        element.y = workspaceHeight - height - 20;
    }
    if (element.x < 20) element.x = 20;
    if (element.y < 20) element.y = 20;
    
    // Устанавливаем финальную позицию
    elementDiv.css({
        left: element.x + 'px',
        top: element.y + 'px'
    });
    
    // Добавляем drag для перемещения
    elementDiv.draggable({
        drag: function(event, ui) {
            element.x = ui.position.left;
            element.y = ui.position.top;
            updateConnections();
        },
        stop: function(event, ui) {
            element.x = ui.position.left;
            element.y = ui.position.top;
            updateConnections();
        }
    });
    
    // Клик для создания связей
    elementDiv.click(function(e) {
        e.stopPropagation();
        
        if (selectedElement === null) {
            // Первый клик - выбираем элемент
            selectedElement = element;
            $('.graph-element').removeClass('selected');
            $(this).addClass('selected');
        } else if (selectedElement.id === element.id) {
            // Клик по тому же элементу - отменяем выбор
            selectedElement = null;
            $(this).removeClass('selected');
        } else {
            // Второй клик - создаем связь
            addConnection(selectedElement.id, element.id);
            $('.graph-element').removeClass('selected');
            selectedElement = null;
        }
    });
    
    // Двойной клик для удаления
    elementDiv.dblclick(function(e) {
        e.stopPropagation();
        if (confirm('Удалить элемент "' + element.text + '"?')) {
            removeElement(element.id);
        }
    });
}

function removeElement(id) {
    // Удаляем элемент из массива
    elements = elements.filter(function(el) { return el.id !== id; });
    
    // Удаляем все связи с этим элементом
    connections = connections.filter(function(conn) { 
        return conn.from !== id && conn.to !== id; 
    });
    
    // Если удаляемый элемент был выбран, сбрасываем выбор
    if (selectedElement && selectedElement.id === id) {
        selectedElement = null;
    }
    
    // Удаляем DOM элемент
    $('.graph-element[data-element-id="' + id + '"]').remove();
    
    updateCounters();
    updateConnections();
    updateElementStates();
    
    // Скрываем кнопку если элементов меньше 3
    if (elements.length < 3) {
        $('#arrange_graph').hide();
    }
}

function updatePreview() {
    $('#preview_all_list').empty();
    
    elements.forEach(function(element) {
        var listItem = $('<li></li>');
        listItem.attr('data-element-id', element.id);
        
        // Ищем связь от этого элемента
        var connection = connections.find(function(conn) {
            return conn.from === element.id;
        });
        
        var connectionText = '';
        if (connection) {
            connectionText = ' <span class="connection-indicator">--> ' + connection.to + '</span>';
        }
        
        listItem.html(
            '<span class="element-number">' + element.id + '.</span>' + 
            element.text + 
            connectionText +
            '<button class="remove-btn" onclick="removeElement(' + element.id + ')">×</button>'
        );
        $('#preview_all_list').append(listItem);
    });
    
    // Инициализируем drag & drop
    initializeDragAndDrop();
}

function updateCounters() {
    $('#element_count').text(elements.length);
    $('#connections_count').text(connections.length);
}

function initializeDragAndDrop() {
    $('#preview_all_list li').draggable({
        helper: 'clone',
        start: function(event, ui) {
            $(this).addClass('dragging');
        },
        stop: function(event, ui) {
            $(this).removeClass('dragging');
        }
    });
    
    $('#preview_all_list li').droppable({
        accept: '#preview_all_list li',
        hoverClass: 'drop-target',
        drop: function(event, ui) {
            var fromId = parseInt(ui.draggable.attr('data-element-id'));
            var toId = parseInt($(this).attr('data-element-id'));
            
            if (fromId !== toId) {
                addConnection(fromId, toId);
            }
        }
    });
}

function addConnection(fromId, toId) {
    // Удаляем существующую связь от этого элемента (1 к 1)
    connections = connections.filter(function(conn) {
        return conn.from !== fromId;
    });
    
    // Добавляем новую связь
    connections.push({from: fromId, to: toId});
    updateCounters();
    updateConnections();
    updateElementStates();
}

function updateElementStates() {
    // Обновляем визуальное состояние всех элементов
    elements.forEach(function(element) {
        var elementDiv = $('.graph-element[data-element-id="' + element.id + '"]');
        var hasConnection = connections.some(function(conn) {
            return conn.from === element.id;
        });
        
        if (hasConnection) {
            elementDiv.removeClass('no-connection');
        } else {
            elementDiv.addClass('no-connection');
        }
    });
}

function updateConnections() {
    var svg = $('#connections_svg');
    
    // Очищаем все линии кроме определений
    svg.find('line, path').remove();
    
    connections.forEach(function(conn) {
        var fromElement = elements.find(function(el) { return el.id === conn.from; });
        var toElement = elements.find(function(el) { return el.id === conn.to; });
        
        if (fromElement && toElement) {
            drawSmartConnection(fromElement, toElement);
        }
    });
}

function drawSmartConnection(fromElement, toElement) {
    var svg = $('#connections_svg');
    
    // Вычисляем центры элементов
    var fromCenterX = fromElement.x + (fromElement.width || 100) / 2;
    var fromCenterY = fromElement.y + (fromElement.height || 40) / 2;
    var toCenterX = toElement.x + (toElement.width || 100) / 2;
    var toCenterY = toElement.y + (toElement.height || 40) / 2;
    
    // Определяем точки выхода и входа на границах элементов
    var fromPoint = getConnectionPoint(fromElement, toCenterX, toCenterY, true);
    var toPoint = getConnectionPoint(toElement, fromCenterX, fromCenterY, false);
    
    // Создаем путь с двумя линиями (L-образный)
    var midX, midY;
    
    // Определяем промежуточную точку для L-образного соединения
    if (Math.abs(fromPoint.x - toPoint.x) > Math.abs(fromPoint.y - toPoint.y)) {
        // Горизонтальное соединение преобладает
        midX = toPoint.x;
        midY = fromPoint.y;
    } else {
        // Вертикальное соединение преобладает
        midX = fromPoint.x;
        midY = toPoint.y;
    }
    
    // Создаем путь
    var pathData = 'M ' + fromPoint.x + ' ' + fromPoint.y + 
                   ' L ' + midX + ' ' + midY + 
                   ' L ' + toPoint.x + ' ' + toPoint.y;
    
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('class', 'connection-path');
    
    svg.append(path);
}

function getConnectionPoint(element, targetX, targetY, isStart) {
    var centerX = element.x + (element.width || 100) / 2;
    var centerY = element.y + (element.height || 40) / 2;
    var width = element.width || 100;
    var height = element.height || 40;
    
    // Отступ от границы элемента
    var offset = isStart ? 15 : 10; // Больше отступ для начала стрелки
    
    // Вычисляем направление к цели
    var dx = targetX - centerX;
    var dy = targetY - centerY;
    
    // Определяем, с какой стороны выходить
    var absX = Math.abs(dx);
    var absY = Math.abs(dy);
    
    if (absX > absY) {
        // Выход справа или слева
        if (dx > 0) {
            return { x: element.x + width + offset, y: centerY };
        } else {
            return { x: element.x - offset, y: centerY };
        }
    } else {
        // Выход сверху или снизу
        if (dy > 0) {
            return { x: centerX, y: element.y + height + offset };
        } else {
            return { x: centerX, y: element.y - offset };
        }
    }
}

function arrangeGraph() {
    if (elements.length < 2) return;
    
    // Обновляем размеры рабочей области
    workspaceWidth = $('#workspace').width();
    workspaceHeight = $('#workspace').height();
    
    // Круговое расположение с учетом размеров элементов
    var centerX = workspaceWidth / 2;
    var centerY = workspaceHeight / 2;
    var radius = Math.min(workspaceWidth, workspaceHeight) / 3;
    
    // Находим максимальный размер элемента для корректировки радиуса
    var maxElementSize = 0;
    elements.forEach(function(element) {
        var size = Math.max(element.width || 100, element.height || 40);
        if (size > maxElementSize) maxElementSize = size;
    });
    
    // Корректируем радиус с учетом размеров элементов
    radius = Math.max(radius, maxElementSize * elements.length / (2 * Math.PI) + 50);
    
    elements.forEach(function(element, index) {
        var angle = (2 * Math.PI * index) / elements.length;
        var elementWidth = element.width || 100;
        var elementHeight = element.height || 40;
        
        element.x = centerX + radius * Math.cos(angle) - elementWidth / 2;
        element.y = centerY + radius * Math.sin(angle) - elementHeight / 2;
        
        // Проверяем границы экрана
        if (element.x < 20) element.x = 20;
        if (element.y < 20) element.y = 20;
        if (element.x + elementWidth > workspaceWidth - 20) {
            element.x = workspaceWidth - elementWidth - 20;
        }
        if (element.y + elementHeight > workspaceHeight - 20) {
            element.y = workspaceHeight - elementHeight - 20;
        }
        
        // Обновляем позицию DOM элемента
        $('.graph-element[data-element-id="' + element.id + '"]').css({
            left: element.x + 'px',
            top: element.y + 'px'
        });
    });
    
    updateConnections();
}

function removeConnection(fromId) {
    connections = connections.filter(function(conn) {
        return conn.from !== fromId;
    });
    updateCounters();
    updatePreview();
    checkBuildGraphAvailability();
}

function checkBuildGraphAvailability() {
    // Проверяем, что у каждого элемента есть хотя бы одна исходящая связь
    var allElementsHaveConnections = elements.length > 0 && elements.every(function(element) {
        return connections.some(function(conn) {
            return conn.from === element.id;
        });
    });
    
    if (allElementsHaveConnections && elements.length >= 3) {
        $('#build_graph_container').show();
    } else {
        $('#build_graph_container').hide();
    }
}

function buildGraph() {
    if (elements.length < 3) {
        alert('Необходимо добавить минимум 3 элемента');
        return;
    }
    
    if (connections.length === 0) {
        alert('Необходимо создать связи между элементами');
        return;
    }
    
    // Показываем правую панель
    $('#right_panel').show();
    
    // Добавляем класс для изменения layout
    $('.two-panel-layout').addClass('graph-visible');
    
    // Очищаем предыдущий граф
    $('#canvas').empty();
    
    // Обновляем текст кнопки
    $('#graph_button_text').text('Обновить граф');
    
    // Небольшая задержка для корректного получения размеров
    setTimeout(function() {
        buildGraphInternal();
    }, 100);
}

function buildGraphInternal() {
    console.log('Building graph...');
    console.log('Elements:', elements);
    console.log('Connections:', connections);
    
    // Проверяем наличие библиотек
    if (typeof Graph === 'undefined') {
        console.error('Graph library not loaded!');
        alert('Ошибка: библиотека Graph не загружена');
        return;
    }
    
    if (typeof Raphael === 'undefined') {
        console.error('Raphael library not loaded!');
        alert('Ошибка: библиотека Raphael не загружена');
        return;
    }
    
    // Создаем массив связей в формате старой системы
    var elementov = elements.length + 1;
    var dirgraph = new Array(elementov);
    
    // Заполняем массив связей
    for (var i = 1; i < elementov; i++) {
        var element = elements[i-1];
        var connection = connections.find(function(conn) { return conn.from === element.id; });
        if (connection) {
            // Находим индекс целевого элемента
            var targetIndex = elements.findIndex(function(el) { return el.id === connection.to; }) + 1;
            dirgraph[i] = targetIndex;
        } else {
            dirgraph[i] = 1; // По умолчанию ссылаемся на первый элемент
        }
    }
    
    // Вычисляем веса (количество входящих связей)
    var vesi = new Array(elementov);
    for (var j = 1; j < elementov; j++) {
        vesi[j] = 0;
        for (var i = 1; i < elementov; i++) {
            if (dirgraph[i] == j) vesi[j]++;
        }
    }
    
    // Поиск циклов
    var bili = new Array(elementov);
    for (var j = 0; j < elementov; j++) bili[j] = 0;
    
    function recur_obhod(kuda) {
        if (bili[kuda] < 6) {
            var nextel = dirgraph[kuda];
            bili[nextel]++;
            recur_obhod(nextel);
        }
    }
    
    var nm_petli = 1;
    for (var j = 1; j < elementov; j++) {
        if ((vesi[j] > 0) && (bili[j] == 0)) {
            bili[j] = 1;
            recur_obhod(j);
            var izmenili = false;
            for (var jj = 1; jj < elementov; jj++) {
                if ((bili[jj] > 4) && (bili[jj] < 100)) {
                    bili[jj] = 100 * nm_petli;
                    izmenili = true;
                }
            }
            if (izmenili) nm_petli++;
        }
    }
    
    // Строим граф
    var g = new Graph();
    g.edgeFactory.template.style.directed = true;
    
    var graphElements = [];
    for (var i = 1; i < elementov; i++) {
        graphElements[i] = elements[i-1].text.slice(0, 20);
    }
    
    for (var i = 1; i < elementov; i++) {
        if (bili[i] > 99) {
            g.addEdge(graphElements[i], graphElements[dirgraph[i]], { stroke: "#bfa", fill: "#56f" });
        } else {
            g.addEdge(graphElements[i], graphElements[dirgraph[i]]);
        }
    }
    
    var layouter = new Graph.Layout.Ordered(g, topological_sort(g));
    
    // Получаем размеры правой панели
    var canvasContainer = $('#canvas');
    var height = canvasContainer.height();
    var width = canvasContainer.width();
    
    console.log('Canvas container dimensions:', width, 'x', height);
    
    // Убеждаемся, что размеры корректные
    if (height <= 0) height = 400;
    if (width <= 0) width = 600;
    
    console.log('Final dimensions:', width, 'x', height);
    
    try {
        var renderer = new Graph.Renderer.Raphael('canvas', g, width, height);
        layouter.layout();
        renderer.draw();
        console.log('Graph rendered successfully');
    } catch (error) {
        console.error('Error rendering graph:', error);
        alert('Ошибка при построении графа: ' + error.message);
    }
}
