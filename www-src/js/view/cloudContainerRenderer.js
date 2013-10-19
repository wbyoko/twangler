goog.provide('twangler.view.CloudContainerRenderer');

goog.require('goog.ui.ContainerRenderer');

/**
 * @constructor
 * @extends {goog.ui.ContainerRenderer}
 */
twangler.view.CloudContainerRenderer = function() {
	goog.base(this);
};
goog.inherits(twangler.view.CloudContainerRenderer, goog.ui.ContainerRenderer);
goog.addSingletonGetter(twangler.view.CloudContainerRenderer);

/** @type {string} */
twangler.view.CloudContainerRenderer.CSS_CLASS = goog.getCssName('twangler-cloud');

/** @inheritDoc */
twangler.view.CloudContainerRenderer.prototype.getCssClass = function() {
	return twangler.view.CloudContainerRenderer.CSS_CLASS;
};