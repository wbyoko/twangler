goog.provide('twangler.utils');

goog.require('goog.color');

/**
 * @return {string} [description]
 */
twangler.utils.randomColor = function () {
	return '#' + ('000000' + Math.floor(Math.random() * 0xFFFFFF).toString(16)).substr(-6);
};

/**
 * @see http://24ways.org/2010/calculating-color-contrast/
 * @param  {string} hexcolor
 * @return {string}
 */
twangler.utils.getContrastingColor = function (hexcolor) {
	//assumes a preceeding #
	hexcolor = hexcolor.substr(1);
	var r = parseInt(hexcolor.substr(0,2),16);
	var g = parseInt(hexcolor.substr(2,2),16);
	var b = parseInt(hexcolor.substr(4,2),16);
	var yiq = ((r*299)+(g*587)+(b*114))/1000;

	return '#' + ((yiq >= 128) ? '000000' : 'ffffff');
	// */

	//return '#' + (Number('0x'+hexcolor.substr(1)).toString(10) > 0xffffff/2 ? '000000' :  'ffffff');
};

/**
 * @see http://stackoverflow.com/questions/1787124/programmatically-darken-a-hex-colour
 * @param  {string} hexcolor
 * @param  {boolean=} opt_gradient
 * @return {string}
 */
twangler.utils.getGradientColor = function (hexcolor, opt_gradient) {
	if ((goog.isDef(opt_gradient) && !opt_gradient) || !goog.isDef(opt_gradient) && Math.floor(Math.random()*2))
		return hexcolor;

	var rgb = goog.color.hexToRgb(hexcolor);
	rgb = goog.color.darken(rgb, 0.2);
	return goog.color.rgbArrayToHex(rgb);
};

/**
 * @param  {string} text
 * @return {string}
 */
twangler.utils.linkUsers = function(text) {
	return text.replace(/[@]+[A-Za-z0-9-_]+/g, function(us) {
		var function_path = 'onClick="return asp(\'' + us + '\');"',
			username = us.replace("@", "");
		us = us.link("http://twitter.com/" + username);
		us = us.replace('href="', function_path + ' target="_blank"  title="' + username + '"  href="');
		return us;
	});
};

/**
 * @param  {string} text
 * @return {string}
 */
twangler.utils.linkTags = function(text) {
	return text.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
		var function_path = 'onClick="return asp(\'' + t + '\');"',
			tag = t.replace("#", "%23");
		t = t.link("http://search.twitter.com/search?q=" + tag);
		t = t.replace('href="', function_path + ' target="_blank" href="');
		return t;
	});
};

/**
 * @param  {string} text
 * @return {string}
 */
twangler.utils.linkify = function(text) {
	return text.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g, function(m) {
		m = m.link(m);
		m = m.replace('href="', 'target="_blank" href="');
		return m;
	});
};

/* End of utils.js */