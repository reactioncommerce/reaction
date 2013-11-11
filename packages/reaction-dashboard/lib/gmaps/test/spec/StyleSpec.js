describe("Adding Map Styles", function() {
  var map_with_styles;

  beforeEach(function() {
    map_with_styles = map_with_styles || new GMaps({
      el : '#map-with-styles',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });

    map_with_styles.addStyle({
      styledMapName : {
        name : 'Lighter'
      },
      mapTypeId : 'lighter',
      styles : [
        {
          elementType : 'geometry',
          stylers : [
            { lightness : 50 }
          ]
        },
        {
          elementType : 'labels',
          stylers : [
            { visibility : 'off' }
          ]
        },
      ]
    });
  });

  it("should add a MapType to the current map", function() {
    expect(map_with_styles.map.mapTypes.get('lighter')).toBeDefined();
  });

  it("should update the styles in the current map", function() {
    map_with_styles.setStyle('lighter');

    expect(map_with_styles.getMapTypeId()).toEqual('lighter');
  });
});