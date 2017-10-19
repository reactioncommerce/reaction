"use strict";
/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * @module base
 * @requires base/chains
 * @requires dcl
 */

var dcl = require( "dcl" );
var chains = require( "./chains" );

/**
 * @classdesc The base of all classes in the system, this is one of the few pure "classes" in core the of the system. It is a
 * pretty clean little class whose primary purpose is to surface the composition chains and a basis for storing
 * options on mixin and subclass instances. Options are handled at the instance rather than the prototype level
 * so that multiple instances don't compete for default values.
 *
 * @exports base
 * @constructor
 * @extends base/chains
 */
var Base = dcl( [chains], /** @lends base# */{
	declaredClass     : "Base",
	/**
	 * Add an option to a class. If any members of the hash already exist in `this.options`, they will be overwritten.
	 * @param {hash} options A hash of options you want to set
	 * @see {base#addDefaultOptions}
	 */
	addOptions        : function ( options ) {
		options = options || {};
		if ( this.options ) {options = sys.extend( {}, sys.result( this, 'options' ), options );}
		this.options = options;
	},
	/**
	 * Add a default option to a class. The default options are only set if there is not already a
	 * value for the option.
	 * @param {hash} options A hash of options you want to set
	 * @see {base#addOptions}
	 */
	addDefaultOptions : function ( options ) {
		options = options || {};
		if ( this.options ) {options = sys.defaults( {}, sys.result( this, 'options' ), options );}
		this.options = options;
	},

	/**
	 * Call this to close your object and dispose of all maintained resources. You can define this method on your
	 * own classes without having to call the superclass instance, however it is reccomended that you put
	 * all disposal code in `destroy()`. You must be disciplined about calling this on your instances.
	 * @see {base/chains#end}
	 * @see {base/chains#destroy}
	 */
	end : function () {
		this.destroy()
	},

	/**
	 * Called when it is time to get rid of all of your instance level references and objects and events. You can
	 * define this method on your own classes without having to call the superclass instance. It is called by
	 * `instance.end()` automatically
	 * @see {base/chains#end}
	 * @see {base/chains#destroy}
	 */
	destroy : function () {

	}


} );

Base.compose = dcl;
Base.mixin = dcl.mix;
module.exports = Base;
