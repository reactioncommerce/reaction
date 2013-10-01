Template.graph.rendered = function () {
// Get data from campaigns and countstats collections
    var campaigns = Projects.find({},{userId:Meteor.userId});
    var chartData = new Array;
    var seriesData = new Array();
    var count = 0;
    // loop through projects and get datapoints for captures

        campaigns.forEach(function (campaigns) {
            seriesData = [];

            //console.log("*********************************"+campaigns._id);
            Session.set('statsProjectId',campaigns._id);
            var statsData = CountStats.find({projectId:campaigns._id});
            var statRow = 0;

            statsData.forEach(function(stats){
                var myDate = new Date(stats.submitted);
                var captureDate = Date.UTC(myDate.getFullYear(),(myDate.getMonth()+1),myDate.getDate());
                //TODO: Add 0 for empty dates, if necessary for plotting
                seriesData[statRow] = [captureDate,stats.count];
                //console.log("date: "+captureDate);
                statRow +=1;
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
               type: 'datetime',
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
                valueSuffix: ' Submissions'
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 1
            },
            series: chartData,
        })
};
