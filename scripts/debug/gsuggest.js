(function($) {
$.gsuggest = function(settings){ 

$.gsuggest.config = {
	'debug': false,
	'url': '/suggest.cfc',
	'size': 10,
	'cacheenabled': false,
	'cacheaggressive': false,
	'cachefoward':false, //true - complete cache dataset, false - incomplete cache datasets
    'casesensitive': false,
	'sort': true,
	'css0': {'position':'absolute', 'z-index':'1', 'display':'none'},
	'css': {'background-color':'#ffffff', 'border':'solid 1px #000000', 'margin':'0px', 'cursor':'pointer', 'color':'#000000', 'padding':'0px'},
	'highlight': '#bcd5ff',
	
	'inlineText': function(data) { return data },	// get the text for suggestion from the suggest_value array item
	'inlineId':  function(data) { return data },	// get the id for suggestion from the suggest_value array item
	'callback': function(data) {},
	'dataSort': function(a,b) { return (a < b) ? -1 : ((a == b) ? 0 : 1); }
	};

if (settings) $.extend($.gsuggest.config, settings);

var fillok = true;
var cacheinit = true;

var timerstart = null;
var timerend = null;

$.gsuggest.cachedata = [];
$.gsuggest.cachekey = "";

$.gsuggest.synctext = false;
$.gsuggest.mouseoverok = false;
$.gsuggest.mousepos = "";
$.gsuggest.childHovered = false;

$.gsuggest.setcase = 
    function(val){
		 if (val)
        if ($.gsuggest.config.casesensitive)
            return val;
        else
            return val.toLowerCase();
		else return "";
    };

$.gsuggest.keydown =
    function(obj, e){ 
		clearTimeout($.gsuggest.suggestDelay);
		var $obj = $(obj);

        if (e.which == 38 || e.which == 40){
            $obj.next().children("div:eq("+$obj.attr("suggestPos")+")").focusout();
        
            switch (e.which){
                case 38: //up
                    if (parseInt($obj.attr("suggestPos"))-1 < -1)
                        $obj.attr("suggestPos", $obj.attr("suggestTtl"));
                    else
                        $obj.attr("suggestPos", Math.max(-2, parseInt($obj.attr("suggestPos"))-1));
                    break;
                    
                case 40: //down
                     if (parseInt($obj.attr("suggestPos"))+1 > parseInt($obj.attr("suggestTtl")))
                        $obj.attr("suggestPos", "-1");
                     else   
                        $obj.attr("suggestPos", Math.min($obj.attr("suggestTtl"), parseInt($obj.attr("suggestPos"))+1));
        
                     break;
            }
        
            $.gsuggest.synctext = true;        
            $obj.next().children("div:eq("+$obj.attr("suggestPos")+")").focusin();
				
				e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
				e.preventDefault ? e.preventDefault() : e.returnValue = false;
				return false;
				
        } else if (e.which == 13){
			  
				if ($obj.next().css("display") == "block") { // do something if the suggestions are shown
	
					var id = $obj.next().children("div:eq("+$obj.attr("suggestPos")+")").attr("data-id");
//					if (id == undefined) id = -1;
					
					$.gsuggest.config.callback({id:id});
			  
					if ($obj.attr("nosubmit") != null) return false; // no submit by just choosing suggestion
				}
        }
    };
    
$.gsuggest.keyup = 
    function(obj){
	   var objval = obj.value;

	   //console.dir($.gsuggest.cachedata);
	   if ($.gsuggest.config.debug)timerstart = new Date().getTime();
	  
       if (objval == $(obj).attr("suggestLast")) return;

	   if (objval.length == 0){
            $(obj).attr("suggestLast", objval);
            $(obj).next().hide();
            return;
        } 
		
       $(obj).attr("suggestLast", objval);
       
       var method = obj.form.name + '_' + obj.name;
       var surl = $.gsuggest.config.url + "?method="+method+"&value="+objval+"&callback=?"
       var data, datat;

	   //fill() *must* be single threaded via fillok	       
       function fill(data){
	   	   while(!fillok){};
		   fillok = false;
			
		   $(obj).next().empty();
		   //$(obj).next().hide(); *we dont need to hide it unless the results are empty
	   
	   		if ($.gsuggest.config.sort) data.sort($.gsuggest.config.dataSort);
	   
            $(obj).attr("suggestTtl", Math.min($.gsuggest.config.size, data.length));
				
            for (i = 0; i < data.length; i++){
						
                $(obj).next().append("<div data-id=\"" + data[i].id + "\">" + data[i].text.substr(0, objval.length) + "<strong>" + data[i].text.substring(objval.length) + "</strong></div>");
                if ( i == $.gsuggest.config.size ) break;
            }
            
            if (i > 0 && !(data.length == 1 && $.gsuggest.setcase(data[0].text) == $.gsuggest.setcase(objval))){
                $(obj).attr("suggestPos", "-1");
                //$(obj).next().slideDown("fast");
				$.gsuggest.synctext = false;
                $.gsuggest.mouseoverok = false;
				$(obj).next().show();
            } else {
				$(obj).next().hide();
			}
			
			fillok = true;
       }
       		
	   //cache roll back -force cache forward if ttl suggest items less than max
		if (objval.indexOf($.gsuggest.cachekey) != 0 || (!$.gsuggest.config.cacheforward && !($(obj).attr("suggestTtl") < $.gsuggest.config.size))){ 
	   	   $.gsuggest.cachekey = $.gsuggest.setcase(objval);
	   }
	   //console.log("key: " + $.gsuggest.cachekey);
//console.log($(obj).data("suggest_value"));					

																		//((datat = $(obj).data("suggest_value")) && datat.length > 0) ||
//console.log($(obj).attr("suggest_value"));
				
       if ($.gsuggest.cachedata[$(obj).attr("id")+$.gsuggest.cachekey] || ((datat = $(obj).attr("suggest_value")) != null && datat.length > 0)){
		   if (!$.gsuggest.cachedata[$(obj).attr("id")+$.gsuggest.cachekey] || !$.gsuggest.config.cacheenabled){
		   	   $.gsuggest.config.cacheforward = true;
					switch(typeof(datat)) {
						case "string": 
							datat = (new Function("return " + datat + ";"))();
							break;
						case "array": break;
						case "object": break;
						default: datat = false;
					}
					
			   if ($.gsuggest.config.debug)$("#_debug").html("CACHE INIT<br>"+datat.join("<br>"));
		   }else{
		   	   datat = $.gsuggest.cachedata[$(obj).attr("id")+$.gsuggest.cachekey];	
			   if ($.gsuggest.config.debug)$("#_debug").html(datat.join("<br>"));	   
		   }
		   
	   	
         data = [];
			  
			$.each(datat, function(i, val){
				if ($.gsuggest.setcase($.gsuggest.config.inlineText(val)).indexOf($.gsuggest.setcase(objval)) == 0){
					data.push({text: $.gsuggest.config.inlineText(val), id: $.gsuggest.config.inlineId(val) });
				}
			})
			  
			if ($.gsuggest.config.cacheenabled){ $.gsuggest.cachedata[$(obj).attr("id")+$.gsuggest.setcase(objval)] = data; $.gsuggest.cachekey = $.gsuggest.setcase(objval)}
			
         fill(data); 
			
			if (!data.length)	$.gsuggest.config.callback({id:-1});	// report no suggestion
			  
       }else{
           $.getJSON(surl, function(data){if ($.gsuggest.config.cacheenabled){ $.gsuggest.cachedata[$(obj).attr("id")+$.gsuggest.setcase(objval)] = data; $.gsuggest.cachekey = $.gsuggest.setcase(objval); if ($.gsuggest.config.debug)$("#_debug").html("CACHE INIT<br>"+$.gsuggest.cachedata[$(obj).attr("id")+$.gsuggest.setcase(objval)].join("<br>"));} fill(data)}); 	   
       }    

	   if ($.gsuggest.config.debug){
	   	  timerend = new Date().getTime();
	      $("#_debug_timer").html(timerend-timerstart);
	   }
	   
    };     

    $("input[suggest=yes]").each(function(i){
        if (this.id == null || this.id == '')
            $(this).attr("id", "_g§µggк§†_"+i)
            
        Init("#" + this.id)}
    );
    
    function Init(id){
        var suggest_id = "_suggestBox";
        var suggest_idChildren = "#" + suggest_id + " > *";

        $(id).attr("autocomplete", "off");
		$(id).keyup(function(e){if (e.which == 27){ $(this).blur(); $(this).focus(); if (!$.gsuggest.config.cacheaggressive){$.gsuggest.cachedata=[]; $.gsuggest.cachekey=""}} else if (e.which < 37 || e.which > 40) {$.gsuggest.suggestDelay = setTimeout("$.gsuggest.keyup(document.getElementById('"+$(this).attr("id")+"'))", (!!$.gsuggest.cachedata[$(this).attr("id")+$.gsuggest.cachekey])?50:(e.which == 13)?0:250);}});
		
			$(id).click(function(){
//console.log("suggest click");
										
//			$(this).blur(); 
				$(this).next().hide(); $(this).attr("suggestPos", "-1");
				$(this).focus();
			});
			
			$(id).blur(function(){
//console.log("suggest blur");
				if (!$.gsuggest.childHovered) $(this).next().hide(); 
				
				$(this).attr("suggestPos", "-1");
				
				var c = $(this).val(), v = $(this).attr("defValue");
				if ( !c || (c == v) ) $(this).val(v).css("color", "#888");
			});
		  
			$(id).focus(function () {
//console.log("suggest focus");
				$(this).css("color", "#000");
				if ($(this).val() == $(this).attr("defValue")) $(this).val('');
			});
		  
        $(id).attr("suggestPos", "-1");
        $(id).attr("data-suggested", "-1");
        $(id).keydown(function(e){return $.gsuggest.keydown(this, e)});
        
        //set event handlers for suggest-box | no propgation
			$(suggest_idChildren).live("mouseover", function(e){
				if (!$.gsuggest.mouseoverok) return false; 
//console.log("children mouseover: " + $(this).text());																		
				$(this).parent().children("div:eq("+$(this).parent().prev().attr("suggestPos")+")").focusout(); 
				$(this).parent().prev().attr("suggestPos", $(this).prevAll().length); 
				$(this).focusin(); 
				$.gsuggest.synctext=true; 
				return false
			}); 
			
			$(suggest_idChildren).live("mouseout", function(){$(this).focusout(); return false;});
			
			$(suggest_idChildren).live("focusin", function(){
//console.log("children focus: " + $(this).text());																		
				$(this).addClass("focus"); 
				$.gsuggest.childHovered	= true;
				if($.gsuggest.synctext)	$(this).parent().prev().attr("value", $(this).text());
				return false;
			});

			$(suggest_idChildren).live("focusout", function(){
//console.log("children blur: " + $(this).text());
				$(this).removeClass("focus"); 
				$.gsuggest.childHovered	= false;
				$(this).parent().prev().attr("value", $(this).parent().prev().attr("suggestLast")); 
				return false;
			});
			
			$(suggest_idChildren).live("click", function(){
//console.log("children click: " + $(this).text());																		
				$(this).parent().prev().attr("suggestLast", $(this).text()); 
				$(this).focusout(); $(this).parent().hide(); $(this).parent().prev().focus(); 
				
				$.gsuggest.config.callback({id: $(this).attr("data-id")});
				return false;
			});
    
        //create suggest-box, set width, and position
        $(id).after("<div id=\""+suggest_id+"\" style=\"display:none\" class=\"suggestion\"></div>");
//		$(id).next().css($.gsuggest.config.css0);
//        $(id).next().css($.gsuggest.config.css);
//        $(id).next().width($(id).width());
//		  var o = $(id).offsetParent().offset();
//debug(o);		  
//        $(id).next().css({ top: $(id).height() - 1 });
    };
};
})(jQuery);

jQuery(document).ready(function(){
   $(document).mousemove(function(e){
	  if ($.gsuggest.mousepos != e.pageX+'-'+e.pageY){
      	$.gsuggest.synctext = true;
        $.gsuggest.mouseoverok = true;
	  }
	  $.gsuggest.mousepos = e.pageX+'-'+e.pageY;
   }); 
})

//init
//jQuery(document).ready(function(){jQuery.gsuggest({'debug':true})});
//requires cache sets to be tied to attributes


/*
I have not decided if I want to add text-range support for autocomplete; my intent
was to memic the behavior of googles suggest and I feel that I have done this. However
I may decided to implement this as an optional setting in the future... */
