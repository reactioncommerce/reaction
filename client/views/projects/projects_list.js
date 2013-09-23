Template.projectsList.helpers({
  // projects: function() {
  //   return Projects.find({}, {sort: {submitted: -1}, limit: projectHandle.limit()})
  // },
  projectReady: function() {
    return ! projectHandle.loading();
  },
  allProjectsLoaded: function() {
    return ! projectHandle.loading() &&
      Projects.find().count() < projectHandle.loaded();
  }
});