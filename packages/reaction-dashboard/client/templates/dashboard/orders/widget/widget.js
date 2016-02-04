/**
 * coreOrderWidgets helpers
 *
 */

Template.coreOrderWidgets.helpers;

/**
 * coreOrderWidgets events
 *
 */

Template.coreOrderWidgets.events;

/**
 * coreOrderWidgets onRendered
 *
 */

Template.coreOrderWidgets.onRendered(function() {
  var age, agedOrdersCount, agingOrdersCount, agingRange, arc, completedOrdersCount, currentDay, currentOrdersCount, elem, elemEnter, fontColor, graph, graphData, height, multiGraph, now, orderCircleData, packingOrdersCount, pendingOrdersCount, processingOrdersCount, scale, statusColor, total, width;
  now = new Date();
  age = 5;
  currentDay = new Date(now.setDate(now.getDate() - 1));
  agingRange = new Date(now.setDate(now.getDate() - age));
  currentOrdersCount = Orders.find({
    'workflow.status': {
      $not: "orderComplete"
    },
    'createdAt': {
      $gt: currentDay
    }
  }).count();
  agingOrdersCount = Orders.find({
    'workflow.status': {
      $not: "orderComplete"
    },
    'createdAt': {
      $lt: currentDay,
      $gt: agingRange
    }
  }).count();
  agedOrdersCount = Orders.find({
    'workflow.status': {
      $not: "coreOrderComplete"
    },
    'createdAt': {
      $lt: agingRange
    }
  }).count();
  pendingOrdersCount = Orders.find({
    'workflow.status': {
      $in: ["orderCreated"]
    }
  }).count();
  processingOrdersCount = Orders.find({
    'workflow.status': {
      $in: ["shipmentTracking", "shipmentPrepare"]
    }
  }).count();
  packingOrdersCount = Orders.find({
    'workflow.status': {
      $in: ["shipmentPacking", "processPayment", "processPayment"]
    }
  }).count();
  completedOrdersCount = Orders.find({
    'workflow.status': {
      $in: ["shipmentShipped", "orderCompleted"]
    }
  }).count();
  total = currentOrdersCount + agingOrdersCount + agedOrdersCount;
  graphData = [[0, currentOrdersCount, "#8abf57"], [currentOrdersCount, currentOrdersCount + agingOrdersCount, "#f38b4e"], [currentOrdersCount + agingOrdersCount, total, "#f53e36"]];
  statusColor = function(orderCount) {
    var bg, color, danger, info, success, warning;
    if (orderCount == null) {
      orderCount = 0;
    }
    bg = "#f5f5f5";
    info = "#3bacba";
    warning = "#f38b4e";
    danger = "#f53e36";
    success = "#8abf57";
    color = (function() {
      switch (false) {
        case !(orderCount <= 5):
          return danger;
        case !(orderCount >= 6):
          return warning;
        case !(orderCount >= 20):
          return info;
        case !(orderCount >= 50):
          return success;
      }
    })();
    return color;
  };
  if (agingOrdersCount > 0) {
    fontColor = "#f53e36";
  } else {
    fontColor = "#8abf57";
  }
  orderCircleData = [
    {
      "x_axis": 70,
      "y_axis": 70,
      "radius": 40,
      "color": statusColor(pendingOrdersCount),
      "value": pendingOrdersCount,
      "url": "/dashboard/orders#pending",
      "label": "Pending"
    }, {
      "x_axis": 180,
      "y_axis": 70,
      "radius": 40,
      "color": statusColor(packingOrdersCount),
      "value": packingOrdersCount,
      "url": "/dashboard/orders#packing",
      "label": "Packing"
    }, {
      "x_axis": 70,
      "y_axis": 180,
      "radius": 40,
      "color": statusColor(processingOrdersCount),
      "value": processingOrdersCount,
      "url": "/dashboard/orders#processing",
      "label": "Processing"
    }, {
      "x_axis": 180,
      "y_axis": 180,
      "radius": 40,
      "color": statusColor(completedOrdersCount),
      "value": completedOrdersCount,
      "url": "/dashboard/orders#completed",
      "label": "Completed"
    }
  ];
  width = 250;
  height = 250;

  /*
   *  Order Aging Circle Graph
   */
  graph = d3.select("#dashboard-order-graph").append("svg").attr("width", width).attr("height", height);
  scale = d3.scale.linear().domain([0, total]).range([0, 2 * Math.PI]);
  arc = d3.svg.arc().innerRadius(55).outerRadius(70).startAngle(function(d) {
    return scale(d[0]);
  }).endAngle(function(d) {
    return scale(d[1]);
  });
  graph.selectAll("path").data(graphData).enter().append("path").attr("d", arc).style("fill", function(d) {
    return d[2];
  }).attr("transform", "translate(125,125)");
  graph.append("text").attr("x", width / 2).attr("y", height / 2 + 22).attr("text-anchor", "middle").style("font-family", "sans-serif").style("font-size", "60px").style("font-weight", "300").attr("fill", fontColor).text(total);

  /*
   * Define the order state circles
   */
  multiGraph = d3.select("#dashboard-order-multi-graph").append("svg").attr("width", width).attr("height", height);
  elem = multiGraph.selectAll("g circlesWithText").data(orderCircleData);
  elemEnter = elem.enter().append("g").attr("class", "order-multi-graph-circle").attr("transform", function(d) {
    return "translate(" + d.x_axis + "," + d.y_axis + ")";
  }).append("svg:a").attr("xlink:href", function(d) {
    return d.url;
  }).attr("class", "order-multi-graph-link");
  elemEnter.append("circle").attr("r", function(d) {
    return d.radius;
  }).style("fill", function(d) {
    return "white";
  }).style("stroke", function(d) {
    return d.color;
  }).style("stroke-width", function(d) {
    return "8";
  });
  elemEnter.append("text").attr("dy", function(d) {
    return 7;
  }).attr("text-anchor", "middle").attr("fill", function(d) {
    return d.color;
  }).style("font-size", "22px").style("font-weight", "400").text(function(d) {
    return d.value;
  });
  return elemEnter.append("text").attr("dy", 20).attr("text-anchor", "middle").attr("fill", "#696969").style("font-size", "10px").style("font-weight", "300").text(function(d) {
    return d.label;
  });
});

/**
 * coreOrderWidgets onDestroyed
 *
 */

Template.coreOrderWidgets.onDestroyed(function() {});
