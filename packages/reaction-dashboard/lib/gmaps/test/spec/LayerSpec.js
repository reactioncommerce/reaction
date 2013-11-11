describe("Adding layers", function() {
  var map_with_layers, single_layer, multiple_layers = [];

  beforeEach(function() {
    map_with_layers = map_with_layers || new GMaps({
      el : '#map-with-layers',
      lat: -12.0433,
      lng: -77.0283,
      zoom: 12
    });
  });

  describe("Single layer", function() {
    beforeEach(function() {
      single_layer = single_layer || map_with_layers.addLayer('traffic');
    })

    it("should be added in the current map", function() {
      expect(single_layer.getMap()).toEqual(map_with_layers.map);
    });

    it("should be removed from the current map", function() {
      map_with_layers.removeLayer('traffic');
      
      expect(single_layer.getMap()).toBeNull();
    });
  });

  describe("Multiple layers", function() {
    beforeEach(function() {
      if (multiple_layers.length == 0) {
        multiple_layers.push(map_with_layers.addLayer('transit'));
        multiple_layers.push(map_with_layers.addLayer('bicycling'));
      }
    });

    it("should be added in the current map", function() {
      expect(multiple_layers[0].getMap()).toEqual(map_with_layers.map);
      expect(multiple_layers[1].getMap()).toEqual(map_with_layers.map);
    });
    
    it("should be removed from the current map", function() {
      map_with_layers.removeLayer('transit');
      map_with_layers.removeLayer('bicycling');

      expect(multiple_layers[0].getMap()).toBeNull();
      expect(multiple_layers[1].getMap()).toBeNull();
    });
  });
});