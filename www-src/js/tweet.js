goog.provide('twangler.Tweet');

goog.require('twangler.utils');
/**
 * @param  {Object} tweet
 * @param  {string=} opt_parent_id
 * @constructor
 */
twangler.Tweet = function (tweet, opt_parent_id) {
  this.id = tweet['user']['id'];
  this.user = tweet['user']['screen_name'];
  this.img = tweet['user']['profile_image_url'];
  this.time = tweet['created_at'];
  this.unix = Date.parse(this.time.replace(/( \+)/, ' UTC$1'));
  this.text = tweet['text'];
  this.stream_id = goog.isDef(opt_parent_id) ? opt_parent_id : '0';
};
