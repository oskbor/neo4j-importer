App = Em.Application.create();


var categories = ["ccode", "name", "blaha", "import", "ccode_from"];


App.Node = Em.Object.extend({
  init: function() {
    this._super();
     this.attributes= [];
    this.attributes.pushObject(App.Attribute.create())
    }
});
App.Attribute = Em.Object.extend({
  init: function(key,value){
      this._super();
      this.key = key || "";
      this.value= value || "";
  }
});


App.nodeController = Em.ArrayController.create({

  // Initialize the array controller with an empty array.
  content: [],

  // Creates a new todo with the passed title, then adds it to the array.
  createNode: function() {
    var node = App.Node.create();
    this.pushObject(node);
  }
});

App.AddNode = Ember.Button.extend({
    classNames: ['add-node-view','btn','btn-success'],
            target: 'App.nodeController',
            action: 'createNode'
    });

App.AddAttribute = Ember.Button.extend({
    classNames: ['add-attr-view','btn','btn-success','btn-small'],
            target: 'contentView',
            action: 'addAttribute'
    });
    
App.NodeView = Em.View.extend({
   classNames: ['node-view'],
  templateName: 'node-template',
    addAttribute: function() {
    var attr = this.getPath('content.attributes');
    attr.pushObject(App.Attribute.create());
  }
});
App.AttributeView = Em.View.extend({
    classNames: ['attr-view'],
  templateName: 'attribute-template'
})
 App.Text = Ember.TextField.extend({
     classNames: ['input-small','inline']
 }
 );
 
 App.DeleteAttributeView = Ember.View.extend({
     tagName:'i',
  classNames: ['delete-attr-view','icon-minus-sign'],
  click: function() {
    var attrView = this.get('content');
    var node = attrView.getPath('parentView.content');
    var attribute = this.getPath('contentView.content');

    node.get('attributes').removeObject(attribute);
  }
});

config= {};
App.load = function(){
    config.nodes=[];
    config.parseNode= function(node) { 
    var tempObject ={};
    node.get('attributes').forEach(function(attr){
        tempObject[attr.get('key')]=attr.get('value')
    })
    config.nodes.pushObject(tempObject);
    }
    App.nodeController.get('content').forEach(config.parseNode);
}


/**
Template:

{{view App.Button label="Click to Load People"}}
<br><br>
{{view App.ProgressBar valueBinding="App.controller.progress"}}
<br><br>
{{#collection JQ.Menu
             contentBinding="App.controller.people"
             disabledBinding="App.controller.menuDisabled"}}
 <a href="#">
   {{content.name}}
 </a>
{{else}}
 <a href="#">LIST NOT LOADED</a>
{{/collection}}
*/