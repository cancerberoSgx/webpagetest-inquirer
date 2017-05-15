(function() {
window["JST"] = window["JST"] || {};

window["JST"]["_modal.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">\n  <div class="modal-dialog">\n    <div class="modal-content">\n      <div class="modal-header">\n        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\n        <h4 class="modal-title" data-type="modal-title" id="myModalLabel">' +
((__t = ( this.title )) == null ? '' : __t) +
'</h4>\n      </div>\n      <div class="modal-body" data-type="modal-body">\n      </div>\n      <div class="modal-footer">\n        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n        <!-- <button type="button" class="btn btn-primary">Save changes</button> -->\n      </div>\n    </div>\n  </div>\n</div>';

}
return __p
}})();
(function() {
window["JST"] = window["JST"] || {};

window["JST"]["header.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<nav class="navbar navbar-default">\n  <div class="container-fluid">\n    <!-- Brand and toggle get grouped for better mobile display -->\n    <div class="navbar-header">\n      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">\n        <span class="sr-only">Toggle navigation</span>\n        <span class="icon-bar"></span>\n        <span class="icon-bar"></span>\n        <span class="icon-bar"></span>\n      </button>\n      <a class="navbar-brand" href="#">webpagetest-inquirer UI</a>\n    </div>\n\n    <!-- Collect the nav links, forms, and other content for toggling -->\n    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">\n      <!-- <ul class="nav navbar-nav"> -->\n        <!-- <li class="active"><a href="#">Link <span class="sr-only">(current)</span></a></li> -->\n        <!-- <li><a href="#">Home</a></li> -->\n      <!--   <li class="dropdown">\n          <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Dropdown <span class="caret"></span></a>\n          <ul class="dropdown-menu" role="menu">\n            <li><a href="#">Action</a></li>\n            <li><a href="#">Another action</a></li>\n            <li><a href="#">Something else here</a></li>\n            <li class="divider"></li>\n            <li><a href="#">Separated link</a></li>\n            <li class="divider"></li>\n            <li><a href="#">One more separated link</a></li>\n          </ul>\n        </li> -->\n      <!-- </ul> -->\n    <!--   <form class="navbar-form navbar-left" role="search">\n        <div class="form-group">\n          <input type="text" class="form-control" placeholder="Search">\n        </div>\n        <button type="submit" class="btn btn-default">Submit</button>\n      </form> -->\n      <ul class="nav navbar-nav navbar-right">\n        <li><a href="#">Home</a></li>\n        <li class="dropdown">\n          <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">About <span class="caret"></span></a>\n          <ul class="dropdown-menu" role="menu">\n            <li><a href="https://github.com/cancerberoSgx/webpagetest-inquirer">Project Home Page</a></li>\n            <li><a href="http://www.webpagetest.org/">Based on webpagetest.org</a></li>\n            <li><a href="#">Something else here</a></li><!-- \n            <li class="divider"></li>\n            <li><a href="#">Separated link</a></li> -->\n          </ul>\n        </li>\n      </ul>\n    </div><!-- /.navbar-collapse -->\n  </div><!-- /.container-fluid -->\n</nav>';

}
return __p
}})();
(function() {
window["JST"] = window["JST"] || {};

window["JST"]["home.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<h1>Test definitions</h1>\n\n\n\n<div class="row">\n<div class="col-md-8">\n	<p>Please select one or more tests below and click \'report\' to see its reports. </p>\n\n	<div data-type="loading-spinner"></div>\n\n	<ul>\n	';
 _(this.metadata).each(function(metadata, testId){ ;
__p += '\n		<li><input class="report-selection" type="checkbox" value="' +
((__t = ( testId )) == null ? '' : __t) +
'">' +
((__t = ( testId )) == null ? '' : __t) +
'</input></li>\n	';
 });
__p += '\n	</ul>\n</div>\n<div class="col-md-4">\n	<p class="condition-met" style="display: none">Please select one or more tests first</p>\n	<button data-action="report">See Single test numbers report!</button>\n	<button data-action="report-compare">Compare tests numbers report!</button>	\n	<button data-action="report-visualProgressCompare">Compare test\'s visual progress!</button>\n</div>\n</div>\n\n\n';

}
return __p
}})();
(function() {
window["JST"] = window["JST"] || {};

window["JST"]["loading.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<style>\n.spinner {\n  width: 30px;\n  height: 30px;\n  background-color: #333;\n\n  margin: 100px auto;\n  -webkit-animation: rotateplane 1.2s infinite ease-in-out;\n  animation: rotateplane 1.2s infinite ease-in-out;\n  width: 100px;height: 100px;\n  color: #a3a3ff;\n  opacity: 0.6;\n  padding: 40px 0 0 15px;\n  font-size: 17px;\n  font-weight: bold;\n}\n\n@-webkit-keyframes rotateplane {\n  60% { -webkit-transform: perspective(120px) }\n  80% { -webkit-transform: perspective(120px) rotateY(180deg) }\n  100% { -webkit-transform: perspective(120px) rotateY(180deg)  rotateX(180deg) }\n}\n\n@keyframes rotateplane {\n  60% { \n    transform: perspective(120px) rotateX(0deg) rotateY(0deg);\n    -webkit-transform: perspective(120px) rotateX(0deg) rotateY(0deg) \n  } \n  80% { \n    transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);\n    -webkit-transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg) \n  } \n  100% { \n    transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);\n    -webkit-transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);\n  }\n}\n</style>\n<div class="spinner">Loading...</div>';

}
return __p
}})();
(function() {
window["JST"] = window["JST"] || {};

window["JST"]["report-compare.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<h1>Page loading numbers comparision for tests ' +
((__t = ( this.testIds.join(', ') )) == null ? '' : __t) +
'</h1>\n\n<div data-type="loading-spinner"></div>\n\n<p>\n<a href="' +
((__t = ( window.location.hash.replace('reportCompare', 'visualProgressCompare') )) == null ? '' : __t) +
'">\nVisual progress compare view</a>, \n\n<a href="' +
((__t = ( window.location.hash.replace('reportCompare', 'resourceBreakdown') )) == null ? '' : __t) +
'">\nResource type breakdown compare view</a>\n</p>\n\n<div data-view="test-description"></div>\n\n<p><label>\n	<input type="checkbox" data-action="viewFirstView" ' +
((__t = ( this.options.viewRepeatView ? 'checked' : '')) == null ? '' : __t) +
'> </input>Show <strong>Repeat View</strong> ?</label>\n\n	<span data-help-ref="repeatView" \n		data-help-title="Repeat View" \n		class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>\n</p>\n\n<p><label>\n	<input type="checkbox" data-action="removeOutliers" ' +
((__t = ( this.options.removeOutliers ? 'checked' : '')) == null ? '' : __t) +
'> </input>Remove outliers ?</label>\n\n	<span data-help-ref="removeOutliers" \n		data-help-title="Remove outliers" \n		class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>\n</p>\n\n<p><label>Sample selection by:\n	<select data-type="sample-selection-by">\n		<option value="average" ' +
((__t = ( this.options.sampleSelectionBy==='average' ? 'selected' : '' )) == null ? '' : __t) +
' >average</option>\n		<option value="median" ' +
((__t = ( this.options.sampleSelectionBy==='median' ? 'selected' : '' )) == null ? '' : __t) +
'>median</option>\n	</select>\n	</label>\n	<span data-help-ref="reportCompareSampleSelectionBy" \n		data-help-title="Sample selection by" \n		class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>\n</p>\n\n<div class="row">\n  <div class="col-md-6">\n	<figure class="chart" data-id="visualCompletionNonZeroCanvas">\n		<figcaption>Time when VisualCompletion is non zero. </figcaption>\n		<span data-help-ref="visualCompletionNonZero" \n			data-help-title="SVisual Completion non zero" \n			class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>\n		<div class="chart-tooltip"></div>\n		<canvas class="chart-canvas" height="300" width="550" \n			alt="First paint time for test definition ' +
((__t = ( this.testIds.join(', ') )) == null ? '' : __t) +
'">\n		</canvas>		\n		<div class="chart-legend"></div>\n	</figure>\n\n  </div>\n  <div class="col-md-6">\n  	<figure class="chart" data-id="visualCompletion100Canvas" >\n		<figcaption>Visual Completion 100%</figcaption>\n		<span data-help-ref="visualCompletion100" \n			data-help-title="SVisual Completion 100%" \n			class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>\n  		<div class="chart-tooltip"></div>\n  		<!-- <div class="chart-controls">\n  			<label>Break on <input type="number" value="100" data-type="chart-visualCompletion100-breakOn"></input> %</label>\n  		</div> -->\n		<canvas class="chart-canvas" height="300" width="550" \n		alt="Visual Completion 100% for est definition ' +
((__t = ( this.testIds.join(', ') )) == null ? '' : __t) +
'"></canvas>\n\n		<div class="chart-legend"></div>\n	</figure>\n  </div>\n</div>\n\n<div class="row">\n \n  <div class="col-md-6">\n	<figure class="chart" data-id="fullyLoadedCanvas">\n		<figcaption>Time to fully loaded</figcaption>\n		<span data-help-ref="fullyLoaded" \n			data-help-title="Time to fully loaded" \n			class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>\n		<div class="chart-tooltip"></div>\n		<div class="chart-tooltip"></div>\n		<canvas class="chart-canvas"  height="300" width="550" \n			alt="Time to fully loaded for test definition ' +
((__t = ( this.testIds.join(', ') )) == null ? '' : __t) +
'">\n		</canvas>		\n		<div class="chart-legend"></div>\n	</figure>\n\n  </div>\n\n  <div class="col-md-6">\n	\n	<figure class="chart" data-id="SpeedIndex">\n		<figcaption>Speed Index</figcaption>\n		<span data-help-ref="speedIndex" \n			data-help-title="Speed index" \n			class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>\n		<div class="chart-tooltip"></div>\n		<canvas class="chart-canvas"  height="300" width="550" \n			alt="Speed Index for test definition ' +
((__t = ( this.testIds.join(', ') )) == null ? '' : __t) +
'">\n		</canvas>		\n		<div class="chart-legend"></div>\n	</figure>\n  </div>\n</div>\n\n\n<div class="row">\n\n <div class="col-md-6">\n	<figure class="chart" data-id="lastVisualChangeCanvas">\n		<figcaption>Time of the last visual change</figcaption>\n		<div class="chart-tooltip"></div>\n		<canvas class="chart-canvas"  height="300" width="550" \n			alt="First paint time for test definition ' +
((__t = ( this.testIds.join(', ') )) == null ? '' : __t) +
'">\n		</canvas>		\n		<div class="chart-legend"></div>\n	</figure>\n\n  </div>\n\n  <div class="col-md-6">\n	<!-- <figure class="chart" data-id="fullyLoadedCanvas">\n		<figcaption>Time to fully loaded</figcaption>\n		<div class="chart-tooltip"></div>\n		<canvas class="chart-canvas"  height="300" width="550" \n			alt="Time to fully loaded for test definition ' +
((__t = ( this.testIds.join(', ') )) == null ? '' : __t) +
'">\n		</canvas>		\n		<div class="chart-legend"></div>\n	</figure> -->\n  </div>\n</div>\n\n\n\n<div>\n</div>\n\n';

}
return __p
}})();
(function() {
window["JST"] = window["JST"] || {};

window["JST"]["report-visual-progress-compare.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<h1>Visual Progress Comparision for tests ' +
((__t = ( this.testIds.join(', ') )) == null ? '' : __t) +
'</h1>\n\n<div data-type="loading-spinner"></div>\n\n<p>\n	<a href="' +
((__t = ( window.location.hash.replace('visualProgressCompare', 'reportCompare') )) == null ? '' : __t) +
'">\n	Main Numbers compare view</a>, \n	<a href="' +
((__t = ( window.location.hash.replace('visualProgressCompare', 'resourceBreakdown') )) == null ? '' : __t) +
'">\n	Resource type breakdown compare view</a>\n</p>\n\n<div data-view="test-description"></div>\n\n<p>This page compares <strong>VISUAL PROGRESS</strong> of some test definitions. The speed index is \nthe correct quantification for this, but seeing visually gives much more information. </p>\n\n<p>From all the existing samples we show only the visual progress of median samples with respect to some interesting sample number. \n	So there is a chart with the visual progress of the median with respect to an interesting number like the visual completion, speed index, fully loaded, etc:</p>\n\n<p><input type="checkbox" data-action="viewFirstView" ' +
((__t = ( this.options.viewRepeatView ? 'checked' : '')) == null ? '' : __t) +
'>Show <strong>Repeat View<strong> ?</input>\n	<span data-help-ref="repeatView" \n		data-help-title="Repeat View" \n		class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>\n</p>\n\n<p><label>\n	<input type="checkbox" data-action="removeOutliers" ' +
((__t = ( this.options.removeOutliers ? 'checked' : '')) == null ? '' : __t) +
'> </input>Remove outliers ?</label>\n\n	<span data-help-ref="removeOutliers" \n		data-help-title="Remove outliers" \n		class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>\n</p>\n\n<div class="row">\n  <div class="col-md-12">\n	<figure class="chart" data-id="visualCompletionNonZeroCanvas" data-measure-name="VisuallyCompleteNonZero">\n		<figcaption>Time when VisualCompletion is non zero. </figcaption>\n		<span data-help-ref="visualCompletionNonZero" \n			data-help-title="Visual Completion non zero" \n			class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>\n		<div><a data-placeholder="videoFramesCompare" href="">\n			<span class="glyphicon glyphicon-exclamation-sign"></span>Video frames</a>\n		</div>\n		<div class="chart-tooltip"></div>\n		<canvas class="chart-canvas"  height="300" width="550" \n			alt="First paint time for test definition ' +
((__t = ( this.testIds.join(', ') )) == null ? '' : __t) +
'">\n		</canvas>		\n		<div class="chart-legend"></div>\n	</figure>\n  </div>\n</div>\n\n<div class="row">\n  <div class="col-md-12">\n  	<figure class="chart" data-id="visualCompletion100Canvas"  data-measure-name="VisuallyComplete100">\n		<figcaption>Visual Completion 100%</figcaption>\n		<span data-help-ref="visualCompletion100" \n			data-help-title="SVisual Completion 100%" \n			class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>\n		<div><a data-placeholder="videoFramesCompare" href="">\n			<span class="glyphicon glyphicon-exclamation-sign"></span>Video frames</a>\n		</div>\n  		<div class="chart-tooltip"></div>\n		<canvas class="chart-canvas" height="300" width="550" \n		alt="Visual Completion 100% for est definition ' +
((__t = ( this.testIds.join(', ') )) == null ? '' : __t) +
'"></canvas>\n\n		<div class="chart-legend"></div>\n	</figure>\n  </div>\n</div>\n\n<div class="row">\n</div>\n\n<div class="row">\n  <div class="col-md-12">\n	\n	<figure class="chart" data-id="SpeedIndex" data-measure-name="SpeedIndex">\n		<figcaption>Speed Index</figcaption>\n		<span data-help-ref="speedIndex" \n			data-help-title="Speed index" \n			class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>\n		<div><a data-placeholder="videoFramesCompare" href="">\n			<span class="glyphicon glyphicon-exclamation-sign"></span>Video frames</a>\n		</div>\n		<div class="chart-tooltip"></div>\n		<canvas class="chart-canvas"  height="300" width="550" \n			alt="Speed Index for test definition ' +
((__t = ( this.testIds.join(', ') )) == null ? '' : __t) +
'">\n		</canvas>		\n		<div class="chart-legend"></div>\n	</figure>\n  </div>\n</div>\n\n <div class="col-md-12">\n	<figure class="chart" data-id="fullyLoadedCanvas" data-measure-name="fullyLoaded">\n		<figcaption>Time to fully loaded</figcaption>\n		<span data-help-ref="fullyLoaded" \n			data-help-title="Time to Fully Loaded" \n			class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>\n		<div><a data-placeholder="videoFramesCompare" href="">\n			<span class="glyphicon glyphicon-exclamation-sign"></span>Video frames</a>\n		</div>\n		<div class="chart-tooltip"></div>\n		<canvas class="chart-canvas"  height="300" width="550" \n			alt="Time to fully loaded for test definition ' +
((__t = ( this.testIds.join(', ') )) == null ? '' : __t) +
'">\n		</canvas>		\n		<div class="chart-legend"></div>\n	</figure>\n</div>\n\n<div class="row">\n  <div class="col-md-12">\n	<figure class="chart" data-id="lastVisualChangeCanvas" data-measure-name="lastVisualChange">\n		<figcaption>Time of the last visual change</figcaption>\n		<div><a data-placeholder="videoFramesCompare" href="">\n			<span class="glyphicon glyphicon-exclamation-sign"></span>Video frames</a>\n		</div>\n		<div class="chart-tooltip"></div>\n		<canvas class="chart-canvas"  height="300" width="550" \n			alt="First paint time for test definition ' +
((__t = ( this.testIds.join(', ') )) == null ? '' : __t) +
'">\n		</canvas>		\n		<div class="chart-legend"></div>\n	</figure>\n\n  </div>\n</div>\n\n';

}
return __p
}})();
(function() {
window["JST"] = window["JST"] || {};

window["JST"]["report.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<h1>Page loading Report ' +
((__t = ( this.reportId)) == null ? '' : __t) +
' for test ' +
((__t = ( this.testIds[0] )) == null ? '' : __t) +
'</h1>\n\n<div data-type="loading-spinner"></div>\n\n<div data-view="test-description"></div>\n\n<p><em>(click the points for links to the run page in webpagetest.org site)</em></p>\n\n<p><input type="checkbox" data-action="viewFirstView" ' +
((__t = ( this.options.viewRepeatView ? 'checked' : '')) == null ? '' : __t) +
'>Show <strong>Repeat View<strong> ?</input>\n	<span data-help-ref="repeatView" \n		data-help-title="Repeat View" \n		class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>\n</p>\n\n\n<div id="visualization"></div>\n\n<div class="row">\n  <div class="col-md-6">\n	<figure class="chart" data-id="visualCompletionNonZeroCanvas" data-measure-type="VisuallyCompleteNonZero">\n		<figcaption>Time when VisualCompletion is non zero. </figcaption>\n		<span data-help-ref="visualCompletionNonZero" \n			data-help-title="SVisual Completion non zero" \n			class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>\n		<button data-action="showStandardDeviation">See Distribution</button>\n		<div class="chart-tooltip"></div>\n		<canvas class="chart-canvas"  height="300" width="550" \n			alt="First paint time for test definition ' +
((__t = ( this.testIds.join(', ') )) == null ? '' : __t) +
'">\n		</canvas>		\n		<div class="chart-legend"></div>\n	</figure>\n  </div>\n  <div class="col-md-6">\n  	<figure class="chart" data-id="visualCompletion100Canvas" data-measure-type="VisuallyComplete100">\n		<figcaption>Visual Completion 100%</figcaption>\n		<span data-help-ref="visualCompletion100" \n			data-help-title="SVisual Completion 100%" \n			class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>\n		<button data-action="showStandardDeviation">See Distribution</button>\n  		<div class="chart-tooltip"></div>\n  		<div class="chart-controls">\n  			<label>visually complete threeshold: <input type="number"\n  				value="' +
((__t = ( this.options.visuallyComplete100Threeshold)) == null ? '' : __t) +
'" \n  				data-type="chart-visuallyComplete100Threeshold"\n  				data-chart-option="visuallyComplete100Threeshold"></input>%\n  			</label>\n  		</div>\n		<canvas class="chart-canvas" height="300" width="550" \n		alt="Visual Completion 100% for est definition ' +
((__t = ( this.testIds.join(', ') )) == null ? '' : __t) +
'"></canvas>\n\n		<div class="chart-legend"></div>\n	</figure>\n  </div>\n</div>\n\n<div class="row">\n  \n  <div class="col-md-6">\n	<figure class="chart" data-id="fullyLoadedCanvas" data-measure-type="fullyLoaded">\n		<figcaption>Time to fully loaded</figcaption>\n		<span data-help-ref="fullyLoaded" \n			data-help-title="Time to Fully Loaded" \n			class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>\n		<button data-action="showStandardDeviation">See Distribution</button>\n		<div class="chart-tooltip"></div>\n		<canvas class="chart-canvas"  height="300" width="550" \n			alt="Time to fully loaded for test definition ' +
((__t = ( this.testIds.join(', ') )) == null ? '' : __t) +
'">\n		</canvas>		\n		<div class="chart-legend"></div>\n	</figure>\n  </div>\n\n  <div class="col-md-6">	\n	<figure class="chart" data-id="SpeedIndex" data-measure-type="SpeedIndex">\n		<figcaption>Speed Index</figcaption>\n		<span data-help-ref="speedIndex" \n			data-help-title="Speed index" \n			class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>\n		<button data-action="showStandardDeviation">See Distribution</button>\n		<div class="chart-tooltip"></div>\n		<canvas class="chart-canvas"  height="300" width="550" \n			alt="Speed Index for test definition ' +
((__t = ( this.testIds.join(', ') )) == null ? '' : __t) +
'">\n		</canvas>		\n		<div class="chart-legend"></div>\n	</figure>\n  </div>\n</div>\n\n\n<div class="row">\n<div class="col-md-6">\n	<figure class="chart" data-id="lastVisualChangeCanvas" data-measure-type="lastVisualChange">\n		<figcaption>Time of the last visual change</figcaption>\n		<div class="chart-tooltip"></div>\n		<button data-action="showStandardDeviation">See Distribution</button>\n		<canvas class="chart-canvas"  height="300" width="550" \n			alt="First paint time for test definition ' +
((__t = ( this.testIds.join(', ') )) == null ? '' : __t) +
'">\n		</canvas>		\n		<div class="chart-legend"></div>\n	</figure>\n\n  </div>\n\n  <div class="col-md-6">\n<!-- 	<figure class="chart" data-id="test">\n		<figcaption>Time to fully loaded</figcaption>\n		<div class="chart-tooltip"></div>\n		<canvas class="chart-canvas"  height="300" width="550" \n			alt="Time to fully loaded for test definition ' +
((__t = ( this.testIds.join(', ') )) == null ? '' : __t) +
'">\n		</canvas>		\n		<div class="chart-legend"></div>\n	</figure> -->\n  </div>\n</div>\n\n\n\n<div>\n</div>\n\n';

}
return __p
}})();
(function() {
window["JST"] = window["JST"] || {};

window["JST"]["resourceBreakdown.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<h1>Resource type breakdown comparison</h1>\n\n';
 _(this.data).each(function(data, testId) { ;
__p += '\n<div class="resource-breakdown"><h4>' +
((__t = ( testId)) == null ? '' : __t) +
'</h4>\n	<div data-legend="' +
((__t = ( testId)) == null ? '' : __t) +
'"></div>\n	<canvas class="chart-canvas" data-canvas-test-id="' +
((__t = ( testId)) == null ? '' : __t) +
'"></canvas>\n</div>\n';
 });;
__p += '\n\n ';

}
return __p
}})();
(function() {
window["JST"] = window["JST"] || {};

window["JST"]["test-description.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {

 if(!this.testData){return'';};
__p += '\n\n<dl class="dl-horizontal">\n	';
 _(this.testData.testDefinition).each(function(val, key){ 
		if(!_(['runtest_php_url']).contains(key)) {;
__p += '	\n	<dt class="test-description-name">' +
((__t = ( key)) == null ? '' : __t) +
'</dt><dd class="test-description-value">' +
((__t = ( val)) == null ? '' : __t) +
'</dd>\n	';
}}); ;
__p += '\n	<dt class="test-description-name">Total test runs</dt><dd class="test-description-value">' +
((__t = ( _(this.testData.testResults).keys().length * (parseInt(this.testData.testDefinition.testCount)||1))) == null ? '' : __t) +
'</dd>\n</dl>\n';

}
return __p
}})();
(function() {
window["JST"] = window["JST"] || {};

window["JST"]["videoFrames.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<h3>Video frames comparison for tests ' +
((__t = ( this.testDefIds.join(', '))) == null ? '' : __t) +
'</h3>\n\n<p>The following timeline show the visual progress of tests\n' +
((__t = ( _(this.wptTestIds).map(function(id){ return '<a href="http://www.webpagetest.org/result/' + id + '">'+id+'</a>'; }).join(', '))) == null ? '' : __t) +
'. \n</p> \n\n\n<a href="#visualProgressCompare/' +
((__t = ( this.visualProgressCompareTests.join(','))) == null ? '' : __t) +
'">Open Visual Progress comparison Charts</a>\n\n\n<p><label>\n	<input type="checkbox" data-action="viewFirstView" ' +
((__t = ( this.options.viewRepeatView ? 'checked' : '')) == null ? '' : __t) +
'> </input>Show <strong>Repeat View</strong> ?</label>\n\n	<span data-help-ref="repeatView" \n		data-help-title="Repeat View" \n		class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>\n</p>\n\n<div data-type="loading-spinner"></div>\n\n\n\n<h3>Filmstrip comparison</h3>\n\n\n<div><div class="filmstrip-comparison">\n<table class="filmstrip-comparison-table">\n<tr class="time-row">\n	<td>Time (ms)</td>\n	';
 for(var i = 0; i<this.getMaxStripLength(); i++){ ;
__p += '\n	<td>' +
((__t = ( i*100 )) == null ? '' : __t) +
'</td>\n	';
 } ;
__p += '\n</tr>\n';
 _(this.filmStrip).each(function(strip, testId){ ;
__p += '\n	<tr class="">\n		<td class="testId"><h5>' +
((__t = ( testId)) == null ? '' : __t) +
'</h5></td>\n		';
 _(strip).each(function(frame){ 
			var desc = 'time='+frame.time+', visuallyComplete='+frame.frame.VisuallyComplete; ;
__p += '\n\n			<td>' +
((__t = ( frame.frame.VisuallyComplete)) == null ? '' : __t) +
'% <img src="' +
((__t = ( frame.frame.image )) == null ? '' : __t) +
'" \n				alt="' +
((__t = ( desc)) == null ? '' : __t) +
'" title="<img src=\'' +
((__t = ( frame.frame.image)) == null ? '' : __t) +
'\'></img>' +
((__t = ( desc)) == null ? '' : __t) +
'" \n				data-image-url="' +
((__t = ( frame.frame.image )) == null ? '' : __t) +
'"\n				data-image-time="' +
((__t = ( frame.time)) == null ? '' : __t) +
'"\n				data-image-VisuallyComplete="' +
((__t = ( frame.frame.VisuallyComplete)) == null ? '' : __t) +
'"></img>\n			</td>\n		';
 });
__p += '\n	</tr>\n';
 }); ;
__p += '\n</table>\n<style type="text/css">\n.filmstrip-comparison img {\n	width: 160px;\n	border: 1px solid #ededed;\n	cursor: pointer;\n}\n.filmstrip-comparison {\n	width: 100%;\n	overflow: scroll;\n}\n.filmstrip-comparison .time-row {\n	font-style: italic; \n	margin-bottom: 16px; \n	font-size: 0.9em;\n}\n</style>\n</div></div>\n\n<button data-type="html-snippet">HTML snippet</button>\n\n\n<h3>Timeline</h3>\n\n<p><em>You can <strong>drag</strong> for move, use the <strong>wheel</strong> to zoom and <strong>click</strong> to open the frame image. </em></p>\n\n<div data-type="timeline"></div>\n';

}
return __p
}})();
(function() {
window["JST"] = window["JST"] || {};

window["JST"]["videoFramesFrame.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<div class="video-frames-frame">\n\n	<div class="row">\n	  <div class="col-md-6">time: ' +
((__t = ( this.time)) == null ? '' : __t) +
'</div>\n	  <div class="col-md-6">Visual complete: ' +
((__t = ( this.VisuallyComplete)) == null ? '' : __t) +
'%</div>\n	</div>\n	<div class="row">\n	  <div class="col-md-12">\n		<img src="' +
((__t = (this.image)) == null ? '' : __t) +
'"></img>\n	</div>\n	</div>\n\n</div>';

}
return __p
}})();
(function() {
window["JST"] = window["JST"] || {};

window["JST"]["help/fullyLoaded.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += 'The time when all resources finish loading. There are no more ajax request left, all images finished loading. It is similar to visual complete 100%. ';

}
return __p
}})();
(function() {
window["JST"] = window["JST"] || {};

window["JST"]["help/removeOutliers.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<p>In statistics, an outlier is an observation point that is distant from other observations. An outlier may be due to variability in the measurement or it may indicate experimental error; the latter are sometimes excluded from the data set.</p>\n\n<p>If turned on, we will removing the outlier values that are outside the range of three standard deviations. </p>';

}
return __p
}})();
(function() {
window["JST"] = window["JST"] || {};

window["JST"]["help/repeatView.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += 'Check this if you want to see the results based on the webpagetest second/repeat view. \n<br/>\nEach webpagetest sample consists in a first page load result where the browser cache is empty and in a second run where the browser\'s cache already may have some resources cached locally. So this second run or repeat run is often faster than the first run. \n<br/>\nIf the page process a lot of css/js the differences will be more noticeable here (and more in slower devices) because is less networking.';

}
return __p
}})();
(function() {
window["JST"] = window["JST"] || {};

window["JST"]["help/reportCompareSampleSelectionBy.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<p>If \'average\' is selected, then the numbers shown are the average measure number of all the samples. </p>\n\n<p>Otherwhise, if \'median\' is selected the shown values are a real sample that is the median sample with respect to the mesure. </p>';

}
return __p
}})();
(function() {
window["JST"] = window["JST"] || {};

window["JST"]["help/speedIndex.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += 'A quantification of a page\'s visual progress. The lower the number the better. Reference: <a href="https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/metrics/speed-index">Speed Index</a>';

}
return __p
}})();
(function() {
window["JST"] = window["JST"] || {};

window["JST"]["help/visualCompletion100.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += 'Time when the page visual progress finish, this is, there are no more visual changes. Concretly this is measured by taking the first webpagetest page frames for which the VisualCompletion is lower than a big threeshold like 95%. ';

}
return __p
}})();
(function() {
window["JST"] = window["JST"] || {};

window["JST"]["help/visualCompletionNonZero.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += 'Time when the page is not longer a blank page and shows something. Concretly this is measured by taking the first webpagetest page frames for which the VisualCompletion is higher than a small threeshold like 5%. ';

}
return __p
}})();