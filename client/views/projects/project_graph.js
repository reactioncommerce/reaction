Template.graph.rendered = function () {
    //get list of projects for this users

    campaigns = Projects.find({},{userId:Meteor.userId});
    chartData = new Array;

    // loop through projects and get datapoints for captures
    var count = 0;
        campaigns.forEach(function (campaigns) {
            captureData = Captures.find({projectId:campaigns._id});
            console.log(campaigns._id+" : "+captureData.submitted);
            chartData[count] = {
                name: campaigns.title,
                data: [12,23,45]
            };
            count += 1;
        });

    //campaignMap = campaigns.map( function(u) { return u.title; } );

    // map captures into date/count array series
    //
    //
    $('#graphcontainer').highcharts({
            title: {
                text: 'Exit Captures',
                x: -20 //center
            },
            xAxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            yAxis: {
                title: {
                    text: 'Conversions'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                valueSuffix: '°C'
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: chartData,
        })
};
