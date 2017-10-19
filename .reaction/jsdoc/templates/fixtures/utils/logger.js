"use strict";
/**
 * @fileOverview The logging system for papyrus is based on [http://pimterry.github.io/loglevel/](loglevel) and slightly decorated
 * @module utils/logger
 * @requires dcl
 * @requires loglevel
 */

var dcl = require( "dcl" );
var log = require( 'loglevel' );

/**
 * A logger class that you can mix into your classes to handle logging settings and state at an object level.
 * See {@link utils/logger} for the members of this class
 *
 * @exports utils/logger.Logger
 * @class
 * @see utils/logger
 */
var Logger = dcl( null, /** @lends  utils/logger.Logger# */{
	declaredClass : "utils/Logger",

	/**
	 * Turn off all logging. If you log something, it will not error, but will not do anything either
	 * and the cycles are minimal.
	 *
	 */
	silent : function () {
		log.disableAll();
	},
	/**
	 * Turns on all logging levels
	 *
	 */
	all    : function () {
		log.enableAll();
	},
	/**
	 * Sets the logging level to one of `trace`, `debug`, `info`, `warn`, `error`.
	 * @param {string} lvl The level to set it to. Can be  one of `trace`, `debug`, `info`, `warn`, `error`.
	 *
	 */
	level  : function ( lvl ) {
		if ( lvl.toLowerCase() === "none" ) {
			log.disableAll();
		} else {
			log.setLevel( lvl );
		}
	},
	/**
	 * Log a `trace` call
	 * @method
	 * @param {string} The value to log
	 */
	trace  : log.trace,
	/**
	 * Log a `debug` call
	 * @method
	 * @param {string} The value to log
	 */
	debug  : log.debug,
	/**
	 * Log a `info` call
	 * @method
	 * @param {string} The value to log
	 */
	info   : log.info,
	/**
	 * Log a `warn` call
	 * @method
	 * @param {string} The value to log
	 */
	warn   : log.warn,
	/**
	 * Log a `error` call
	 * @method
	 * @param {string} The value to log
	 */
	error  : log.error
} );

module.exports = new Logger();
/**
 * The system global, cross-platform logger
 * @name utils/logger
 * @static
 * @type {utils/logger.Logger}
 */
module.exports.Logger = Logger;
