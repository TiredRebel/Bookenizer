jQuery.webshims.register("details",function(b,f,k,l,m,h){var i=function(a){var c=b(a).parent("details");if(c[0]&&c.children(":first").get(0)===a)return c},j=function(a,c){var a=b(a),c=b(c),d=b.data(c[0],"summaryElement");b.data(a[0],"detailsElement",c);if(!d||a[0]!==d[0])d&&(d.hasClass("fallback-summary")?d.remove():d.unbind(".summaryPolyfill").removeData("detailsElement").removeAttr("role").removeAttr("tabindex").removeAttr("aria-expanded").removeClass("summary-button").find("span.details-open-indicator").remove()),
b.data(c[0],"summaryElement",a),c.prop("open",c.prop("open"))};f.createElement("summary",function(){var a=i(this);if(a&&!b.data(this,"detailsElement")){var c;j(this,a);b(this).bind("focus.summaryPolyfill",function(){b(this).addClass("summary-has-focus")}).bind("blur.summaryPolyfill",function(){b(this).removeClass("summary-has-focus")}).bind("mouseenter.summaryPolyfill",function(){b(this).addClass("summary-has-hover")}).bind("mouseleave.summaryPolyfill",function(){b(this).removeClass("summary-has-hover")}).bind("click.summaryPolyfill",
function(b){var a=i(this);a&&(clearTimeout(c),c=setTimeout(function(){b.isDefaultPrevented()||a.attr("open",!a.attr("open"))},0))}).bind("keydown.summaryPolyfill",function(a){if(a.keyCode==13||a.keyCode==32){var e=this;clearTimeout(c);c=setTimeout(function(){a.isDefaultPrevented()||b(e).trigger("click")},0)}}).attr({tabindex:"0",role:"button"}).prepend('<span class="details-open-indicator" />')}});var g;f.defineNodeNamesBooleanProperty("details","open",function(a){var c=b(b.data(this,"summaryElement"));
if(c){var d=a?"removeClass":"addClass",e=b(this);if(!g&&h.animate){e.stop().css({width:"",height:""});var f={width:e.width(),height:e.height()}}c.attr("aria-expanded",""+a);e[d]("closed-details-summary").children().not(c[0])[d]("closed-details-child");!g&&h.animate&&(a={width:e.width(),height:e.height()},e.css(f).animate(a,{complete:function(){b(this).css({width:"",height:""})}}))}});f.createElement("details",function(){g=!0;var a=b.data(this,"summaryElement");a||(a=b("> summary:first-child",this),
a[0]?j(a,this):(b(this).prependPolyfill('<summary class="fallback-summary">'+h.text+"</summary>"),b.data(this,"summaryElement")));b.prop(this,"open",b.prop(this,"open"));g=!1})});
