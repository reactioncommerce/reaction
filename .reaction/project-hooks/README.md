This directory contains project hooks for the Reaction development environment.
They are invoked from the reaction-platform build tools which operate across all
projects to aid with orchestration.

These hooks provide means for developers of an application to ensure that the
application configure itself without higher-level coordination outside of the
project.

## Included Hooks

| Name                 | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `pre-build`          | Invoked before Docker build.                         |
| `post-build`         | Invoked after Docker build and before project start. |
| `post-project-start` | Invoked after project start.                         |
| `post-system-start`  | Invoked after entire system start.                   |

More information can be found in the header documentation of each script.

## General Best Practices

### Check that Services Are Available Before Using Them

The `post-project-start` and `post-system-start` hooks are called after the
services are started with Docker. Though they have been started, it's possible
that they will not yet be available to perform any script actions. This depends
on the startup time for you application.

This can lead to race conditions if you try to use a service in a hook script.

Always check that any service is available before using it.

Tools like [await](https://github.com/betalo-sweden/await) can help.

### Keep Hook Scripts Lightweight

It can be tempting to add code directly to the hook script to directly perform
a task.

It is better to create a script in your project and call it from the hook. This
keeps the scripted action reusable and available outside of the hook context.
