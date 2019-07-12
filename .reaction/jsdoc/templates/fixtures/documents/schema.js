"use strict";
/**
 * @fileOverview Enables a schema and validation feature set to your document or other object.
 * @module documents/schema
 * @requires base
 * @requires jjv
 * @require lodash
 */
var sys = require( "lodash" );
var Validator = require( "jjv" );
var Base = require( "../base" );
/**
 * The validator mixin provides access to the features of the JSON validation system
 * @exports documents/schema
 * @mixin
 */
var Schema = Base.compose( [Base], /** @lends documents/schema# */{
	constructor : function () {
		/**
		 * The schema that defines the validation rules. This should probably be defined at the prototype for each
		 * object or model classification. It can be an anonymous schema defined right here, or this can be
		 * registered schema names to use, or just a single name
		 *
		 * @type {object}
		 * @memberOf documents/schema#
		 * @name schema
		 */

		/**
		 * If you want to register multiple schemas, use this property instead
		 *
		 * @type {object}
		 * @memberOf documents/schema#
		 * @name schemas
		 */

		/**
		 * The validation environment
		 * @private
		 * @type {jjv}
		 */
		var env = new Validator();

		/**
		 * The default name of the scheman when you use anonymous schemas. You can define this at the prototype for classified
		 * schemas. The can also
		 *
		 * @type {string|function():{string}}
		 * @memberOf documents/schema#
		 * @name _defaultSchemaName
		 */
		this._defaultSchemaName = sys.result( this, "_defaultSchemaName" ) || sys.uniqueId( "schema" );

		/**
		 * The options to pass to the validator when it runs
		 * @type {object|function():{object}}
		 * @name validationOptions
		 * @memberOf documents/schema#
		 */
		this.validationOptions = sys.defaults( {}, sys.result( this, 'validationOptions' ), {checkRequired : true} );

		/**
		 * Validate an object against the schema
		 * @returns {object?}
		 * @method
		 * @name validate
		 * @memberOf documents/schema#
		 * @param {Object=} record The record to validate
		 * @param {string|object=} schemaName The name of a previously registered schema
		 * @param {Object=} options Options to pass to the validator
		 * @example
		 * // This supports these signatures:
		 *
		 * instance.validate(record, schemaName, options);
		 *
		 *
		 * instance.validate(); // this, this._defaultSchemaName, this.validationOptions
		 * instance.validate(record); // record, this._defaultSchemaName, this.validationOptions
		 * instance.validate(schemaName); //this, schemaName, this.validationOptions
		 * instance.validate(record, schemaName); //record, schemaName, this.validationOptions
		 * instance.validate(schemaName, options); //this, schemaName, this.validationOptions
		 */
		this.validate = function ( record, schemaName, options ) {
			if ( arguments.length === 0 ) {
				record = this;
				schemaName = this._defaultSchemaName;
				options = this.validationOptions;
			} else {
				if ( sys.isString( record ) ) {
					schemaName = record;
					record = this;
				}
				if ( sys.isEmpty( options ) ) {
					options = this.validationOptions;
				}
			}

			return env.validate( schemaName, record, options );
		};

		/**
		 * Initialize the schema collection by registering the with the handler. You can call this at any time and as often as you like. It will be called once
		 * by the constructor on any instance schemas
		 * @method
		 * @name registerSchemas
		 * @memberOf documents/schema#
		 * @param {hash} schemas A hash of schemas where the key is the name of the schema
		 */
		this.registerSchemas = function ( schemas ) {
			var schema = sys.result( this, "schema" );
			var schemas = schemas || sys.result( this, "schemas" );
			if ( !sys.isEmpty( schema ) ) {
				env.addSchema( this._defaultSchemaName, schema );
			}
			if ( !sys.isEmpty( schemas ) ) {
				sys.each( schemas, function ( val, key ) {
					env.addSchema( val, key );
				} );
			}
		};

		/**
		 * Extracts only the elements of the object that are defined in the schema
		 * @memberOf documents/schema#
		 * @name extract
		 * @param {Object=} record The record to extract from
		 * @param {string=} schema The name of the schema to attach
		 * @method
		 */
		this.extract = function ( record, schema ) {
			if ( arguments.length === 0 ) {
				record = this;
				schema = this._defaultSchemaName;
			}
			if ( sys.isString( record ) ) {
				schema = record;
				record = this;
			}
		};

		/**
		 * Create a type to be used in your schemas to define new validators
		 * @memberOf documents/schema#
		 * @name addType
		 * @method
		 * @param {String} name The name of the type
		 * @param {function(object)} operation What to do with the type.
		 * @param {Object} operation.value The value to validation
		 * @returns {Boolean}
		 */
		this.addType = env.addType;

		/**
		 * It is also possible to add support for additional string formats through the addFormat function.
		 * @memberOf documents/schema#
		 * @name addFormat
		 * @method
		 * @param {String} name The name of the formatter
		 * @param {function(object)} formatter How to format it
		 * @param {Object} formatter.value The value to format
		 * @returns {Boolean}
		 */
		this.addFormat = env.addFormat;

		/**
		 * It is possible to add support for custom checks (i.e., minItems, maxItems, minLength, maxLength, etc.) through the addCheck function
		 * @memberOf documents/schema#
		 * @name addCheck
		 * @method
		 * @param {String} name The name of the check
		 * @param {function(...object)} formatter Perform the check
		 * @param {Object} formatter.value The value to check followed by any parameters from the schema
		 * @returns {Boolean}
		 */
		this.addCheck = env.addCheck;

		/**
		 * Custom coercion rules
		 *
		 * @memberOf documents/schema#
		 * @name addTypeCoercion
		 * @method
		 * @param {String} name The name of the coercion
		 * @param {function(object)} coercer Perform the coercion
		 * @param {Object} coercer.value The value to coerce
		 * @returns {Boolean}
		 */
		this.addTypeCoercion = env.addTypeCoercion;

		/**
		 * Get a registered schema by name
		 * @param {string=} schemaName
		 * @returns {object?}
		 * @memberOf documents/schema#
		 * @name getSchema
		 * @method
		 */
		this.getSchema = function ( schemaName ) {
			if ( sys.isEmpty( schemaName ) || !sys.isString() ) {
				schemaName = this._defaultSchemaName;
			}
			return env.schema[schemaName];
		}
	},
	/**
	 * This method will create a new object that contains only the fields and no methods or other artifacts. This is useful
	 * for creating objects to pass over the wire or save in a table. This is not deeply copied, so changes made to the
	 * extracted object will be represented in this class for reference objects.
	 *
	 * @param {string=} schema The schema name to use
	 * @param {Object=} src The object to extract fields from
	 * @return {Object} Data-only version of the class instance.
	 */
	extract     : function ( schemaName, src ) {
		if ( sys.isObject( schemaName ) ) {
			src = schema;
			schemaName = this._defaultSchemaName;
		}

		if ( sys.isEmpty( src ) ) {
			src = this;
		}

		if ( sys.isFunction( src.toJSON ) ) {
			src = src.toJSON();
		}
		var schema = this.getSchema( schemaName ) || {};
		var newobj = {};
		sys.each( schema.properties, function ( prop, propname ) {
			if ( prop.properties && !sys.isUndefined( src[ propname ] ) ) {
				newobj[ propname ] = this.extract( prop, src[propname] );
			} else if ( !sys.isUndefined( src[ propname ] ) ) {
				newobj[ propname ] = src[ propname ];
			}
		}, this );

		return newobj;
	},
	/**
	 * Builds a default document based on the schema. What this does is create a document from schema and for each property
	 * that has a default value or is required, the resultant object will contain that property. It is useful for extending
	 * values from some source that may be incomplete, like options or some such.
	 * @param {json-schema} schema A schema to use to create the default document
	 * @returns {object?}
	 * @name defaultDoc
	 * @memberOf documents/schema#
	 * @method
	 */
	defaultDoc  : function ( schemaName ) {
		if ( sys.isEmpty( schemaName ) ) {
			schemaName = this._defaultSchemaName;
		}
		var newdoc = {};
		var schema;

		if ( sys.isObject( schemaName ) ) {
			schema = schemaName;
		} else {
			schema = this.getSchema( schemaName ) || {};
		}
		sys.each( schema.properties, function ( val, key ) {

			var def = val[ "default" ]; // keyword and all that
			if ( val.type === "object" && !sys.isEmpty( val.properties ) ) {
				newdoc[ key ] = this.defaultDoc( val );
			} else {
				if ( sys.isFunction( def ) || sys.isBoolean( def ) || sys.isNumber( def ) || !sys.isEmpty( def ) ) {

					if ( sys.isFunction( def ) ) {
						newdoc[ key ] = def( schema );
					} else {
						newdoc[ key ] = def;
					}
				} else if ( val.required ) {
					if ( val.type === 'string' ) {
						newdoc[ key ] = null;
					} else if ( val.type === 'object' ) {
						newdoc[ key ] = {};
					} else if ( val.type === 'array' ) {
						newdoc[ key ] = [];
					} else {
						newdoc[ key ] = null;
					}
				}
			}
		}, this );

		return newdoc;
	}
} );

module.exports = Schema;
