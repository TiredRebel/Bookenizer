var map, geocoder, xData={};

function validateMail(s) {	return (new RegExp('^[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+@[-!#$%&\'*+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+$')).test(s); }

function debug(e) {
	var s = t = "";
	if ((typeof(e) == "object") || (typeof(e) == "array"))
		for (var i in e) {
			switch (t = typeof(e[i])) {
				case "function": case "object": case "array": break;
				default: t = e[i];
			}
			s += i + " = " + t + "\n";
		}
	else
		s = e;
	alert(s);
}

function log() {
	if (window.console && window.console.log)
		window.console.log.apply(window.console, arguments);
//	else
//		debug(arguments[0]);
};

function clone(o) {	// return the clone of the object
	if(!o || "object" !== typeof o)
		return o;
		
	var c = "function" === typeof o.pop ? [] : {};
	var p, v;
	for(p in o) {
		if(o.hasOwnProperty(p)) {
			v = o[p];
			if(v && "object" === typeof v)
				c[p] = clone(v);
			else 
				c[p] = v;
		} else 
			c[p] = o[p];
	}
//	c.prototype = o.prototype;
	return c;
}

function reallyInt(i) {
	var temp = parseInt(i);
	return isNaN(temp) ? 0 : temp;
}

function oneDecimal(i) { return (~~(10 * i)) / 10 }


String.prototype.str_repeat = function(num) {	// Returns the string repeated num times 
	return new Array(num+1).join(this);
}

String.prototype.trim = function() {	// Removes the leading and ending whitespaces
	return this.replace("%20", " ").replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

String.prototype.capitalize = function(s) {
	return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/*  (x) Sb, 2k9
 * ---------------------------------------------------------------------------
 *
 * Localization interface
 *
 */

l18n = new (function() {
	this.data = {};
	
	this.add = function(key, fun) { this.data[key] = fun }
	
	this.spell = function(key, data) {
		return (this.data[key] && this.data[key](key, data)) || key;
	}
})();

function GmapInit() {
    if (GBrowserIsCompatible()) {
        map = new GMap2(document.getElementById("mapa"));
        map.setCenter(new GLatLng(37.4419, -122.1419), 1);
        map.setUIToDefault();
        geocoder = new GClientGeocoder();
      }
}

function showAddress(address) {
  if (geocoder) {
    geocoder.getLatLng(
      address,
      function(point) {
        if (!point) {
          alert(address + " not found");
        } else {
          map.setCenter(point, 13);
          var marker = new GMarker(point);
          map.addOverlay(marker);
          marker.openInfoWindow(document.createTextNode(address));
        }
      }
    );
  }
}
/*  (x) Sb, 2k8
 * ---------------------------------------------------------------------------
 *
 * Some interface handling functions - switchers, etc.
 *
 */

switchHotellist = function (s) {
	var sta = ((s == "selected") || $("#hotellist").hasClass("popular")) ? "popular" : "selected";
	var top = $("ul.topblock li.selected");

	switch(sta) {
		case "popular":
			$("#hotellist").html('<div class="inprogress"><img src="img/progress.gif" /></div>').removeClass("popular").addClass("selected").load("ajax/ajax-hotellist-selected.html");
			$("ul#hotellistSwitcher").html('\
				<li class="popular noprint"><a href="#" class="noreload" onclick="return switchHotellist()" title="The most popular hotels of the world">popular<\/a><\/li>\
				<li class="selected">selected<\/li>');
			top.html('<span>' + top.children("a").text() + '</span> / ');
			break;

		case "selected":
			$("#hotellist").html('<div class="inprogress"><img src="img/progress.gif" /></div>').removeClass("selected").addClass("popular").load("ajax/ajax-hotellist-popular.html");
			$("ul#hotellistSwitcher").html('\
				<li class="popular">popular<\/li>\
				<li class="selected noprint"><a href="#" class="noreload" onclick="return switchHotellist()" title="Hotels you have chosen earlier">selected<\/a><\/li>');
			top.html('<a href="#" class="noreload" onclick="return switchHotellist()" title="Show your Selected hotels">' + top.children("span").text() + '<\/a> / ');
			break;
	}

	return false;
}
/*
switchSearchtype = function (s) {
	var v = $("#searchbar form.advanced .dest").attr("defValue");
	var sta = ((s == "quick") || ($("#searchbar form.quick").css('display') == "none")) ? "advanced" : "quick";

	switch(sta) {
		case "quick":
//			xState.vars.searchType = "ADVANCED";
			
			$("#searchbar ul.switcher").html('\
				<li><a href="#" class="noreload" onclick="return switchSearchtype()" title="Simple search">quick<\/a><\/li>\
				<li>advanced<\/li>');

			$("#searchbar form.advanced .dest").val( e = $("#searchbar form.quick .dest").val() );

			if ( !e || (e == v)) // no data entered
				$("#searchbar form.advanced .dest").val(v).css("color", "#888");
			else
				$("#searchbar form.advanced .dest").css("color", "#000");
			
			$("#advdateFrom").val( $("#dateFrom").val() );
			$("#advdateTo").val( $("#dateTo").val() );
			
			$("#searchbar form.quick").hide();
			$("#searchbar form.advanced").show();
			break;

		case "advanced":
//			xState.vars.searchType = "QUICK";
			
			$("#searchbar ul.switcher").html('\
				<li>quick<\/li>\
				<li><a href="#" class="noreload" onclick="return switchSearchtype()" title="More search options">advanced<\/a><\/li>');

			$("#searchbar form.quick .dest").val( e = $("#searchbar form.advanced .dest").val() );

			if ( !e || (e == v)) // no data entered
				$("#searchbar form.quick .dest").val(v).css("color", "#888");
			else
				$("#searchbar form.quick .dest").css("color", "#000");
			
			$("#advdateFrom").val( $("#dateFrom").val() );
			$("#advdateTo").val( $("#dateTo").val() );

			$("#searchbar form.advanced").hide();
			$("#searchbar form.quick").show();
			break;
	}

	return false;
}
*/

/*  (x) Sb, 2k8
 * ---------------------------------------------------------------------------
 *
 * simple dialog manager
 *
 * required: jQuery
 */

iMgr = function() {
	this.dlgs = [];
}

iMgr.prototype.lookfor = function(d) {
	var parent = (d && d.parent) || window;
	
	if (parent.xMgr)
		for (var i in parent.xMgr.dlgs)
			if (parent.xMgr.dlgs[i] == d) return i;
	return false;
}

iMgr.prototype.remove = function(d) {
	var parent = (d && d.parent) || window;
	var res = [];
	
	if (parent.xMgr && parent.xMgr.dlgs && parent.xMgr.dlgs.length) {
		for (var i in parent.xMgr.dlgs) if (parent.xMgr.dlgs.hasOwnProperty(i))
			if (parent.xMgr.dlgs[i] != d) res.push(parent.xMgr.dlgs[i]);
		parent.xMgr.dlgs = res;
	}
}

iMgr.prototype.registerDialog = function(d) {
	var parent = (d && d.parent) || window;
	if (parent.xMgr)
		if (parent.xMgr.lookfor(d) === false)
			parent.xMgr.dlgs.push(d);
	return d;
}
	
iMgr.prototype.unregisterDialog = function(d) {
	var parent = (d && d.parent) || window;
	if (parent.xMgr)
		parent.xMgr.remove(d);
}
	
iMgr.prototype.show = function(d) {
	var self = (d && d.data && d.data.self) || d;
	var parent = (self && self.parent) || window;
	
	if (self && (self.visible === false)) {
		if (parent.xMgr && parent.xMgr.dlgs && parent.xMgr.dlgs.length)
			for (var i in parent.xMgr.dlgs)
				if (parent.xMgr.dlgs[i] != self) 
					parent.xMgr.dlgs[i]["hide"] && parent.xMgr.dlgs[i].hide();

		self.show(d);
	}
	
log("xMgr.show", self);
	 
	return false;
}
	
iMgr.prototype.hide = function(d) {
	var self = (d && d.data && d.data.self) || (d && d.hide && d);
	var me = (self && self.parent && self.parent.xMgr) || (this && this.dlgs && this) || window.xMgr;

	if (self && (typeof(self.hide) == "function")) {
		self.hide(d);
		return false;
	}

	if (me && me.dlgs && me.dlgs.length)
		for (var i in me.dlgs) 
			me.dlgs[i]["hide"] && me.dlgs[i].hide();
	return false;
}

xMgr = new iMgr();

/*  (x) Sb, 2k8
 * ---------------------------------------------------------------------------
 *
 * simple dialog template
 *
 * required: jQuery
 */

iDlg = function (params) {
	this.init(params);
}

iDlg.prototype = {

	init : function (params) {

		if (params) {
			for (var i in params)
				if (typeof(this[i]) != "function")
					this[i] = params[i];
					
			if (this.id)
				$(this.id).attr("self", this);
				
			this.parent = this.parent || window;
			this.xMgr = new iMgr();

			this.visible = false;
			
			var ph = params['ph'] || 'def';
			this.phase(ph);

log("iDlg.init", this, $(this.btActivator).length);


			$(this.btActivator).bind('click', {self:this, phase:ph}, this.xMgr.show);
			
			$(this.id).bind("click", {self:this}, function(e){ 
				e.data.self.xMgr && e.data.self.xMgr.hide(); 
				e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
				e.preventDefault ? e.preventDefault() : e.returnValue = false;
				return false;
			});

			if (this.btActivatorAlt)
				$(this.btActivatorAlt).bind('click', {self:this, phase:ph}, this.xMgr.show);

			this.parent.xMgr.registerDialog(this);
		}
	},
	
	show : function (e) {	// !handler
		var self = (e && e.data && e.data.self) || this;
		var ph = (e && e.data && e.data.phase) || "def";
		if (self && (self.visible === false) ) {
			$(self.btActivator).unbind('click').bind("click", {self:self}, self.hide);
			if (self.phase(ph)) {	// default phase
				$(self.id).show(); 
				self.visible = true;
			}
		}
		return false;
	},
	
	hide : function (e) {	// !handler
		var self = (e && e.data && e.data.self) || this;
		var ph = (e && e.data && e.data.phase) || "def";

		if (self.xMgr) self.xMgr.hide();
		
		if (self && (self.visible === true) ) {
			$(self.id).hide(); 
			$(self.btActivator).unbind('click').bind("click", {self:self, phase:ph}, xMgr.show);
			self.visible = false;
		}
		return false;
	},

	phase : function(p) {
		$(this.id + " .diags p").hide();
		$(this.id + " .diags " + this.pre + "_" + p).show();
		return true;	
	},
	
	processInputClick : function () {
		$(this).css("color", "#000");
		if ($(this).val() == $(this).attr("defValue")) $(this).val('');
	},
	
	processInputBlur : function () {
		var c = $(this).val(), v = $(this).attr("defValue");
		if ( !c || (c == v) ) 
			$(this).val(v).css("color", "#888");
	}
	
}



/*  (x) Sb, 2k8
 * ---------------------------------------------------------------------------
 *
 * Subscribe dialog processing
 *
 */

iSubscribe = function (params) {
    if(xData.user!==null && xData.user!==undefined){
        var name = xData.user && xData.user.name;

        if (!params.ph && name){
            params.ph = "signed_in";
        }
    }else{
      params.ph = "not_signed_in";
    }

	this.superClass.init.call(this, params);
	$(this.idMail).click(this.processInputClick).focus(this.processInputClick).blur(this.processInputBlur);
}

iSubscribe.prototype = new iDlg();
iSubscribe.prototype.superClass = iDlg.prototype;
iSubscribe.prototype.constructor = iSubscribe;

iSubscribe.prototype.phase = function(p) {
		switch (p) {	// check current Sign in status
			case 'def':
			case 'signed_in':
				p = xData.user.id ? 'signed_in' : 'def';
		}
		
		switch (p) {
		
			case 'def':
				$(this.btAction).text('Subscribe').attr('title', 'A confirmation e-mail will be sent to your address').unbind('click').bind("click", {self:this}, this.processSubscribe);
				$(this.idMail).show();
				$(this.id + " select").show();
				break;

			case 'signed_in':
				$(this.btAction).text('Subscribe').attr('title', 'A confirmation e-mail will be sent to your address').unbind('click').bind("click", {self:this}, this.processSubscribe);
				$(this.idMail).hide();
				$(this.id + " select").show();
				break;

			case 'success':
				$(this.btAction).text('Close').attr('title', 'Subscription successful').unbind('click').bind("click", {self:this}, xMgr.hide);
				$(this.idMail).hide();
				$(this.id + " select").hide();
				break;
		}

		this.superClass.phase.call(this, p);
		return true;	
	}

iSubscribe.prototype.processSubscribe = function (e) {
	var self = (e && e.data && e.data.self) || this;

	if (xData.user.name)
		self.phase('success');
	else {
		var c = $(self.idMail).val(), v = $(self.idMail).attr("defValue");
	
		if ( c != v )	// if right e-mail (AJAX request should be here)
			if (validateMail(c))
				self.phase('success');
			else
				self.phase('bad_mail');		
		else
			self.phase('no_mail');		
	}
	return false;
}
	
	
	
/*  (x) Sb, 2k8
 * ---------------------------------------------------------------------------
 *
 * Sign in / Register dialog manipulations
 *
 */


iSignIn = function (params) {
	
	var name = xData.user && xData.user.name;

	if (!params.ph && name)
		params.ph = "signed_in";

	this.superClass.init.call(this, params);

	$(this.idMail).click(this.processInputClick).focus(this.processInputClick).blur(this.processInputBlur);

	$(this.idPassOpen).bind("click", {self:this}, this.processPassClick).bind("focus", {self:this}, this.processPassClick);
	$(this.idPass).bind("blur", {self:this}, this.processPassBlur);

	$(this.btRegister).unbind('click').bind('click', {self:this, phase:"show_register"}, xMgr.show);
}

iSignIn.prototype = new iDlg();
iSignIn.prototype.superClass = iDlg.prototype;
iSignIn.prototype.constructor = iSignIn;


iSignIn.prototype.hide = function (e) {
	var self = (e && e.data && e.data.self) || this;
	self.superClass.hide.call(self, e);
	
	$(self.btRegister).unbind('click').bind('click', {self:self, phase:"show_register"}, xMgr.show);
	return false;
}

iSignIn.prototype.phase = function(p) {

	switch (p) {
	
		case 'def':
			($(this.idPass).val()) ?  $(this.idPass).show() && $(this.idPassOpen).hide() : $(this.idPass).hide() && $(this.idPassOpen).show();
			$(this.idMail).show();
			
			$(this.btAction).text('Sign in').attr('title', 'Get access to all site features.').unbind('click').bind("click", {self:this}, this.processSignIn);
			$(this.btActivator).unbind('click').bind('click', {self:this}, xMgr.hide);
			$(this.btRegister).unbind('click').bind('click', {self:this, phase:"show_register"}, this.doIt);
			$("#block_register").show();
			$("#welcome").hide();
			break;
	
		case 'signed_in':
			$("#welcome a").text( xData.user.name ); 
			$("#welcome").show();
			$(this.btActivator).text("Sign out").attr('title', 'Sign out').unbind('click').bind("click", {self:this}, this.processSignOut);
			$("#block_register").hide();
			
			$(".hideOnSignIn").hide();
			$(".showOnSignIn").show();
			
			if (this.onSignIn && (typeof(this.onSignIn) == "function")) this.onSignIn(this);
			
			xMgr.hide({data:{self:this, phase:"sign_out"}});
			return false;
			break;
			
		case 'sign_out':
			$("#welcome").hide();
			$("#block_register").show();
			$(this.btActivator).text("Sign in").attr('title', 'Welcome to full featured system').unbind('click').bind('click', {self:this}, xMgr.show);
			$(this.btRegister).unbind('click').bind('click', {self:this, phase:"show_register"}, xMgr.show);
			
			$(".hideOnSignIn").show();
			$(".showOnSignIn").hide();
			
			xMgr.hide();
			
			if (this.onSignOut && (typeof(this.onSignOut) == "function")) this.onSignOut(this);

			return false;
			break;
		
		case 'no_mail_to_reset':
			$(this.idPass).hide();
			$(this.idPassOpen).hide();
			$(this.btAction).text('Reset password').attr('title', 'A password reset letter will be sent to your e-mail. Use it to reset your password.').unbind('click').bind('click', {self:this}, this.processForgotPassword);
			break;
			
		case 'reset_pass_sent':
			$(this.idMail).hide();
			$(this.idPass).hide();
			$(this.idPassOpen).hide();
			$(this.btAction).text('Close').attr('title', 'A password reset letter has been sent to your e-mail. Use it to reset your password.').unbind('click').click(xMgr.hide);
			break;
		
		case 'show_register':
			$(this.idMail).show();
			$(this.idPass).hide();
			$(this.idPassOpen).hide();
			$(this.btAction).text('Register').attr('title', 'The e-mail validation letter will be sent to you to continue registration process.').unbind('click').bind("click", {self:this}, this.processRegister);
			$(this.btActivator).unbind('click').bind('click', {self:this}, this.doIt);
			$(this.btRegister).unbind('click').bind('click', {self:this}, xMgr.hide);
			break;

		case 'do_register':
			$(this.idMail).hide();
			$(this.idPass).hide();
			$(this.idPassOpen).hide();
			$(this.btAction).text('Close').attr('title', 'A validation letter has been sent to your e-mail. Use it to complete registration').unbind('click').click(xMgr.hide);
			break;
	}

	this.superClass.phase.call(this, p);
	return true;
}

iSignIn.prototype.doIt = function (e) {
	var self = (e && e.data && e.data.self) || this;
	var ph = (e && e.data && e.data.phase) || "def";

	self.phase(ph);
	
	return false;
}

iSignIn.prototype.processSignIn = function (e) {
	var self = (e && e.data && e.data.self) || this;
	var c = $(self.idMail).val(), p = $(self.idPass).val();

	if ( c == "e@mail.com" )	// if right e-mail (AJAX request should be here)
		if ( p == "111" ) {		// right password
		
			xData.user = {id:123, name:"Konstantinopulo"};	// set current user data. need to get it from server via AJAX request

			self.phase('signed_in');
		}
		else							// wrong password
			self.phase('bad_pass');
	else								// wrong e-mail
		self.phase('bad_mail');		
	
	return false;
}

iSignIn.prototype.processSignOut = function (e) {
	var self = (e && e.data && e.data.self) || this;
	
	xData.user = {id:0, name:""};	// clear current user data
	
	self.phase("sign_out");
	return false;
}

iSignIn.prototype.processForgotPassword = function (e) {
	var self = (e && e.data && e.data.self) || this;
	var c = $(self.idMail).val();

	if (c && (c != $(self.idMail).attr('defValue')))	// e-mail address is entered
	
		if (c == "e@mail.com")									// ok, this address is registered in our base
			self.phase("reset_pass_sent");
		else
			self.phase("bad_mail");								// no, we don't know this e-mail
			
	else
		self.phase("no_mail_to_reset");						// nothing entered
		
	return false;
}

iSignIn.prototype.processRegister = function (e) {
	var self = (e && e.data && e.data.self) || this;
	var c = $(self.idMail).val();

	if ( !c || (c == $(self.idMail).attr("defValue"))) // no e-mail entered
		self.phase('no_mail_to_register');
	else
		if ( c == "e@mail.com" )								// if right e-mail (AJAX request should be here)
			self.phase('already_registered');
		else
			self.phase('do_register');		
	
	return false;
}

iSignIn.prototype.processPassClick = function (e) {
	var self = (e && e.data && e.data.self) || this;
	$(this).hide();
	$(self.idPass).val('').show().focus();
}

iSignIn.prototype.processPassBlur = function (e) {
	var self = (e && e.data && e.data.self) || this;
	if ( !$(this).val() ) {
		$(this).hide();
		$(self.idPassOpen).val( $(self.idPassOpen).attr("defValue") ).show();
	}
}

/*  (x) Sb, 2k8
 * ---------------------------------------------------------------------------
 *
 * Mapa dialog processing
 *
 */

iMapa = function (params) {
	this.superClass.init.call(this, params);
    GmapInit();
	this.me = $(this.id);
	this.h = this.me.height();
	this.w = this.me.width();

	this.win = $(window);
	
	this.centerMe();
	
//	this.win.bind("scroll", {self:this}, this.centerMe).bind("resize", {self:this}, this.centerMe);
	$(this.btAction).bind("click", {self:this}, xMgr.hide);
}

iMapa.prototype = new iDlg();
iMapa.prototype.superClass = iDlg.prototype;
iMapa.prototype.constructor = iMapa;

iMapa.prototype.phase = function(p) {
		return true;	
}

iMapa.prototype.show = function(e) {
	var self = (e && e.data && e.data.self) || this;
    var address=$("#geocoords").text().trim();
    showAddress(address);
	self.centerMe();
	self.superClass.show.call(self, e);

	$(self.id).before('<div id="fader"></div>');
	$("#fader").height($(document).height()).bind("click", {self:self}, xMgr.hide);

	return false;
}

iMapa.prototype.hide = function(e) {
	var self = (e && e.data && e.data.self) || this;

	self.superClass.hide.call(self, e);

	$("#fader").remove();

	return false;
}

iMapa.prototype.centerMe = function (e) {
	var self = (e && e.data && e.data.self) || this, temp;

	var st = self.win.scrollTop(), sl = self.win.scrollLeft(), wh = self.win.height(), ww = self.win.width();

	var t = ((temp = st + (wh - self.h) / 2 ) > 0 ? temp : 0) + "px";
	var l = ((temp = sl + (ww - self.w) / 2 ) > 0 ? temp : 0) + "px";

	self.me.css({top: t, left: l});
}


/*  (x) Sb, 2k8
 * ---------------------------------------------------------------------------
 *
 * Gallery dialog processing
 *
 */

iGallery = function (params) {
	this.superClass.init.call(this, params);

	this.me = $(this.id);
	this.aptId = this.aptId || reallyInt(this.me.attr("rel"));	// get an apartment id at xData.apt
	this.h = this.me.height();
	this.w = this.me.width();

	this.current = $(this.id + " img.current");
	this.preload = $(this.id + " img.preload");

	this.animating = 0;

	this.win = $(window);
	
	this.current.bind("load", {self:this}, this.centerMe);
	this.preload.bind("load", {self:this}, this.loadHandler);

	$(this.btAction).bind("click", {self:this}, xMgr.hide);
	$(this.id + " .gallery a").bind("click", {self:this}, this.previewClick)
}

iGallery.prototype = new iDlg();
iGallery.prototype.superClass = iDlg.prototype;
iGallery.prototype.constructor = iGallery;

iGallery.prototype.phase = function(p) {
		return true;	
}

iGallery.prototype.show = function(e) {
	var self = (e && e.data && e.data.self) || this, temp;
	self.centerMe();
/*
	if (self.aptId && xData.apt[self.aptId]) {
		if (temp = xData.apt[self.aptId].avail) {
			$(self.id + " .available").show();
			$(self.id + " .available .number").text(temp);
			$(self.id + " .unavailable").hide();
		} else {
			$(self.id + " .available").hide();
			$(self.id + " .unavailable").show();
		}
	}
*/
	$("select").not($(self.id + " select")).css("visibility", "hidden");	// fix for IE bug: it shows SELECT, OBJECT and IFRAME on top of the rest of document

	self.superClass.show.call(self, e);

	$(self.id).before('<div id="fader"></div>');
	$("#fader").height($(document).height()).bind("click", {self:self}, xMgr.hide);

	return false;
}

iGallery.prototype.hide = function(e) {
	var self = (e && e.data && e.data.self) || this;

	if (self.visible) {

		self.superClass.hide.call(self, e);
	
		$("#fader").remove();
	
		$("select").not(self.id + " select").css("visibility", "visible");	// fix for IE bug: it shows SELECT, OBJECT and IFRAME on top of the rest of document

	}

	return false;
}

iGallery.prototype.centerMe = function (e) {
	var self = (e && e.data && e.data.self) || this, temp;

	var st = self.win.scrollTop(), sl = self.win.scrollLeft(), wh = self.win.height(), ww = self.win.width();
	self.h = self.me.height();
	self.w = self.me.width();

	self.top = ((temp = st + (wh - self.h) / 2 ) > 0 ? temp : 0);
	self.left = ((temp = sl + (ww - self.w) / 2 ) > 0 ? temp : 0);

	self.me.css({top: self.top + "px", left: self.left + "px"});
}

iGallery.prototype.previewClick = function (e) {
	var self = (e && e.data && e.data.self) || this, temp;
	
	if ( $(this).hasClass("current") ) return false;

	$(self.id + " .gallery a").removeClass("current");
	$(this).addClass("current");

	if (self.animating && (self.animating++ < 3))
		return false;

	self.faded = self.loaded = false;

	self.preload.attr("src", $(this).attr("rel"));

	self.current.fadeOut(200, function() { 
		self.faded = true;
		self.faded && self.loaded && self.imgLoaded();
	});
}

iGallery.prototype.loadHandler = function (e) {
	var self = (e && e.data && e.data.self) || this, temp;
		
	self.loaded = true;
	self.faded && self.loaded && self.imgLoaded();
}

iGallery.prototype.previewAnimationComplete = function (self) {
		
	self.h = self.me.height();
	self.top = parseFloat(self.me.css("top"));

	self.current.fadeIn(200);

	self.animating = 0;
}

iGallery.prototype.imgLoaded = function (e) {
	var self = (e && e.data && e.data.self) || this, temp;

	var dy = self.preload.height() - self.current.height();

	var newH = self.h + dy;
	var newT = (temp = self.top - dy / 2) >  0 ? temp : 0;

	self.animating = 1;
	self.me.animate({ height: newH + "px", top: newT + "px" }, 300, "swing", function() {
		self.previewAnimationComplete(self);
	});

	self.current.hide().attr("src", self.preload.attr("src"));
}


/*  (x) Sb, 2k8
 * ---------------------------------------------------------------------------
 *
 * some extended object processing
 *
 */

iArray = function (params) {
	this.init(params);
}

iArray.prototype = {

	init : function (params) {

		var u; 
		this.__ = u;
		this.__max = 0;
		this.__assoc = false;
		if (params)
			for (var i in params)
				if (typeof(params[i]) != "function")
					this.addIndex(i, params[i]);
	},
	
	isKey : function(i) {
		return !( (typeof(this[i]) == "function") || (this[i] == this.__) || ((i != reallyInt(i)) && (i.slice(0,2) == "__")) );
	},

	mayBeKey : function(i) {
		return !( (typeof(this[i]) == "function") || ((i != reallyInt(i)) && (i.slice(0,2) == "__")) );
	},

	length : function() {
		var len=0;
		for (var i in this)
			if (this.isKey(i)) len++;
		return len;
	},
	
	removeIndex : function(i) {
		if (this[i] !== this.__)
			this[i] = this.__;
	},
	
	apply: function(o,f) {
		if (typeof(o) == "function") {
			f = o;
			o = null;
		}
		
		if (this.__assoc)
			var res = {};
		else
			var res = [];
			
		for (var i in this)
			if (this.isKey(i)) 
				res[i] = f.call(o, i, this[i]);
				
		return res;
	},

	search : function(o,f) {
		if (typeof(o) == "function") {
			f = o;
			o = this;
		}

		for (var i in this) {
			if (this.isKey(i)) 
				if (f.call(o, i, this[i])) 
					return {key:i, value:this[i]};
		}
		return false;
	},

	addIndex : function(i,v) {
		if (this.mayBeKey(i)) {
			if (i == reallyInt(i)) { 
				if (i > this.__max)
					this.__max = i;
			} else
				this.__assoc = true;
		
			this[i] = v;
		}
	},

	addValue : function(v) {
		this[++this.__max] = v;
		return {key:this.__max, value:v};
	},

	first : function() {
		for (var i in this)
			if (this.isKey(i))
				return {key:i, value:this[i]};
		return false;
	}
}


/*  (x) Sb, 2k8
 * ---------------------------------------------------------------------------
 *
 * Order dialog processing
 *
 */

iOrder = function (params) {
	this.init(params);
}

iOrder.prototype = {

	init : function (params) {
		if (params)
			for (var i in params)
				if (typeof(params[i]) != "function")
					this[i] = params[i];
					
		if (this.id)
			$(this.id).attr("self", this);

		(this.tpl = $(this.id + " div.apt-template"))
			.find(".remove").bind("click", {self:this}, this.removeApt)
		.end()
			.find(".apt-room-type select, .apt-room-number input, .apt-room-extrabed select")
				.bind("change", {self:this}, this.updateApt);

		$(this.id + " .orderMeals select, " + this.id + " .orderMeals input")
			.bind("change", {self:this}, this.updateMeals);

		this.nights = reallyInt($(this.id + " .search_nights_num").text());
		this.showMeals = 0;
		this.total = 0;

		if (xData.order.length())
			this.updateAll();
			
		$(this.btActivator).bind('click', {self:this}, this.addApt);
	},

	updateAll : function () {
		$(this.id + " div.apt").remove();
				
		var newJQ = xData.order.apply( this, this.createAptBlock );
		var start = this.tpl;

		for (var i in newJQ) 
			if (newJQ[i] && (typeof(newJQ[i]) != "function")) {
				start.after(newJQ[i]);
				start = newJQ[i];
			}

		var s = [];
		for (i in xData.meals)
			if (xData.meals.isKey(i))
				if (i == xData.order.meals.type)
					s.push('<option value="' + i + '" selected="selected">' + xData.meals[i].name + '</option>');
				else
					s.push('<option value="' + i + '">' + xData.meals[i].name + '</option>');

		$(this.id + " .orderMeals")
			.children("select").html(s.join('')).end()
			.children("input").val(xData.order.meals.num);

		this.calcPrice();
	},

	updateMeals : function (e) {
		var self = (e && e.data && e.data.self) || this, temp;
		temp = $(this).parent();
		var newType = temp.children("select").val();
		var newNum = reallyInt(temp.children("input").val());

		xData.order.meals = { type: newType, persons: newNum };
		temp.find("input").val(newNum);

		self.calcPrice();
	},

	updateApt : function (e) {
		var self = (e && e.data && e.data.self) || this, oldJQ, newJQ, temp;
		var pos = (temp = $(this).parents(".apt")).attr("rel");		
		var newType = temp.find(".apt-room-type select").val();
		var newNum = reallyInt(temp.find(".apt-room-number input").val());
		var newXbed = temp.find(".apt-room-extrabed select").val();

		if (!isNaN(pos = reallyInt(pos)))		// block number
			if ( (oldJQ = $(self.id + ' div.apt[rel=' + pos + ']')).length && xData.order[pos])	{	// block exists
				xData.order[pos] = { type: newType, num: newNum, extrabeds: newXbed };
				
				if (newJQ = self.createAptBlock(pos, xData.order[pos]))		// create new block
					oldJQ.replaceWith(newJQ);		// replace old with new
			}
			
		self.calcPrice();
	},

	removeApt : function (e) {
		var self = (e && e.data && e.data.self) || this, b, pos;
		
		pos = (b = $(this).parents(".apt")).attr("rel");
		
		xData.order.removeIndex(pos);
		b.hide(500, function(){$(this).remove()});
		self.calcPrice();
		return false;
	},


	createAptBlock : function (k,v) {
		var b, temp, s, num, i;

		if (k != reallyInt(k)) return false;	// apartment are indexed with integers only

		if (xData.apt[v.type]) {	// rooms of known type
		
			b = this.tpl.clone(true);
			
			s = [];
			for (i in xData.apt)
				if (xData.apt.isKey(i))
					if (i == v.type)
						s.push('<option value="' + i + '" selected="selected">' + xData.apt[i].name + '</option>');
					else
						s.push('<option value="' + i + '">' + xData.apt[i].name + '</option>');

			(temp = b.children(".apt-room-type")).children("select").html(s.join('')).attr("name", "roomtype"+k);

			if (xData.apt[v.type].avail) {
				temp.children("p.available").children("span.number").text(xData.apt[v.type].avail);
				temp.children(".unavailable").css("display", "none");

				num = (v.num > xData.apt[v.type].avail) ? xData.apt[v.type].avail : v.num;
				b.children(".apt-room-number").children("input").val(num).attr("name", "rooms"+k);

				if (xData.apt[v.type].extrabeds.num) {
					num = (v.extrabeds > xData.apt[v.type].extrabeds.num) ? xData.apt[v.type].extrabeds.num : v.extrabeds;
					
					s = [];
					
					for (i = 0; i <= xData.apt[v.type].extrabeds.num; i++)
						if (i == num)
							s.push('<option value="' + i + '" selected="selected">' + i + '</option>');
						else
							s.push('<option value="' + i + '">' + i + '</option>');

					b.children(".apt-room-extrabed").children("select").html(s.join('')).attr("name", "extrabeds"+k);
					
				} else
					b.children(".apt-room-extrabed").css("display", "none");

				b.attr("class", "sideblock opener active apt").attr("rel",k);
		
			} else {
				temp.children("p.available").css("display", "none");
				b.children(".apt-room-number").css("display", "none");
				b.children(".apt-room-extrabed").css("display", "none");
				b.attr("class", "sideblock opener inactive apt").attr("rel",k);
			}
			return b;
		}
		return false;
	},
	
	addApt : function(e) {
		var self = (e && e.data && e.data.self) || this, b, def, form, temp;
		
		if ((form = $(this).parents(".aptform")).length) {		// adding from apt gallery
		
			xMgr.hide();

			if (temp = reallyInt(form.attr("rel")))
				def = {key:temp, value:xData.apt[temp]};
		}

		if (!def)
			if (!(def = xData.apt.search( function(k,v) { return v.avail } )))		// look for apt with avail > 0
				if (!(def = xData.apt.first()))	// look for any apt
					return false;		// no apt
		var newBlockNum = xData.order.addValue({type:def.key, num:1, extrabeds:0}).key;	// add new block to storage 
		var b = self.createAptBlock(newBlockNum, {type:def.key, num:1, extrabeds:0});		// create JQ block

		b.hide();
		$(self.id + " .add2order").parent().before(b);
		b.show(500);
		
		self.calcPrice();
		return false;
	},
	
	calcPrice : function() {
		
		this.total = 0;
		this.nights = reallyInt($(this.id + " .search_nights_num").text());

		var apts = xData.order.apply(this, function(k,v) {
			if (k != reallyInt(k)) return 0;	// all apts are integer indexed
			
			var data = xData.apt[v.type];
			if (data.avail < 1) return 0;	// no apts available
			
			var s = this.nights * v.num * (data.price + v.extrabeds * data.extrabeds.price);
			this.total += s;
			return s;
		});

		if (this.total) {		// some apts chosen - show meals block and calculate it
			if (!this.showMeals)
				this.showMeals = $(this.id + " .orderMeals").show(200);

			this.total += this.nights * xData.meals[xData.order.meals.type].price * xData.order.meals.persons;
			$(this.id + " .submit").attr("disabled", "");
				
		} else {			// no apts chosen - hide meals block and don't calculate it
			if (this.showMeals)
				this.showMeals = $(this.id + " .orderMeals").hide(200) && 0;
				
			$(this.id + " .submit").attr("disabled", "disabled");
		}

		$("#orderTotal").text(this.total);
	}
	
}
	

