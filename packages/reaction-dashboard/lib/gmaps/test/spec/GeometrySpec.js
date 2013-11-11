describe("Drawing geometry overlays", function() {
  var map_with_polygons, line, rectangle, circle, polygon;

  beforeEach(function() {
    map_with_polygons = map_with_polygons || new GMaps({
      el : '#map-with-polygons',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });
  });

  describe("A line", function() {
    beforeEach(function() {
      line = line || map_with_polygons.drawPolyline({
        path : [[-12.0440, -77.0247], [-12.0544, -77.0302], [-12.0551, -77.0303], [-12.0759, -77.0276], [-12.0763, -77.0279], [-12.0768, -77.0289], [-12.0885, -77.0241], [-12.0908, -77.0227]],
        strokeColor : '#131540',
        strokeOpacity : 0.6,
        strokeWeight : 6
      });
    });

    it("should add the line to the polylines collection", function() {
      expect(map_with_polygons.polylines.length).toEqual(1);
      expect(map_with_polygons.polylines[0]).toEqual(line);
    });

    it("should be added in the current map", function() {
      expect(line.getMap()).toEqual(map_with_polygons.map);
    });

    it("should return the defined path", function() {
      var first_point = line.getPath().getAt(0);

      expect(parseFloat(first_point.lat().toFixed(4))).toEqual(-12.0440);
      expect(parseFloat(first_point.lng().toFixed(4))).toEqual(-77.0247);
    });
  });

  describe("A rectangle", function() {
    beforeEach(function() {
      rectangle = rectangle || map_with_polygons.drawRectangle({
        bounds : [[-12.0303,-77.0237],[-12.0348,-77.0115]],
        strokeColor : '#BBD8E9',
        strokeOpacity : 1,
        strokeWeight : 3,
        fillColor : '#BBD8E9',
        fillOpacity : 0.6
      });
    });

    it("should add the rectangle to the polygons collection", function() {
      expect(map_with_polygons.polygons.length).toEqual(1);
      expect(map_with_polygons.polygons[0]).toEqual(rectangle);
    });

    it("should be added in the current map", function() {
      expect(rectangle.getMap()).toEqual(map_with_polygons.map);
    });

    it("should have the defined bounds", function() {
      // Fix for floating-point bug
      var SWLat = parseFloat(rectangle.getBounds().getSouthWest().lat().toFixed(4));
      var SWLng = parseFloat(rectangle.getBounds().getSouthWest().lng().toFixed(4));

      var NELat = parseFloat(rectangle.getBounds().getNorthEast().lat().toFixed(4));
      var NELng = parseFloat(rectangle.getBounds().getNorthEast().lng().toFixed(4));

      expect(SWLat).toEqual(-12.0303);
      expect(SWLng).toEqual(-77.0237);
      expect(NELat).toEqual(-12.0348);
      expect(NELng).toEqual(-77.0115);
    });
  });

  describe("A polygon", function() {
    beforeEach(function() {
      polygon = polygon || map_with_polygons.drawPolygon({
        paths : [[-12.0403,-77.0337],[-12.0402,-77.0399],[-12.0500,-77.0244],[-12.0448,-77.0215]],
        strokeColor : '#25D359',
        strokeOpacity : 1,
        strokeWeight : 3,
        fillColor : '#25D359',
        fillOpacity : 0.6
      });
    });

    it("should add the polygon to the polygons collection", function() {
      expect(map_with_polygons.polygons.length).toEqual(2);
      expect(map_with_polygons.polygons[1]).toEqual(polygon);
    });

    it("should be added in the current map", function() {
      expect(polygon.getMap()).toEqual(map_with_polygons.map);
    });

    it("should return the defined path", function() {
      var first_point = polygon.getPath().getAt(0);

      expect(parseFloat(first_point.lat().toFixed(4))).toEqual(-12.0403);
      expect(parseFloat(first_point.lng().toFixed(4))).toEqual(-77.0337);
    });
  });

  describe("A circle", function() {
    beforeEach(function() {
      circle = circle || map_with_polygons.drawCircle({
        lat : -12.040504866577001,
        lng : -77.02024422636042,
        radius : 350,
        strokeColor : '#432070',
        strokeOpacity : 1,
        strokeWeight : 3,
        fillColor : '#432070',
        fillOpacity : 0.6
      });
    });

    it("should add the circle to the polygons collection", function() {
      expect(map_with_polygons.polygons.length).toEqual(3);
      expect(map_with_polygons.polygons[2]).toEqual(circle);
    });

    it("should be added in the current map", function() {
      expect(circle.getMap()).toEqual(map_with_polygons.map);
    });

    it("should have the defined radius", function() {
      expect(circle.getRadius()).toEqual(350);
    });
  });
});

describe("Removing geometry overlays", function() {
  var map_with_polygons, line, rectangle, circle, polygon;

  beforeEach(function() {
    map_with_polygons = map_with_polygons || new GMaps({
      el : '#map-with-polygons',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });
  });

  describe("A line", function() {
    beforeEach(function() {
      line = map_with_polygons.drawPolyline({
        path : [[-12.0440, -77.0247], [-12.0544, -77.0302], [-12.0551, -77.0303], [-12.0759, -77.0276], [-12.0763, -77.0279], [-12.0768, -77.0289], [-12.0885, -77.0241], [-12.0908, -77.0227]],
        strokeColor : '#131540',
        strokeOpacity : 0.6,
        strokeWeight : 6
      });

      map_with_polygons.removePolyline(line);
    });

    it("should remove the line from the polylines collection", function() {
      expect(map_with_polygons.polylines.length).toEqual(0);
      expect(line.getMap()).toBeNull();
    });
  });

  describe("A rectangle", function() {
    beforeEach(function() {
      rectangle = map_with_polygons.drawRectangle({
        bounds : [[-12.0303,-77.0237],[-12.0348,-77.0115]],
        strokeColor : '#BBD8E9',
        strokeOpacity : 1,
        strokeWeight : 3,
        fillColor : '#BBD8E9',
        fillOpacity : 0.6
      });

      map_with_polygons.removePolygon(rectangle);
    });

    it("should remove the rectangle from the polygons collection", function() {
      expect(map_with_polygons.polygons.length).toEqual(0);
      expect(rectangle.getMap()).toBeNull();
    });
  });

  describe("A polygon", function() {
    beforeEach(function() {
      polygon = map_with_polygons.drawPolygon({
        paths : [[-12.0403,-77.0337],[-12.0402,-77.0399],[-12.0500,-77.0244],[-12.0448,-77.0215]],
        strokeColor : '#25D359',
        strokeOpacity : 1,
        strokeWeight : 3,
        fillColor : '#25D359',
        fillOpacity : 0.6
      });

      map_with_polygons.removePolygon(polygon);
    });

    it("should remove the polygon from the polygons collection", function() {
      expect(map_with_polygons.polygons.length).toEqual(0);
      expect(polygon.getMap()).toBeNull();
    });
  });

  describe("A circle", function() {
    beforeEach(function() {
      circle = map_with_polygons.drawCircle({
        lat : -12.040504866577001,
        lng : -77.02024422636042,
        radius : 350,
        strokeColor : '#432070',
        strokeOpacity : 1,
        strokeWeight : 3,
        fillColor : '#432070',
        fillOpacity : 0.6
      });

      map_with_polygons.removePolygon(circle);
    });

    it("should remove the circle from the polygons collection", function() {
      expect(map_with_polygons.polygons.length).toEqual(0);
      expect(circle.getMap()).toBeNull();
    });
  });
});