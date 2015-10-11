# Overview
## Style Guide
For configuration instructions on setting up Linting and other code style tools, please see: [styleguide.md](styleguide.md)

## Methods
Documentation for methods can be found in [methods.md](methods.md).

It's also a good idea to review `core/server/methods/*` and `core/common/methods/*` source for reference.

### Namespace
`ReactionCore` is exported as a global variable.

For more details take a look at [variables.md](variables.md).

### Presentation
See [themes.md](themes.md) for details on the themes and LESS implementation.

### Logging
Client and server logging.
- `ReactionCore.Log.info("This is some info")`
- `ReactionCore.Log.warn("Warn Will Robinson")`
- `ReactionCore.Log.debug("Stuff", stuffObject)`

More options and use examples at [logging.md](logging.md).

### Testing
Testing is implemented at the package and app level. We use [the Velocity Meteor testing framework](https://velocity.meteor.com) to implement end to end BDD testing with [Jasmine](http://jasmine.github.io/).

More details can be found in [testing.md](testing.md).

## Issues
For development tasks/issues please use the [Reaction project issues](https://github.com/reactioncommerce/reaction/issues?state=open). We're keeping this as the central issue tracking for all [reactioncommerce:*](https://github.com/reactioncommerce/) packages. You can also view issues on our [waffle board](https://waffle.io/reactioncommerce/reaction).

The default branch for reaction, reaction-core, reaction-core-theme is _development_. Pull requests made into the _development_ branch, will be reviewed and accepted into development for a quick release, while we work on specific feature branches separately, to be merged into _development_.

We're trying to practice the art of liberally creating issues for every development task, rather than just 'community' bugs. This can be much noisier but we're trying to ensure we're publicly capturing and sharing all the tasks so everyone can have detailed insight into the project progress.

The [help wanted](https://github.com/reactioncommerce/reaction/labels/help%20wanted) label calls out issues that prioritize where community member contributions would be relatively easy. Of course, all contributions are welcome.

The [ready](https://github.com/reactioncommerce/reaction/labels/ready) label groups issues that can be worked on immediately; requirements documentation should be complete (work to do on this). If you want to take ownership of one these [![Stories in Ready](https://badge.waffle.io/reactioncommerce/reaction.svg?label=ready&title=Ready)](https://waffle.io/reactioncommerce/reaction) issues, self assign it and change to "in progress" label when the item is actually being worked on, or comment in the issue.

Of course, [in progress](https://github.com/reactioncommerce/reaction/labels/in%20progress) labels are actively being worked on.

## Releases
We will publish packages, and merge `development` into `master`, whenever a major feature set becomes test-able.

No pull requests to `master` will be accepted.

`master` should always be a stable branch, but with a rapid merge cycle from `development`.  The [release](https://github.com/reactioncommerce/reaction/releases) and published packages will be tagged for minor release or higher, and sometimes for special case patches.

## Pull Requests
**Caution: your own research may be needed here, feedback is appreciated!**

Please make sure your pull requests are to the active `development` branch, no pull requests to `master` will be accepted. When you create a pull request, you can click the 'edit' button to change the "to" branch.

Please cleanup your PR into as few commits as possible (single is good).

In your branch:

```bash
git rebase -i origin/development
```

In the editor that opens, replace the words "pick" with "squash" next to the commits you want to squash into the commit before it(so all but the first one, for a single commit). Save and close the editor, and another editor instance will open the combined commit messages, tidy them up and save and close the editor.

If you need to edit the commit message later you can use

```bash
 git commit --amend
```

You can now `push` your branch to GitHub. If you've already published this branch, you should create a new branch, or use `--force` (rewrites history)

```bash
git push --force
```

Finally, [create a pull request](https://help.github.com/articles/creating-a-pull-request/) into the `development` branch of the appropriate reaction package.
