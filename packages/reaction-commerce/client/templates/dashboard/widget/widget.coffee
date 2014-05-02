Template["reactionCommerceWidget"].helpers


Template["reactionCommerceWidget"].events


Template["reactionCommerceWidget"].rendered = ->
  # get data
  now = new Date()
  age = 5
  currentDay = new Date(now.setDate(now.getDate() - 1))
  agingRange = new Date(now.setDate(now.getDate() - age))

  # current in progress order counts
  currentOrdersCount = Orders.find({'state': {$not: "orderComplete"}, 'createdAt': { $gt: currentDay } }).count()
  agingOrdersCount =  Orders.find({'state': {$not: "orderComplete"}, 'createdAt': { $lt: currentDay, $gt: agingRange} }).count()
  agedOrdersCount =  Orders.find({'state': {$not: "orderComplete"}, 'createdAt': { $lt: agingRange} }).count()
  # of all time
  pendingOrdersCount = Orders.find({'state': {$in: ["orderCreated"]} }).count()
  processingOrdersCount = Orders.find({'state': {$in: ["shipmentTracking","shipmentPrepare"]} }).count()
  packingOrdersCount = Orders.find({'state': {$in: ["shipmentPacking","processPayment","processPayment"]} }).count()
  completedOrdersCount = Orders.find({'state': {$in: ["shipmentShipped","orderCompleted"]} }).count()

  total = currentOrdersCount + agingOrdersCount + agedOrdersCount

  graphData = [[0,currentOrdersCount,"#8abf57"], [currentOrdersCount,currentOrdersCount+agingOrdersCount, "#f38b4e"], [currentOrdersCount+agingOrdersCount,total,"#f53e36"]]

  # method to set color levels
  statusColor = (orderCount = 0) ->
    #colors
    bg = "#f5f5f5"
    info  = "#3bacba"
    warning =  "#f38b4e"
    danger =  "#f53e36"
    success = "#8abf57"
    #levels
    color = switch
      when orderCount <= 5 then danger
      when orderCount >= 6 then warning
      when orderCount >= 20 then info
      when orderCount >= 50 then success
    return color

  if agingOrdersCount > 0 then fontColor = "#f53e36" else fontColor = "#8abf57"

  #define circle data
  orderCircleData = [
    { "x_axis": 70, "y_axis": 70, "radius": 40, "color" : statusColor(pendingOrdersCount), "value": pendingOrdersCount, "url": "/dashboard/orders#pending", "label": "Pending" },
    { "x_axis": 180, "y_axis": 70, "radius": 40, "color" : statusColor(packingOrdersCount), "value": packingOrdersCount, "url": "/dashboard/orders#packing", "label": "Packing"  },
    { "x_axis": 70, "y_axis": 180, "radius": 40, "color" : statusColor(processingOrdersCount), "value": processingOrdersCount, "url": "/dashboard/orders#processing", "label": "Processing"  },
    { "x_axis": 180, "y_axis": 180, "radius": 40, "color" : statusColor(completedOrdersCount), "value": completedOrdersCount, "url": "/dashboard/orders#completed", "label": "Completed"  }
  ]

  #create graph svg
  width = 250
  height = 250

  ###
  #  Order Aging Circle Graph
  ###
  graph = d3.select("#dashboard-order-graph").append("svg")
    .attr("width", width)
    .attr("height", height)

  # create scale
  scale = d3.scale.linear()
    .domain([0, total])
    .range([0, 2 * Math.PI])

  # create graph
  arc = d3.svg.arc().innerRadius(55).outerRadius(70).startAngle((d) ->
    scale d[0]
  ).endAngle((d) ->
    scale d[1]
  )

  #center donut graph
  graph.selectAll("path")
    .data(graphData)
    .enter()
    .append("path")
    .attr("d", arc)
    .style("fill", (d) ->
      d[2]
    ).attr "transform", "translate(125,125)"
  #  append the order count
  graph.append("text")
    .attr("x", (width / 2))
    .attr("y", (height / 2 + 22))
    .attr("text-anchor", "middle")
    .style("font-family", "sans-serif")
    .style("font-size", "60px")
    .style("font-weight", "300")
    .attr("fill", fontColor)
    .text(total)


  ###
  # Define the order state circles
  ###
  multiGraph = d3.select("#dashboard-order-multi-graph").append("svg")
    .attr("width", width)
    .attr("height", height)

  elem = multiGraph.selectAll("g circlesWithText").data(orderCircleData)

  #Create and place the "blocks" containing the circle and the text
  elemEnter = elem.enter()
    .append("g")
    .attr("class","order-multi-graph-circle")
    .attr("transform", (d) -> "translate(" + d.x_axis + "," + d.y_axis + ")")

  #Create the circle for each block
  circle = elemEnter
    .append("svg:a")
      .attr("xlink:href", (d) -> d.url)
      .attr("class", "order-multi-graph-link")
    .append("circle")
      .attr("r", (d) -> d.radius)
      .style("fill", (d) -> "white")
      .style("stroke", (d) -> d.color)
      .style("stroke-width", (d) -> "8")

  # Create the text for each block
  elemEnter
    .append("svg:a")
      .attr("xlink:href", (d) -> d.url)
      .attr("class", "order-multi-graph-link")
    .append("text")
      .attr("dy", (d) -> 7 )
      .attr("text-anchor", "middle")
      .style("font-size", "22px")
      .style("font-weight", "400")
      .attr("fill", (d) -> d.color)
      .text (d) -> d.value
  # append the order state labels
  elem
    .append("text")
    .attr("dy", 20 )
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .style("font-weight", "300")
    .attr("fill", "#696969")
    .text (d) -> d.label



Template["reactionCommerceWidget"].destroyed = ->
  # destroy graphs
