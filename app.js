App = Em.Application.create();


var categories = ["ccode", "name", "blaha", "import", "ccode_from"];


App.Node = Em.Object.extend({
  init: function(id) {
    this._super();
     this.attributes= [];
     this.id ="";
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
  currentId: '1',

  // Creates a new todo with the passed title, then adds it to the array.
  createNode: function() {
    var node = App.Node.create();
    node.set('id',App.nodeController.currentId);
    App.nodeController.currentId++;
    App.nodeController.pushObject(node);
      }
  
});
App.relationController = Em.ArrayController.create({
  // Initialize the array controller with an empty array.
  content: [],

  // Creates a new todo with the passed title, then adds it to the array.
  createRelation: function() {

    var rel = App.Relation.create();
    App.relationController.pushObject(rel);
      
  }
});

App.AddNode = Ember.View.extend({
  tagName:'li',
  click: App.nodeController.createNode
    //classNames: ['add-node-view','btn','btn-success','btn-small'],
    });
    App.AddRelation = Ember.View.extend({
    //classNames: ['add-rel-view','btn','btn-success','btn-small'],
    tagName:'li',
    click: App.relationController.createRelation
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
 App.DeleteNodeView = Ember.View.extend({
     tagName:'i',
  classNames: ['delete-node-view','icon-remove'],
  click: function(p1, p2) {
    var node = this.getPath('contentView.content');
    App.nodeController.removeObject(node);
    //App.nodeController.currentId--;
  }
});
 App.DeleteRelationView = Ember.View.extend({
     tagName:'i',
  classNames: ['delete-rel-view','icon-remove'],
  click: function() {
    var rel = this.getPath('contentView.content');
    App.relationController.removeObject(rel);
  }
});


App.RelationView=App.NodeView.extend({
  classNames: ['relation-view'],
  templateName: 'relation-template'
})

App.Draggable = JQ.Draggable.extend({
    appendTo: 'body',
    tagName: 'th',
    helper: JQ.safeClone
})
    App.Droppable = JQ.Droppable.extend({
    activeClass: 'ui-state-default',
    hoverClass: 'ui-state-hover',
    accept: ':not(.ui-sortable-helper)',
    jq_drop: function(event,ui) {
        console.log("node-id: " + ui.draggable.attr('data-id'));
    }
})
    App.Dialog = JQ.Dialog.extend({
    classNames: ['well'],
    closeText: 'hide',
    autoOpen:true,
    draggable: false,
    closeOnEscape: false,
    resizable: false,
    position: ['center',100],
    modal: true,
    buttons:[ 
    {text:'Or play around with some sample data..',
        id: 'test',
        disabled: false,
        click: function()
        {$(this).dialog("close");}
    }],
    jq_create: function() {
      this.$().parent().find('a.ui-dialog-titlebar-close').remove();  
    }
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
App.NodeView.HeaderView = App.Draggable.extend({
tagName: 'th',
//classNameBindings: ['parentView.content.id'],
attributeBindings: ['colspan', 'data-id'],
"data-idBinding":'parentView.content.id',
colspan: 2
})


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