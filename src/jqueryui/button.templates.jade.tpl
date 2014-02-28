
meta(ng-module='optng.jqueryui.button.template')

//-
	Template for the $optng.jqueryui.button directive.

script(type='text/ng-template', id='$optn.jqueryui.dialog.template')

	div
		.ui-widget-overlay.ui-front(ng-if='$dialog.modal')
		.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-front.ui-content-height-fixed.ui-dialog-buttons.ui-draggable.ui-resizable(
			tabindex='-1'
		)

			//- Title bar.
			.ui-dialog-titlebar.ui-widget-header.ui-corner-all.ui-helper-clearfix
				//- Title display
				span.ui-dialog-title {{ $dialog.title }}
				//- close button !
				button.ui-button.ui-widget.ui-state-default.ui-corner-all.ui-button-icon-only.ui-dialog-titlebar-close(
					jqui-hoverable
					jqui-focusable
				)
					span.ui-button-icon-primary.ui-icon.ui-icon-closethick
					span.ui-button-text close


			//- The contents of the dialog go here.
			div(ng-transclude)

			//- And here is the button bar !
			div.ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix
				div.ui-dialog-buttonset
					button(ng-repeat='btn in $dialog.buttons' jqui-button)

