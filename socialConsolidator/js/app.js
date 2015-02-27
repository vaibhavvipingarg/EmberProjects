App = Ember.Application.create();

var cb = new Codebird;
cb.setConsumerKey("OwCupIp1F3zHXmi7brKw11BIA", "LM6vIF3rO2dxpdNLlMsliVwj0tTTol06vLuag6LQrFo1t7HnTK");
cb.__call(
    "oauth2_token",
    {},
    function (reply) {
      cb.setBearerToken(reply.access_token);
    }
);

App.LinkLiComponent = Em.Component.extend({
  tagName: 'li',
  classNameBindings: ['active'],
  active: function() {
    return this.get('childViews').anyBy('active');
  }.property('childViews.@each.active')
});

App.Router.map(function() {
  this.resource('artists', function(){
  		this.resource('connector', function() {
        this.resource('post', { path: ':post_id' });  
      });      
  });
});

App.ArtistsRoute = Ember.Route.extend({
    counter : 0,
    renderTemplate: function() {
      this.render();
    },
    actions: {
  	changeView: function(){
  		var newView = this.get('controller').get('newView');
  		consolidator.set('currentView', newView);
  	},
    createArtist: function() {
      var name = this.get('controller').get('newName');
      var currentView = consolidator.currentView;
      var currentModel = this.modelFor('connector');
      switch(currentView) {
        case '0':
        Ember.$.ajax('https://www.googleapis.com/youtube/v3/search?part=snippet', {
        type: 'GET',
        dataType: 'json',
        data: { q: name, key : 'AIzaSyCTylRIwVcy1xIRN_bymA7CMfei7D2SLUk' },
        context: this,
        success: function(data) {
          var results = data.items;
          var items = [];
          for(var index = 0; index < results.length; index++){
                    items.pushObject({
                      title: results[index].snippet.title,
                      description: results[index].snippet.description
                    });
                  };
          currentModel.pushObject({
            id: this.counter++,
            title: name,
            results: items
          });

          //var artist = App.Artist.createRecord(data);
          //this.modelFor('artists').pushObject(artist);
          //this.get('controller').set('newName', '');
          //this.transitionTo('artists.songs', artist);
        },
        error: function() {
          alert('Failed to save artist');
        }
      });
          break;
        case '1':
          cb.__call(
            "search_tweets",
            "q=" + name,
            function (data) {
                  var statuses = data.statuses;
                  var items = [];
                  for(var index = 0; index < statuses.length; index++){
                    items.pushObject({
                      title: statuses[index].user.name,
                      description: statuses[index].text
                    });
                  }
                  currentModel.pushObject({
                  id: this.counter++,
                  title: name,
                  results: items
                });
              },
            true // this parameter required
          );
          break;
        case '2':
          break;
      }      
    }
  }
});

App.PostRoute = Ember.Route.extend({
  model: function(params) {
    return App.ConnectorRoute.model.findBy('id', params.post_id);
  },
  renderTemplate: function() {
      this.render();
        this.render('post', {
        outlet: 'post',
        into: 'artists'
    });
    }
});

App.ConnectorRoute = Ember.Route.extend({
  renderTemplate: function() {
      this.render();
        this.render('connector', {
        outlet: 'connector',
        into: 'artists'
    });
    },
   actions: {
    changeConnector: function (newConnector) {
      consolidator.currentView =  newConnector;
      this.refresh();
      var items = $('#connectorTabs').find('.connector');
        $.each(items, function(i, item){
        $(item).removeClass('active');
      });

      $(items[newConnector]).addClass('active');
    }
   },
   model: function() {
   	var currentView = consolidator.currentView;
   	var m = null;
   	switch(currentView) {
   		case '0':
	   		m = consolidator.getYouTube();
	   		break;
	   	case '1':
	   		m = consolidator.getTwitter();
	   		break;
      case '2':
        m = consolidator.getFacebook();
        break;
   	}
   	if (m === null) {
   		alert('Model not set properly, man');
   	}
    return m;
  }
});

var youTubeModel = [];
var twitterModel = [];
var facebookModel = [];
var consolidator = {
	currentView: '0',
	getYouTube: function() {
		return youTubeModel;
	},
	getTwitter: function() {
		return twitterModel;
	},
  getFacebook: function() {
    return facebookModel;
  }
};

$(".connector").click(function() {    

 });

/*var posts = [{
  id: '1',
  title: "BiggBoss",
  author: { name: "d2h" },
  date: new Date('12-27-2012'),
  excerpt: "There are lots of à la carte software environments in this world. Places where in order to eat, you must first carefully look over the menu of options to order exactly what you want.",
  body: "I want this for my ORM, I want that for my template language, and let's finish it off with this routing library. Of course, you're going to have to know what you want, and you'll rarely have your horizon expanded if you always order the same thing, but there it is. It's a very popular way of consuming software.\n\nRails is not that. Rails is omakase."
}, {
  id: '2',
  title: "John Oliver",
  author: { name: "d2h" },
  date: new Date('12-24-2012'),
  excerpt: "My [appearance on the Ruby Rogues podcast](http://rubyrogues.com/056-rr-david-heinemeier-hansson/) recently came up for discussion again on the private Parley mailing list.",
  body: "A long list of topics were raised and I took a time to ramble at large about all of them at once. Apologies for not taking the time to be more succinct, but at least each topic has a header so you can skip stuff you don't care about.\n\n### Maintainability\n\nIt's simply not true to say that I don't care about maintainability. I still work on the oldest Rails app in the world."  
}];*/