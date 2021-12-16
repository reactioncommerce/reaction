# reaction-logger

Reaction uses the [Bunyan](https://github.com/trentm/node-bunyan) logging library to provide a stream capable log handler that can send your logs to a variety of places.  By default, the Reaction logger outputs to the console (stdout), but you can also stream your server side logs to services like [Loggly](https://www.loggly.com/) (see below) or even save them to your database.

## Log Level

Most loggers have the concept of log level.  That allows you to filter what is visible in your logs (see available levels and their descriptions below).  The default levels in Reaction are `INFO` on the server and `WARN` on the client.  To override the log level on the server, you can modify `REACTION_LOG_LEVEL` environment variable.  Overriding the log level on the client requires using the `settings.json` approach - specifically in the `public` object (see below).

### Environment Variables

To set the logger name that appears at the beginning of every log line and as the `name` key in the raw JSON output, you can set...

```sh
# default: Reaction
export REACTION_LOGGER_NAME="My Custom Logger"
```

The default log level is `INFO`. You can override that with `REACTION_LOG_LEVEL` (see more about available levels below).

To set the server log level in development, you can add the environment variable before the `reaction` command when starting the app.

```sh
REACTION_LOG_LEVEL="DEBUG" reaction
```

Or export it first...

```sh
export REACTION_LOG_LEVEL="DEBUG"

reaction
```

To set it in production (assuming you're using Docker), it would look like this:

```sh
docker run -e REACTION_LOG_LEVEL="DEBUG" ...
```

### Log Levels

When doing custom development and adding more logging to the app, we suggest following the [Bunyan recommendations on log levels](https://github.com/trentm/node-bunyan#levels) and use appropriate levels for your messages.

The log levels in Bunyan are as follows. The level descriptions are best practice opinions.

- "**TRACE**" (10): Logging from external libraries used by your app or very detailed application logging.
- "**DEBUG**" (20): Anything too verbose to be included in the standard "info" level.
- "**INFO**" (30): Detail on regular operation.
- "**WARN**" (40): Detail on something that should probably be looked at by an operator eventually.
- "**ERROR**" (50): Fatal for a particular event, but the service/app continues servicing other events. An operator should look at this soon.
- "**FATAL**" (60): The service/app is going to stop or become unusable now. An operator should definitely look into this soon.

Suggestions: Use "DEBUG" sparingly. Information that will be useful to debug errors post mortem should usually be included in "info" messages if it's generally relevant or else with the corresponding "error" event. Don't rely on spewing mostly irrelevant debug messages all the time and sifting through them when an error occurs.

## Usage

```js
import Logger from "@reactioncommerce/logger";

/**
 * Logging general info
 */

// a general message string
Logger.info("Something important happened!");

// include some event-specific data in the message string
Logger.info(`Order ID ${order._id} has been submitted by user ${order.userId}`);

// or extend the JSON output of the logger with an object
// (note that the object should go before the message text)
Logger.info({ order }, "Order has been submitted");


/**
 * Logging warnings
 */

// Log a non-critical warning that should be investigated
Logger.warn("API key missing. The feature won't work.");


/**
 * Logging errors
 */

Logger.error("Something went wrong!");

// Bunyan has an error object parser built in, so you can pass
// errors into the logger and it will format them in your console
// as well as extend the raw JSON log output if you are piping
// your logs to another service like Loggly.
// (note that the error object should go before the message text)
doSomething((err, result) => {
  if (err) {
    Logger.error(err, "Something went wrong!");
    throw err;
  }
  Logger.info("That thing worked!");
  // or
  Logger.info({ result }, "That thing worked!");
});


/**
 * Logging fatal events
 */

// If an event is considered fatal (will stop the app from functioning
// entirely), you should use the FATAL log level.
// Note that this will rarely be needed.  Most negative events
// are just warnings or errors and don't entirely prevent the
// app from running.
Logger.fatal("The app is going to crash now! Attention needed!");
```

## Outputs

As mentioned above, Bunyan is capable of sending your logs to a variety of services or you can even build your own plugin to send the raw JSON output to any API you choose.  We suggest [searching npm for Bunyan](https://npms.io/search?q=bunyan) to see what options are already available before attempting to build your own.  There are already a lot to choose from.

By default, Reaction sends logs to the console, but we also support sending to [Loggly](https://www.loggly.com/).

### Loggly

Default level: `DEBUG`

#### Environment variables

```sh
# required
LOGGLY_SUBDOMAIN=""
LOGGLY_TOKEN=""

# optional
LOGGLY_LOG_LEVEL=""
```

### Developer Certificate of Origin
We use the [Developer Certificate of Origin (DCO)](https://developercertificate.org/) in lieu of a Contributor License Agreement for all contributions to Reaction Commerce open source projects. We request that contributors agree to the terms of the DCO and indicate that agreement by signing-off all commits made to Reaction Commerce projects by adding a line with your name and email address to every Git commit message contributed:
```
Signed-off-by: Jane Doe <jane.doe@example.com>
```

You can sign-off your commit automatically with Git by using `git commit -s` if you have your `user.name` and `user.email` set as part of your Git configuration.

We ask that you use your real full name (please no anonymous contributions or pseudonyms) and a real email address. By signing-off your commit you are certifying that you have the right to submit it under the [MIT License](./LICENSE). 

We use the [Probot DCO GitHub app](https://github.com/apps/dco) to check for DCO sign-offs of every commit.

If you forget to sign-off your commits, the DCO bot will remind you and give you detailed instructions for how to amend your commits to add a signature.


### License
Reaction Logger is [MIT Licensed](./LICENSE)
