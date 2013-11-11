themeSparkline = function () {
  //--------------------------- Sparkline --------------------------------//
  if (jQuery().sparkline) {
    $('.inline-sparkline').sparkline(
      'html',
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
    );
  }
}
