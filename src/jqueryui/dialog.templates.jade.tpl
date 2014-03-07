
meta(ng-module='optng.jqueryui.dialog.templates')

//-
	Template for the $optng.jqueryui.dialog directive.

script(type='text/ng-template', id='$optng.jqueryui.dialog.template')

	div
		//- Add a transparent overlay if the dialog is modal.
		.ui-widget-overlay.ui-front(ng-if='_dialog.modal', ng-click='_dialog.close()')

		//- This is the real dialog.
		.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-front.ui-content-height-fixed.ui-dialog-buttons.ui-draggable.ui-resizable(
			tabindex='-1'
			ng-class="_dialog.class"
			ng-style="{\
				position: 'absolute',\
				width: '' + _dialog.width + 'px',\
				height: '' + _dialog.height + 'px',\
				top: '50px',\
				left: '50%',\
				'margin-left': '-' + _dialog.width/2 + 'px'\
			}"
		)

			//- Title bar.
			.ui-dialog-titlebar.ui-widget-header.ui-corner-all.ui-helper-clearfix
				//- Title display
				span.ui-dialog-title {{ _dialog.title }}
				//- close button !
				button.ui-button.ui-widget.ui-state-default.ui-corner-all.ui-button-icon-only.ui-dialog-titlebar-close(
					jqui-hoverable
					jqui-focusable
					ng-click='_dialog.close()'
				)
					span.ui-button-icon-primary.ui-icon.ui-icon-closethick
					span.ui-button-text close


			//- The contents of the dialog go here.
			.ui-dialog-content.ui-widget-content(ng-transclude)

			//- And here is the button bar !
			div.ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix(ng-if='_dialog.buttons')
				div.ui-dialog-buttonset
					button(
						ng-repeat='btn in _dialog.buttons'
						jqui-button
						role='button'
						aria-disabled='false'
						ng-class='btn.class'
						ng-click='btn.click.call(_dialog)'
					) {{ btn.text }}
