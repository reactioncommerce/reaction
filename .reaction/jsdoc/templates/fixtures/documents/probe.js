"use strict";
/**
 @fileOverview Queries objects in memory using a mongo-like notation for reaching into objects and filtering for records

 @module documents/probe
 @author Terry Weiss
 @license MIT
 @requires lodash
 */

var sys = require( "lodash" );
/**
 The list of operators that are nested within the expression object. These take the form <code>{path:{operator:operand}}</code>
 @private
 @type {array.<string>}
 **/
var nestedOps = ["$eq", "$gt", "$gte", "$in", "$lt", "$lte", "$ne", "$nin", "$exists", "$mod", "$size", "$all"];

/**
 The list of operators that prefix the expression object. These take the form <code>{operator:{operands}}</code> or <code>{operator: [operands]}</code>
 @private
 @type {array.<string>}
 **/
var prefixOps = ["$and", "$or", "$nor", "$not"];

/**
 Processes a nested operator by picking the operator out of the expression object. Returns a formatted object that can be used for querying
 @private
 @param {string} path The path to element to work with
 @param {object} operand The operands to use for the query
 @return {object} A formatted operation definition
 **/
function processNestedOperator( path, operand ) {
	var opKeys = Object.keys( operand );
	return {
		operation : opKeys[ 0 ],
		operands  : [operand[ opKeys[ 0 ] ]],
		path      : path
	};
}

/**
 Interrogates a single query expression object and calls the appropriate handler for its contents
 @private
 @param {object} val The expression
 @param {object} key The prefix
 @returns {object} A formatted operation definition
 **/
function processExpressionObject( val, key ) {
	var operator;
	if ( sys.isObject( val ) ) {
		var opKeys = Object.keys( val );
		var op = opKeys[ 0 ];

		if ( sys.indexOf( nestedOps, op ) > -1 ) {
			operator = processNestedOperator( key, val );
		} else if ( sys.indexOf( prefixOps, key ) > -1 ) {
			operator = processPrefixOperator( key, val );
		} else if ( op === "$regex" ) {
			// special handling for regex options
			operator = processNestedOperator( key, val );
		} else if ( op === "$elemMatch" ) {
			// elemMatch is just a weird duck
			operator = {
				path      : key,
				operation : op,
				operands  : []
			};
			sys.each( val[ op ], function ( entry ) {
				operator.operands = parseQueryExpression( entry );
			} );
		}
		else {
			throw new Error( "Unrecognized operator" );
		}
	} else {
		operator = processNestedOperator( key, { $eq : val } );
	}
	return operator;
}

/**
 Processes a prefixed operator and then passes control to the nested operator method to pick out the contained values
 @private
 @param {string} operation The operation prefix
 @param {object} operand The operands to use for the query
 @return {object} A formatted operation definition
 **/
function processPrefixOperator( operation, operand ) {
	var component = {
		operation : operation,
		path      : null,
		operands  : []
	};

	if ( sys.isArray( operand ) ) {
		//if it is an array we need to loop through the array and parse each operand
		//if it is an array we need to loop through the array and parse each operand
		sys.each( operand, function ( obj ) {
			sys.each( obj, function ( val, key ) {
				component.operands.push( processExpressionObject( val, key ) );
			} );
		} );
	} else {
		//otherwise it is an object and we can parse it directly
		sys.each( operand, function ( val, key ) {
			component.operands.push( processExpressionObject( val, key ) );
		} );
	}
	return component;

}

/**
 Parses a query request and builds an object that can used to process a query target
 @private
 @param {object} obj The expression object
 @returns {object} All components of the expression in a kind of execution tree
 **/

function parseQueryExpression( obj ) {
	if ( sys.size( obj ) > 1 ) {
		var arr = sys.map( obj, function ( v, k ) {
			var entry = {};
			entry[k] = v;
			return entry;
		} );
		obj = {
			$and : arr
		};
	}
	var payload = [];
	sys.each( obj, function ( val, key ) {

		var exprObj = processExpressionObject( val, key );

		if ( exprObj.operation === "$regex" ) {
			exprObj.options = val.$options;
		}

		payload.push( exprObj );
	} );

	return payload;
}

/**
 The delimiter to use when splitting an expression
 @type {string}
 @static
 @default '.'
 **/

exports.delimiter = '.';

/**
 Splits a path expression into its component parts
 @private
 @param {string} path The path to split
 @returns {array}
 **/

function splitPath( path ) {
	return path.split( exports.delimiter );
}

/**
 Reaches into an object and allows you to get at a value deeply nested in an object
 @private
 @param {array} path The split path of the element to work with
 @param {object} record The record to reach into
 @return {*} Whatever was found in the record
 **/
function reachin( path, record ) {
	var context = record;
	var part;
	var _i;
	var _len;

	for ( _i = 0, _len = path.length; _i < _len; _i++ ) {
		part = path[_i];
		context = context[part];
		if ( sys.isNull( context ) || sys.isUndefined( context ) ) {
			break;
		}
	}

	return context;
}

/**
 This will write the value into a record at the path, creating intervening objects if they don't exist
 @private
 @param {array} path The split path of the element to work with
 @param {object} record The record to reach into
 @param {string} setter The set command, defaults to $set
 @param {object} newValue The value to write to the, or if the operator is $pull, the query of items to look for
 */
function pushin( path, record, setter, newValue ) {
	var context = record;
	var parent = record;
	var lastPart = null;
	var _i;
	var _len;
	var part;
	var keys;

	for ( _i = 0, _len = path.length; _i < _len; _i++ ) {
		part = path[_i];
		lastPart = part;
		parent = context;
		context = context[part];
		if ( sys.isNull( context ) || sys.isUndefined( context ) ) {
			parent[part] = {};
			context = parent[part];
		}
	}

	if ( sys.isEmpty( setter ) || setter === '$set' ) {
		parent[lastPart] = newValue;
		return parent[lastPart];
	} else {
		switch ( setter ) {
			case '$inc':
				/**
				 * Increments a field by the amount you specify. It takes the form
				 * `{ $inc: { field1: amount } }`
				 * @name $inc
				 * @memberOf module:documents/probe.updateOperators
				 * @example
				 * var probe = require("documents/probe");
				 * probe.update( obj, {'name.last' : 'Owen', 'name.first' : 'LeRoy'},
				 * {$inc : {'password.changes' : 2}} );
				 */

				if ( !sys.isNumber( newValue ) ) {
					newValue = 1;
				}
				if ( sys.isNumber( parent[lastPart] ) ) {
					parent[lastPart] = parent[lastPart] + newValue;
					return parent[lastPart];
				}
				break;
			case '$dec':
				/**
				 * Decrements a field by the amount you specify. It takes the form
				 * `{ $dec: { field1: amount }`
                 * @name $dec
				 * @memberOf module:documents/probe.updateOperators
				 * @example
				 *  var probe = require("documents/probe");
				 * probe.update( obj, {'name.last' : 'Owen', 'name.first' : 'LeRoy'},
				 * {$dec : {'password.changes' : 2}} );
				 */

				if ( !sys.isNumber( newValue ) ) {
					newValue = 1;
				}
				if ( sys.isNumber( parent[lastPart] ) ) {
					parent[lastPart] = parent[lastPart] - newValue;
					return parent[lastPart];
				}
				break;
			case '$unset':
				/**
				 * Removes the field from the object. It takes the form
				 * `{ $unset: { field1: "" } }`
				 * @name $unset
				 * @memberOf module:documents/probe.updateOperators
				 * @example
				 * var probe = require("documents/probe");
				 * probe.update( data, {'name.first' : 'Yogi'}, {$unset : {'name.first' : ''}} );
				 */

				return delete parent[lastPart];
			case '$pop':
				/**
				 * The $pop operator removes the first or last element of an array. Pass $pop a value of 1 to remove the last element
				 * in an array and a value of -1 to remove the first element of an array. This will only work on arrays. Syntax:
				 * `{ $pop: { field: 1 } }` or `{ $pop: { field: -1 } }`
				 * @name $pop
				 * @memberOf module:documents/probe.updateOperators
				 * @example
				 * var probe = require("documents/probe");
				 * // attr is the name of the array field
				 * probe.update( data, {_id : '511d18827da2b88b09000133'}, {$pop : {attr : 1}} );
				 */

				if ( sys.isArray( parent[lastPart] ) ) {
					if ( !sys.isNumber( newValue ) ) {
						newValue = 1;
					}
					if ( newValue === 1 ) {
						return parent[lastPart].pop();
					} else {
						return parent[lastPart].shift();
					}
				}
				break;
			case '$push':
				/**
				 * The $push operator appends a specified value to an array. It looks like this:
				 * `{ $push: { <field>: <value> } }`
				 * @name $push
				 * @memberOf module:documents/probe.updateOperators
				 * @example
				 * var probe = require("documents/probe");
				 * // attr is the name of the array field
				 * probe.update( data, {_id : '511d18827da2b88b09000133'},
				 * {$push : {attr : {"hand" : "new", "color" : "new"}}} );
				 */

				if ( sys.isArray( parent[lastPart] ) ) {
					return parent[lastPart].push( newValue );
				}
				break;
			case '$pull':
				/**
				 * The $pull operator removes all instances of a value from an existing array. It looks like this:
				 * `{ $pull: { field: <query> } }`
				 * @name $pull
				 * @memberOf module:documents/probe.updateOperators
				 * @example
				 * var probe = require("documents/probe");
				 * // attr is the name of the array field
				 * probe.update( data, {'email' : 'EWallace.43@fauxprisons.com'},
				 * {$pull : {attr : {"color" : "green"}}} );
				 */

				if ( sys.isArray( parent[lastPart] ) ) {
					keys = exports.findKeys( parent[lastPart], newValue );
					sys.each( keys, function ( val, index ) {
						return delete parent[lastPart][index];
					} );
					parent[lastPart] = sys.compact( parent[lastPart] );
					return parent[lastPart];
				}
		}
	}
}

/**
 The query operations that evaluate directly from an operation
 @private
 **/
var operations = {
	/**
	 * `$eq` performs a `===` comparison by comparing the value directly if it is an atomic value.
	 * otherwise if it is an array, it checks to see if the value looked for is in the array.
	 * `{field: value}` or `{field: {$eq : value}}` or `{array: value}` or `{array: {$eq : value}}`
	 * @name $eq
	 * @memberOf module:documents/probe.queryOperators
	 * @example
	 * var probe = require("documents/probe");
	 * probe.find( data, {categories : "cat1"} );
	 * // is the same as
	 * probe.find( data, {categories : {$eq: "cat1"}} );
	 */

	$eq        : function ( qu, value ) {
		if ( sys.isArray( value ) ) {
			return sys.find( value, function ( entry ) {
				return JSON.stringify( qu.operands[0] ) === JSON.stringify( entry );
			} ) !== void 0;
		} else {
			return JSON.stringify( qu.operands[0] ) === JSON.stringify( value );
		}
	},
	/**
	 *  `$ne` performs a `!==` comparison by comparing the value directly if it is an atomic value. Otherwise, if it is an array
	 * this is performs a "not in array".
	 * '{field: {$ne : value}}` or '{array: {$ne : value}}`
	 * @name $ne
	 * @memberOf module:documents/probe.queryOperators
	 * @example
	 * var probe = require("documents/probe");
	 * probe.find( data, {"name.first" : {$ne : "Sheryl"}} );
	 */

	$ne        : function ( qu, value ) {
		if ( sys.isArray( value ) ) {
			return sys.find( value, function ( entry ) {
				return JSON.stringify( qu.operands[0] ) !== JSON.stringify( entry );
			} ) !== void 0;
		} else {
			return JSON.stringify( qu.operands[0] ) !== JSON.stringify( value );
		}
	},
	/**
	 * `$all` checks to see if all of the members of the query are included in an array
	 * `{array: {$all: [val1, val2, val3]}}`
	 * @name $all
	 * @memberOf module:documents/probe.queryOperators
	 * @example
	 * var probe = require("documents/probe");
	 * probe.find( data, {"categories" : {$all : ["cat4", "cat2", "cat1"]}} );
	 */

	$all       : function ( qu, value ) {
		var operands, result;

		result = false;
		if ( sys.isArray( value ) ) {
			operands = sys.flatten( qu.operands );
			result = sys.intersection( operands, value ).length === operands.length;
		}
		return result;
	},
	/**
	 * `$gt` Sees if a field is greater than the value
	 * `{field: {$gt: value}}`
	 * @name $gt
	 * @memberOf module:documents/probe.queryOperators
	 * @example
	 * var probe = require("documents/probe");
	 * probe.find( data, {"age" : {$gt : 24}} );
	 */

	$gt        : function ( qu, value ) {
		return qu.operands[0] < value;
	},
	/**
	 * `$gte` Sees if a field is greater than or equal to the value
	 * `{field: {$gte: value}}`
	 * @name $gte
	 * @memberOf module:documents/probe.queryOperators
	 * @example
	 * var probe = require("documents/probe");
	 * probe.find( data, {"age" : {$gte : 50}} );
	 */

	$gte       : function ( qu, value ) {
		return qu.operands[0] <= value;
	},
	/**
	 * `$lt` Sees if a field is less than the value
	 * `{field: {$lt: value}}`
	 * @name $lt
	 * @memberOf module:documents/probe.queryOperators
	 * @example
	 * var probe = require("documents/probe");
	 * probe.find( data, {"age" : {$lt : 24}} );
	 */

	$lt        : function ( qu, value ) {
		return qu.operands[0] > value;
	},
	/**
	 * `$lte` Sees if a field is less than or equal to the value
	 * `{field: {$lte: value}}`
	 * @name $lte
	 * @memberOf module:documents/probe.queryOperators
	 * @example
	 * var probe = require("documents/probe");
	 * probe.find( data, {"age" : {$lte : 50}} );
	 */

	$lte       : function ( qu, value ) {
		return qu.operands[0] >= value;
	},
	/**
	 * `$in` Sees if a field has one of the values in the query
	 * `{field: {$in: [test1, test2, test3,...]}}`
	 * @name $in
	 * @memberOf module:documents/probe.queryOperators
	 * @example
	 * var probe = require("documents/probe");
	 * probe.find( data, {"age" : {$in : [24, 28, 60]}} );
	 */

	$in        : function ( qu, value ) {
		var operands;

		operands = sys.flatten( qu.operands );
		return sys.indexOf( operands, value ) > -1;
	},
	/**
	 * `$nin` Sees if a field has none of the values in the query
	 * `{field: {$nin: [test1, test2, test3,...]}}`
	 * @name $nin
	 * @memberOf module:documents/probe.queryOperators
	 * @example
	 * var probe = require("documents/probe");
	 * probe.find( data, {"age" : {$nin : [24, 28, 60]}} );
	 */

	$nin       : function ( qu, value ) {
		var operands;

		operands = sys.flatten( qu.operands );
		return sys.indexOf( operands, value ) === -1;
	},
	/**
	 * `$exists` Sees if a field exists.
	 * `{field: {$exists: true|false}}`
	 * @name $exists
	 * @memberOf module:documents/probe.queryOperators
	 * @example
	 * var probe = require("documents/probe");
	 * probe.find( data, {"name.middle" : {$exists : true}} );
	 */

	$exists    : function ( qu, value ) {
		return (sys.isNull( value ) || sys.isUndefined( value )) !== qu.operands[0];
	},
	/**
	 * Checks equality to a modulus operation on a field
	 * `{field: {$mod: [divisor, remainder]}}`
	 * @name $mod
	 * @memberOf module:documents/probe.queryOperators
	 * @example
	 * var probe = require("documents/probe");
	 * probe.find( data, {"age" : {$mod : [2, 0]}} );
	 */

	$mod       : function ( qu, value ) {
		var operands = sys.flatten( qu.operands );
		if ( operands.length !== 2 ) {
			throw new Error( "$mod requires two operands" );
		}
		var mod = operands[0];
		var rem = operands[1];
		return value % mod === rem;
	},
	/**
	 * Compares the size of the field/array to the query. This can be used on arrays, strings and objects (where it will count keys)
	 * `{'field|array`: {$size: value}}`
	 * @name $size
	 * @memberOf module:documents/probe.queryOperators
	 * @example
	 * var probe = require("documents/probe");
	 * probe.find( data, {attr : {$size : 3}} );
	 */

	$size      : function ( qu, value ) {
		return sys.size( value ) === qu.operands[0];
	},
	/**
	 * Performs a regular expression test againts the field
	 * `{field: {$regex: re, $options: reOptions}}`
	 * @name $regex
	 * @memberOf module:documents/probe.queryOperators
	 * @example
	 * var probe = require("documents/probe");
	 * probe.find( data, {"name.first" : {$regex : "m*", $options : "i"}} );
	 */

	$regex     : function ( qu, value ) {
		var r = new RegExp( qu.operands[0], qu.options );
		return r.test( value );
	},
	/**
	 * This is like $all except that it works with an array of objects or value. It checks to see the array matches all
	 * of the conditions of the query
	 * `{array: {$elemMatch: {path: value, path: {$operation: value2}}}`
     * @name $elemMatch
	 * @memberOf module:documents/probe.queryOperators
	 * @example
	 * var probe = require("documents/probe");
	 * probe.find( data, {attr : {$elemMatch : [
     *  {color : "red", "hand" : "left"}
     * ]}} );
	 */
	$elemMatch : function ( qu, value ) {
		var expression, test, _i, _len;

		if ( sys.isArray( value ) ) {
			var _ref = qu.operands;
			for ( _i = 0, _len = _ref.length; _i < _len; _i++ ) {
				expression = _ref[_i];
				if ( expression.path ) {
					expression.splitPath = splitPath( expression.path );
				}
			}
			test = execQuery( value, qu.operands, null, true ).arrayResults;
		}
		return test.length > 0;
	},
	/**
	 * Returns true if all of the conditions of the query are met
	 * `{$and: [query1, query2, query3]}`
	 * @name $and
	 * @memberOf module:documents/probe.queryOperators
	 * @example
	 * var probe = require("documents/probe");
	 * probe.find( data, {$and : [
     *      {"name.first" : "Mildred"},
     *      {"name.last" : "Graves"}
     * ]} );
	 */

	$and       : function ( qu, value, record ) {
		var isAnd = false;

		sys.each( qu.operands, function ( expr ) {
			if ( expr.path ) {
				expr.splitPath = expr.splitPath || splitPath( expr.path );
			}
			var test = reachin( expr.splitPath, record, expr.operation );
			isAnd = operations[expr.operation]( expr, test, record );
			if ( !isAnd ) {
				return false;
			}
		} );

		return isAnd;
	},
	/**
	 * Returns true if any of the conditions of the query are met
	 * `{$or: [query1, query2, query3]}`
	 * @name $or
	 * @memberOf module:documents/probe.queryOperators
	 * @example
	 * var probe = require("documents/probe");
	 * probe.find( data, {$or : [
     *      "age" : {$in : [24, 28, 60]}},
	 *      {categories : "cat1"}
	 * ]} );
	 */
	$or        : function ( qu, value, record ) {
		var isOr = false;
		sys.each( qu.operands, function ( expr ) {
			if ( expr.path ) {
				expr.splitPath = expr.splitPath || splitPath( expr.path );
			}
			var test = reachin( expr.splitPath, record, expr.operation );
			isOr = operations[expr.operation]( expr, test, record );
			if ( isOr ) {
				return false;
			}
		} );

		return isOr;
	},
	/**
	 * Returns true if none of the conditions of the query are met
	 * `{$nor: [query1, query2, query3]}`
	 * @name $nor
	 * @memberOf module:documents/probe.queryOperators
	 * @example
	 * var probe = require("documents/probe");
	 * probe.find( data, {$nor : [
     *      {"age" : {$in : [24, 28, 60]}},
     *      {categories : "cat1"}
     * ]} );
	 */
	$nor       : function ( qu, value, record ) {
		var isOr = false;
		sys.each( qu.operands, function ( expr ) {
			if ( expr.path ) {
				expr.splitPath = expr.splitPath || splitPath( expr.path );
			}
			var test = reachin( expr.splitPath, record, expr.operation );
			isOr = operations[expr.operation]( expr, test, record );
			if ( isOr ) {
				return false;
			}
		} );

		return !isOr;
	},
	/**
	 * Logical NOT on the conditions of the query
	 * `{$not: [query1, query2, query3]}`
	 * @name $not
	 * @memberOf module:documents/probe.queryOperators
	 * @example
	 * var probe = require("documents/probe");
	 * probe.find( data, {$not : {"age" : {$lt : 24}}} );
	 */
	$not       : function ( qu, value, record ) {

		var result = false;
		sys.each( qu.operands, function ( expr ) {
			if ( expr.path ) {
				expr.splitPath = expr.splitPath || splitPath( expr.path );
			}
			var test = reachin( expr.splitPath, record, expr.operation );
			result = operations[expr.operation]( expr, test, record );
			if ( result ) {
				return false;
			}
		} );

		return !result;

	}
};

/**
 Executes a query by traversing a document and evaluating each record
 @private
 @param {array|object} obj The object to query
 @param {object} qu The query to execute
 @param {?boolean} shortCircuit When true, the condition that matches the query stops evaluation for that record, otherwise all conditions have to be met
 @param {?boolean} stopOnFirst When true all evaluation stops after the first record is found to match the conditons
 **/
function execQuery( obj, qu, shortCircuit, stopOnFirst ) {
	var arrayResults = [];
	var keyResults = [];
	sys.each( obj, function ( record, key ) {
		var expr, result, test, _i, _len;

		for ( _i = 0, _len = qu.length; _i < _len; _i++ ) {
			expr = qu[_i];
			if ( expr.splitPath ) {
				test = reachin( expr.splitPath, record, expr.operation );
			}
			result = operations[expr.operation]( expr, test, record );
			if ( result ) {
				arrayResults.push( record );
				keyResults.push( key );
			}
			if ( !result && shortCircuit ) {
				break;
			}
		}
		if ( arrayResults.length > 0 && stopOnFirst ) {
			return false;
		}
	} );
	return {
		arrayResults : arrayResults,
		keyResults   : keyResults
	};
}

/**
 Updates all records in obj that match the query. See {@link module:documents/probe.updateOperators} for the operators that are supported.
 @param {object|array} obj The object to update
 @param {object} qu The query which will be used to identify the records to updated
 @param {object} setDocument The update operator. See {@link module:documents/probe.updateOperators}
 */
exports.update = function ( obj, qu, setDocument ) {
	var records = exports.find( obj, qu );
	return sys.each( records, function ( record ) {
		return sys.each( setDocument, function ( fields, operator ) {
			return sys.each( fields, function ( newValue, path ) {
				return pushin( splitPath( path ), record, operator, newValue );
			} );
		} );
	} );
};
/**
 Find all records that match a query
 @param {array|object} obj The object to query
 @param {object} qu The query to execute. See {@link module:documents/probe.queryOperators} for the operators you can use.
 @returns {array} The results
 **/
exports.find = function ( obj, qu ) {
	var expression, _i, _len;

	var query = parseQueryExpression( qu );
	for ( _i = 0, _len = query.length; _i < _len; _i++ ) {
		expression = query[_i];
		if ( expression.path ) {
			expression.splitPath = splitPath( expression.path );
		}
	}
	return execQuery( obj, query ).arrayResults;
};
/**
 Find all records that match a query and returns the keys for those items. This is similar to {@link module:documents/probe.find} but instead of returning
 records, returns the keys. If `obj` is an object it will return the hash key. If 'obj' is an array, it will return the index
 @param {array|object} obj The object to query
 @param {object} qu The query to execute. See {@link module:documents/probe.queryOperators} for the operators you can use.
 @returns {array}
 */
exports.findKeys = function ( obj, qu ) {
	var expression, _i, _len;

	var query = parseQueryExpression( qu );
	for ( _i = 0, _len = query.length; _i < _len; _i++ ) {
		expression = query[_i];
		if ( expression.path ) {
			expression.splitPath = splitPath( expression.path );
		}
	}
	return execQuery( obj, query ).keyResults;
};

/**
 Returns the first record that matches the query. Aliased as `seek`.
 @param {array|object} obj The object to query
 @param {object} qu The query to execute. See {@link module:documents/probe.queryOperators} for the operators you can use.
 @returns {object}
 */
exports.findOne = function ( obj, qu ) {
	var expression, _i, _len;

	var query = parseQueryExpression( qu );
	for ( _i = 0, _len = query.length; _i < _len; _i++ ) {
		expression = query[_i];
		if ( expression.path ) {
			expression.splitPath = splitPath( expression.path );
		}
	}
	var results = execQuery( obj, query, false, true ).arrayResults;
	if ( results.length > 0 ) {
		return results[0];
	} else {
		return null;
	}
};
exports.seek = exports.findOne;
/**
 Returns the first record that matches the query and returns its key or index depending on whether `obj` is an object or array respectively.
 Aliased as `seekKey`.
 @param {array|object} obj The object to query
 @param {object} qu The query to execute. See {@link module:documents/probe.queryOperators} for the operators you can use.
 @returns {object}
 */
exports.findOneKey = function ( obj, qu ) {
	var expression, _i, _len;

	var query = parseQueryExpression( qu );
	for ( _i = 0, _len = query.length; _i < _len; _i++ ) {
		expression = query[_i];
		if ( expression.path ) {
			expression.splitPath = splitPath( expression.path );
		}
	}
	var results = execQuery( obj, query, false, true ).keyResults;
	if ( results.length > 0 ) {
		return results[0];
	} else {
		return null;
	}
};
exports.seekKey = exports.findOneKey;

/**
 Remove all items in the object/array that match the query
 @param {array|object} obj The object to query
 @param {object} qu The query to execute. See {@link module:documents/probe.queryOperators} for the operators you can use.
 @return {object|array} The array or object as appropriate without the records.
 **/
exports.remove = function ( obj, qu ) {
	var expression, _i, _len;

	var query = parseQueryExpression( qu );
	for ( _i = 0, _len = query.length; _i < _len; _i++ ) {
		expression = query[_i];
		if ( expression.path ) {
			expression.splitPath = splitPath( expression.path );
		}
	}
	var results = execQuery( obj, query, false, false ).keyResults;
	if ( sys.isArray( obj ) ) {
		var newArr = [];
		sys.each( obj, function ( item, index ) {
			if ( sys.indexOf( results, index ) === -1 ) {
				return newArr.push( item );
			}
		} );
		return newArr;
	} else {
		sys.each( results, function ( key ) {
			return delete obj[key];
		} );
		return obj;
	}
};
/**
 Returns true if all items match the query

 @param {array|object} obj The object to query
 @param {object} qu The query to execute. See {@link module:documents/probe.queryOperators} for the operators you can use.
 @returns {boolean}
 **/
exports.all = function ( obj, qu ) {
	return exports.find( obj, qu ).length === sys.size( obj );
};

/**
 Returns true if any of the items match the query

 @param {array|object} obj The object to query
 @param {object} qu The query to execute. See {@link module:documents/probe.queryOperators} for the operators you can use.
 @returns {boolean}
 **/
exports.any = function ( obj, qu ) {
	var expression, _i, _len;

	var query = parseQueryExpression( qu );
	for ( _i = 0, _len = query.length; _i < _len; _i++ ) {
		expression = query[_i];
		if ( expression.path ) {
			expression.splitPath = splitPath( expression.path );
		}
	}
	var results = execQuery( obj, query, true, true ).keyResults;
	return results.length > 0;
};

/**
 Returns the set of unique records that match a query
 @param {array|object} obj The object to query
 @param {object} qu The query to execute. See {@link module:documents/probe.queryOperators} for the operators you can use.
 @return {array}
 **/
exports.unique = function ( obj, qu ) {
	var test = exports.find( obj, qu );
	return sys.unique( test, function ( item ) {
		return JSON.stringify( item );
	} );
};

/**
 This will write the value into a record at the path, creating intervening objects if they don't exist. This does not work as filtered
 update and is meant to be used on a single record. It is a nice way of setting a property at an arbitrary depth at will.

 @param {array} path The split path of the element to work with
 @param {object} record The record to reach into
 @param {string} setter The set operation.  See {@link module:documents/probe.updateOperators} for the operators you can use.
 @param {object} newValue The value to write to the, or if the operator is $pull, the query of items to look for
 */
exports.set = function ( record, path, setter, newValue ) {
	return pushin( splitPath( path ), record, setter, newValue );
};

/**
 Reaches into an object and allows you to get at a value deeply nested in an object. This is not a query, but a
 straight reach in, useful for event bindings

 @param {array} path The split path of the element to work with
 @param {object} record The record to reach into
 @return {*} Whatever was found in the record
 **/
exports.get = function ( record, path ) {
	return reachin( splitPath( path ), record );
};

/**
 Returns true if any of the items match the query. Aliases as `any`
 @function
 @param {array|object} obj The object to query
 @param {object} qu The query to execute
 @returns {boolean}
 */
exports.some = exports.any;

/**
 Returns true if all items match the query. Aliases as `all`
 @function
 @param {array|object} obj The object to query
 @param {object} qu The query to execute
 @returns {boolean}
 */
exports.every = exports.all;

var bindables = {
	any        : exports.any,
	all        : exports.all,
	remove     : exports.remove,
	seekKey    : exports.seekKey,
	seek       : exports.seek,
	findOneKey : exports.findOneKey,
	findOne    : exports.findOne,
	findKeys   : exports.findKeys,
	find       : exports.find,
	update     : exports.update,
	some       : exports.some,
	every      : exports.every,
	"get"      : exports.get,
	"set"      : exports.set
};

/**
 Binds the query and update methods to a new object. When called these
 methods can skip the first parameter so that find(object, query) can just be called as find(query)
 @param {object|array} obj The object or array to bind to
 @return {object} An object with method bindings in place
 **/
exports.proxy = function ( obj ) {
	var retVal;

	retVal = {};
	sys.each( bindables, function ( val, key ) {
		retVal[key] = sys.bind( val, obj, obj );
	} );
	return retVal;
};

/**
 Binds the query and update methods to a specific object and adds the methods to that object. When called these
 methods can skip the first parameter so that find(object, query) can just be called as object.find(query)
 @param {object|array} obj The object or array to bind to
 @param {object|array=} collection If the collection is not the same as <code>this</code> but is a property, or even
 a whole other object, you specify that here. Otherwise the <code>obj</code> is assumed to be the same as the collecion
 **/
exports.mixin = function ( obj, collection ) {
	collection = collection || obj;
	return sys.each( bindables, function ( val, key ) {
		obj[key] = sys.bind( val, obj, collection );
	} );
};

/**
 * These are the supported query operators
 *
 * @memberOf module:documents/probe
 * @name queryOperators
 * @class This is not actually a class, but an artifact of the documentation system
 */

/**
 * These are the supported update operators
 *
 * @memberOf module:documents/probe
 * @name updateOperators
 * @class This is not actually a class, but an artifact of the documentation system
 */
