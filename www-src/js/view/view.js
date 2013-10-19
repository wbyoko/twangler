goog.provide('twangler.view');

goog.require('goog.ui.Container');
goog.require('goog.ui.ContainerRenderer');

twangler.view.CloudContainer = new goog.ui.Container(
	goog.ui.Container.Orientation.HORIZONTAL,
	goog.ui.ContainerRenderer.getCustomRenderer(
		goog.ui.Container,
		goog.getCssName("twangler-cloud")
	)
);