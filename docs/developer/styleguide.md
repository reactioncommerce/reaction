# Style Guide
_A work in progress, but this is good guide to start._

Read [Meteor Style Guide](https://github.com/meteor/meteor/wiki/Meteor-Style-Guide) for ideas on format and style of contributions.

## Linters
**Installation & Usage**

We've been developing a lot lately using the Atom editor, here's how we setup ESLinting with Atom:

```
npm i -g eslint babel-eslint
apm install linter linter-eslint
```

Add your global node path, and use the global ESLint installation in the Atom package settings.

For more information, and for instructions with other editors, please the excellent [Meteor blog post on configuring up ES6 linting](https://info.meteor.com/blog/set-up-sublime-text-for-meteor-es6-es2015-and-jsx-syntax-and-linting).

In the Reaction app root, we have Reaction specific configuration files.  
- .eslintrc - [http://eslint.org/](https://eslint.org/)
- .jsbeautifyrc - [http://jsbeautifier.org/](https://jsbeautifier.org/)
- .editorconfig - [http://editorconfig.org/](https://editorconfig.org/)

You can copy these into each new package you develop, and this will enforce Reaction stylistic choices.
