// var LoadingView = require('./LoadingView'); 

// @module wptinquirer.html @class AbstractView @extends Backbone.View
var AbstractView = Backbone.View.extend({

	initialize: function(options)
	{
		this.application = options.application;
	}

	//@method renderIn renders this view in given parent element @param {jQuery} $parent
,	renderIn: function($parent, dontAfterRender)
	{
		var template;
		if(_(this.template).isFunction())
		{
			template = this.template; 
		}
		else
		{
			template = this.application.templates[this.template]; 
		}
		if(template)
		{
			var html = template.apply(this, []); 
			this.$el.html(html);
			$parent.append(this.$el); 
		}
		else
		{
			console.log('Invalid template, ', this.template); 
			return;
		}
		this._afterRender(); 
		if(!dontAfterRender)
		{
			this.afterRender();
		}
		return this;
	}

,	afterRender: function()
	{
	}

,	_afterRender: function()
	{
		var events = _({
			'click [data-help-ref]': 'showHelp'
		}).extend(this.events); 
		// console.log(events)
		this.delegateEvents(events); 
	}

,	showHelp: function(el)
	{
		// data-help-ref="reportCompareSampleSelectionBy"
		var helpId = jQuery(el.target).data('help-ref');
		var title = jQuery(el.target).data('help-title') || ('Help on ' + helpId);
		var helpView = new AbstractView({application: this.application}); 
		_(helpView).extend({
			template: 'help/'+helpId+'.html'
		// ,	title: title
		})
		this.application.showViewInModal(helpView, {title: title}); 
	}
		
	//@method render implemented to comply with Backbone View contract		
,	render: function(dontAfterRender)
	{
		return this.renderIn(jQuery(this.el), dontAfterRender); 
	}

,	renderHeader: function()
	{
		var html = this.application.templates['header.html'].apply(this, []); 
		this.$el.prepend(html)
	}

,	showLoadingStatus: function(placeholder, status)
	{
		if(status)
		{
			var loadingView = new AbstractView({application: this.application});
			loadingView.template = 'loading.html'; 
			loadingView.renderIn(this.$(placeholder));
		}
		else
		{
			this.$(placeholder).empty();
		}
	}
}); 

module.exports = AbstractView; 