Router.configure({
    layout: 'layout',
    notFoundTemplate: 'notFound',
    loadingTemplate: 'loading',
    renderTemplates: {
        'header': { to: 'header' },
        'footer': { to: 'footer '}
    }
});


Router.map(function() {
    this.route('index', {path: '/'});
    this.route('howitworks');
    this.route('pricing');
    this.route('contactus');
    this.route('dashboard');
    //Footer
    this.route('about');
    this.route('faqs');
    this.route('termsofuse');
    this.route('privacypolicy');
    // this.route('greetramp',{
    //     renderTemplates: {
    //         'greetramp': {to: 'main' }
    //     }
    // });
});
