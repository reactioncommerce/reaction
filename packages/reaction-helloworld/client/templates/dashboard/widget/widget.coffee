###
Draw the little mouse speed animated graph
This just attaches a handler to the mousemove event to see
(roughly) how far the mouse has moved
and then updates the display a couple of times a second via
setTimeout()

See: http://omnipotent.net/jquery.sparkline
###
Template["reaction-helloworld-widget"].created = (e) ->
  mrefreshinterval = 300 # update display every 300ms
  lastmousex = -1
  lastmousey = -1
  lastmousetime = undefined
  mousetravel = 0
  mpoints = []
  mpoints_max = 70
  $("html").mousemove (e) ->
    mousex = e.pageX
    mousey = e.pageY
    mousetravel += Math.max(Math.abs(mousex - lastmousex), Math.abs(mousey - lastmousey))  if lastmousex > -1
    lastmousex = mousex
    lastmousey = mousey

  mdraw = ->
    md = new Date()
    timenow = md.getTime()
    if lastmousetime and lastmousetime isnt timenow
      pps = Math.round(mousetravel / (timenow - lastmousetime) * 1000)
      mpoints.push pps
      mpoints.splice 0, 1  if mpoints.length > mpoints_max
      mousetravel = 0
      $("#mousespeed-sparkline").sparkline mpoints,
        width: mpoints.length * 2
        tooltipSuffix: " pixels per second"
        html:
          width: "70px"
          height: "26px"
          lineWidth: 2
          spotRadius: 3
          lineColor: "#88bbc8"
          fillColor: "#f2f7f9"
          spotColor: "#14ae48"
          maxSpotColor: "#e72828"
          minSpotColor: "#f7941d"

    lastmousetime = timenow
    setTimeout mdraw, mrefreshinterval

  setTimeout mdraw, mrefreshinterval
