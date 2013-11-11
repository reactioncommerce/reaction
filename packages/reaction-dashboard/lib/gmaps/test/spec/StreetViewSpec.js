describe("Create a Street View Panorama", function() {
  var map_with_streetview, attached_panorama, standalone_panorama, panorama_with_events;

  beforeEach(function() {
    map_with_streetview = map_with_streetview || new GMaps({
      el : '#map-with-streetview',
      lat : 42.3455,
      lng : -71.0983,
      zoom : 12
    });
  });

  describe("Standalone", function() {
    beforeEach(function() {
      standalone_panorama = standalone_panorama || GMaps.createPanorama({
        el : '#streetview-standalone-panorama',
        lat : 42.3455,
        lng : -71.0983,
        pov : {
          heading : 60,
          pitch : -10,
          zoom : 1
        }
      });
    });

    it("should create a Street View panorama", function() {
      expect(standalone_panorama).toBeDefined();
    });
  });

  describe("Attached to the current map", function() {
    beforeEach(function() {
      attached_panorama = attached_panorama || map_with_streetview.createPanorama({
        el : '#streetview-panorama',
        pov : {
          heading : 60,
          pitch : -10,
          zoom : 1
        }
      });
    });

    it("should be equal to the current map Street View panorama", function() {
      expect(map_with_streetview.getStreetView()).toEqual(attached_panorama);
    });
  });

  describe("With events", function() {
    var callbacks;

    beforeEach(function() {
      callbacks = {
        onpovchanged : function() {
          console.log(this);
        }
      };

      spyOn(callbacks, 'onpovchanged').andCallThrough();

      panorama_with_events = panorama_with_events || GMaps.createPanorama({
        el : '#streetview-with-events',
        lat : 42.3455,
        lng : -71.0983,
        pov : {
          heading : 60,
          pitch : -10,
          zoom : 1
        },
        pov_changed : callbacks.onpovchanged
      });
    });

    it("should respond to pov_changed event", function() {
      panorama_with_events.setPov({
        heading : 80,
        pitch : -10,
        zoom : 1
      });

      expect(callbacks.onpovchanged).toHaveBeenCalled();
    });
  });
});