describe("Creating event listeners", function() {
  var map_events, marker, line, polygon, callbacks_native, callbacks_gmaps;
  var added_marker, added_line, added_polygon;
  var marker_added_event, marker_removed_event,
    polyline_added_event, polyline_removed_event,
    polygon_added_event, polygon_removed_event;

  beforeEach(function() {
    map_events = map_events || new GMaps({
      el : '#events',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });

    marker = marker || map_events.addMarker({
      lat : -12.0433,
      lng : -77.0283,
      title : 'New marker'
    });

    line = line || map_events.drawPolyline({
      path : [[-12.0440, -77.0247], [-12.0544, -77.0302], [-12.0551, -77.0303], [-12.0759, -77.0276], [-12.0763, -77.0279], [-12.0768, -77.0289], [-12.0885, -77.0241], [-12.0908, -77.0227]],
      strokeColor : '#131540',
      strokeOpacity : 0.6,
      strokeWeight : 6
    });

    polygon = polygon || map_events.drawPolygon({
      paths : [[-12.0403,-77.0337],[-12.0402,-77.0399],[-12.0500,-77.0244],[-12.0448,-77.0215]],
      strokeColor : '#25D359',
      strokeOpacity : 1,
      strokeWeight : 3,
      fillColor : '#25D359',
      fillOpacity : 0.6
    });
  });

  describe("for google.maps events", function() {
    beforeEach(function() {
      callbacks_native = callbacks_native || {
        map : {
          onclick : function() {
            console.log('callbacks_native.map.onclick');
          }
        },
        marker : {
          onclick : function() {
            console.log('callbacks_native.marker.onclick');
          }
        },
        line : {
          onclick : function() {
            console.log('callbacks_native.line.onclick');
          }
        },
        polygon : {
          onclick : function() {
            console.log('callbacks_native.polygon.onclick');
          }
        }
      };

      spyOn(callbacks_native.map, 'onclick').andCallThrough();
      spyOn(callbacks_native.marker, 'onclick').andCallThrough();
      spyOn(callbacks_native.line, 'onclick').andCallThrough();
      spyOn(callbacks_native.polygon, 'onclick').andCallThrough();
    });

    describe("To a map", function() {
      it("should add the listener to the listeners collection", function() {
        var click_event = GMaps.on('click', map_events.map, callbacks_native.map.onclick);

        expect(map_events.map['__e3_']['click'][click_event['id']]).toBeDefined();
        expect(map_events.map['__e3_']['click'][click_event['id']]).toEqual(click_event);
      });
    });

    describe("To a marker", function() {
      it("should add the listener to the listeners collection", function() {
        var click_event = GMaps.on('click', marker, callbacks_native.marker.onclick);

        expect(marker['__e3_']['click'][click_event['id']]).toBeDefined();
        expect(marker['__e3_']['click'][click_event['id']]).toEqual(click_event);
      });
    });

    describe("To a line", function() {
      it("should add the listener to the listeners collection", function() {
        var click_event = GMaps.on('click', line, callbacks_native.line.onclick);

        expect(line['__e3_']['click'][click_event['id']]).toBeDefined();
        expect(line['__e3_']['click'][click_event['id']]).toEqual(click_event);
      });
    });

    describe("To a polygon", function() {
      it("should add the listener to the listeners collection", function() {
        var click_event = GMaps.on('click', polygon, callbacks_native.polygon.onclick);

        expect(polygon['__e3_']['click'][click_event['id']]).toBeDefined();
        expect(polygon['__e3_']['click'][click_event['id']]).toEqual(click_event);
      });
    });
  });

  describe("for GMaps events", function() {
    beforeEach(function() {
      callbacks_gmaps = {
        marker_added : function() {
          console.log('callbacks_gmaps.marker_added called');
        },
        marker_removed : function() {
          console.log('callbacks_gmaps.marker_removed called');
        },
        polyline_added : function() {
          console.log('callbacks_gmaps.polyline_added called');
        },
        polyline_removed : function() {
          console.log('callbacks_gmaps.polyline_removed called');
        },
        polygon_added : function() {
          console.log('callbacks_gmaps.polygon_added called');
        },
        polygon_removed : function() {
          console.log('callbacks_gmaps.polygon_removed called');
        }
      };

      spyOn(callbacks_gmaps, 'marker_added').andCallThrough();
      spyOn(callbacks_gmaps, 'marker_removed').andCallThrough();
      spyOn(callbacks_gmaps, 'polyline_added').andCallThrough();
      spyOn(callbacks_gmaps, 'polyline_removed').andCallThrough();
      spyOn(callbacks_gmaps, 'polygon_added').andCallThrough();
      spyOn(callbacks_gmaps, 'polygon_removed').andCallThrough();
    });

    describe("#marker_added", function() {
      beforeEach(function() {
        marker_added_event = GMaps.on('marker_added', map_events, callbacks_gmaps.marker_added);
      });

      it("should add the listener to the listeners collection", function() {
        expect(map_events.registered_events['marker_added'][0]).toEqual(marker_added_event);
      });

      it("should trigger the listener created", function() {
        added_marker = added_marker || map_events.addMarker({
          lat : -12.0433,
          lng : -77.0273,
          title : 'New marker'
        });

        expect(callbacks_gmaps.marker_added).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('marker_added', map_events);
      });
    });

    describe("#marker_removed", function() {
      beforeEach(function() {
        marker_removed_event = GMaps.on('marker_removed', map_events, callbacks_gmaps.marker_removed);
      });

      it("should add the listener to the listeners collection", function() {
        expect(map_events.registered_events['marker_removed'][0]).toEqual(marker_removed_event);
      });

      it("should trigger the listener created", function() {
        map_events.removeMarker(added_marker);

        expect(callbacks_gmaps.marker_removed).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('marker_removed', map_events);
      });
    });

    describe("#polyline_added", function() {
      beforeEach(function() {
        polyline_added_event = GMaps.on('polyline_added', map_events, callbacks_gmaps.polyline_added);
      });

      it("should add the listener to the listeners collection", function() {
        expect(map_events.registered_events['polyline_added'][0]).toEqual(polyline_added_event);
      });

      it("should trigger the listener created", function() {
        added_line = added_line || map_events.drawPolyline({
          path : [[-12.0420, -77.0247], [-12.0544, -77.0102], [-12.0751, -77.0903], [-12.0759, -77.0276], [-12.0763, -77.0279], [-12.0768, -77.0289], [-12.0885, -77.0241], [-12.0908, -77.0227]],
          strokeColor : '#271804',
          strokeOpacity : 0.1,
          strokeWeight : 1
        });

        expect(callbacks_gmaps.polyline_added).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('polyline_added', map_events);
      });
    });

    describe("#polyline_removed", function() {
      beforeEach(function() {
        polyline_removed_event = GMaps.on('polyline_removed', map_events, callbacks_gmaps.polyline_removed);
      });

      it("should add the listener to the listeners collection", function() {
        expect(map_events.registered_events['polyline_removed'][0]).toEqual(polyline_removed_event);
      });

      it("should trigger the listener created", function() {
        map_events.removePolyline(added_line);

        expect(callbacks_gmaps.polyline_removed).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('polyline_removed', map_events);
      });
    });

    describe("#polygon_added", function() {
      beforeEach(function() {
        polygon_added_event = GMaps.on('polygon_added', map_events, callbacks_gmaps.polygon_added);
      });

      it("should add the listener to the listeners collection", function() {
        expect(map_events.registered_events['polygon_added'][0]).toEqual(polygon_added_event);
      });

      it("should trigger the listener created", function() {
        added_polygon = added_polygon || map_events.drawPolygon({
          paths : [[-12.0203,-77.0137],[-12.0402,-77.0109],[-12.0500,-77.0144],[-12.0848,-77.0115]],
          strokeColor : '#D32559',
          strokeOpacity : 0.7,
          strokeWeight : 8,
          fillColor : '#D32559',
          fillOpacity : 0.6
        });

        expect(callbacks_gmaps.polygon_added).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('polygon_added', map_events);
      });
    });

    describe("#polygon_removed", function() {
      beforeEach(function() {
        polygon_removed_event = GMaps.on('polygon_removed', map_events, callbacks_gmaps.polygon_removed);
      });

      it("should add the listener to the listeners collection", function() {
        expect(map_events.registered_events['polygon_removed'][0]).toEqual(polygon_removed_event);
      });

      it("should trigger the listener created", function() {
        map_events.removePolygon(added_polygon);

        expect(callbacks_gmaps.polygon_removed).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('polygon_removed', map_events);
      });
    });
  });
});