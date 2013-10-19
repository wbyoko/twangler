goog.provide('twangler.view.CloudItem');

goog.require('goog.ui.Control');
goog.require('goog.ui.registry');
goog.require('twangler.view.CloudItemRenderer');

/**
 * A control that displays a ChecklistItem.
 * @param {goog.ui.ControlContent=} opt_content Text caption or DOM structure
 *     to display as the content of the component (if any).
 * @constructor
 * @extends {goog.ui.Control}
 */
twangler.view.CloudItem = function(opt_content) {
	goog.base(this, opt_content || '');
	this.setDispatchTransitionEvents(goog.ui.Component.State.ACTIVE, true);
};
goog.inherits(twangler.view.CloudItem, goog.ui.Control);

goog.ui.registry.setDefaultRenderer(
	twangler.view.CloudItem,
	twangler.view.CloudItemRenderer
);

goog.ui.registry.setDecoratorByClassName(
	twangler.view.CloudItemRenderer.CSS_CLASS,
	function() {
		return new twangler.view.CloudItem();
	}
);