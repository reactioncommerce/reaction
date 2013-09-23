Router.configure({
    layout: 'layout',
    notFoundTemplate: 'notFound',
    loadingTemplate: 'loading',
    renderTemplates: {
    /* render the templated named footer to the 'footer' yield */
    'footer': { to: 'footer' },

    /* render the template named sidebar to the 'sidebar' yield */
    'header': { to: 'header' }
    }
});

Router.map(function() {
    //Header
    this.route('index', {path: '/'});
    this.route('projectsList', {
        path: '/projects',
        waitOn: function() {return Meteor.subscribe('allprojects',10);},
        data: function() { return { projects: Projects.find({}, {sort: {submitted: -1}, limit: projectHandle.limit()})};},
    });
    this.route('projects', {
        path: '/projects/:_id',
        waitOn: function() {
            Session.set("currentProjectId",this.params._id);
            return Meteor.subscribe('singleProject', this.params._id);
        },
        data: function() { return { projects: Projects.findOne(this.params._id) };}
    });
    this.route('home', {path: '/'});
    this.route('howitworks');
    this.route('pricing');
    this.route('contactus');
    this.route('dashboard');
    //Footer
    this.route('about');
    this.route('faqs');
    this.route('termsofuse');
    this.route('privacypolicy');
});