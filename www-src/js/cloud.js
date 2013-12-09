goog.provide('twangler.Cloud');
goog.provide('twangler.Cloud.EventType');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('twangler.Tweet');
goog.require('twangler.twitter.utils');
goog.require('twangler.word');
goog.require('twangler.wordParser');


/**
 * @param  {string} query
 * @constructor
 * @extends {goog.events.EventTarget}
 */
twangler.Cloud = function (query) {
	goog.events.EventTarget.call(this);
	this.query = '';
	this.filteredQuery = '';
	this.interval_id = 0;
	this.hashtags = [];
	this.users = [];
	this.phrases = [];
	this.tweets = [];
	this.last_id = 0;
	this.change(query);
};
goog.inherits(twangler.Cloud, goog.events.EventTarget);

/**
 * @param  {string} query
 */
twangler.Cloud.prototype.change = function (query) {
	this.stop();
	this.tweets = [];
	this.last_id = 0;
	this.query = query;
	this.filteredQuery = twangler.twitter.utils.filterQuery(query);
	this.start();
};

twangler.Cloud.prototype.stop = function () {
	clearInterval(this.interval_id);
};

twangler.Cloud.prototype.start = function () {
	var self = this;
	this.refresh();
	this.interval_id = setInterval( function() { self.refresh(); }, 15000);
};

twangler.Cloud.prototype.refresh = function () {
	var query = this.filteredQuery,
		cloud = this,
		data = {};
		if (this.last_id === 0)
			data['rpp'] = 30;
		else if (goog.isDef(this.last_id))
			data['since_id'] = this.last_id;
	twangler.twitter.utils.search(query, data, function(data) { cloud.update(data); });
};

/**
 * @param  {Object} data
 */
twangler.Cloud.prototype.update = function (data) {

	var tweet_text ='',
		tweet,
		word_list,
		tweets = data['results'],
		users = [],
		i,
		w;

	if (goog.isDef(tweets)){
		this.last_id = data['max_id'];

		for (i = tweets.length - 1; i >= 0; i--) {
			tweet = new twangler.Tweet(tweets[i]);
			if (!goog.array.contains(this.tweets, tweet)) {
				this.tweets.push(tweet);
				tweet_text += ' ' + tweet.text; //new tweets count double; though just the text
			}
			if (this.tweets.length > 60) //assuming 61
				this.tweets.shift();
		}

		for (i = this.tweets.length - 1; i >= 0; i--) {
			tweet = this.tweets[i];
			tweet_text += ' @' + tweet.user + ' ' + tweet.text;
		}
		word_list = twangler.wordParser(tweet_text);

		this.hashtags = [];
		this.users = [];
		this.phrases = [];


		for (i = word_list.length - 1; i >= 0 ; i--) {
			w = word_list[i].word;
			if (w.lastIndexOf('#', 0) === 0 && this.hashtags.length < 12)
				this.hashtags.push(w);
			else if (w.lastIndexOf('@', 0) === 0 && this.users.length < 4)
				this.users.push(w);
			else if (w.lastIndexOf('@', 0) !== 0 && w.lastIndexOf('#', 0) !== 0 && this.phrases.length < 8)
				this.phrases.push(w);
			else if (this.hashtags.length > 11 && this.users.length > 3 && this.phrases.length > 7)
				break;
		}

		this.dispatchEvent(twangler.Cloud.EventType.CLOUD_UPDATED);
	}
};


/** @enum {string} */
twangler.Cloud.EventType = {
	CLOUD_UPDATED: goog.events.getUniqueId(goog.getCssName('cloud-updated'))
};

/** End of cloud.js */