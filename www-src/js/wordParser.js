goog.provide('twangler.word');
goog.provide('twangler.wordParser');

goog.require('goog.string');
goog.require('goog.array');

/**
 * @param  {string} word
 * @param  {number} freq
 * @constructor
 */
twangler.word = function (word, freq) {
	this.word = word;
	this.freq = freq;
};

/**
 * @param  {string} text
 * @return {Array.<twangler.word>}
 */
twangler.wordParser = function (text) {

	/**
	 * @param  {string} str
	 * @param  {string=} opt_charlist
	 *
	 * @return {string}
	 */
	var trim = function (str, opt_charlist) {
		var whitespace, l = 0,
			i = 0;
			str += '';

		if (!goog.isDef(opt_charlist)) {
			// default list
			whitespace = " \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000";
		} else {
			// preg_quote custom list
			opt_charlist += '';
			whitespace = opt_charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
		}

		l = str.length;
		for (i = 0; i < l; i++) {
			if (whitespace.indexOf(str.charAt(i)) === -1) {
				str = str.substring(i);
				break;
			}
		}

		l = str.length;
		for (i = l - 1; i >= 0; i--) {
			if (whitespace.indexOf(str.charAt(i)) === -1) {
				str = str.substring(0, i + 1);
				break;
			}
		}

		return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
	};

	/**
	 * @param  {twangler.word} a
	 * @param  {twangler.word} b
	 * @return {number}
	 */
	var compareWords = function (a,b) {
		//compare freq
		if (a.freq < b.freq)
			return -1;
		if (a.freq > b.freq)
			return 1;

		//must have same freq; compare length
		if (a.word.length < b.word.length)
			return -1;
		if (a.word.length > b.word.length)
			return 1;

		//whatever
		return 0;
	};

	//console.log(text);

	var stopwords = ["that","this","&lt;","&gt;","just","the","and","for","&amp;","plz?","can","was","que","now","you","see"], //make all lowercase

		words = text.replace(/["”“]/gi,' ').replace(/’/g,"'").replace(/#/gi,' #').replace(/[):,"?!']\s/gi,' ').replace(/\s[(:,"?!']/gi,' ').replace(/[\s\.]{2,}/gi,' ').split(' '),

		wordcount = {},

		topwords = [],

		word,

		i;

	//console.log(text.replace(/["”“]/gi,' ').replace(/’/g,"'").replace(/#/gi,' #').replace(/[:,"?!]\s/gi,' ').replace(/[\s\.]{2,}/gi,' '));

	// build an object to count word frequency
	for (i = words.length - 1; i >= 0; i--) {

		word = trim(trim(words[i]),'.');
		if (word.lastIndexOf('http://', 0) !== 0)
			word = word.toLowerCase();

		if (!goog.array.contains(stopwords, word)) {
			if (wordcount[word] > 0 && word.length) {
				wordcount[word] += 1;
			} else {
				wordcount[word] = 1;
			}
		}
    }

	// convert the object to an object array
	// include only words repeated more than once within the paragraph
	// if (i > 1 || w.lastIndexOf('#', 0) === 0 || w.lastIndexOf('@', 0) === 0)
	for (i in wordcount) {
		if (wordcount[i] > 1 && i.length > 2)
			topwords.push(new twangler.word(i, wordcount[i]));
	}

	goog.array.sort(topwords, compareWords);
  
	return topwords;
};

/** End of wordParser.js*/