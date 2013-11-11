var map_with_routes, route, routes;

describe("Drawing a route", function() {
  beforeEach(function() {
    map_with_routes = map_with_routes || new GMaps({
      el : '#map-with-routes',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });
  });

  it("should add a line in the current map", function() {
    var route_flag;

    runs(function() {
      route_flag = false;

      map_with_routes.drawRoute({
        origin : [-12.044012922866312, -77.02470665341184],
        destination : [-12.090814532191756, -77.02271108990476],
        travelMode : 'driving',
        strokeColor : '#131540',
        strokeOpacity : 0.6,
        strokeWeight : 6,
        callback : function() {
          route_flag = true;
        }
      });
    });

    waitsFor(function() {
      return route_flag;
    }, "The drawn route should create a line in the current map", 500);

    runs(function() {
      expect(map_with_routes.polylines.length).toEqual(1);
      expect(map_with_routes.polylines[0].get('strokeColor')).toEqual('#131540');
      expect(map_with_routes.polylines[0].get('strokeOpacity')).toEqual(0.6);
      expect(map_with_routes.polylines[0].getMap()).toEqual(map_with_routes.map);
    });
  });
});

describe("Getting routes", function() {
  beforeEach(function() {
    map_with_routes = map_with_routes || new GMaps({
      el : '#map-with-routes',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });
  });

  it("should return an array of routes", function() {
    var routes_flag;

    runs(function() {
      routes_flag = false;

      map_with_routes.getRoutes({
        origin : [-12.0440, -77.0247],
        destination : [-12.0908, -77.0227],
        callback : function(r) {
          routes = r;

          routes_flag = true;
        }
      });
    });

    waitsFor(function() {
      return routes_flag;
    }, "#getRoutes should return the found routes as an argument", 500);

    runs(function() {
      expect(routes).toBeDefined();
      expect(map_with_routes.routes).toEqual(routes);

      if (routes.length > 0) {
        expect(routes[0].legs[0].distance).toBeDefined();
        expect(routes[0].legs[0].duration).toBeDefined();
      }
    });
  });
});