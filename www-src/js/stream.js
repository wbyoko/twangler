goog.provide('twangler.Stream');
goog.provide('twangler.Stream.EventType');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('twangler.Tweet');
goog.require('twangler.twitter.utils');


/**
 * @param {string} query
 * @param {string} id
 * @param {string} opt_cloud_query
 * @constructor
 * @extends {goog.events.EventTarget}
 */
twangler.Stream = function (query, id, opt_cloud_query) {
	goog.events.EventTarget.call(this);
	this.query = query;
	this.cloud_query = opt_cloud_query;
	this.id = id;
	this.last_id = 0;
	this.tweet_queue = [];
	this.interval_id  = 0;

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
	var tweets = data['statuses'],
		i;

	if (goog.isDef(tweets)){
		this.last_id = data['search_metadata']['max_id'];

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