/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Input Mapping component for A-Frame.
 */
AFRAME.registerSystem('input-mapping', {
  schema: {},
  mappings: {},
  mappingsPerControllers: {},
  currentMapping: 'default',

  /**
   * Set if component needs multiple instancing.
   */
  multiple: false,

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {
    if (AFRAME.DEFAULT_INPUT_MAPPINGS) {
      this.registerInputMappings(AFRAME.DEFAULT_INPUT_MAPPINGS);
    }

    var self = this;

    // Controllers
    this.sceneEl.addEventListener('controllerconnected', function (evt) {
      if (!self.mappings) {
        console.warn('controller-mapping: No mappings defined');
        return;
      }

      if (!self.mappingsPerControllers[controllerModel]) {
        self.mappingsPerControllers[controllerModel] = {};
      }

      var mappingsPerController = self.mappingsPerControllers[controllerModel];

      for (var mapping in self.mappings) {
        var mappingData = self.mappings[mapping];
        var controllerModel = evt.detail.name;

        var controllerMappings = mappingData[controllerModel];
        if (!controllerMappings) {
          console.warn('controller-mapping: No mappings defined for controller type: ', controllerModel);
          return;
        }

        /*
        mappingsPerControllers: {
         vive-controls: {
            trackpaddown: {
              default: event1
              task1: event2
            }
          }
        }
        */

        for (var eventName in controllerMappings) {
          var mapping = controllerMappings[eventName];
          if (!mappingsPerController[eventName]) {
            mappingsPerController[eventName] = {};
          }

          mappingsPerController[eventName][mapping] = mapping;
        }
      }

      for (var eventName in mappingsPerController) {
        self.sceneEl.addEventListener(eventName, function(event2) {
          var mapping = mappingsPerController[event2.type];

          var mappedEvent = mapping[self.currentMapping] ? mapping[self.currentMapping] : mapping.default;
          if (mappedEvent) {
            evt.detail.target.emit(mappedEvent, event2);
          }
        });
      }
    });

    // Keyboard (Very WIP)
    var self = this;
    var scene = this.sceneEl;
    document.addEventListener('keyup', function (event) {
      var mappings = self.mappings[self.currentMapping];

      if (mappings && mappings.keyboard) {
        mappings = mappings.keyboard;

        var mapEvent = mappings[event.key + '_up'];
        if (mapEvent) {
          scene.emit(mapEvent);
        }
      }
    });
    /*
    document.addEventListener('keydown', function (event) {
    });
    document.addEventListener('keypress', function (event) {
    });
    */
  },

  /**
   * Called when component is attached and when component data changes.
   * Generally modifies the entity based on the data.
   */
  update: function (oldData) { },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function () { },

  /**
   * Called on each scene tick.
   */
  // tick: function (t) { },

  /**
   * Called when entity pauses.
   * Use to stop or remove any dynamic or background behavior such as events.
   */
  pause: function () { },

  /**
   * Called when entity resumes.
   * Use to continue or add any dynamic or background behavior such as events.
   */
  play: function () { },

  registerInputMappings: function (mappings) {
    this.mappings = mappings;
  },

  getActiveMapping: function () {
    return this.currentMapping;
  },

  setActiveMapping: function (mapping) {
    if (this.mappings[mapping]) {
      this.currentMapping = mapping;
    } else {
      console.warn('aframe-input-mapping-component: Trying to activate a mapping that doesn\'t exist:', mapping);
    }
  }
});

AFRAME.registerInputMappings = function(mappings) {
  // Add mapping
  AFRAME.scenes[0].sceneEl.systems['input-mapping'].registerInputMappings(mappings);
};
