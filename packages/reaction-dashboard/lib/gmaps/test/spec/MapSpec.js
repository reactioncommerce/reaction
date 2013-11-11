describe("Creating a map", function() {
  var basic_map, advanced_map, map_with_events, map_with_custom_controls;

  it("should throw an error if element is not defined", function() {
    expect(function() { new GMaps({}); }).toThrow(new Error('No element defined.'));
  });

  describe("With basic options", function() {
    beforeEach(function() {
      basic_map = basic_map || new GMaps({
        el : '#basic-map',
        lat: -12.0433,
        lng: -77.0283,
        zoom: 12
      });
    });

    it("should create a GMaps object", function() {
      expect(basic_map).toBeDefined();
    });

    it("should have centered the map at the initial coordinates", function() {
      var lat = basic_map.getCenter().lat();
      var lng = basic_map.getCenter().lng();

      expect(lat).toEqual(-12.0433);
      expect(lng).toEqual(-77.0283);
    });

    it("should have the correct zoom", function() {
      expect(basic_map.getZoom()).toEqual(12);
    });
  });

  describe("With advanced controls", function() {
    beforeEach(function() {
      advanced_map = advanced_map || new GMaps({
        el : '#advanced-map',
        lat: -12.0433,
        lng: -77.0283,
        zoomControl : true,
        panControl : false,
        streetViewControl : false,
        mapTypeControl: false,
        overviewMapControl: false
      });
    });

    it("should show the defined controls", function() {
      expect(advanced_map.map.zoomControl).toBeTruthy();
      expect(advanced_map.map.panControl).toBeFalsy();
      expect(advanced_map.map.streetViewControl).toBeFalsy();
      expect(advanced_map.map.mapTypeControl).toBeFalsy();
      expect(advanced_map.map.overviewMapControl).toBeFalsy();
    });
  });

  describe("With events", function() {
    var callbacks, current_zoom = 0, current_center = null;

    beforeEach(function() {
      callbacks = {
        onclick : function(e) {
          var lat = e.latLng.lat();
          var lng = e.latLng.lng();

          map_with_events.addMarker({
            lat : lat,
            lng : lng,
            title : 'New Marker'
          });
        },
        onzoomchanged : function() {
          console.log('onzoomchanged');
          current_zoom = this.getZoom();
        },
        oncenterchanged : function() {
          console.log('oncenterchanged');
          current_center = this.getCenter();
        }
      };

      spyOn(callbacks, 'onclick').andCallThrough();
      spyOn(callbacks, 'onzoomchanged').andCallThrough();
      spyOn(callbacks, 'oncenterchanged').andCallThrough();

      map_with_events = map_with_events || new GMaps({
        el : '#map-with-events',
        lat : -12.0433,
        lng : -77.0283,
        click : callbacks.onclick,
        zoom_changed : callbacks.onzoomchanged,
        center_changed : callbacks.oncenterchanged
      });
    });

    it("should respond to zoom_changed event", function() {
      map_with_events.map.setZoom(16);

      expect(callbacks.onzoomchanged).toHaveBeenCalled();
      expect(current_zoom).toEqual(16);
    });

    it("should respond to center_changed event", function() {
      map_with_events.map.setCenter(new google.maps.LatLng(-12.0907, -77.0227));

      // Fix for floating-point bug
      var lat = parseFloat(current_center.lat().toFixed(4));
      var lng = parseFloat(current_center.lng().toFixed(4));

      expect(callbacks.oncenterchanged).toHaveBeenCalled();
      expect(lat).toEqual(-12.0907);
      expect(lng).toEqual(-77.0227);
    });

    it("should respond to click event", function() {
      google.maps.event.trigger(map_with_events.map, 'click', {
        latLng : new google.maps.LatLng(-12.0433, -77.0283)
      });

      expect(callbacks.onclick).toHaveBeenCalled();
      expect(map_with_events.markers.length).toEqual(1);
    });

    afterEach(function() {
      document.getElementById('map-with-events').innerHTML = '';
      map_with_events = null;
    });
  });

  describe("With custom controls", function() {
    var callbacks, markers_in_map = 0;

    beforeEach(function() {
      callbacks = {
        onclick : function() {
          map_with_custom_controls.addMarker({
            lat : map_with_custom_controls.getCenter().lat(),
            lng : map_with_custom_controls.getCenter().lng()
          });
        }
      }

      spyOn(callbacks, 'onclick').andCallThrough();

      map_with_custom_controls = new GMaps({
        el : '#map-with-custom-controls',
        lat : -12.0433,
        lng : -77.0283
      });

      map_with_custom_controls.addControl({
        position : 'top_right',
        content : 'Add marker at the center',
        style : {
          margin: '5px',
          padding: '1px 6px',
          border: 'solid 1px #717B87',
          background: '#fff'
        },
        events : {
          click: callbacks.onclick
        }
      });
    });

    it("should add the control to the controls collection", function() {
      expect(map_with_custom_controls.controls.length).toEqual(1);
    });

    it("should respond to click event attached to the custom control", function() {
      google.maps.event.trigger(map_with_custom_controls.controls[0], 'click');

      expect(callbacks.onclick).toHaveBeenCalled();
      expect(map_with_custom_controls.markers.length).toEqual(1);
    });
  });
});
