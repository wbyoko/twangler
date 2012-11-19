goog.provide('twangler');

goog.require('twangler.templates');
goog.require('twangler.controller');

goog.require('twangler.Cloud');
goog.require('twangler.Cloud.EventType');

goog.require('twangler.Stream');
goog.require('twangler.Stream.EventType');

goog.require('goog.dom');
goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.events');
goog.require('goog.events.EventType');

goog.require('soy');

twangler.main = function () {

	/* Display frame */

	var defaultQuery = '#callofduty',
		fragment = soy.renderAsFragment(twangler.templates.frame, {defaultQuery : defaultQuery});
		console.log(fragment);
	goog.dom.appendChild(goog.dom.getElementsByTagNameAndClass('body')[0], /** @type {Node} */ (fragment));

	/* Init Cloud */

	var cloud = new twangler.Cloud(defaultQuery),
		streams = [],
		num_streams = 0,
		tweet_queue = [],
		displayTweet = function (tweet) {
			var tweetHtml = soy.renderAsFragment(twangler.templates.tweetView, {tweet : tweet}),
				streamDiv = goog.dom.getElementByClass(goog.getCssName('twangler-stream'));
			goog.dom.insertChildAt(streamDiv, /** @type {Node} */ (tweetHtml), 0);
		},
		interval_id = setInterval(
			function() {
				if (tweet_queue.length) {
					var tweet = tweet_queue.pop();
					while (goog.isDef(tweet) && !goog.isNull(goog.dom.getElementByClass('tweet' + tweet.id))) {
						tweet = tweet_queue.pop();
					}
					if (goog.isDef(tweet))
						displayTweet(tweet);
				}
			}, 750
		);

	/* Init Event Listeners */

	goog.events.listen(
		cloud,
		twangler.Cloud.EventType.CLOUD_UPDATED,
		twangler.controller.updateCloudView
	);

	goog.events.listen(
		goog.dom.getElementByClass(goog.getCssName('header-sumbit')),
		goog.events.EventType.CLICK,
		function (e) {
			var query = goog.string.trim(goog.dom.getElementByClass(goog.getCssName('header-input')).value);
			cloud.change(query);
		}
	);

	goog.events.listen(
		goog.dom.getElementByClass(goog.getCssName('twangler-cloud')),
		goog.events.EventType.CLICK,
		function (e) {
			var item = e.target;

			if (goog.string.contains(item.className, goog.getCssName('cloud-item'))) {
				var query = goog.string.trim(item.innerHTML),
					iQuery = query + (goog.string.caseInsensitiveCompare(cloud.query, query) ? ' (' + cloud.query + ')': '' ),
					sQuery = cloud.query + ' ' + query,
					color = '#' + ('000000' + Math.floor(Math.random() * 0xFFFFFF).toString(16)).substr(-6),
					contrast = function (color) {
						return '#' + (Number('0x'+color.substr(1)).toString(10) > 0xffffff/2 ? '000000' :  'ffffff');
					},
					flag = false,
					stream_id = 'x' + num_streams++ + 'z';

				for (var i = streams.length - 1; i >= 0 && !flag; i--) {
					flag = flag || (streams[i].query === sQuery);
				}

				if (!flag) {
					var stream = new twangler.Stream(sQuery, stream_id, color),
						itemFragment = soy.renderAsFragment( twangler.templates.selectedItem, {
							item : iQuery,
							color : color,
							contrast : contrast(color),
							id : stream_id
						});

					//console.log(twangler.templates.selectedItem({item:query, color:color}));
					//console.log(itemFragment);

					streams.push(stream);
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
								tweet_queue.push(tweet);
								new_tweets_added = true;
							}

							if (new_tweets_added) {
								/**
								 * @param  {Twitter.tweet} a
								 * @param  {Twitter.tweet} b
								 * @return {number}
								 */
								var compareTweets = function (a,b) {
									//compare freq

									var ta = Date.parse(a.time.replace(/( \+)/, ' UTC$1'));
									var tb = Date.parse(b.time.replace(/( \+)/, ' UTC$1'));

									if (ta < tb)
										return -1;
									if (ta > tb)
										return 1;

									//whatever
									return 0;
								};

								goog.array.sort(tweet_queue, compareTweets);
							}
						}
					);
				}
			}
		}
	);

	goog.events.listen(
		goog.dom.getElementByClass(goog.getCssName('twangler-selected')),
		goog.events.EventType.CLICK,
		function (e) {
			var item = e.target;

			if (goog.string.contains(item.className, goog.getCssName('selected-item'))) {

				var stream_id = goog.string.trim(item.id),
					tweet,
					tweet_stream_id,
					i;

				for (i = streams.length - 1; i >= 0; i--) {
					if (goog.string.compareVersions(streams[i].id, stream_id) === 0) {
						streams[i].stop();
						goog.array.remove(streams, streams[i]);
					}
				}
				for (i = tweet_queue.length - 1; i >= 0; i--) {
					tweet = tweet_queue[i],
					tweet_stream_id = tweet.stream_id;
					if (goog.string.compareVersions(tweet_stream_id, stream_id) === 0) {
						goog.array.remove(tweet_queue, tweet);
					}
				}
				item.parentNode.removeChild(item);
			}
		}
	);

};

twangler.main();