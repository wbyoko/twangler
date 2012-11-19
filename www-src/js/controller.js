goog.provide('twangler.controller');

/* Button Controller Functions */

/* Event Controller Functions */

twangler.controller.updateCloudView = function (e) {
	var cloud = e.target,
		cloudDiv = goog.dom.getElementByClass(goog.getCssName('twangler-cloud')),
		fragment = soy.renderAsFragment(twangler.templates.cloudView, {cloud : cloud });
	goog.dom.removeChildren(cloudDiv);
	goog.dom.appendChild(cloudDiv, /** @type {Node} */ (fragment));
};