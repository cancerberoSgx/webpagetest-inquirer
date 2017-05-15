var Router = require('./Router'); 
var AbstractView = require('./AbstractView'); 
// @module wptinquirer.html @class Application
var Application = function()
{
	this.templates = window.JST;

	if(jQuery('#mainContainer').size()===0)
	{
		jQuery('body').append('<div id="mainContainer"></div>'); 
	}
	this.$containerEl = jQuery('#mainContainer'); 


	if(jQuery('#modalsContainer').size()===0)
	{
		jQuery('body').append('<div id="modalsContainer"></div>'); 
	}
	this.$modalsContainer = jQuery('#modalsContainer');
	// this.$modalsContainer .hide();
	this.modalView = new AbstractView({application: this}); 
	this.modalView.template = '_modal.html'; 
	// this.modalView.title = 'Information'; 
	this.modalView.renderIn(this.$modalsContainer); 
}; 

_(Application.prototype).extend({

	//@method showView @param {AbstractView} view
	showView: function(view)
	{
		this.currentView = view;
		this.$containerEl.empty();
		view.renderIn(this.$containerEl);
	}

,	showViewInModal: function(view, modalConfig)
	{
		//TODO: destroy current child view
		this.modalView.$('[data-type="modal-body"]').empty();
		var title = modalConfig.title || 'Information';	
		this.modalView.$('[data-type="modal-title"]').text(title);
		view.renderIn(this.modalView.$('[data-type="modal-body"]'));
		this.modalView.$('#myModal').modal('show'); 
	}
});

Application.start = function()
{
	Application.instance = new Application();	
	new Router(Application.instance);
	Backbone.history.start(); 
}; 


jQuery(document).ready(function()
{	
	Application.start(); 
}); 

module.exports = Application;