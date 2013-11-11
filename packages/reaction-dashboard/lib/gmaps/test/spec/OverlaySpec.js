describe("Drawing HTML overlays", function() {
  var map_with_overlays, overlay;

  beforeEach(function() {
    map_with_overlays = map_with_overlays || new GMaps({
      el : '#map-with-overlays',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });

    overlay = overlay || map_with_overlays.drawOverlay({
      lat: map_with_overlays.getCenter().lat(),
      lng: map_with_overlays.getCenter().lng(),
      layer: 'overlayLayer',
      content: '<div class="overlay">Lima</div>',
      verticalAlign: 'top',
      horizontalAlign: 'center'
    });
  });

  it("should add the overlay to the overlays collection", function() {
    expect(map_with_overlays.overlays.length).toEqual(1);
    expect(map_with_overlays.overlays[0]).toEqual(overlay);
  });

  it("should add the overlay in the current map", function() {
    expect(overlay.getMap()).toEqual(map_with_overlays.map);
  });
});