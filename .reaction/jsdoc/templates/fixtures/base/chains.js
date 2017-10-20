"use strict";
/**
 * @fileOverview The chains define the primary composition elements (functions) that determine the order of execution.
 *
 * @module base/chains
 * @requires dcl
 */
var dcl = require( "dcl" );
/**
 * @classDesc Chains define the primary composition elements (functions) that determine the order of execution.
 * @exports base/chains
 * @constructor
 */
var Chains = dcl( null, {declaredClass : "base/chains"} );
/**
 * The `close` method asks an object to shut itself down in a way that will allow it to be reopened, unlike the
 * [end method]{@link base/chains#end} which will call the destroy method which should make the object unusable, but also
 * devoid of all resources whereas `close` may still keep some resources open.
 *
 * | Heading 1 | Heading 2 | Heading 3       |
 * |-----------|-----------|-----------------|
 * | Bar       | Food      | This is a table |
 *
 * This uses the `before` chain which means the last one defined in the first one destroyed
 * @memberOf base/chains#
 * @name close
 * @see base/chains#open
 */
dcl.chainBefore( Chains, "close" );
/**
 * The `end` method will call the destroy method which should make the object unusable and
 * devoid of all resources, unlike the
 * [close method]{@link base/chains#close} asks an object to shut itself down in a way that will allow it to be reopened.
 *
 * This uses the `before` chain which means the last one defined in the first one destroyed
 * @memberOf base/chains#
 * @name end
 *
 * @example  <caption>Add *this* to your application.properties.</caption>
 * {@lang bash}
 * foo=bar
 *
 */
dcl.chainBefore( Chains, "end" );
/**
 * Destroy is called by the end method and it is here that you should clean up after yourself. The difference between
 * `destroy` and [end]{@link base/chains#end} is the `end` is the verb that you raise on an object to ask it to go away
 * and `destroy` is where you actually do the work to clean up. Think of this as the counterpart of `constructor` yet
 * not called automatically.
 *
 * This uses the `before` chain which means the last one defined is the first one destroyed
 * @private
 * @memberOf base/chains#
 * @name destroy
 */
dcl.chainBefore( Chains, "destroy" );

/**
 * If you are using the open/close paradigm for an object that can kind of go dormant on {@link base/chains#close} and can be "reopened"
 * again later, here is where the "open" code will go.
 *
 * This used the `after` chain which means that the first one defined is the first one destroyed.
 *
 * @memberOf base/chains#
 * @name open
 * @see base/chains#close
 */
dcl.chainAfter( Chains, "open" );

module.exports = Chains;
