"use strict";
/**
 * @fileOverview Provides easy access to the system bus and provides some helper methods for doing so
 * @module mixins/bussable
 * @requires postal
 * @requires lodash
 * @requires base
 */
var bus = require( "postal" );
var Base = require( "../base" );
var sys = require( "lodash" );

/**
 *  @classDesc Provides easy access to the system bus and provides some helper methods for doing so
 *  @exports mixins/bussable
 *  @mixin
 */
var Bussable = Base.compose( [Base], /** @lends mixins/bussable# */{
	declaredClass : "mixins/Bussable",
	constructor   : function () {
		/**
		 * The list of subscriptions maintained by the mixin
		 * @type {Array}
		 * @memberof mixins/bussable#
		 * @name _subscriptions
		 * @private
		 */
		this._subscriptions = {};

		this.log.trace( "Bussable constructor" );
	},

	/**
	 * Subscribe to an event
	 * @param {String} channel The channel to subscribe to
	 * @param {String} topic The topic to subscribe to
	 * @param {callback} callback What to do when you get the event
	 * @returns {Object} The subscription definition
	 */
	subscribe : function ( channel, topic, callback ) {
		this.log.trace( "Bussable subscribe" );
		var sub = bus.subscribe( {channel : channel, topic : topic, callback : callback} );
		this.subscriptions[channel + "." + topic] = sub;
		return sub;
	},

	/**
	 * Subscribe to an event once
	 * @param {String} channel The channel to subscribe to
	 * @param {String} topic The topic to subscribe to
	 * @param {callback} callback What to do when you get the event
	 * @returns {Object} The subscription definition
	 */
	once : function ( channel, topic, callback ) {
		this.log.trace( "Bussable once" );
		var sub = this.subscribe( channel, topic, callback );
		this.subscriptions[channel + "." + topic] = sub;
		sub.disposeAfter( 1 );
		return sub;
	},

	/**
	 * Publish an event on the system bus
	 * @param {String} channel The channel to publish to
	 * @param {String} topic The topic to publish to
	 * @param {Object=} options What to pass to the event
	 */
	publish : function ( channel, topic, options ) {
		this.log.trace( "Bussable publish" );
		bus.publish( {channel : channel, topic : topic, data : options} );
	},

	/**
	 * Get a subscription definition
	 *
	 * @param {String} channel
	 * @param {String} topic
	 * @returns {Object=} The subscription definition
	 */
	getSubscription : function ( channel, topic ) {
		this.log.trace( "Bussable getSubscription" );
		return this.subscriptions[channel + "." + topic];
	},

	/**
	 * Gets rid of all subscriptions for this object.
	 * @private
	 */
	destroy : function () {
		this.log.trace( "Bussable destroy" );

		sys.each( this.subscriptions, function ( sub ) {
			sub.unsubscribe();
		} );
	}
} );

module.exports = Bussable;
