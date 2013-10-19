goog.provide('twangler.Stream');
goog.provide('twangler.Stream.EventType');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.string');
goog.require('twangler.Tweet');
goog.require('twangler.twitter.utils');


/**
 * @param {string} query
 * @param {string} id
 * @param {string} opt_cloudQuery
 * @param {string} opt_color
 * @param {string} opt_endColor
 * @param {string} opt_textColor
 * @param {string} opt_borderColor
 * @constructor
 * @extends {goog.events.EventTarget}
 */
twangler.Stream = function (query, id, opt_cloudQuery, opt_color, opt_endColor, opt_textColor, opt_borderColor) {
	goog.events.EventTarget.call(this);
	this.query = query;
	this.cloud_query = opt_cloudQuery;
	this.id = id;
	this.last_id = 0;
	this.tweet_queue = [];
	this.interval_id = 0;
	this.color = opt_color;
	this.endColor = opt_endColor;
	this.textColor = opt_textColor;
	this.borderColor = opt_borderColor;

	this.filteredQuery = twangler.twitter.utils.filterQuery(goog.string.trim(query)) +
						( this.cloud_query ? ' '  + twangler.twitter.utils.filterQuery(this.cloud_query) : '' ) +
						' -filter:retweets';

	this.label = this.query + ( this.cloud_query ? ' (' + this.cloud_query + ')' : '' );

	//this.start();
};
goog.inherits(twangler.Stream, goog.events.EventTarget);

twangler.Stream.prototype.start = function () {
	var self = this;
	this.stop();
	this.refresh();
	this.interval_id = setInterval( function() { self.refresh(); }, 10000);
};

twangler.Stream.prototype.stop = function () {
	clearInterval(this.interval_id);
};

/**
 * @param {string} query
 * @param {string} opt_cloud_query
 * @return {boolean}
 */
twangler.Stream.prototype.hasEquivalentQueries = function (query, opt_cloud_query) {

	var mainQueryEqual = goog.string.caseInsensitiveCompare(this.query, query) === 0,
		cloudQueryEqual = goog.isDef(opt_cloud_query) === goog.isDef(this.cloud_query);
		
	if (cloudQueryEqual && goog.isDef(this.cloud_query))
		cloudQueryEqual = !goog.string.caseInsensitiveCompare(this.cloud_query, opt_cloud_query);
	
	return mainQueryEqual && cloudQueryEqual;
};

twangler.Stream.prototype.refresh = function () {
	var query = this.filteredQuery,
		stream = this,
		data = {};
		if (this.last_id === 0)
			data['rpp'] = 20;
		else if (goog.isDef(this.last_id))
			data['since_id'] = this.last_id;

	twangler.twitter.utils.search( query, data, function(data) { stream.update(data); });
};

/**
 * @param  {Object} data
 */
twangler.Stream.prototype.update = function (data) {

	var tweets = data['results'],
		i;

	if (goog.isDef(tweets)){
		this.last_id = data['max_id'];

		for ( i = tweets.length - 1; i >= 0; i--) {
			this.tweet_queue.push(new twangler.Tweet(tweets[i], this.id));
		}

		if (this.tweet_queue.length > 0)
			this.dispatchEvent(twangler.Stream.EventType.NEW_TWEETS);
	}
};

/** @enum {string} */
twangler.Stream.EventType = {
	NEW_TWEETS: goog.events.getUniqueId(goog.getCssName('new-tweets'))
};