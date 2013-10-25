

Evolutions from gridix-angular mess
===================================

* extensions to jquery are now loaded as a module. gdRemove and gdChildScopes
  disappear.

* optng.ajaxload with optLoad and optLoadIndicator

* created the optng.edit module with contenteditable fun.

* gridix angular filters went to the lodash module, so load optng.lodash

* gd-input is now named $gestures. Directive names are gestures and global-gestures.
	They now expect json objects for the gestures instead of the strange custom object.

* gd-if and gd-ifelse and friends shall not be kept, in favor of ng-switch, a
	more maintained (since it's official) solution.

* gdutils disappears. Instead, $optng.throttler and $optng.utils.ObserverGroup for
	the most common parts.

* requestThrottler is now in $optng.throttler. There is a new service
	$optng.throttler.http to replace $http when needed.
