function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

function saveMindData() {
    if (!supports_html5_storage()) { return false; }
    localStorage["mindflow.teme"] = $("#tema").text();
    localStorage["mindflow.text"] = $("#in_list").val();
    return true;
}

function clearMindData() {
    if (!supports_html5_storage()) { return false; }
    localStorage["mindflow.teme"] = '';
    localStorage["mindflow.text"] = '';
    return true;
}


function resumeMindData() {
    if (!supports_html5_storage()) { return false; }
     $("#in_list").val(localStorage["mindflow.text"]);     
     if ((localStorage["mindflow.teme"]  == null) || (localStorage["mindflow.teme"]  == '') )
     	$("#tema").trigger('click'); 
      else 
       { 
      		$("#tema").text(localStorage["mindflow.teme"]);  
      		document.title = localStorage["mindflow.teme"] + ' - MindFlow';  
      		$('#in_list').focus(); 
      	}
    return true;
}

function renew() {
 if (window.confirm("Точно всё сбросить?")) {
	clearMindData();
	javascript:location.reload(true)
	}
}
