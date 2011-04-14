/*!
 * jStore - Persistent Client-Side Storage
 *
 * Copyright (c) 2009 Eric Garside (http://eric.garside.name)
 * 
 * Dual licensed under:
 * 	MIT: http://www.opensource.org/licenses/mit-license.php
 *	GPLv3: http://www.opensource.org/licenses/gpl-3.0.html
 */
/*!
 * jQuery JSON Plugin
 * version: 1.0 (2008-04-17)
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 * Brantley Harris technically wrote this plugin, but it is based somewhat
 * on the JSON.org website's http://www.json.org/json2.js, which proclaims:
 * "NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.", a sentiment that
 * I uphold.  I really just cleaned it up.
 *
 * It is also based heavily on MochiKit's serializeJSON, which is 
 * copywrited 2005 by Bob Ippolito.
 */
 
(function($) {   
    function toIntegersAtLease(n) 
    // Format integers to have at least two digits.
    {    
        return n < 10 ? '0' + n : n;
    }

    Date.prototype.toJSON = function(date)
    // Yes, it polutes the Date namespace, but we'll allow it here, as
    // it's damned usefull.
    {
        return this.getUTCFullYear()   + '-' +
             toIntegersAtLease(this.getUTCMonth()) + '-' +
             toIntegersAtLease(this.getUTCDate());
    };

    var escapeable = /["\\\x00-\x1f\x7f-\x9f]/g;
    var meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };
        
    $.quoteString = function(string)
    // Places quotes around a string, inteligently.
    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.
    {
        if (escapeable.test(string))
        {
            return '"' + string.replace(escapeable, function (a) 
            {
                var c = meta[a];
                if (typeof c === 'string') {
                    return c;
                }
                c = a.charCodeAt();
                return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
            }) + '"';
        }
        return '"' + string + '"';
    };
    
    $.toJSON = function(o, compact)
    {
        var type = typeof(o);
        
        if (type == "undefined")
            return "undefined";
        else if (type == "number" || type == "boolean")
            return o + "";
        else if (o === null)
            return "null";
        
        // Is it a string?
        if (type == "string") 
        {
            return $.quoteString(o);
        }
        
        // Does it have a .toJSON function?
        if (type == "object" && typeof o.toJSON == "function") 
            return o.toJSON(compact);
        
        // Is it an array?
        if (type != "function" && typeof(o.length) == "number") 
        {
            var ret = [];
            for (var i = 0; i < o.length; i++) {
                ret.push( $.toJSON(o[i], compact) );
            }
            if (compact)
                return "[" + ret.join(",") + "]";
            else
                return "[" + ret.join(", ") + "]";
        }
        
        // If it's a function, we have to warn somebody!
        if (type == "function") {
            throw new TypeError("Unable to convert object of type 'function' to json.");
        }
        
        // It's probably an object, then.
        var ret = [];
        for (var k in o) {
            var name;
            type = typeof(k);
            
            if (type == "number")
                name = '"' + k + '"';
            else if (type == "string")
                name = $.quoteString(k);
            else
                continue;  //skip non-string or number keys
            
            var val = $.toJSON(o[k], compact);
            if (typeof(val) != "string") {
                // skip non-serializable values
                continue;
            }
            
            if (compact)
                ret.push(name + ":" + val);
            else
                ret.push(name + ": " + val);
        }
        return "{" + ret.join(", ") + "}";
    };
    
    $.compactJSON = function(o)
    {
        return $.toJSON(o, true);
    };
    
    $.evalJSON = function(src)
    // Evals JSON that we know to be safe.
    {
        return eval("(" + src + ")");
    };
    
    $.secureEvalJSON = function(src)
    // Evals JSON in a way that is *more* secure.
    {
        var filtered = src;
        filtered = filtered.replace(/\\["\\\/bfnrtu]/g, '@');
        filtered = filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
        filtered = filtered.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
        
        if (/^[\],:{}\s]*$/.test(filtered))
            return eval("(" + src + ")");
        else
            throw new SyntaxError("Error parsing JSON, source is not valid.");
    };
})(jQuery);
/**
 * Javascript Class Framework
 * 
 * Copyright (c) 2008 John Resig (http://ejohn.org/blog/simple-javascript-inheritance/)
 * Inspired by base2 and Prototype
 */
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);       
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();
/*!
 * jStore Delegate Framework
 * Copyright (c) 2009 Eric Garside (http://eric.garside.name)
 */
(function($){
	
	this.jStoreDelegate = Class.extend({
		init: function(parent){
			// The Object this delgate operates for
			this.parent = parent;
			// Container for callbacks to dispatch.
			// eventType => [ callback, callback, ... ]
			this.callbacks = {};
		},
		bind: function(event, callback){
			if ( !$.isFunction(callback) ) return this;
			if ( !this.callbacks[ event ] ) this.callbacks[ event ] = [];
			
			this.callbacks[ event ].push(callback);
			
			return this;
		},
		trigger: function(){
			var parent = this.parent,
				args = [].slice.call(arguments),
				event = args.shift(),
				handlers = this.callbacks[ event ];

			if ( !handlers ) return false;
			
			$.each(handlers, function(){ this.apply(parent, args) });
			return this;
		}
	});
	
})(jQuery);
/**
 * jStore-jQuery Interface
 * Copyright (c) 2009 Eric Garside (http://eric.garside.name)
 */
(function($){
	
	var rxJson;
	
	try {
		rxJson = new RegExp('^("(\\\\.|[^"\\\\\\n\\r])*?"|[,:{}\\[\\]0-9.\\-+Eaeflnr-u \\n\\r\\t])+?$')
	} catch (e) {
		rxJson = /^(true|false|null|\[.*\]|\{.*\}|".*"|\d+|\d+\.\d+)$/
	}
	
	// Setup the jStore namespace in jQuery for options storage
	$.jStore = {};
	
	// Seed the object
	$.extend($.jStore, {
		EngineOrder: [],
		// Engines should put their availability tests within jStore.Availability
		Availability: {},
		// Defined engines should enter themselves into the jStore.Engines
		Engines: {},
		// Instanciated engines should exist within jStore.Instances
		Instances: {},
		// The current engine to use for storage
		CurrentEngine: null,
		// Provide global settings for overwriting
		defaults: {
			project: null,
			engine: null,
			autoload: true,
			flash: 'jStore.Flash.html'
		},
		// Boolean for ready state handling
		isReady: false,
		// Boolean for flash ready state handling
		isFlashReady: false,
		// An event delegate
		delegate: new jStoreDelegate($.jStore)
			.bind('jStore-ready', function(engine){
				$.jStore.isReady = true;
				if ($.jStore.defaults.autoload) engine.connect();
			})
			.bind('flash-ready', function(){
				$.jStore.isFlashReady = true;
			}),
		// Enable ready callback for jStore
		ready: function(callback){
			if ($.jStore.isReady) callback.apply($.jStore, [$.jStore.CurrentEngine]);
			else $.jStore.delegate.bind('jStore-ready', callback);
		},
		// Enable failure callback registration for jStore
		fail: function(callback){
			$.jStore.delegate.bind('jStore-failure', callback);
		},
		// Enable ready callback for Flash
		flashReady: function(callback){
			if ($.jStore.isFlashReady) callback.apply($.jStore, [$.jStore.CurrentEngine]);
			else $.jStore.delegate.bind('flash-ready', callback);
		},
		// Enable and test an engine
		use: function(engine, project, identifier){
			project = project || $.jStore.defaults.project || location.hostname.replace(/\./g, '-') || 'unknown';
		
			var e = $.jStore.Engines[engine.toLowerCase()] || null,
				name = (identifier ? identifier + '.' : '') + project + '.' + engine;
		
			if ( !e ) throw 'JSTORE_ENGINE_UNDEFINED';

			// Instanciate the engine
			e = new e(project, name);
		
			// Prevent against naming conflicts
			if ($.jStore.Instances[name]) throw 'JSTORE_JRI_CONFLICT';
		
			// Test the engine
			if (e.isAvailable()){
				$.jStore.Instances[name] = e;	// The Easy Way
				if (!$.jStore.CurrentEngine){
					$.jStore.CurrentEngine = e;
				}
				$.jStore.delegate.trigger('jStore-ready', e);
			} else {
				if (!e.autoload)				// Not available
					throw 'JSTORE_ENGINE_UNAVILABLE';
				else { 							// The hard way
					e.included(function(){
						if (this.isAvailable()) { // Worked out
							$.jStore.Instances[name] = this;
							// If there is no current engine, use this one
							if (!$.jStore.CurrentEngine){
								$.jStore.CurrentEngine = this;
							} 
							$.jStore.delegate.trigger('jStore-ready', this);
						}
						else $.jStore.delegate.trigger('jStore-failure', this);
					}).include();
				}
			}
		},
		// Set the current storage engine
		setCurrentEngine: function(name){
			if (!$.jStore.Instances.length )				// If no instances exist, attempt to load one
				return $.jStore.FindEngine();
			
			if (!name && $.jStore.Instances.length >= 1) { // If no name is specified, use the first engine
				$.jStore.delegate.trigger('jStore-ready', $.jStore.Instances[0]);
				return $.jStore.CurrentEngine = $.jStore.Instances[0];
			}
			
			if (name && $.jStore.Instances[name]) { // If a name is specified and exists, use it
				$.jStore.delegate.trigger('jStore-ready', $.jStore.Instances[name]);
				return $.jStore.CurrentEngine = $.jStore.Instances[name];
			}
		
			throw 'JSTORE_JRI_NO_MATCH';
		},
		// Test all possible engines for straightforward useability
		FindEngine: function(){
			$.each($.jStore.EngineOrder, function(k){
				if ($.jStore.Availability[this]()){ // Find the first, easiest option and use it.
					$.jStore.use(this, $.jStore.defaults.project, 'default');
					return false;
				}
			})
		},
		// Provide a way for users to call for auto-loading
		load: function(){
			if ($.jStore.defaults.engine)
				return $.jStore.use($.jStore.defaults.engine, $.jStore.defaults.project, 'default');
			
			// Attempt to find a valid engine, and catch any exceptions if we can't
			try {
				$.jStore.FindEngine();
			} catch (e) {}
		},
		// Parse a value as JSON before its stored.
		safeStore: function(value){
			switch (typeof value){
				case 'object': case 'function': return $.jStore.compactJSON(value);
				case 'number': case 'boolean': case 'string': case 'xml': return value;
				case 'undefined': default: return '';
			}
		},
		// Restores JSON'd values before returning
		safeResurrect: function(value){
			return rxJson.test(value) ? $.evalJSON(value) : value;
		},
		// Provide a simple interface for storing/getting values
		store: function(key, value){
			if (!$.jStore.CurrentEngine) return false;
		
			if ( !value ) // Executing a get command
				return $.jStore.CurrentEngine.get(key);
			// Executing a set command
				return $.jStore.CurrentEngine.set(key, value);
		},
		// Provide a simple interface for removing values
		remove: function(key){
			if (!$.jStore.CurrentEngine) return false;
		
			return $.jStore.CurrentEngine.rem(key);
		},
		// Alias access for reading
		get: function(key){
			return $.jStore.store(key);
		},
		// Alias access for setting
		set: function(key, value){
			return $.jStore.store(key, value);
		}
	})
	
	// Extend the jQuery funcitonal object
	$.extend($.fn, {
		// Provide a chainable interface for storing values/getting a value at the end of a chain
		store: function(key, value){
			if (!$.jStore.CurrentEngine) return this;
		
			var result = $.jStore.store(key, value);
		
			return !value ? result : this;
		},
		// Provide a chainable interface for removing values
		removeStore: function(key){
			$.jStore.remove(key);
		
			return this;
		},
		// Alias access for reading at the end of a chain.
		getStore: function(key){
			return $.jStore.store(key);
		},
		// Alias access for setting on a chanin.
		setStore: function(key, value){
			$.jStore.store(key, value);
			return this;
		}
	})
	
})(jQuery);
/**
 * jStore Engine Core
 * Copyright (c) 2009 Eric Garside (http://eric.garside.name)
 */
(function($){
	
	this.StorageEngine = Class.extend({
		init: function(project, name){
			// Configure the project name
			this.project = project;
			// The JRI name given by the manager
			this.jri = name;
			// Cache the data so we can work synchronously
			this.data = {};
			// The maximum limit of the storage engine
			this.limit = -1;
			// Third party script includes
			this.includes = [];
			// Create an event delegate for users to subscribe to event triggers
			this.delegate = new jStoreDelegate(this)
				.bind('engine-ready', function(){
					this.isReady = true;
				})
				.bind('engine-included', function(){
					this.hasIncluded = true;
				});
			// If enabled, the manager will check availability, then run include(), then check again
			this.autoload = false; // This should be changed by the engines, if they have required includes
			// When set, we're ready to transact data
			this.isReady = false;
			// When the includer is finished, it will set this to true
			this.hasIncluded = false;
		},
		// Performs all necessary script includes
		include: function(){
			var self = this,
				total = this.includes.length,
				count = 0;
				
			$.each(this.includes, function(){
				$.ajax({type: 'get', url: this, dataType: 'script', cache: true, 
					success: function(){
						count++;
						if (count == total)	self.delegate.trigger('engine-included');
					}
				})
			});
		},
		// This should be overloaded with an actual functionality presence check
		isAvailable: function(){
			return false;
		},
		// All get/set/rem functions across the engines should add this to the
		// first line of those functions to prevent accessing the engine while unstable.
		interruptAccess: function(){
			if (!this.isReady) throw 'JSTORE_ENGINE_NOT_READY';
		},
		/** Event Subscription Shortcuts **/
		ready: function(callback){
			if (this.isReady) callback.apply(this);
			else this.delegate.bind('engine-ready', callback);
			return this;
		},
		included: function(callback){
			if (this.hasIncluded) callback.apply(this);
			else this.delegate.bind('engine-included', callback);
			return this;
		},
		/** Cache Data Access **/
		get: function(key){
			this.interruptAccess();
			return this.data[key] || null;
		},
		set: function(key, value){
			this.interruptAccess();
			this.data[key] = value;
			return value;
		},
		rem: function(key){
			this.interruptAccess();
			var beforeDelete = this.data[key];
			this.data[key] = null;
			return beforeDelete;			
		}
	});
	
})(jQuery);
