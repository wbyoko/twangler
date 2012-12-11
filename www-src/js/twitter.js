/**
 * @fileoverview This is the twitter search api
 * @see https://dev.twitter.com/docs/api/1.1/get/search/tweets
 *
 * @see https://dev.twitter.com/docs/api/1/get/search
 * @see https://dev.twitter.com/docs/using-search
 */
goog.provide('twangler.twitter.utils');

goog.require("goog.net.Jsonp");
goog.require("goog.object");

/**
 * @param  {string} query       [description]
 * @param  {Object} options     [description]
 * @param  {Function} callback_fn [description]
 */
twangler.twitter.utils.search = function (query, options, callback_fn) {

  var request = new goog.net.Jsonp('http://search.twitter.com/search.json'),
      payload = {
        'lang' : 'en',
        'result_type' : 'recent',
        'rpp' : 100,
        'q' : query
      };

  goog.object.extend(payload, options);

  //console.log(payload);
  request.send(payload, callback_fn);
};

/**
 * @param  {string} a
 * @return {number}
 */
twangler.twitter.utils.dateDifference = function (a){
    var z = navigator.userAgent,
        zie = z.match(/MSIE\s([^;]*)/),
        b = new Date(),
        c = new Date(a);

    if (zie)
        c = Date.parse(a.replace(/( \+)/, ' UTC$1'));

    return b - c;
};
/**
 * @see http://darklaunch.com/2010/05/21/parse-twitter-created-at-value-into-friendly-time-format-relative-time-time-ago
 * @see http://widgets.twimg.com/j/1/widget.js
 * @param  {string} a [description]
 * @return {string}   [description]
 */
twangler.twitter.utils.parseTime = function (a) {
    var d = twangler.twitter.utils.dateDifference(a);
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


/**
 * @param  {string} query
 * @return {string}
 */
twangler.twitter.utils.filterQuery = function (query) {
    if (/^@\w+$/.test(query)) {
        query = query.substr(1);
        query = '@' + query + ' OR to:' + query + ' OR from:' + query;
    }
    return query;
};

/* end of twitter.js */