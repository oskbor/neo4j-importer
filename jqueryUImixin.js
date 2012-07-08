/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
JQ = Ember.Namespace.create(); 
// Create a new mixin for jQuery UI widgets using the Ember
// mixin syntax.
JQ.Widget = Ember.Mixin.create({
    // When Ember creates the view's DOM element, it will call this
    // method.
    didInsertElement: function() {
        // Make jQuery UI options available as Ember properties
        var options = this._gatherOptions();

        // Make sure that jQuery UI events trigger methods on this view.
        this._gatherEvents(options);

        // Create a new instance of the jQuery UI widget based on its `uiType`
        // and the current element.
        var ui = jQuery.ui[this.get('uiType')](options, this.get('element'));

        // Save off the instance of the jQuery UI widget as the `ui` property
        // on this Ember view.
        this.set('ui', ui);
    },

    // When Ember tears down the view's DOM element, it will call
    // this method.
    willDestroyElement: function() {
        var ui = this.get('ui');

        if (ui) {
            // Tear down any observers that were created to make jQuery UI
            // options available as Ember properties.
            var observers = this._observers;
            for (var prop in observers) {
                if (observers.hasOwnProperty(prop)) {
                    this.removeObserver(prop, observers[prop]);
                }
            }
            ui._destroy();
        }
    },

    // Each jQuery UI widget has a series of options that can be configured.
    // For instance, to disable a button, you call
    // `button.options('disabled', true)` in jQuery UI. To make this compatible
    // with Ember bindings, any time the Ember property for a
    // given jQuery UI option changes, we update the jQuery UI widget.
    _gatherOptions: function() {
        var uiOptions = this.get('uiOptions'),
            options = {};

        // The view can specify a list of jQuery UI options that should be treated
        // as Ember properties.
        uiOptions.forEach(function(key) {
            options[key] = this.get(key);

            // Set up an observer on the Ember property. When it changes,
            // call jQuery UI's `setOption` method to reflect the property onto
            // the jQuery UI widget.
            var observer = function() {
                var value = this.get(key);
                this.get('ui')._setOption(key, value);
            };

            this.addObserver(key, observer);

            // Insert the observer in a Hash so we can remove it later.
            this._observers = this._observers || {};
            this._observers[key] = observer;
        }, this);

        return options;
    },

    // Each jQuery UI widget has a number of custom events that they can
    // trigger. For instance, the progressbar widget triggers a `complete`
    // event when the progress bar finishes. Make these events behave like
    // normal Ember events. For instance, a subclass of JQ.ProgressBar
    // could implement the `complete` method to be notified when the jQuery
    // UI widget triggered the event.
    _gatherEvents: function(options) {
        var uiEvents = this.get('uiEvents') || [],
            self = this;

        uiEvents.forEach(function(event) {
            
            var callback;
            event = "jq_" + event;
            callback = self[event];
            if (callback) {
                // You can register a handler for a jQuery UI event by passing
                // it in along with the creation options. Update the options hash
                // to include any event callbacks.
                options[event.replace("jq_", '')] = function(event, ui) {
                    callback.call(self, event, ui);
                };
            }
        });
    }
});


JQ.safeClone = function(event) {
    var clone;
    clone = $(this).clone();
    clone.find('script[id^=metamorph]').remove();
    clone.removeClass('ember-view');
    //clone.removeClass('ui-draggable');
    clone.find('*').each(function() {
      var $this;
      $this = $(this);
      return $.each($this[0].attributes, function(index, attr) {
        if (attr.name.indexOf('data-bindattr') === -1) {
          return;
        }
        return $this.removeAttr(attr.name);
      });
    });
    if (clone.attr('id') && clone.attr('id').indexOf('ember') !== -1) {
      clone.removeAttr('id');
    }
    clone.find('[id^=ember]').removeAttr('id');
    return clone;
  }

// Create a new Ember view for the jQuery UI Button widget
JQ.Button = Ember.View.extend(JQ.Widget, {
    uiType: 'button',
    uiOptions: ['label', 'disabled'],
    tagName: 'button'
});

JQ.Droppable = Ember.View.extend(JQ.Widget, {
    uiType: 'droppable',
    uiOptions: ['activeClass', 'hoverClass', 'accept'],
    uiEvents: ['drop']
})
JQ.Draggable = Ember.View.extend(JQ.Widget, {
    uiType: 'draggable',
    uiOptions: ['appendTo', 'helper'],
    uiEvents: []
})

JQ.Dialog = Ember.View.extend(JQ.Widget, {
  uiType: 'dialog',
  uiOptions: ['resizable','autoOpen','position','closeText','disabled','buttons', 'draggable', 'closeOnEscape','modal'],
  uiEvents: ['create','open','close']
})
