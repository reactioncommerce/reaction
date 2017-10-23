"use strict";
/**
 * @fileOverview A model is the first level if usable data-bearing entity in the system. It does NOT include any verbs for saving or anything like
 * that, it is a pure, in memory data container
 * @module documents/model
 * @require base
 * @require documents/probe
 * @require lodash
 */

var Base = require( "../base" );
var probe = require( "./probe" );
var sys = require( "lodash" );
/**
 * A model is the first level if usable data-bearing entity in the system. It does NOT include any verbs for saving or anything like
 * that, it is a pure, in memory data container
 * @exports documents/model
 * @constructor
 * @borrows module:documents/probe.get as get
 * @borrows module:documents/probe.set as set
 * @borrows module:documents/probe.any as any
 * @borrows module:documents/probe.all as all
 * @borrows module:documents/probe.remove as remove
 * @borrows module:documents/probe.seekKey as seekKey
 * @borrows module:documents/probe.seek as seek
 * @borrows module:documents/probe.findOne as findOne
 * @borrows module:documents/probe.findOneKey as findOneKey
 * @borrows module:documents/probe.findKeys as findKeys
 * @borrows module:documents/probe.find as find
 * @borrows module:documents/probe.update as update
 * @borrows module:documents/probe.some as some
 * @borrows module:documents/probe.every as every
 */
var Model = Base.compose( [Base], /** @lends documents/model# */{
	constructor : function () {
		var that = this;
		probe.mixin( this );

		var idField = "_id";
		/**
		 * The name of the field that uniquely identifies a record. When provided, some operations will take advantage of it
		 *
		 * @name _idField
		 * @memberOf  documents/model#
		 * @type {string}
		 * @private
		 */
		Object.defineProperty( this, "_idField", {
			get          : function () {
				return idField;
			},
			set          : function ( val ) {
				idField = val;
			},
			configurable : false,
			enumerable   : true,
			writable     : true
		} );

		/**
		 * The value of the primary key if {@link documents/model#_idField} is filled in. It will be null if none found
		 *
		 * @name _pkey
		 * @memberOf  documents/model#
		 * @type {*}
		 * @private
		 */
		Object.defineProperty( this, "_pkey", {
			get          : function () {
				var val;
				if ( !sys.isEmpty( that._idField ) ) {
					val = that[that._idField];
				}
				return val;
			},
			set          : function ( val ) {
				if ( !sys.isEmpty( that._idField ) ) {
					that[that._idField] = val;
				}
			},
			configurable : false,
			enumerable   : true,
			writable     : true
		} );

		/**
		 * If {@link documents/model#_idField} is filled in and it's value is empty this will be true.
		 * @type {boolean}
		 * @name isNew
		 * @memberOf  documents/model#
		 */
		Object.defineProperty( this, "isNew", {
			get          : function () {
				return !sys.isEmpty( that._idField ) && !sys.isEmpty( that[that._idField] )
			},
			configurable : false,
			enumerable   : true,
			writable     : false
		} );

		/**
		 * Returns true if this instance is empty
		 * @type {boolean}
		 * @name isEmpty
		 * @memberOf  documents/model#
		 */
		Object.defineProperty( this, "isEmpty", {
			get          : function () {
				return sys.isEmpty( that );
			},
			configurable : false,
			enumerable   : true,
			writable     : false
		} );
	}
} );
module.exports = Model;
