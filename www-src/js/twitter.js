/**
 * @fileoverview This is the twitter search api
 * @see https://dev.twitter.com/docs/api/1.1/get/search/tweets
 *
 * @see https://dev.twitter.com/docs/api/1/get/search
 * @see https://dev.twitter.com/docs/using-search
 */
goog.provide('Twitter.search');
goog.provide('Twitter.tweet');
goog.provide('Twitter.parseTime');

goog.require("goog.net.Jsonp");
goog.require("goog.object");

/**
 * @param  {string} query       [description]
 * @param  {Object} options     [description]
 * @param  {Function} callback_fn [description]
 */
Twitter.search = function (query, options, callback_fn) {

  var request = new goog.net.Jsonp('http://search.twitter.com/search.json'),
      payload = {
        'lang' : 'en',
        'result_type' : 'recent',
        'rpp' : 30,
        '_dc' : goog.now(),
        'q' : ( goog.isDef(query) ? query : '' )
      };

  goog.object.extend(payload, options);

  //console.log(payload);
  request.send(payload, callback_fn);
};

/**
 * @param  {Object} tweet
 * @param  {string=} parent_id
 * @param  {string=} color
 * @constructor
 */
Twitter.tweet = function (tweet, parent_id, color) {
  var contrast = function (color) {
      return '#' + (Number('0x'+color.substr(1)).toString(10) > 0xffffff/2 ? '000000' :  'ffffff');
  };
  this.id = tweet['id'];
  this.user = tweet['from_user'];
  this.img = tweet['profile_image_url'];
  this.time = tweet['created_at'];
  this.str_time = Twitter.parseTime(this.time);
  this.text = tweet['text'];
  this.color = goog.isDef(color) ? color : '#000000';
  this.stream_id = goog.isDef(parent_id) ? parent_id : '0';
  this.contrast = contrast(this.color);
};

/**
 * @see http://darklaunch.com/2010/05/21/parse-twitter-created-at-value-into-friendly-time-format-relative-time-time-ago
 * @see http://widgets.twimg.com/j/1/widget.js
 * @param  {string} a [description]
 * @return {string}   [description]
 */
Twitter.parseTime = function (a) {

    var z = navigator.userAgent,
      zie = z.match(/MSIE\s([^;]*)/),
      b = new Date(),
      c = new Date(a);

    if (zie) {
        c = Date.parse(a.replace(/( \+)/, ' UTC$1'));
    }
    var d = b - c;
    var e = 1000,
        minute = e * 60,
        hour = minute * 60,
        day = hour * 24,
        week = day * 7;
    if (isNaN(d) || d < 0) {
        return "";
    }
    if (d < e * 7) {
        return "right now";
    }
    if (d < minute) {
        return Math.floor(d / e) + " seconds ago";
    }
    if (d < minute * 2) {
        return "about 1 minute ago";
    }
    if (d < hour) {
        return Math.floor(d / minute) + " minutes ago";
    }
    if (d < hour * 2) {
        return "about 1 hour ago";
    }
    if (d < day) {
        return Math.floor(d / hour) + " hours ago";
    }
    if (d > day && d < day * 2) {
        return "yesterday";
    }
    if (d < day * 365) {
        return Math.floor(d / day) + " days ago";
    } else {
        return "over a year ago";
    }
};
