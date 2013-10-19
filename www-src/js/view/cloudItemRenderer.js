goog.provide('twangler.view.CloudItemRenderer');

goog.require('goog.ui.ControlRenderer');

/**
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
twangler.view.CloudItemRenderer = function() {
	goog.base(this);
};
goog.inherits(twangler.view.CloudItemRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(twangler.view.CloudItemRenderer);

/** @type {string} */
twangler.view.CloudItemRenderer.CSS_CLASS = goog.getCssName('cloud-item');

/** @inheritDoc */
twangler.view.CloudItemRenderer.prototype.getCssClass = function() {
	return twangler.view.CloudItemRenderer.CSS_CLASS;
};