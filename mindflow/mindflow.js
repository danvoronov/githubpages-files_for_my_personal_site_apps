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
 			hideConnectionHints();
 			hidePhantomConnection();
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

	// Обработчик для кнопки сохранения
	$("#save_image").click(function() {
		saveGraphAsImage();
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
   $('#legend_tooltip').tipsy({gravity: 'w', fade: true, html: true });
   $('#analysis_tooltip').tipsy({gravity: 'w', fade: true, html: true });

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
    
    // Умное размещение нового элемента
    var position = getSmartPosition();
    
    var element = {
        id: elementCounter,
        text: cleanText,
        x: position.x,
        y: position.y
    };
    
    elements.push(element);
    createElementDOM(element);
    updateCounters();
    updateElementStates();
    
    // Показываем кнопку сохранения если элементов больше 2
    if (elements.length >= 3) {
        $('#save_image').show();
    }
}

function getSmartPosition() {
    var centerX = workspaceWidth / 2;
    var centerY = workspaceHeight / 2;
    var margin = 100; // Отступ от краев
    
    // Если это первый элемент, размещаем в центре
    if (elements.length === 0) {
        return {
            x: centerX - 50,
            y: centerY - 25
        };
    }
    
    // Для последующих элементов используем спиральное размещение
    var attempts = 0;
    var maxAttempts = 50;
    var minDistance = 120; // Минимальное расстояние между элементами
    
    while (attempts < maxAttempts) {
        var angle = (elements.length * 2.4) + (Math.random() * 1.5); // Спиральный угол с небольшой случайностью
        var radius = 80 + (elements.length * 30) + (Math.random() * 40); // Увеличивающийся радиус
        
        var x = centerX + radius * Math.cos(angle) - 50;
        var y = centerY + radius * Math.sin(angle) - 25;
        
        // Проверяем границы
        if (x < margin) x = margin;
        if (y < margin) y = margin;
        if (x > workspaceWidth - margin - 100) x = workspaceWidth - margin - 100;
        if (y > workspaceHeight - margin - 50) y = workspaceHeight - margin - 50;
        
        // Проверяем, не слишком ли близко к существующим элементам
        var tooClose = false;
        for (var i = 0; i < elements.length; i++) {
            var existingElement = elements[i];
            var distance = Math.sqrt(
                Math.pow(x - existingElement.x, 2) + 
                Math.pow(y - existingElement.y, 2)
            );
            
            if (distance < minDistance) {
                tooClose = true;
                break;
            }
        }
        
        if (!tooClose) {
            return { x: x, y: y };
        }
        
        attempts++;
    }
    
    // Если не удалось найти хорошую позицию, используем случайную
    return {
        x: Math.random() * (workspaceWidth - 200) + margin,
        y: Math.random() * (workspaceHeight - 100) + margin
    };
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
        distance: 5,
        delay: 100,
        cancel: false,
        start: function(event, ui) {
            // Если элемент выбран для создания связи, отменяем перетаскивание
            if (selectedElement !== null) {
                return false;
            }
            // Отключаем анимации только для позиционирования
            $(this).css('transition', 'box-shadow 0.3s ease, transform 0.3s ease');
        },
        drag: function(event, ui) {
            // Обновляем позицию элемента в реальном времени
            element.x = ui.position.left;
            element.y = ui.position.top;
            
            // Мгновенно обновляем стрелки без задержек
            updateConnectionsInstant();
        },
        stop: function(event, ui) {
            // Возвращаем все анимации
            $(this).css('transition', 'all 0.3s ease');
            
            element.x = ui.position.left;
            element.y = ui.position.top;
            updateConnections();
        }
    });
    
    // Клик для создания связей
    var clickCount = 0;
    var clickTimer = null;
    
    elementDiv.click(function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        clickCount++;
        
        if (clickCount === 1) {
            clickTimer = setTimeout(function() {
                // Одинарный клик
                handleSingleClick(element, $(e.currentTarget));
                clickCount = 0;
            }, 250);
        } else if (clickCount === 2) {
            // Двойной клик
            clearTimeout(clickTimer);
            handleDoubleClick(element, $(e.currentTarget));
            clickCount = 0;
        }
    });
    
    function handleSingleClick(element, elementDiv) {
        console.log('Single click on element', element.id);
        
        if (selectedElement === null) {
            // Нет выбранного элемента - проверяем, можно ли выбрать этот элемент
            var hasConnection = connections.some(function(conn) {
                return conn.from === element.id;
            });
            
            if (hasConnection) {
                // У элемента есть связь - одинарный клик ничего не делает
                console.log('Element has connection, single click ignored');
                return;
            }
            
            // У элемента нет связи - можно выбрать
            selectedElement = element;
            $('.graph-element').removeClass('selected');
            elementDiv.addClass('selected');
            showConnectionHints();
            console.log('Selected element', element.id);
        } else if (selectedElement.id === element.id) {
            // Клик на уже выбранный элемент - отменяем выбор
            selectedElement = null;
            elementDiv.removeClass('selected');
            hideConnectionHints();
            console.log('Deselected element', element.id);
        } else {
            // Есть выбранный элемент и кликнули на другой - создаем связь
            console.log('Creating connection from', selectedElement.id, 'to', element.id);
            addConnection(selectedElement.id, element.id);
            $('.graph-element').removeClass('selected');
            selectedElement = null;
            hideConnectionHints();
        }
    }
    
    function handleDoubleClick(element, elementDiv) {
        console.log('Double click on element', element.id);
        
        // Проверяем, есть ли у элемента исходящая связь
        var hasConnection = connections.some(function(conn) {
            return conn.from === element.id;
        });
        
        if (hasConnection) {
            // У элемента есть связь - двойной клик для изменения связи
            if (selectedElement === null) {
                selectedElement = element;
                $('.graph-element').removeClass('selected');
                elementDiv.addClass('selected');
                showConnectionHints();
                console.log('Selected element with connection for change', element.id);
            } else if (selectedElement.id === element.id) {
                selectedElement = null;
                elementDiv.removeClass('selected');
                hideConnectionHints();
                console.log('Deselected element', element.id);
            } else {
                console.log('Changing connection from', selectedElement.id, 'to', element.id);
                addConnection(selectedElement.id, element.id);
                $('.graph-element').removeClass('selected');
                selectedElement = null;
                hideConnectionHints();
            }
        } else {
            // У элемента нет связи - двойной клик для удаления
            if (confirm('Delete element "' + element.text + '"?')) {
                removeElement(element.id);
            }
        }
    }
    
    // Hover для фантомной стрелки
    elementDiv.hover(
        function() {
            if (selectedElement && selectedElement.id !== element.id) {
                drawPhantomConnection(selectedElement, element);
            }
        },
        function() {
            hidePhantomConnection();
        }
    );
    
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
        $('#save_image').hide();
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
    
    // Проверяем, все ли элементы соединены
    checkAllElementsConnected();
}

function checkAllElementsConnected() {
    if (elements.length >= 3) {
        var allConnected = elements.every(function(element) {
            return connections.some(function(conn) {
                return conn.from === element.id;
            });
        });
        
        if (allConnected) {
            $('#analysis_icon').fadeIn(500);
        } else {
            $('#analysis_icon').fadeOut(300);
        }
        
        // Показываем кнопку сохранения если есть элементы
        $('#save_image').show();
    } else {
        $('#analysis_icon').fadeOut(300);
        if (elements.length < 3) {
            $('#save_image').hide();
        }
    }
}

function updateConnections() {
    var svg = $('#connections_svg');
    
    // Очищаем все линии кроме определений, но оставляем фантомные
    svg.find('line:not(.phantom), path:not(.phantom)').remove();
    
    connections.forEach(function(conn) {
        var fromElement = elements.find(function(el) { return el.id === conn.from; });
        var toElement = elements.find(function(el) { return el.id === conn.to; });
        
        if (fromElement && toElement) {
            drawSmartConnection(fromElement, toElement);
        }
    });
}

function updateConnectionsInstant() {
    // Быстрое обновление без очистки DOM - только изменение атрибутов
    connections.forEach(function(conn) {
        var fromElement = elements.find(function(el) { return el.id === conn.from; });
        var toElement = elements.find(function(el) { return el.id === conn.to; });
        
        if (fromElement && toElement) {
            updateExistingConnection(fromElement, toElement, conn);
        }
    });
}

function updateExistingConnection(fromElement, toElement, connection) {
    var svg = $('#connections_svg');
    
    // Ищем существующий путь для этого соединения
    var existingPath = svg.find('path[data-connection="' + connection.from + '-' + connection.to + '"]')[0];
    
    if (existingPath) {
        // Пересчитываем путь
        var fromCenterX = fromElement.x + (fromElement.width || 100) / 2;
        var fromCenterY = fromElement.y + (fromElement.height || 40) / 2;
        var toCenterX = toElement.x + (toElement.width || 100) / 2;
        var toCenterY = toElement.y + (toElement.height || 40) / 2;
        
        var fromPoint = getConnectionPoint(fromElement, toCenterX, toCenterY, true);
        var toPoint = getConnectionPoint(toElement, fromCenterX, fromCenterY, false);
        var pathData = createSmartPath(fromPoint, toPoint);
        
        // Обновляем только атрибут d
        existingPath.setAttribute('d', pathData);
    } else {
        // Если путь не найден, создаем новый
        drawSmartConnection(fromElement, toElement);
    }
}

function showConnectionHints() {
    $('.graph-element').not('.selected').addClass('connection-hint');
}

function hideConnectionHints() {
    $('.graph-element').removeClass('connection-hint');
}

function drawPhantomConnection(fromElement, toElement) {
    hidePhantomConnection();
    
    var svg = $('#connections_svg');
    
    // Вычисляем центры элементов
    var fromCenterX = fromElement.x + (fromElement.width || 100) / 2;
    var fromCenterY = fromElement.y + (fromElement.height || 40) / 2;
    var toCenterX = toElement.x + (toElement.width || 100) / 2;
    var toCenterY = toElement.y + (toElement.height || 40) / 2;
    
    // Определяем точки выхода и входа
    var fromPoint = getConnectionPoint(fromElement, toCenterX, toCenterY, true);
    var toPoint = getConnectionPoint(toElement, fromCenterX, fromCenterY, false);
    
    // Создаем улучшенный путь
    var pathData = createSmartPath(fromPoint, toPoint);
    
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('class', 'phantom-connection');
    path.setAttribute('stroke', '#999');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-dasharray', '5,5');
    path.setAttribute('fill', 'none');
    path.setAttribute('opacity', '0.6');
    
    svg.append(path);
}

function hidePhantomConnection() {
    $('#connections_svg .phantom-connection').remove();
}

function createSmartPath(fromPoint, toPoint) {
    var dx = toPoint.x - fromPoint.x;
    var dy = toPoint.y - fromPoint.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    // Для коротких расстояний используем прямую линию
    if (distance < 100) {
        return 'M ' + fromPoint.x + ' ' + fromPoint.y + ' L ' + toPoint.x + ' ' + toPoint.y;
    }
    
    // Определяем промежуточные точки на основе сторон выхода
    var midX1, midY1, midX2, midY2;
    var offset = Math.min(50, distance / 3);
    
    // Первая промежуточная точка - отходим от элемента
    if (fromPoint.side === 'right') {
        midX1 = fromPoint.x + offset;
        midY1 = fromPoint.y;
    } else if (fromPoint.side === 'left') {
        midX1 = fromPoint.x - offset;
        midY1 = fromPoint.y;
    } else if (fromPoint.side === 'bottom') {
        midX1 = fromPoint.x;
        midY1 = fromPoint.y + offset;
    } else { // top
        midX1 = fromPoint.x;
        midY1 = fromPoint.y - offset;
    }
    
    // Вторая промежуточная точка - подходим к элементу
    if (toPoint.side === 'right') {
        midX2 = toPoint.x + offset;
        midY2 = toPoint.y;
    } else if (toPoint.side === 'left') {
        midX2 = toPoint.x - offset;
        midY2 = toPoint.y;
    } else if (toPoint.side === 'bottom') {
        midX2 = toPoint.x;
        midY2 = toPoint.y + offset;
    } else { // top
        midX2 = toPoint.x;
        midY2 = toPoint.y - offset;
    }
    
    // Создаем плавный путь
    return 'M ' + fromPoint.x + ' ' + fromPoint.y + 
           ' L ' + midX1 + ' ' + midY1 + 
           ' L ' + midX2 + ' ' + midY2 + 
           ' L ' + toPoint.x + ' ' + toPoint.y;
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
    
    // Создаем умный путь
    var pathData = createSmartPath(fromPoint, toPoint);
    
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('class', 'connection-path');
    path.setAttribute('data-connection', fromElement.id + '-' + toElement.id);
    
    svg.append(path);
}

function getConnectionPoint(element, targetX, targetY, isStart) {
    var centerX = element.x + (element.width || 100) / 2;
    var centerY = element.y + (element.height || 40) / 2;
    var width = element.width || 100;
    var height = element.height || 40;
    
    // Отступ от границы элемента
    var offset = isStart ? 8 : 5;
    
    // Вычисляем направление к цели
    var dx = targetX - centerX;
    var dy = targetY - centerY;
    
    // Определяем ближайшую сторону элемента к цели
    var distToRight = Math.abs((element.x + width) - targetX) + Math.abs(centerY - targetY);
    var distToLeft = Math.abs(element.x - targetX) + Math.abs(centerY - targetY);
    var distToBottom = Math.abs(centerX - targetX) + Math.abs((element.y + height) - targetY);
    var distToTop = Math.abs(centerX - targetX) + Math.abs(element.y - targetY);
    
    var minDist = Math.min(distToRight, distToLeft, distToBottom, distToTop);
    
    if (minDist === distToRight) {
        // Выход справа
        return { 
            x: element.x + width + (isStart ? offset : -offset), 
            y: centerY,
            side: 'right'
        };
    } else if (minDist === distToLeft) {
        // Выход слева
        return { 
            x: element.x - (isStart ? offset : -offset), 
            y: centerY,
            side: 'left'
        };
    } else if (minDist === distToBottom) {
        // Выход снизу
        return { 
            x: centerX, 
            y: element.y + height + (isStart ? offset : -offset),
            side: 'bottom'
        };
    } else {
        // Выход сверху
        return { 
            x: centerX, 
            y: element.y - (isStart ? offset : -offset),
            side: 'top'
        };
    }
}


function saveGraphAsImage() {
    // Получаем размеры рабочей области
    var workspace = document.getElementById('workspace');
    var rect = workspace.getBoundingClientRect();
    
    // Создаем canvas
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    // Устанавливаем размеры canvas
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Заливаем фон
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Добавляем тему вверху
    var topic = $('#tema').text() || 'Mind Flow';
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(topic, canvas.width / 2, 40);
    
    // Рисуем стрелки
    drawConnectionsOnCanvas(ctx);
    
    // Рисуем элементы
    drawElementsOnCanvas(ctx);
    
    // Сохраняем изображение
    var link = document.createElement('a');
    link.download = (topic.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'mindflow') + '_graph.png';
    link.href = canvas.toDataURL();
    link.click();
}

function drawConnectionsOnCanvas(ctx) {
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    
    connections.forEach(function(conn) {
        var fromElement = elements.find(function(el) { return el.id === conn.from; });
        var toElement = elements.find(function(el) { return el.id === conn.to; });
        
        if (fromElement && toElement) {
            // Вычисляем центры элементов для определения направления
            var fromCenterX = fromElement.x + (fromElement.width || 100) / 2;
            var fromCenterY = fromElement.y + (fromElement.height || 40) / 2;
            var toCenterX = toElement.x + (toElement.width || 100) / 2;
            var toCenterY = toElement.y + (toElement.height || 40) / 2;
            
            // Получаем правильные точки подключения с отступами
            var fromPoint = getConnectionPoint(fromElement, toCenterX, toCenterY, true);
            var toPoint = getConnectionPoint(toElement, fromCenterX, fromCenterY, false);
            
            // Рисуем умный путь
            drawSmartPathOnCanvas(ctx, fromPoint, toPoint);
            
            // Рисуем стрелку в конечной точке с правильным направлением
            drawArrowHeadSmart(ctx, fromPoint, toPoint);
        }
    });
}

function drawSmartPathOnCanvas(ctx, fromPoint, toPoint) {
    var dx = toPoint.x - fromPoint.x;
    var dy = toPoint.y - fromPoint.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    ctx.beginPath();
    ctx.moveTo(fromPoint.x, fromPoint.y);
    
    // Для коротких расстояний используем прямую линию
    if (distance < 100) {
        ctx.lineTo(toPoint.x, toPoint.y);
    } else {
        // Определяем промежуточные точки на основе сторон выхода
        var offset = Math.min(50, distance / 3);
        
        // Первая промежуточная точка - отходим от элемента
        var midX1, midY1;
        if (fromPoint.side === 'right') {
            midX1 = fromPoint.x + offset;
            midY1 = fromPoint.y;
        } else if (fromPoint.side === 'left') {
            midX1 = fromPoint.x - offset;
            midY1 = fromPoint.y;
        } else if (fromPoint.side === 'bottom') {
            midX1 = fromPoint.x;
            midY1 = fromPoint.y + offset;
        } else { // top
            midX1 = fromPoint.x;
            midY1 = fromPoint.y - offset;
        }
        
        // Вторая промежуточная точка - подходим к элементу
        var midX2, midY2;
        if (toPoint.side === 'right') {
            midX2 = toPoint.x + offset;
            midY2 = toPoint.y;
        } else if (toPoint.side === 'left') {
            midX2 = toPoint.x - offset;
            midY2 = toPoint.y;
        } else if (toPoint.side === 'bottom') {
            midX2 = toPoint.x;
            midY2 = toPoint.y + offset;
        } else { // top
            midX2 = toPoint.x;
            midY2 = toPoint.y - offset;
        }
        
        // Рисуем плавный путь через промежуточные точки
        ctx.lineTo(midX1, midY1);
        ctx.lineTo(midX2, midY2);
        ctx.lineTo(toPoint.x, toPoint.y);
    }
    
    ctx.stroke();
}

function drawArrowHeadSmart(ctx, fromPoint, toPoint) {
    var dx = toPoint.x - fromPoint.x;
    var dy = toPoint.y - fromPoint.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    // Определяем направление стрелки на основе последнего сегмента
    var arrowFromX, arrowFromY;
    
    if (distance < 100) {
        // Для коротких расстояний используем прямое направление
        arrowFromX = fromPoint.x;
        arrowFromY = fromPoint.y;
    } else {
        // Для длинных путей вычисляем направление от предпоследней точки
        var offset = Math.min(50, distance / 3);
        
        if (toPoint.side === 'right') {
            arrowFromX = toPoint.x + offset;
            arrowFromY = toPoint.y;
        } else if (toPoint.side === 'left') {
            arrowFromX = toPoint.x - offset;
            arrowFromY = toPoint.y;
        } else if (toPoint.side === 'bottom') {
            arrowFromX = toPoint.x;
            arrowFromY = toPoint.y + offset;
        } else { // top
            arrowFromX = toPoint.x;
            arrowFromY = toPoint.y - offset;
        }
    }
    
    var angle = Math.atan2(toPoint.y - arrowFromY, toPoint.x - arrowFromX);
    var arrowLength = 12;
    var arrowAngle = Math.PI / 6;
    
    ctx.fillStyle = '#28a745';
    ctx.beginPath();
    ctx.moveTo(toPoint.x, toPoint.y);
    ctx.lineTo(
        toPoint.x - arrowLength * Math.cos(angle - arrowAngle),
        toPoint.y - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
        toPoint.x - arrowLength * Math.cos(angle + arrowAngle),
        toPoint.y - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();
    ctx.fill();
}

function drawArrowHead(ctx, toX, toY, fromX, fromY) {
    var angle = Math.atan2(toY - fromY, toX - fromX);
    var arrowLength = 12;
    var arrowAngle = Math.PI / 6;
    
    ctx.fillStyle = '#28a745';
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - arrowLength * Math.cos(angle - arrowAngle),
        toY - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
        toX - arrowLength * Math.cos(angle + arrowAngle),
        toY - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();
    ctx.fill();
}

function drawElementsOnCanvas(ctx) {
    elements.forEach(function(element) {
        var x = element.x;
        var y = element.y;
        var width = element.width || 100;
        var height = element.height || 40;
        
        // Определяем цвет рамки
        var hasConnection = connections.some(function(conn) {
            return conn.from === element.id;
        });
        
        var borderColor = hasConnection ? '#007bff' : '#dc3545';
        
        // Рисуем элемент
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        
        // Рисуем прямоугольник с закругленными углами
        drawRoundedRect(ctx, x, y, width, height, 8);
        ctx.fill();
        ctx.stroke();
        
        // Рисуем текст
        ctx.fillStyle = '#333';
        ctx.font = '13px Arial';
        ctx.textAlign = 'left';
        
        var text = element.id + '. ' + element.text;
        var textX = x + 12;
        var textY = y + height / 2 + 5;
        
        ctx.fillText(text, textX, textY);
    });
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
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
