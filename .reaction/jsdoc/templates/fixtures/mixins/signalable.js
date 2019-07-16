"use strict";
/**
 * @fileOverview Add the ability to fire signals on your objects. Signals are events, but hard coded into the object
 * and don't rely on strings like other events and `eventables`
 * @module mixins/signalable
 * @requires base
 * @requires signals
 * @requires base/logger
 */

var Base = require( "../base" );
var signals = require( 'signals' );
var format = require( "../strings/format" );
var sys = require( "lodash" );

/**
 * @typedef
 * @property {boolean=} memorize If Signal should keep record of previously dispatched parameters and automatically execute listener. Defaults to `false`
 * @property {array=} params Default parameters passed to listener during `Signal.raise`/`Signal.fire`/`Signal.trigger` and SignalBinding.execute. (curried parameters). Defaults to `null`
 * @property {object=} context When provided the signal will be raised in the context of this object. Defaults to `this` - the signal host
 * @name SignalOptions
 * @memberOf module:mixins/signalable
 * @example
 *
 *  signals:{
 *      opened: null,
 *      twisted: { memorize:true },
 *      applied: { memorize: false, params:[one, two] }
 *  }
 *
 *  // Setting the context initially can be a hassle, so this also supports a function that returns a hash
 *
 *  signals: function(){
 *      return {
 *      opened: null,
 *      twisted: { memorize:true },
 *      applied: { memorize: false, params:[one, two] },
 *      reversed: {context: someOtherRuntimeObject}
 *      };
 *  }
 *
 */

/**
 * @classDesc A signal that can be raised on an object. When you deploy the `Signalable` mixin, it
 * creates instances of these for you.
 *
 * @constructor
 * @param {?object} host If hosted, you can identify the host here.
 * @param {?string} name The name of the signal
 * @type module:mixins/signalable.SignalOptions
 */
var Signal = Base.compose( [Base, signals.Signal], /** @lends module:mixins/signalable~Signal# */{
	declaredClass : "mixins/Signal",

	constructor : function ( host, name, options ) {
		options = options || {};
		this.memorize = options.memorize === true;
		this.host = host;
		this.trigger = this.fire = this.raise = this.dispatch;
		this.name = name || sys.uniqueId( "signal" );
		this.params = options.params;
		this.defaultContext = options.context;
	},

	/**
	 * Cleans up
	 * @private
	 */
	destroy : function () {
		this.removeAll();
		this.dispose();
		this.host = null;
	},

	/**
	 * Ties a listener to a signal.
	 * @param {function} listener The function to call when the signal is raised
	 * @param {?object} listenerContext A context to set for the listener. The event host may set a default for this value, but you may override that here.
	 * @param {?number} priority A priority for the listener.
	 * @returns {SignalBinding}
	 */
	on       : function ( listener, listenerContext, priority ) {
		if ( sys.isNumber( listenerContext ) ) {
			priority = listenerContext;
			listenerContext = null;
		}
		listenerContext = listenerContext || this.defaultContext || this.host;
		var binding = this.add( listener, listenerContext, priority );
		if ( this.options.params ) {
			binding.params = this.arams;
		}
		return binding;
	},
	/**
	 * Ties a listener to for a signal for one execution.
	 * @param {function} listener The function to call when the signal is raised
	 * @param {?object} listenerContext A context to set for the listener. The event host may set a default for this value, but you may override that here.
	 * @param {?number} priority A priority for the listener.
	 * @returns {SignalBinding}
	 */
	once     : function ( listener, listenerContext, priority ) {
		if ( sys.isNumber( listenerContext ) ) {
			priority = listenerContext;
			listenerContext = null;
		}
		listenerContext = listenerContext || this.defaultContext || this.host;
		var binding = this.addOnce( listener, listenerContext, priority );
		if ( this.options.params ) {
			binding.params = this.params;
		}
		return binding;
	},
	/**
	 * Unbinds a listener to a signal.
	 * @param {function} listener The function to unbind
	 * @param {?object} listenerContext The context that was bound
	 * @returns {function}
	 */
	off      : function ( listener, listenerContext ) {
		listenerContext = listenerContext || this.host;
		return this.remove( listener, listenerContext );
	},
	/**
	 * Check if listener was attached to Signal.
	 * @param {function} listener The function to check
	 * @param {?object} listenerContext The context that was bound
	 * @returns {Boolean}
	 */
	has      : function ( listener, listenerContext ) {
		listenerContext = listenerContext || this.defaultContext || this.host;
		return this.remove( listener, listenerContext );
	},
	/**
	 * Strings!
	 */
	toString : function () {
		return  format( "{0}\nname:{1}\nlisteners:{2}",
			this.declaredClass,
			this.name,
			this.getNumListeners()
		);
	}

} );

/**
 * @classDesc Make an object capable of handling a signal. Or many signals.
 * @exports mixins/signalable
 * @mixin
 * @extends base
 */
var Signalable = Base.compose( [Base], /** @lends mixins/signalable# */{
	declaredClass : "mixins/Signalable",

	constructor    : function () {
		this.autoLoadSignals = this.autoLoadSignals || true;
		if ( this.autoLoadSignals === true ) {
			this._loadSignals();
		}
	},
	/**
	 * When you make a change to the signals hash after loading, then you can make it reload
	 */
	refreshSignals : function () {
		this._loadSignals();
	},

	/**
	 * Interprets the `signals` hash and instantiates it
	 * @private
	 */
	_loadSignals : function () {
		var signals = this.signals || {};
		sys.each( signals, function ( value, key ) {
			var opts = {};
			if ( !sys.isEmpty( value ) ) {
				if ( sys.isBoolean( value.memorize ) ) {
					opts.memorize = value.memorize;
				}
				if ( sys.isBoolean( value.params ) ) {
					opts.params = value.params;
				}
				if ( !sys.isEmpty( value.context ) ) {
					opts.context = value.context;
				}
			}
			this._addSignal( key, opts );
		} );
	},
	/**
	 * Creates a single signal
	 * @param {String} name The name of the signal
	 * @param {module:mixins/signalable~SignalOptions} options The options the signal expects
	 * @private
	 */
	_addSignal   : function ( name, options ) {
		if ( sys.isEmpty( this[name] ) ) {
			this[name] = new Signal( this, name, options );
		}
	},

	/**
	 * Add a signal to an object. If any members of the hash already exist in `this.signals`, they will be overwritten.
	 * @param {module:mixins/signalable.SignalOptions} signals
	 * @private
	 */
	_addSignals : function ( signals ) {
		signals = signals || {};
		if ( this.options ) {signals = sys.extend( {}, sys.result( this, 'signals' ), signals );}
		this.signals = signals;
	},
	/**
	 * Clean up
	 * @private
	 */
	destroy     : function () {
		sys.each( sys.keys( this ), function ( key ) {
			if ( this[key] instanceof Signal || this[key] instanceof signals.Signal ) {
				this[key].close();
			}
		}, this );
	}
} );

module.exports = Signalable;
alable.Signal = Signal;
Signalable.mixin = Base.mixin;

/**
 * When true, the class will load the `signals` hash and create the signal definitions during construction
 * @memberOf mixins/signalable#
 * @name autoLoadSignals
 * @type boolean
 */


/**
 * A hash of signals to create automatically. Each definition consists of a name for the signal as the key
 * and then a hash of options (nullable) for each signal
 * @type {hash|function():hash}
 * @memberOf mixins/signalable#
 * @name signals
 * @type module:mixins/signalable.SignalOptions
 */
