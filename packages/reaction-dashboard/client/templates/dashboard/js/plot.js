themePlot = function () {
  //----------------------------- Charts -----------------------------------//
  if (jQuery().plot) {
    // used by plot functions
    var data = [];
    var totalPoints = 250;

    // random data generator for plot charts
    function getRandomData() {
      if (data.length > 0) {
        data = data.slice(1);
      }
      // do a random walk
      while (data.length < totalPoints) {
        var prev = data.length > 0 ? data[data.length - 1] : 50;
        var y = prev + Math.random() * 10 - 5;
        if (y < 0) {
          y = 0;
        }
        if (y > 100) {
          y = 100;
        }
        data.push(y);
      }
      // zip the generated y values with the x values
      var res = [];
      for (var i = 0; i < data.length; ++i) {
        res.push([i, data[i]])
      }
      return res;
    }

    //Basic Chart
    function chart1() {
      if ($("#chart_1").size() == 0) {
        return;
      }
      var d1 = [];
      for (var i = 0; i < Math.PI * 2; i += 0.25) {
        d1.push([i, Math.sin(i)]);
      }

      var d2 = [];
      for (var i = 0; i < Math.PI * 2; i += 0.25) {
        d2.push([i, Math.cos(i)]);
      }

      var d3 = [];
      for (var i = 0; i < Math.PI * 2; i += 0.1) {
        d3.push([i, Math.tan(i)]);
      }

      $.plot($("#chart_1"), [
        {
          label: "sin(x)",
          data: d1
        },
        {
          label: "cos(x)",
          data: d2
        },
        {
          label: "tan(x)",
          data: d3
        }
      ], {
        series: {
          lines: {
            show: true
          },
          points: {
            show: true
          }
        },
        xaxis: {
          ticks: [
            0, [Math.PI / 2, "\u03c0/2"],
            [Math.PI, "\u03c0"],
            [Math.PI * 3 / 2, "3\u03c0/2"],
            [Math.PI * 2, "2\u03c0"]
          ]
        },
        yaxis: {
          ticks: 10,
          min: -2,
          max: 2
        },
        grid: {
          backgroundColor: {
            colors: ["#fff", "#eee"]
          }
        }
      });

    }

    //Interactive Chart
    function chart2() {
      if ($("#chart_2").size() == 0) {
        return;
      }
      function randValue() {
        return (Math.floor(Math.random() * (1 + 40 - 20))) + 20;
      }

      var pageviews = [
        [1, randValue()],
        [2, randValue()],
        [3, 2 + randValue()],
        [4, 3 + randValue()],
        [5, 5 + randValue()],
        [6, 10 + randValue()],
        [7, 15 + randValue()],
        [8, 20 + randValue()],
        [9, 25 + randValue()],
        [10, 30 + randValue()],
        [11, 35 + randValue()],
        [12, 25 + randValue()],
        [13, 15 + randValue()],
        [14, 20 + randValue()],
        [15, 45 + randValue()],
        [16, 50 + randValue()],
        [17, 65 + randValue()],
        [18, 70 + randValue()],
        [19, 85 + randValue()],
        [20, 80 + randValue()],
        [21, 75 + randValue()],
        [22, 80 + randValue()],
        [23, 75 + randValue()],
        [24, 70 + randValue()],
        [25, 65 + randValue()],
        [26, 75 + randValue()],
        [27, 80 + randValue()],
        [28, 85 + randValue()],
        [29, 90 + randValue()],
        [30, 95 + randValue()]
      ];
      var visitors = [
        [1, randValue() - 5],
        [2, randValue() - 5],
        [3, randValue() - 5],
        [4, 6 + randValue()],
        [5, 5 + randValue()],
        [6, 20 + randValue()],
        [7, 25 + randValue()],
        [8, 36 + randValue()],
        [9, 26 + randValue()],
        [10, 38 + randValue()],
        [11, 39 + randValue()],
        [12, 50 + randValue()],
        [13, 51 + randValue()],
        [14, 12 + randValue()],
        [15, 13 + randValue()],
        [16, 14 + randValue()],
        [17, 15 + randValue()],
        [18, 15 + randValue()],
        [19, 16 + randValue()],
        [20, 17 + randValue()],
        [21, 18 + randValue()],
        [22, 19 + randValue()],
        [23, 20 + randValue()],
        [24, 21 + randValue()],
        [25, 14 + randValue()],
        [26, 24 + randValue()],
        [27, 25 + randValue()],
        [28, 26 + randValue()],
        [29, 27 + randValue()],
        [30, 31 + randValue()]
      ];

      var plot = $.plot($("#chart_2"), [
        {
          data: pageviews,
          label: "Unique Visits"
        },
        {
          data: visitors,
          label: "Page Views"
        }
      ], {
        series: {
          lines: {
            show: true,
            lineWidth: 2,
            fill: true,
            fillColor: {
              colors: [
                {
                  opacity: 0.05
                },
                {
                  opacity: 0.01
                }
              ]
            }
          },
          points: {
            show: true
          },
          shadowSize: 2
        },
        grid: {
          hoverable: true,
          clickable: true,
          tickColor: "#eee",
          borderWidth: 0
        },
        colors: ["#FCB322", "#A5D16C", "#52e136"],
        xaxis: {
          ticks: 11,
          tickDecimals: 0
        },
        yaxis: {
          ticks: 11,
          tickDecimals: 0
        }
      });


      function showTooltip(x, y, contents) {
        $('<div id="tooltip">' + contents + '</div>').css({
          position: 'absolute',
          display: 'none',
          top: y + 5,
          left: x + 15,
          border: '1px solid #333',
          padding: '4px',
          color: '#fff',
          'border-radius': '3px',
          'background-color': '#333',
          opacity: 0.80
        }).appendTo("body").fadeIn(200);
      }

      var previousPoint = null;
      $("#chart_2").bind("plothover", function (event, pos, item) {
        $("#x").text(pos.x.toFixed(2));
        $("#y").text(pos.y.toFixed(2));

        if (item) {
          if (previousPoint != item.dataIndex) {
            previousPoint = item.dataIndex;

            $("#tooltip").remove();
            var x = item.datapoint[0].toFixed(2),
              y = item.datapoint[1].toFixed(2);

            showTooltip(item.pageX, item.pageY, item.series.label + " of " + x + " = " + y);
          }
        } else {
          $("#tooltip").remove();
          previousPoint = null;
        }
      });
    }

    //Tracking Curves
    function chart3() {
      if ($("#chart_3").size() == 0) {
        return;
      }
      //tracking curves:

      var sin = [],
        cos = [];
      for (var i = 0; i < 14; i += 0.1) {
        sin.push([i, Math.sin(i)]);
        cos.push([i, Math.cos(i)]);
      }

      plot = $.plot($("#chart_3"), [
        {
          data: sin,
          label: "sin(x) = -0.00"
        },
        {
          data: cos,
          label: "cos(x) = -0.00"
        }
      ], {
        series: {
          lines: {
            show: true
          }
        },
        crosshair: {
          mode: "x"
        },
        grid: {
          hoverable: true,
          autoHighlight: false
        },
        colors: ["#FCB322", "#A5D16C", "#52e136"],
        yaxis: {
          min: -1.2,
          max: 1.2
        }
      });

      var legends = $("#chart_3 .legendLabel");
      legends.each(function () {
        // fix the widths so they don't jump around
        $(this).css('width', $(this).width());
      });

      var updateLegendTimeout = null;
      var latestPosition = null;

      function updateLegend() {
        updateLegendTimeout = null;

        var pos = latestPosition;

        var axes = plot.getAxes();
        if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max || pos.y < axes.yaxis.min || pos.y > axes.yaxis.max) {
          return;
        }

        var i, j, dataset = plot.getData();
        for (i = 0; i < dataset.length; ++i) {
          var series = dataset[i];

          // find the nearest points, x-wise
          for (j = 0; j < series.data.length; ++j) {
            if (series.data[j][0] > pos.x) {
              break;
            }
          }

          // now interpolate
          var y, p1 = series.data[j - 1],
            p2 = series.data[j];
          if (p1 == null) {
            y = p2[1];
          }
          else if (p2 == null) {
            y = p1[1];
          }
          else {
            y = p1[1] + (p2[1] - p1[1]) * (pos.x - p1[0]) / (p2[0] - p1[0]);
          }

          legends.eq(i).text(series.label.replace(/=.*/, "= " + y.toFixed(2)));
        }
      }

      $("#chart_3").bind("plothover", function (event, pos, item) {
        latestPosition = pos;
        if (!updateLegendTimeout) {
          updateLegendTimeout = setTimeout(updateLegend, 50);
        }
      });
    }

    //Dynamic Chart
    function chart4() {
      if ($("#chart_4").size() == 0) {
        return;
      }
      //server load
      var options = {
        series: {
          shadowSize: 1
        },
        lines: {
          show: true,
          lineWidth: 0.5,
          fill: true,
          fillColor: {
            colors: [
              {
                opacity: 0.1
              },
              {
                opacity: 1
              }
            ]
          }
        },
        yaxis: {
          min: 0,
          max: 100,
          tickFormatter: function (v) {
            return v + "%";
          }
        },
        xaxis: {
          show: false
        },
        colors: ["#6ef146"],
        grid: {
          tickColor: "#a8a3a3",
          borderWidth: 0
        }
      };

      var updateInterval = 30;
      var plot = $.plot($("#chart_4"), [getRandomData()], options);

      function update() {
        plot.setData([getRandomData()]);
        plot.draw();
        setTimeout(update, updateInterval);
      }

      update();
    }

    //bars with controls
    function chart5() {
      if ($("#chart_5").size() == 0) {
        return;
      }
      var d1 = [];
      for (var i = 0; i <= 10; i += 1) {
        d1.push([i, parseInt(Math.random() * 30)]);
      }

      var d2 = [];
      for (var i = 0; i <= 10; i += 1) {
        d2.push([i, parseInt(Math.random() * 30)]);
      }

      var d3 = [];
      for (var i = 0; i <= 10; i += 1) {
        d3.push([i, parseInt(Math.random() * 30)]);
      }

      var stack = 0,
        bars = true,
        lines = false,
        steps = false;

      function plotWithOptions() {
        $.plot($("#chart_5"), [d1, d2, d3], {
          series: {
            stack: stack,
            lines: {
              show: lines,
              fill: true,
              steps: steps
            },
            bars: {
              show: bars,
              barWidth: 0.6
            }
          }
        });
      }

      $(".stackControls input").click(function (e) {
        e.preventDefault();
        stack = $(this).val() == "With stacking" ? true : null;
        plotWithOptions();
      });
      $(".graphControls input").click(function (e) {
        e.preventDefault();
        bars = $(this).val().indexOf("Bars") != -1;
        lines = $(this).val().indexOf("Lines") != -1;
        steps = $(this).val().indexOf("steps") != -1;
        plotWithOptions();
      });

      plotWithOptions();
    }

    //graph
    function graphs() {
      if ($("#graph_1").size() == 0) {
        return;
      }

      var graphData = [];
      var series = Math.floor(Math.random() * 10) + 1;
      for (var i = 0; i < series; i++) {
        graphData[i] = {
          label: "Series" + (i + 1),
          data: Math.floor((Math.random() - 1) * 100) + 1
        }
      }

      $.plot($("#graph_1"), graphData, {
        series: {
          pie: {
            show: true,
            radius: 1,
            label: {
              show: true,
              radius: 1,
              formatter: function (label, series) {
                return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">' + label + '<br/>' + Math.round(series.percent) + '%</div>';
              },
              background: {
                opacity: 0.8
              }
            }
          }
        },
        legend: {
          show: false
        }
      });


      $.plot($("#graph_2"), graphData, {
        series: {
          pie: {
            show: true,
            radius: 1,
            label: {
              show: true,
              radius: 3 / 4,
              formatter: function (label, series) {
                return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">' + label + '<br/>' + Math.round(series.percent) + '%</div>';
              },
              background: {
                opacity: 0.5
              }
            }
          }
        },
        legend: {
          show: false
        }
      });

      $.plot($("#graph_3"), graphData, {
        series: {
          pie: {
            show: true
          }
        },
        grid: {
          hoverable: true,
          clickable: true
        }
      });
      $("#graph_3").bind("plothover", pieHover);
      $("#graph_3").bind("plotclick", pieClick);

      function pieHover(event, pos, obj) {
        if (!obj) {
          return;
        }
        percent = parseFloat(obj.series.percent).toFixed(2);
        $("#hover").html('<span style="font-weight: bold; color: ' + obj.series.color + '">' + obj.series.label + ' (' + percent + '%)</span>');
      }

      function pieClick(event, pos, obj) {
        if (!obj) {
          return;
        }
        percent = parseFloat(obj.series.percent).toFixed(2);
        alert('' + obj.series.label + ': ' + percent + '%');
      }

      $.plot($("#graph_4"), graphData, {
        series: {
          pie: {
            innerRadius: 0.5,
            show: true
          }
        }
      });
    }

    chart1();
    chart2();
    chart3();
    chart4();
    chart5();
    graphs();
  }
  //---------------------------- Dashboard Visitors Chart -------------------------//
  if (jQuery.plot) {
    //define placeholder class
    var placeholder = $("#visitors-chart");

    if ($(placeholder).size() == 0) {
      return;
    }
    //some data
    var d1 = [
      [1, 35],
      [2, 48],
      [3, 34],
      [4, 54],
      [5, 46],
      [6, 37],
      [7, 40],
      [8, 55],
      [9, 43],
      [10, 61],
      [11, 52],
      [12, 57],
      [13, 64],
      [14, 56],
      [15, 48],
      [16, 53],
      [17, 50],
      [18, 59],
      [19, 66],
      [20, 73],
      [21, 81],
      [22, 75],
      [23, 86],
      [24, 77],
      [25, 86],
      [26, 85],
      [27, 79],
      [28, 83],
      [29, 95],
      [30, 92]
    ];
    var d2 = [
      [1, 9],
      [2, 15],
      [3, 16],
      [4, 21],
      [5, 19],
      [6, 15],
      [7, 22],
      [8, 29],
      [9, 20],
      [10, 27],
      [11, 32],
      [12, 37],
      [13, 34],
      [14, 30],
      [15, 28],
      [16, 23],
      [17, 28],
      [18, 35],
      [19, 31],
      [20, 28],
      [21, 33],
      [22, 25],
      [23, 27],
      [24, 24],
      [25, 36],
      [26, 25],
      [27, 39],
      [28, 28],
      [29, 35],
      [30, 42]
    ];
    var chartColours = ['#88bbc8', '#ed7a53', '#9FC569', '#bbdce3', '#9a3b1b', '#5a8022', '#2c7282'];
    //graph options
    var options = {
      grid: {
        show: true,
        aboveData: true,
        color: "#3f3f3f",
        labelMargin: 5,
        axisMargin: 0,
        borderWidth: 0,
        borderColor: null,
        minBorderMargin: 5,
        clickable: true,
        hoverable: true,
        autoHighlight: true,
        mouseActiveRadius: 20
      },
      series: {
        grow: {
          active: false,
          stepMode: "linear",
          steps: 50,
          stepDelay: true
        },
        lines: {
          show: true,
          fill: true,
          lineWidth: 3,
          steps: false
        },
        points: {
          show: true,
          radius: 4,
          symbol: "circle",
          fill: true,
          borderColor: "#fff"
        }
      },
      legend: {
        position: "ne",
        margin: [0, -25],
        noColumns: 0,
        labelBoxBorderColor: null,
        labelFormatter: function (label, series) {
          // just add some space to labes
          return label + '&nbsp;&nbsp;';
        }
      },
      yaxis: { min: 0 },
      xaxis: {ticks: 11, tickDecimals: 0},
      colors: chartColours,
      shadowSize: 1,
      tooltip: true, //activate tooltip
      tooltipOpts: {
        content: "%s : %y.0",
        defaultTheme: false,
        shifts: {
          x: -30,
          y: -50
        }
      }
    };
    $.plot(placeholder, [
      {
        label: "Visits",
        data: d1,
        lines: {fillColor: "#f2f7f9"},
        points: {fillColor: "#88bbc8"}
      },
      {
        label: "Unique Visits",
        data: d2,
        lines: {fillColor: "#fff8f2"},
        points: {fillColor: "#ed7a53"}
      }

    ], options);
  }
}
