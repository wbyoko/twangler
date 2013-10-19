goog.provide('twangler.view.CloudContainer');

goog.require('goog.ui.Container');
goog.require('goog.ui.registry');
goog.require('twangler.view.CloudContainerRenderer');

/**
 * A control that displays a ChecklistItem.
 * @param {goog.ui.ControlContent=} opt_content Text caption or DOM structure
 *     to display as the content of the component (if any).
 * @constructor
 * @extends {goog.ui.Control}
 */
twangler.view.CloudContainer = function() {
	goog.base(this);
};
goog.inherits(twangler.view.CloudContainer, goog.ui.Container);

goog.ui.registry.setDefaultRenderer(
	twangler.view.CloudContainer,
	twangler.view.CloudContainerRenderer
);

goog.ui.registry.setDecoratorByClassName(
	twangler.view.CloudContainerRenderer.CSS_CLASS,
	function() {
		return new twangler.view.CloudContainer();
	}
);
