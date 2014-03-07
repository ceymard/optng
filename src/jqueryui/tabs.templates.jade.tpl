
meta(ng-module='optng.jqueryui.tabs.templates')

script(type='text/ng-template', id='$optng.jqueryui.tab.template')
	ul.ui-tabs-nav.ui-helper-reset.ui-helper-clearfix.ui-widget-header.ui-corner-all
		li(
			ng-class="{\
				'ui-state-hover': hovering,\
				'ui-state-active': tab === $tabs.$tab\
			}"
			ng-repeat="tab in $tabs.tabs"
			class="ui-state-default ui-corner-top"
		)
			a.ui-tabs-anchor(
				href="javascript://"
				ng-mouseenter="hovering = true"
				ng-mouseleave="hovering = false"
				ng-click="tab.focus()"
			)
				{{ tab.title }}
				i.icon-remove(ng-show="tab.closable" ng-click="tab.remove()")

	.ui-tabs-panel.ui-widget-content.ui-corner-bottom
		div(ng-include="$tabs.$tab.template")
