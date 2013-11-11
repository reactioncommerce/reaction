Template.graph.rendered = function () {
    // Get data from campaigns and countstats collections
    var campaigns = Campaigns.find({}, {userId: Meteor.userId});
    var chartData = [];
    var seriesData = [];
    var count = 0;

    // loop through campaigns and get datapoints for captures
    campaigns.forEach(function (campaigns) {
        seriesData = [];

        Session.set('statsCampaignId', campaigns._id);
        var statsData = CountStats.find({campaignId: campaigns._id});
        var statRow = 0;

        //console.log(campaigns._id+": "+statsData.count());
        statsData.forEach(function (stats) {
            var myDate = new Date(stats.submitted);
            var captureDate = Date.UTC(myDate.getFullYear(), (myDate.getMonth() + 1), myDate.getDate());
            //TODO: Add 0 for empty dates, if necessary for plotting
            seriesData[statRow] = [captureDate, stats.count];
            //console.log("date: "+captureDate);
            statRow += 1;
        });

        chartData[count] = {
            name: campaigns.title,
            data: seriesData
        };

        count += 1;
    });

    // Create and display graph
    $('#graphcontainer').highcharts({
        title: {
            text: 'Captures',
            x: -20 //center
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Conversions'
            },
            plotLines: [
                {
                    value: 0,
                    width: 1,
                    color: '#808080'
                }
            ]
        },
        tooltip: {
            valueSuffix: ' Submissions'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 1
        },
        series: chartData
    });
};
