goog.provide('twangler');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyEvent');
goog.require('goog.events.KeyHandler');
goog.require('goog.fx');
goog.require('goog.fx.dom');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.Uri');
goog.require('mvc.Router');
goog.require('twangler.analytics');
goog.require('twangler.Cloud');
goog.require('twangler.Cloud.EventType');
goog.require('twangler.Stream');
goog.require('twangler.Stream.EventType');
goog.require('twangler.templates');
goog.require('twangler.twitter.utils');
goog.require('twangler.utils');
goog.require('soy');


/* Constant Definitions */


/**
 * @const
 * @type {number}
 */
twangler.FX_INTERVAL = 800;


/* Major Data Definitions */


/** @type {mvc.Router} */
twangler.router = new mvc.Router();

/** @type {string} */
twangler.defaultQuery = goog.isDef(window['dQ']) ? window['dQ'] : '#news';

/** @type {twangler.Cloud} */
twangler.myCloud = new twangler.Cloud(twangler.defaultQuery);

/** @type {Array.<twangler.Stream>} */
twangler.myStreams = [];

/** @type {Array.<twangler.Tweet>} */
twangler.myTweets = [];


/* Minor Data Definitions */


/** @type {number} */
twangler.numTwitterRequests = 0;

/** @type {number} */
twangler.numStreams = 0;

/** @type {number} */
twangler.tweetIntervalId = 0;

/** @type {number} */
twangler.maintenanceIntervalId = 0;

/** @type {boolean} */
twangler.cloudBind = false;

/** @type {boolean} */
twangler.cloudVisible = true;

/** @type {boolean} */
twangler.cloudPaused = false;

/** @type {boolean} */
twangler.streamPaused = false;

/* Function definitions */

/**
 * @param  {twangler.Tweet} twt [description]
 */
twangler.displayTweet = function (twt) {
	var tweet = goog.object.clone(twt);

	tweet.text = twangler.utils.linkTags(twangler.utils.linkUsers(twangler.utils.linkify(tweet.text)));

	var tweet_html = soy.renderAsFragment(twangler.templates.tweetView, {tweet : tweet, str_time : twangler.twitter.utils.parseTime(tweet.time) }),
		stream_div = goog.dom.getElementByClass(goog.getCssName('twangler-stream'));

	goog.dom.insertChildAt(stream_div, /** @type {Node} */ (tweet_html), 0);

	var new_tweet_div = goog.dom.getElementByClass(goog.getCssName('tweet') + tweet.id),
		anim = new goog.fx.dom.FadeInAndShow(new_tweet_div, twangler.FX_INTERVAL);

	anim.play();
};

twangler.startStreams = function () {
	for (var i = twangler.myStreams.length - 1; i >= 0; i--) {
		twangler.myStreams[i].start();
	}
	twangler.tweetIntervalId = setInterval(
		function() {
			var waitingTweets = twangler.myTweets.length,
				/**
				 * @const
				 * @type {number}
				 */
				tweetCutoff = 150,
				//nextTweet = Math.floor(waitingTweets/20);
				nextTweet = 0;

			if (waitingTweets) {
				var tweet = twangler.myTweets.splice(nextTweet,1)[0];

				while (goog.isDef(tweet) && !goog.isNull(goog.dom.getElementByClass(goog.getCssName('tweet') + tweet.id))) {
					tweet = twangler.myTweets.splice(nextTweet,1)[0];
				}

				if (goog.isDef(tweet))
					twangler.displayTweet(tweet);

				waitingTweets = twangler.myTweets.length;

				if (waitingTweets > tweetCutoff)
					//if (twangler.twitter.utils.dateDifference(twangler.myTweets[tweetCutoff].time) > (tweetCutoff * 1000))
						twangler.myTweets.splice(tweetCutoff,waitingTweets - tweetCutoff);
			}
		}, twangler.FX_INTERVAL
	);
	twangler.streamPaused = false;
	/*
	twangler.maintenanceIntervalId = setInterval(
		function() {
			// <b class="{css tweet-date}" data-time="{$tweet.unix}">{$str_time}</b>
			var tweet_times = goog.dom.getElementsByClass(goog.getCssName('tweet-date')),
				tweet_time;

			for (var i = tweet_times.length - 1; i >= 0; i--) {
				tweet_time = tweet_times[i];
			}
		}, twangler.FX_INTERVAL * 5
	);
	// */
};

twangler.stopStreams = function () {
	clearInterval(twangler.tweetIntervalId);
	//clearInterval(twangler.maintenanceIntervalId);
	for (var i = twangler.myStreams.length - 1; i >= 0; i--) {
		twangler.myStreams[i].stop();
	}
	twangler.streamPaused = true;
};

/**
 * @param {string} query
 * @param {string=} opt_color
 * @param {string=} opt_text_color
 * @param {string=} opt_cloud_query
 * @param {string=} opt_border_color
 * @param {string=} opt_gradient
 */
twangler.addStream = function (query, opt_color, opt_text_color, opt_cloud_query, opt_border_color, opt_gradient) {

	var stream_id = goog.getCssName('twangler_stream') + twangler.numStreams++,
		color = goog.isDef(opt_color) ? goog.color.parse(opt_color).hex : twangler.utils.randomColor(),
		text_color = goog.isDef(opt_text_color) ? goog.color.parse(opt_text_color).hex : twangler.utils.getContrastingColor(color),
		endColor,
		borderColor,
		cloud_query = '',
		stream,
		stream_label,
		flag = false;

		if (goog.isDef(opt_gradient)) {
			if (!goog.string.caseInsensitiveCompare(opt_gradient, 'darken')) {
				endColor = twangler.utils.getGradientColor(color, true);
			} else if (goog.string.caseInsensitiveCompare(opt_gradient, 'none')) {
				endColor = goog.color.parse(opt_gradient).hex;
			}
		} else {
			endColor = twangler.utils.getGradientColor(color);
		}

		if (goog.isDef(opt_border_color)) {
			if (!goog.string.caseInsensitiveCompare(opt_border_color, 'darken')) {
				borderColor = twangler.utils.getGradientColor(color, true);
			} else if (goog.string.caseInsensitiveCompare(opt_border_color, 'none')) {
				borderColor = goog.color.parse(opt_border_color).hex;
			}
		} else {
			borderColor = twangler.utils.getGradientColor(color);
		}

		if (goog.isDef(opt_cloud_query)) {
			cloud_query = opt_cloud_query;
		} else if (twangler.cloudBind && goog.string.caseInsensitiveCompare(twangler.myCloud.query, query)) {
			cloud_query = twangler.myCloud.query;
		}

		stream = new twangler.Stream(query, stream_id, cloud_query);

	stream_label = stream.label;
	//@todo this is where i would add color compare
	for (var i = twangler.myStreams.length - 1; i >= 0 && !flag; i--) {
		flag = !goog.string.caseInsensitiveCompare(twangler.myStreams[i].label, stream_label);
	}

	if (!flag) {

		var itemFragment = soy.renderAsFragment( twangler.templates.selectedItem, {
				item : stream.label,
				streamId : stream_id
			}),
			streamStyles = twangler.templates.streamStyles({
				streamId : stream_id,
				startColor : color,
				endColor :  endColor,
				textColor : text_color,
				borderColor : borderColor
			});

		twangler.myStreams.push(stream);
		stream.start();
		goog.style.installStyles(streamStyles);
		goog.dom.appendChild(goog.dom.getElementByClass(goog.getCssName('twangler-selected')), /** @type {Node} */ (itemFragment));

		goog.events.listen(
			stream,
			twangler.Stream.EventType.NEW_TWEETS,
			function (e) {
				var stream = e.target,
					i = stream.tweet_queue.length,
					tweet,
					tweetHtml,
					new_tweets_added = false;

				while (i) {
					tweet = stream.tweet_queue.pop();
					i = stream.tweet_queue.length;
					twangler.myTweets.push(tweet);
					new_tweets_added = true;
				}

				if (new_tweets_added) {
					/**
					 * @param  {twangler.Tweet} a
					 * @param  {twangler.Tweet} b
					 * @return {number}
					 */
					var compareTweets = function (a,b) {
						//compare freq

						var ta = twangler.twitter.utils.dateDifference(a.time);
						var tb = twangler.twitter.utils.dateDifference(b.time);

						if (ta < tb)
							return -1;
						if (ta > tb)
							return 1;

						//whatever
						return 0;
					};

					twangler.myTweets.sort(compareTweets);
				}
				twangler.numTwitterRequests++;
			}
		);
		return false;
	}
};
goog.exportSymbol('asp', twangler.addStream);

twangler.toggleCloudVisibility = function () {

	var icon_plus_className = 'icon-plus',
		icon_refresh_className = 'icon-refresh',

		active_icon_className = goog.getCssName('twangler-icon-active'),
		cloud_hidden_className = goog.getCssName('cloud-hidden'),

		cloud_div = goog.dom.getElementByClass(goog.getCssName('twangler-cloud')),
		header_buttons_div = goog.dom.getElementByClass(goog.getCssName('header-buttons')),
		cloud_update_button_icon = goog.dom.getElementByClass(goog.getCssName('header-update-icon')),
		cloud_pause_button = goog.dom.getElementByClass(goog.getCssName('twangler-cloud-pause')),
		header_stream_clear_button = goog.dom.getElementByClass(goog.getCssName('twangler-header-stream-clear')),
		cloud_show_button = goog.dom.getElementByClass(goog.getCssName('twangler-cloud-show')),
		selected_form = goog.dom.getElementByClass(goog.getCssName('selected-form')),
		stream_pause_button = goog.dom.getElementByClass(goog.getCssName('twangler-stream-pause')),

		stream_paused = goog.dom.classes.has(stream_pause_button, active_icon_className),
		anim1,
		anim2;

	if (goog.dom.classes.toggle(cloud_show_button, active_icon_className)) {
		anim1 = new goog.fx.dom.FadeInAndShow(cloud_div, twangler.FX_INTERVAL);
		anim2 = new goog.fx.dom.FadeInAndShow(selected_form, twangler.FX_INTERVAL);
		anim1.play();
		anim2.play();
		goog.style.showElement(header_stream_clear_button, false);
		goog.dom.classes.remove(cloud_pause_button, active_icon_className);
		goog.dom.classes.swap(cloud_update_button_icon, icon_plus_className, icon_refresh_className);
		twangler.myCloud.start();
		twangler.cloudPaused = false;
	} else {
		anim1 = new goog.fx.dom.FadeOutAndHide(cloud_div, twangler.FX_INTERVAL);
		anim2 = new goog.fx.dom.FadeOutAndHide(selected_form, twangler.FX_INTERVAL);
		anim1.play();
		anim2.play();
		goog.style.showElement(header_stream_clear_button, true);
		goog.dom.classes.enable(cloud_pause_button,active_icon_className,stream_paused);
		goog.dom.classes.swap(cloud_update_button_icon, icon_refresh_className, icon_plus_className);
		twangler.myCloud.stop();
		twangler.cloudPaused = true;
	}

	goog.dom.classes.toggle(header_buttons_div, cloud_hidden_className);

	twangler.cloudVisible = goog.dom.classes.has(cloud_show_button, active_icon_className);
};

twangler.clearStream = function () {
	var stream_div = goog.dom.getElementByClass(goog.getCssName('twangler-stream'));

	goog.dom.removeChildren(stream_div);
};

twangler.toggleCloudPause = function () {

	var active_icon_className = goog.getCssName('twangler-icon-active'),
		cloud_pause_button = goog.dom.getElementByClass(goog.getCssName('twangler-cloud-pause'));

	if (twangler.cloudVisible) {
		if (goog.dom.classes.toggle(cloud_pause_button, active_icon_className)) {
			twangler.myCloud.stop();
			twangler.cloudPaused = true;
		} else {
			twangler.myCloud.start();
			twangler.cloudPaused = false;
		}
	}
};

twangler.toggleStreamPause = function () {

	var active_icon_className = goog.getCssName('twangler-icon-active'),
		cloud_pause_button = goog.dom.getElementByClass(goog.getCssName('twangler-cloud-pause')),
		stream_pause_button = goog.dom.getElementByClass(goog.getCssName('twangler-stream-pause'));

	if (twangler.cloudVisible) {
		if (goog.dom.classes.toggle(stream_pause_button, active_icon_className)) {
			twangler.stopStreams();
		} else {
			twangler.startStreams();
		}
	} else {
		if (goog.dom.classes.toggle(cloud_pause_button, active_icon_className)) {
			twangler.stopStreams();
		} else {
			twangler.startStreams();
		}
	}

	twangler.streamPaused = !twangler.streamPaused;
};
/* Main Function */


twangler.main = function () {

	/* Display frame */

	var fragment = soy.renderAsFragment(twangler.templates.frame, {defaultQuery : twangler.defaultQuery});
	goog.dom.appendChild(goog.dom.getElementsByTagNameAndClass('body')[0], /** @type {Node} */ (fragment));

	var active_icon_className = goog.getCssName('twangler-icon-active'),
		cloud_item_className = goog.getCssName('cloud-item'),
		selected_item_className = goog.getCssName('selected-item'),

		cloud_div = goog.dom.getElementByClass(goog.getCssName('twangler-cloud')),
		header_input = goog.dom.getElementByClass(goog.getCssName('header-input')),
		
		cloud_update_button = goog.dom.getElementByClass(goog.getCssName('twangler-cloud-update')),
		cloud_bind_button = goog.dom.getElementByClass(goog.getCssName('twangler-cloud-bind')),
		cloud_pause_button = goog.dom.getElementByClass(goog.getCssName('twangler-cloud-pause')),
		header_stream_clear_button = goog.dom.getElementByClass(goog.getCssName('twangler-header-stream-clear')),
		cloud_show_button = goog.dom.getElementByClass(goog.getCssName('twangler-cloud-show')),

		selected_div = goog.dom.getElementByClass(goog.getCssName('twangler-selected')),
		selected_submit_button = goog.dom.getElementByClass(goog.getCssName('selected-submit')),
		stream_input = goog.dom.getElementByClass(goog.getCssName('selected-input')),
		stream_clear_button = goog.dom.getElementByClass(goog.getCssName('twangler-stream-clear')),
		stream_pause_button = goog.dom.getElementByClass(goog.getCssName('twangler-stream-pause')),

		root_key_handler = new goog.events.KeyHandler(document),
		header_input_key_handler = new goog.events.KeyHandler(header_input),
		stream_input_key_handler = new goog.events.KeyHandler(stream_input);

	/* Init Cloud */

	twangler.startStreams();

	goog.style.showElement(header_stream_clear_button, false);

	/* Init Event Listeners */

	goog.events.listen(
		twangler.myCloud,
		twangler.Cloud.EventType.CLOUD_UPDATED,
		function (e) {
			var cloud = e.target,
				fragment = soy.renderAsFragment(twangler.templates.cloudView, {cloud : cloud });
			goog.dom.removeChildren(cloud_div);
			goog.dom.appendChild(cloud_div, /** @type {Node} */ (fragment));
			twangler.numTwitterRequests++;
		}
	);

	/* Document Keyboard Event Listener */

	goog.events.listen(root_key_handler, goog.events.KeyHandler.EventType.KEY, function(e) {
		var keyEvent = /** @type {goog.events.KeyEvent} */ (e);
		if (keyEvent.ctrlKey) {
			switch(keyEvent.keyCode)
			{
				case goog.events.KeyCodes.Z:
					//pause
					twangler.toggleStreamPause();
				break;
				case goog.events.KeyCodes.S:
					//show
					twangler.toggleCloudVisibility();
				break;
				case goog.events.KeyCodes.D:
					//clear
					twangler.clearStream();
				break;
			}
		}
	});

	/* Header Button Event Listeners */

	goog.events.listen(header_input_key_handler, goog.events.KeyHandler.EventType.KEY, function(e) {
		var keyEvent = /** @type {goog.events.KeyEvent} */ (e);
		if (keyEvent.keyCode == goog.events.KeyCodes.ENTER) {
			var query = goog.string.trim(header_input.value);
			if (twangler.cloudVisible) {
				twangler.myCloud.change(query);
				if (twangler.cloudPaused)
					twangler.myCloud.stop();
			} else {
				twangler.addStream(query);
			}
		}
	});

	goog.events.listen(
		cloud_update_button,
		goog.events.EventType.CLICK,
		function (e) {
			var query = goog.string.trim(header_input.value);
			if (twangler.cloudVisible) {
				twangler.myCloud.change(query);
				if (twangler.cloudPaused)
					twangler.myCloud.stop();
			} else {
				twangler.addStream(query);
			}
		}
	);

	goog.events.listen(
		cloud_bind_button,
		goog.events.EventType.CLICK,
		function (e) {
			twangler.cloudBind = goog.dom.classes.toggle(
				cloud_bind_button,
				active_icon_className
			);
		}
	);

	goog.events.listen(
		cloud_pause_button,
		goog.events.EventType.CLICK,
		function (e) {
			if (twangler.cloudVisible) {
				twangler.toggleCloudPause();
			} else {
				twangler.toggleStreamPause();
			}
		}
	);

	goog.events.listen(
		cloud_show_button,
		goog.events.EventType.CLICK,
		function (e) {
			twangler.toggleCloudVisibility();
		}
	);

	goog.events.listen(
		header_stream_clear_button,
		goog.events.EventType.CLICK,
		function (e) {
			twangler.clearStream();
		}
	);

	/* Cloud Button Event Listeners */

	goog.events.listen(
		cloud_div,
		goog.events.EventType.CLICK,
		function (e) {
			var item = e.target;
			if (goog.dom.classes.has(item, cloud_item_className)) {
				var query = goog.string.trim(item.innerHTML);
				/*
				if (query.lastIndexOf('@', 0) === 0)
					query = 'from:' + query.substr(1);
				// */
				twangler.addStream(query);
			}
		}
	);

	/* Stream Button Event Listeners */

	goog.events.listen(stream_input_key_handler, goog.events.KeyHandler.EventType.KEY, function(e) {
		var keyEvent = /** @type {goog.events.KeyEvent} */ (e);
		if (keyEvent.keyCode == goog.events.KeyCodes.ENTER) {
			var query = goog.string.trim(stream_input.value);
			twangler.addStream(query);
		}
	});

	goog.events.listen(
		selected_submit_button,
		goog.events.EventType.CLICK,
		function (e) {
			var query = goog.string.trim(stream_input.value);
			twangler.addStream(query);
		}
	);

	goog.events.listen(
		stream_pause_button,
		goog.events.EventType.CLICK,
		function (e) {
			twangler.toggleStreamPause();
		}
	);

	goog.events.listen(
		stream_clear_button,
		goog.events.EventType.CLICK,
		function (e) {
			twangler.clearStream();
		}
	);

	/* Selectect Item Event Listeners */

	goog.events.listen(
		selected_div,
		goog.events.EventType.CLICK,
		function (e) {
			var item = e.target;

			if (goog.string.contains(item.className, selected_item_className)) {

				var stream_id = goog.string.trim(item.id),
					stream,
					tweet,
					i;

				for (i = twangler.myStreams.length - 1; i >= 0; i--) {
					stream = twangler.myStreams[i];

					if (goog.string.compareVersions(stream.id, stream_id) === 0) {
						stream.stop();
						goog.array.remove(twangler.myStreams, stream);
					}
				}
				for (i = twangler.myTweets.length - 1; i >= 0; i--) {
					tweet = twangler.myTweets[i];

					if (goog.string.compareVersions(tweet.stream_id, stream_id) === 0) {
						goog.array.remove(twangler.myTweets, tweet);
					}
				}
				item.parentNode.removeChild(item);
			}
		}
	);
	/* Init Router */
	//twangler.router.route('*', twangler.parseToken);
	
	twangler.analytics.trackPage();
	twangler.analytics.gaInit();
};

twangler.main();