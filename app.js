App = Em.Application.create();


var categories = ["ccode", "name", "blaha", "import", "ccode_from"];


App.Node = Em.Object.extend({
  init: function() {
    this._super();
     this.attributes= [];
    this.attributes.pushObject(App.Attribute.create())
    }
});
App.Relation = Em.Object.extend({
  init: function(){
      this._super();
      this.attributes=[];
      this.type= "is_related_to";
      this.from="0";
      this.to="1";
  }
})
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
      if(this.content.length>=4){
          alert("For layout reasons you cannot add more than 4 nodes currently :)")
      }
      else{
    var node = App.Node.create();
    this.pushObject(node);
      }
  }
});
App.relationController = Em.ArrayController.create({

  // Initialize the array controller with an empty array.
  content: [],

  // Creates a new todo with the passed title, then adds it to the array.
  createRelation: function() {
      if(this.content.length>=4){
          alert("For layout reasons you cannot add more than 4 relations currently :)")
      }
      else{
    var rel = App.Relation.create();
    this.pushObject(rel);
      }
  }
});

App.AddNode = Ember.Button.extend({
    classNames: ['add-node-view','btn','btn-success','btn-small'],
            target: 'App.nodeController',
            action: 'createNode'
    });
    App.AddRelation = Ember.Button.extend({
    classNames: ['add-rel-view','btn','btn-success','btn-small'],
            target: 'App.relationController',
            action: 'createRelation'
    });

App.AddAttribute = Ember.View.extend({
    tagName:'div',
    classNames: ['add-attr-view','btn'],
    click: function(){
        var cv=this.get('contentView');
        cv.addAttribute();
    }
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
     classNames: ['attribute','form-inline']
 }
 );
 
 App.DeleteAttributeView = Ember.View.extend({
     tagName:'i',
  classNames: ['delete-attr-view','icon-remove'],
  click: function() {
    var attrView = this.get('content');
    var node = attrView.getPath('parentView.content');
    var attribute = this.getPath('contentView.content');

    node.get('attributes').removeObject(attribute);
  }
});

App.RelationView=App.NodeView.extend({
  classNames: ['relation-view'],
  templateName: 'relation-template'
})


App.getConfig = function(){
  var config={};
    config.nodes=[];
    config.relations=[];
    config.parseNode= function(node) { 
    var tempObject ={};
    node.get('attributes').forEach(function(attr){
        tempObject[attr.get('key')]=attr.get('value')
    })
    config.nodes.pushObject(tempObject);
    }
        config.parseRelation= function(relation) { 
    var tempObject ={};
    relation.get('attributes').forEach(function(attr){
        tempObject[attr.get('key')]=attr.get('value')
    })
    tempObject.type=relation.get('type');
    tempObject.to=relation.get('to');
    tempObject.from=relation.get('from');
    config.relations.pushObject(tempObject);
    }
    App.nodeController.get('content').forEach(config.parseNode);
    App.relationController.get('content').forEach(config.parseRelation);
    return config;
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