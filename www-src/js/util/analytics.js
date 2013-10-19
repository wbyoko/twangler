goog.provide('twangler.analytics');

//https://developers.google.com/analytics/devguides/collection/gajs/

/**
 * @type {string}
 */
twangler.analytics.gaid = "UA-28995990-2";

twangler.analytics.gaInit = function () {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl'   : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
};

twangler.analytics.trackEvent = function () {

};

twangler.analytics.trackPage = function () {
  window['_gaq'] = window['_gaq'] || [];
  var _gaq = window['_gaq'];
  _gaq.push(['_setAccount', twangler.analytics.gaid ]);
  _gaq.push(['_trackPageview']);
};