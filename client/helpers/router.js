Router.configure({
    layout: 'main',
    notFoundTemplate: 'notFound',
    loadingTemplate: 'loading',
    renderTemplates: {
        'footer': { to: 'footer' },
        'header': { to: 'header' }
    }
});


Router.map(function() {
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
