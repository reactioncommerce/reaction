"use strict";
/**
 * @fileOverview allows you to bind a change watcher that looks for get and set operations on an arbitrary
 * property of an object at at any depth. This allows you to look for changes or intercept values asynchronously or otherwise.
 * @module documents/binder
 * @requires async
 * @requires documents/probe
 * @requires lodash
 * @requires promise
 */
var Promise = require( 'promise' );
var async = require( "async" );
var probe = require( "./probe" );
var sys = require( "lodash" );

/**
 * Identifies the properties that the binder expects
 * @type {{getter: null, getterAsync: boolean, setter: null, validator: null, validatorAsync: boolean, setterAsync: boolean}}
 * @private
 */
var dataBinderOptions = exports.dataBinderOptions = {
	getter         : null,
	getterAsync    : false,
	setter         : null,
	validator      : null,
	validatorAsync : false,
	setterAsync    : false
};

/**
 * You can unbind previously bound objects from here.
 *
 * @param {string} path The path that was bound using {@link module:documents/binder.bind}
 * @param {*} record The object that was bound
 */
exports.unbind = function ( path, record ) {
	var context = record;
	var lastParent = context;
	var parts = path.split( probe.delimiter );
	var lastPartName = path;
	var lastParentName;
	sys.each( parts, function ( part ) {
		lastParentName = part;
		lastParent = context;
		context = context[part];
		lastPartName = part;
		if ( sys.isNull( context ) || sys.isUndefined( context ) ) {
			context = {};
		}
	} );

	if ( lastParent === context ) {
		deleteBindings( record, lastPartName );
	} else {
		deleteBindings( lastParent, lastPartName );
	}

	function deleteBindings( mountPoint, mountName ) {
		mountPoint[mountName] = mountPoint["__" + mountName + "__"];
		delete mountPoint["__" + mountName + "__"];
	}
};

/**
 * Bind to a property somewhere in an object. The property is found using dot notation and can be arbitrarily deep.
 * @param {string} path The path into the object to locate the property. For instance this could be `"_id"`, `"name.last"`.
 * or `"some.really.really.long.path.including.an.array.2.name"`
 * @param {object} record Anything you can hang a property off of
 * @param {options} options What you wanna do with the doohicky when yoyu bind it.
 * @param {function(*):Promise|*=} options.getter This is the method to run when getting the value. When it runs, you will receive
 * a single parameter which is the current value as the object understands it. You can return the value directly, just raise an event or
 * whatever your little heart demands. However, if you are asynchronous, this will turn your return value into a promise, one of the
 * few places this system will embrace promises over node-like error passing and that is mainly because this is a getter so a return value
 * is particularly important. *
 * @param {*} options.getter.value The current value of the record
 * @param {function(err, value)=} options.getter.callback When asynchronous, return you value through this method using node style
 * error passing (the promise is handled for you by this method).
 * @param {boolean=} options.getterAsync When true (not truthy) the getter is treated asynchronously and returns a promise with your value.
 * @param {function(*, *, *)=} options.setter A setter method
 * @param {*} options.setter.newVal The new value
 * @param {*} options.setter.oldVal The old value
 * @param {*} options.setter.record The record hosting the change
 * @param {function(*, *, *, function=)=} options.validator If you want a validator to run before settings values, pass this guy in
 * @param {*} options.validator.newVal The new value
 * @param {*} options.validator.oldVal The old value
 * @param {*} options.validator.record The record hosting the change
 * @param {function(err)=} options.validator.callback If the validator is asynchronous, then pass your value back here, otherwise pass it back as a return value.
 * When you use an asynchronous instance, pass the error in the first value and then the rest of the parameters are yours to play with
 * @param {boolean=} options.validatorAsync When true (not truthy) the validator is treated asynchornously and returns a promise with your value.
 * @returns {*}
 */
exports.bind = function ( path, record, options ) {
	options = sys.extend( {}, dataBinderOptions, options );
	var context = record;
	var lastParent = context;
	var parts = path.split( probe.delimiter );
	var lastPartName = path;
	var lastParentName;

	sys.each( parts, function ( part ) {
		lastParentName = part;
		lastParent = context;
		context = context[part];
		lastPartName = part;
		if ( sys.isNull( context ) || sys.isUndefined( context ) ) {
			context = {};
		}
	} );

	if ( lastParent === context ) {
		setUpBindings( record, lastPartName );
	} else {
		setUpBindings( lastParent, lastPartName );
	}

	function setUpBindings( mountPoint, mountName ) {
		mountPoint["__" + mountName + "__"] = mountPoint[mountName];
		Object.defineProperty( mountPoint, mountName, {
			get : function () {
				if ( sys.isFunction( options.getter ) ) {
					var promise;
					if ( options.getterAsync === true ) {
						promise = Promise.denodeify( options.getter );
					}

					if ( promise ) {
						return promise( mountPoint["__" + mountName + "__"] ).then( function ( val ) {
							mountPoint["__" + mountName + "__"] = val;
						} );
					} else {
						mountPoint["__" + mountName + "__"] = options.getter( mountPoint["__" + mountName + "__"] );
						return mountPoint["__" + mountName + "__"];
					}

				} else {
					return mountPoint["__" + mountName + "__"];
				}
			},
			set : function ( val ) {
				async.waterfall( [
					function ( done ) {
						if ( sys.isFunction( options.validator ) ) {
							if ( options.validatorAsync ) {
								options.validator( val, mountPoint["__" + mountName + "__"], record, done );
							} else {
								var res = options.validator( val, mountPoint["__" + mountName + "__"], record );
								if ( res === true ) {
									done();
								} else {
									done( res );
								}
							}
						} else {
							done();
						}
					},
					function ( done ) {
						if ( sys.isFunction( options.setter ) ) {
							if ( options.setterAsync === true ) {
								options.setter( val, mountPoint["__" + mountName + "__"], record, done );
							} else {
								done( null, options.setter( val, mountPoint["__" + mountName + "__"], record ) );
							}
						} else {
							done( null, val );
						}
					}
				], function ( err, newVal ) {
					if ( err ) { throw new Error( err ); }
					mountPoint["__" + mountName + "__"] = newVal;
				} );

			}
		} );
	}

	return context;
};
