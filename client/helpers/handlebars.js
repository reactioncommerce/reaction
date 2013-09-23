Handlebars.registerHelper('pluralize', function(n, thing) {
  // fairly stupid pluralizer
  if (n === 1) {
    return '1 ' + thing;
  } else {
    return n + ' ' + thing + 's';
  }
});

Handlebars.registerHelper('currentProject', function(current) {
    if (Session.get('currentProject')) {
        return Session.get('currentProject');
    } else {
        Session.set("currentProject", "Overview");
    }
    return Session.get('currentProject');

});