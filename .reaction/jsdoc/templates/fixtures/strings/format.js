"use strict";
/**
 * @fileOverview String helper methods
 *
 * @module strings/format
 */

/**
 * Format a string quickly and easily using .net style format strings
 * @param {String} format A string format like "Hello {0}, now take off your {1}!"
 * @param {...?} args One argument per `{}` in the string, positionally replaced
 * @returns {String}
 *
 * @example
 * var strings = require("papyrus/strings");
 * var s = strings.format("Hello {0}", "Madame Vastra");
 * // s = "Hello Madame Vastra"
 *
 * @example {@lang xml}
 * <span>
 *      <%= strings.format("Hello {0}", "Madame Vastra") %>
 * </span>
 */
module.exports = function ( format ) {
	var args = Array.prototype.slice.call( arguments, 1 );
	return format.replace( /{(\d+)}/g, function ( match, number ) {
		return typeof args[number] != 'undefined'
			? args[number]
			: match
			;
	} );
};
