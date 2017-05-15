// @module wptinquirer.html @class Application @extends AbstractView
var AbstractView = require('./AbstractView');
var Util = require('./Util')

module.exports = AbstractView.extend({

	template: 'home.html'

,	events: {
		'click [data-action="report"]': 'report'
	,	'click [data-action="report-compare"]': 'reportCompare'
	,	'click [data-action="report-visualProgressCompare"]': 'reportVisualProgressCompare'
	}

,	initialize: function(options)
	{
		this.application = options.application;
	}

,	afterRender: function()
	{
		var self = this; 

		this.renderHeader();
		this.showLoadingStatus('[data-type="loading-spinner"]', true); 

		Util.getTestsMetadata().done(function(metadata)
		{	
			self.metadata = metadata; 

			self.showLoadingStatus('[data-type="loading-spinner"]', false); 
			self.render(true);
			self.renderHeader();
		}); 

	}

,	report: function()
	{
		var tests = this.getSelectedTests();
		if(!tests||!tests.length)
		{
			return;
		}; 
		Backbone.history.navigate('report/' + tests[0], {trigger:true});
	}

,	reportCompare: function()
	{
		var tests = this.getSelectedTests();
		if(!tests||!tests.length)
		{
			return;
		}; 
		Backbone.history.navigate('reportCompare/' + tests.join(','), {trigger:true});
	}

,	reportVisualProgressCompare: function()
	{
		var tests = this.getSelectedTests();
		if(!tests||!tests.length)
		{
			return;
		}; 
		Backbone.history.navigate('visualProgressCompare/' + tests.join(','), {trigger:true});
	}

,	getSelectedTests: function()
	{
		var tests = [];
		var checked = this.$('.report-selection:checked'); 
		if(!checked.size()) 
		{
			this.$('.condition-met').show();
			return null;
		}
		else
		{
			this.$('.condition-met').hide();
		}
		checked.each(function()
		{
			tests.push(jQuery(this).val()); 
		}); 
		return tests; 
	}
});    