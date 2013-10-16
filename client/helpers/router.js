Router.configure({
    layoutTemplate: 'dashboardLayout',
    notFoundTemplate: 'notFound',
    loadingTemplate: 'loading'
});


Router.map(function() {
    this.route('index', {
        path: '/',
        layoutTemplate:'introLayout',
        before: function() {
            if(!Meteor.loggingIn() && Meteor.user() && Meteor.user().profile.store ){
                this.redirect('dashboard');
            }
        }
    });

    this.route('dashboard');

    this.route('howitworks',{layoutTemplate:'introLayout'});
    this.route('pricing',{layoutTemplate:'introLayout'});
    this.route('contactus',{layoutTemplate:'introLayout'});
    //Footer
    this.route('about',{layoutTemplate:'introLayout'});
    this.route('faqs',{layoutTemplate:'introLayout'});
    this.route('termsofuse',{layoutTemplate:'introLayout'});
    this.route('privacypolicy',{layoutTemplate:'introLayout'});

    this.route('notFound', {
        path: '*',
        layoutTemplate:'introLayout'
    });


});
