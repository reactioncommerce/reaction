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
      if (currentProjectId) {
           return Projects.findOne(currentProjectId).title;
      } else {
          return "Overview";
      }

});