## reaction-analytics-libs
This package does nothing more than providing server side access to analytics libraries.
Technique for getting around meteor build plugin static asset limitation borrowed from [Nemo64/meteor-bootstrap-data](https://github.com/Nemo64/meteor-bootstrap-data)

This package is a dependency for reaction-analytics.

The reason this package exists is to provide a workaround for the limitation, that meteor does not allow static assets to be accessed in a build plugin. It is however allowed to 'use' other packages in a plugin and this other package can than provide static assets (which is what this package does).
