goog.provide('twangler.Queue');

goog.require('twangler.Tweet');


twangler.Queue = function () {

	/** @type {Array.<twangler.Tweet>}*/
	queue_ = [];
};

/**
 * @type {number}
 * @const
 */
twangler.Queue.MAX_LENGTH = 250;

/**
 * @return {number}
 */
twangler.Queue.prototype.length = function () {
	return queue_.length;
};

/**
 * @return {twangler.Tweet?}
 */
twangler.Queue.prototype.nextTweet = function () {

};

/**
 * @return {twangler.Tweet?}
 */
twangler.Queue.prototype.addTweets = function () {

};