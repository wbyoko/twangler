goog.provide('twangler.Tweet');

goog.require('twangler.utils');
/**
 * @param  {Object} tweet
 * @param  {string=} opt_parent_id
 * @constructor
 */
twangler.Tweet = function (tweet, opt_parent_id) {
  this.id = tweet['id'];
  this.user = tweet['from_user'];
  this.img = tweet['profile_image_url'];
  this.time = tweet['created_at'];
  this.unix = Date.parse(this.time.replace(/( \+)/, ' UTC$1'));
  this.text = tweet['text'];
  this.stream_id = goog.isDef(opt_parent_id) ? opt_parent_id : '0';
};
