Handlebars.registerHelper('pluralize', function(n, thing) {
  // fairly stupid pluralizer
  if (n === 1) {
    return '1 ' + thing;
  } else {
    return n + ' ' + thing + 's';
  }
});

Handlebars.registerHelper('currentProjectTitle', function(current) {
      var currentProjectId = Session.get("currentProjectId");
      switch (currentProjectId) {
        case 'all':
              return "All Campaigns";
        case 'overview':
              return "Overview";
        default:
              if (!currentProjectId) {
              return "Overview";
              }
              return Projects.findOne(currentProjectId).title;
      };
});