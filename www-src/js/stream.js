goog.provide('twangler.Stream');
goog.provide('twangler.Stream.EventType');


goog.require('Twitter.search');
goog.require('Twitter.tweet');

goog.require('goog.events');
goog.require('goog.events.EventTarget');


/**
 * @param {string} query
 * @param {string} id
 * @param {string} color
 * @constructor
 * @extends {goog.events.EventTarget}
 */
twangler.Stream = function (query, id, color) {
	goog.events.EventTarget.call(this);
	this.query = query;
	this.color = color;
	this.id = id;
	this.last_id = 0;
	this.tweet_queue = [];
	this.start();
};
goog.inherits(twangler.Stream, goog.events.EventTarget);


twangler.Stream.prototype.start = function () {
	var self = this;
	this.refresh();
	this.interval_id = setInterval( function() { self.refresh(); }, 30000);
};

twangler.Stream.prototype.stop = function () {
	clearInterval(this.interval_id);
};

twangler.Stream.prototype.refresh = function () {
	var query = this.query,
		stream = this;
	Twitter.search( query, { 'since_id' : this.last_id }, function(data) { stream.update(data); });
};

/**
 * @param  {Object} data
 */
twangler.Stream.prototype.update = function (data) {

	var tweets = data['results'],
		i;

	this.last_id = data['max_id'];

	for ( i = tweets.length - 1; i >= 0; i--) {
		this.tweet_queue.push(new Twitter.tweet(tweets[i], this.id, this.color));
	}

	if (this.tweet_queue.length > 0)
		this.dispatchEvent(twangler.Stream.EventType.NEW_TWEETS);
};

/** @enum {string} */
twangler.Stream.EventType = {
	NEW_TWEETS: goog.events.getUniqueId(goog.getCssName('new-tweets'))
};