/**
** Draw the little mouse speed animated graph
** This just attaches a handler to the mousemove event to see
** (roughly) how far the mouse has moved
** and then updates the display a couple of times a second via
** setTimeout()
**
** See: http://omnipotent.net/jquery.sparkline
**/
Template['reaction-helloworld-widget'].created = function () {
    var mrefreshinterval = 300; // update display every 300ms
    var lastmousex=-1;
    var lastmousey=-1;
    var lastmousetime;
    var mousetravel = 0;
    var mpoints = [];
    var mpoints_max = 70;
    $('html').mousemove(function(e) {
        var mousex = e.pageX;
        var mousey = e.pageY;
        if (lastmousex > -1) {
            mousetravel += Math.max( Math.abs(mousex-lastmousex), Math.abs(mousey-lastmousey) );
        }
        lastmousex = mousex;
        lastmousey = mousey;
    });
    var mdraw = function() {
        var md = new Date();
        var timenow = md.getTime();
        if (lastmousetime && lastmousetime!=timenow) {
            var pps = Math.round(mousetravel / (timenow - lastmousetime) * 1000);
            mpoints.push(pps);
            if (mpoints.length > mpoints_max)
                mpoints.splice(0,1);
            mousetravel = 0;
            $('#mousespeed-sparkline').sparkline(mpoints, { width: mpoints.length*2,
                             tooltipSuffix: ' pixels per second',
                             html:
                                    {
                                        width: '70px',
                                        height: '26px',
                                        lineWidth: 2,
                                        spotRadius: 3,
                                        lineColor: '#88bbc8',
                                        fillColor: '#f2f7f9',
                                        spotColor: '#14ae48',
                                        maxSpotColor: '#e72828',
                                        minSpotColor: '#f7941d'
                                    }
                             });
        }
        lastmousetime = timenow;
        setTimeout(mdraw, mrefreshinterval);
    }
    setTimeout(mdraw, mrefreshinterval);
};