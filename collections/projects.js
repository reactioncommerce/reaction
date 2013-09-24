Projects = new Meteor.Collection('projects');

Projects.allow({
  update: ownsDocument,
  remove: ownsDocument
});

Projects.deny({
  update: function(userId, project, fieldNames) {
    // may only edit the following two fields:
    return (_.without(fieldNames, 'url', 'title').length > 0);
  }
});

Meteor.methods({
  project: function(projectAttributes) {
    var user = Meteor.user(),
      projectWithSameLink = Projects.findOne({url: projectAttributes.url});

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to create projects");

    // ensure the project has a title
    if (!projectAttributes.title)
      throw new Meteor.Error(422, 'Please fill in a title');

    // check that there are no previous projects with the same link
    if (projectAttributes.url && projectWithSameLink) {
      throw new Meteor.Error(302,
        'This link has already created in a project.',
        projectWithSameLink._id);
    }

    // pick out the whitelisted keys
    var project = _.extend(_.pick(projectAttributes, 'url', 'title'), {
        userId: user._id,
        creator: user.username,
        submitted: new Date().getTime()
    });

    var projectId = Projects.insert(project);

    return projectId;
  }
});