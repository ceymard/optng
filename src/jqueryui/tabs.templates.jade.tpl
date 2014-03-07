
meta(ng-module='optng.jqueryui.tabs.templates')

script(type='text/ng-template', id='$optng.jqueryui.tab.template')
	ul.ui-tabs-nav.ui-helper-reset.ui-helper-clearfix.ui-widget-header.ui-corner-all
		li(
			jqui-hoverable
			ng-class="{'ui-state-active': tab === _tabs.$tab}"
			ng-repeat="tab in _tabs.tabs"
			class="ui-state-default ui-corner-top"
		)
			a.ui-tabs-anchor(
				href="javascript://"
				tabindex='-1'
				ng-mouseenter="hovering = true"
				ng-mouseleave="hovering = false"
				ng-click="_tabs.show(tab)"
			)
				{{ tab.title }}
				i.icon-remove(ng-show="tab.closable" ng-click="tab.remove()")

	//- .ui-tabs-panel.ui-widget-content.ui-corner-bottom
	//- 	div(ng-include="$tabs.$tab.template")
