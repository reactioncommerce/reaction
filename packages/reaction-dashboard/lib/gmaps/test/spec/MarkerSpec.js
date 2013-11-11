describe("Creating a marker", function() {
  var map, marker;

  beforeEach(function() {
    map = map || new GMaps({
      el : '#map-with-markers',
      lat : -12.0533,
      lng: -77.0293,
      zoom: 14
    });
  });

  describe("With basic options", function() {
    beforeEach(function() {
      marker = map.addMarker({
        lat : -12.0533,
        lng: -77.0293,
        title : 'New marker'
      });
    });

    it("should add the marker to the markers collection", function() {
      expect(map.markers.length).toEqual(1);
      expect(map.markers[0]).toEqual(marker);
    });

    it("should create a marker with defined position", function() {
      // Fix for floating-point bug
      expect(parseFloat(marker.getPosition().lat().toFixed(4))).toEqual(-12.0533);
      expect(parseFloat(marker.getPosition().lng().toFixed(4))).toEqual(-77.0293);
    });
  });

  describe("With events", function() {
    var callbacks;

    beforeEach(function() {
      callbacks = {
        onclick : function() {
          console.log(this.title);
        }
      };

      spyOn(callbacks, 'onclick').andCallThrough();

      marker = map.addMarker({
        lat : -12.0533,
        lng: -77.0193,
        title : 'New marker',
        click : callbacks.onclick
      });
    });

    it("should respond to click event", function() {
      google.maps.event.trigger(marker, 'click');

      expect(callbacks.onclick).toHaveBeenCalled();
    });
  });
});