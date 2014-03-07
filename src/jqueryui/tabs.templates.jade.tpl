
meta(ng-module='optng.jqueryui.tabs.templates')

script(type='text/ng-template', id='$optng.jqueryui.tab.template')
	ul.ui-tabs-nav.ui-helper-reset.ui-helper-clearfix.ui-widget-header.ui-corner-all(role='tablist')
		li(
			jqui-hoverable
			ng-class="{'ui-state-active': tab === _tabs.current, 'ui-tabs-active': tab === _tabs.current}"
			ng-repeat="tab in _tabs.tabs"
			class="ui-state-default ui-corner-top"
			role='tab'
		)
			a.ui-tabs-anchor(
				href="javascript://"
				tabindex='-1'
				ng-click="_tabs.focusTab(tab)"
				class='ui-tabs-anchor'
				role='presentation'
			)
				{{ tab.title }}
				i.icon-remove(ng-show="tab.closable" ng-click="tab.remove()")

	//- .ui-tabs-panel.ui-widget-content.ui-corner-bottom
	//- 	div(ng-include="$tabs.$tab.template")
