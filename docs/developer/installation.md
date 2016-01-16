# Installation
## Prerequisites
**Prerequisites**
- Npm and [Node.js](https://nodejs.org/)
- _`ImageMagick` - Optional but suggested_
- _For [windows installation](https://github.com/reactioncommerce/reaction/issues/363) you also need:_
  - Win32 OpenSSL
  - Visual Studio 2008 redistributables
  - Git / mysgit

## Developer Install

```bash
curl https://install.meteor.com | /bin/sh
git clone https://github.com/reactioncommerce/reaction.git
cd reaction
./reaction pull
./reaction
```

The `master` branch will ensure your initial installation is the latest published release, and also should work with current packages from the [Meteor package manager](https://atmospherejs.com/).

However, the most recent code is in `development`, which is the recommended default branch if you are a developer.

When using the `master` branch for with development packages and versions of published packages (versus local packages), you may get some package compatibility warnings. You can use `meteor --allow-incompatible-update` to resolve this.

See the [package development documentation](https://github.com/reactioncommerce/reaction/blob/master/docs/developer/packages.md) for details on working with the `development` branch, and using local package dependencies. You can clone or create new packages in `reaction/packages` for local package development.

### reaction run
To start Reaction, run the `reaction` command

```
reaction
```

This command runs a script that executes `meteor`. You can use any [Meteor command line option](http://docs.meteor.com/#/full/meteorhelp). ![](https://raw.github.com/reactioncommerce/reaction/development/docs/assets/guide-installation-default-user.png)

_The initial admin user for the site is auto generated, and displayed in your console (or see: env variables section to default these)_

Browse to [http://localhost:3000](https://localhost:3000) and you should see Reaction running (sample data same as on demo site)

### reaction reset
To reset the Reaction database, and optionally clear development packages. This will give you a fresh test dataset from `reactioncommerce:reaction-sample-data`.

```
reaction reset
```

See the [package development documentation](https://github.com/reactioncommerce/reaction/blob/master/docs/developer/packages.md)  and the [settings and fixture data documentation](https://github.com/reactioncommerce/reaction/blob/master/docs/developer/fixtures.md) for detailed instructions on modifying initial fixture data.

### reaction pull

```bash
reaction pull
```

You can just use `git pull`, but `reaction pull` will run a script that pulls all local packages as well as Reaction. It's the easiest way to make sure you're working with the complete developer package set.

```bash
cd reaction
reaction pull
reaction
```

You can also use `meteor upgrade` to upgrade to the latest Atmosphere published packages.

_Note: currently there is not any data schema compatibility tests between releases, which is why we use `meteor reset` in this example. It's not necessary if you want to preserve your data, but there could be compatibility issues with the upgrade._

## Settings
Copy the optional `settings/dev.settings.json` to `<your-settings>.json` and run:

```
 meteor --settings settings/<your-settings>.json
```

**_settings/dev.settings.json_**

```
{
  "ROOT_URL": "",
  "MONGO_URL": "",
  "MAIL_URL": "",
  "reaction": {
    "REACTION_USER": "<username>",
    "REACTION_AUTH": "<password>",
    "REACTION_EMAIL": "<login email>"
  },
  "isDebug": "info"
}
```

You can provide a custom settings `/settings/settings.json` file. Creating this file will prevent the default `dev.settings.json` from being loaded.

> Reaction also uses private/data/reaction.json for loading additional Reaction Package settings.

> See [settings and fixture data documentation](https://github.com/reactioncommerce/reaction/blob/master/docs/developer/deploying.md).

# Troubleshooting
**HTTPS Redirect**

You can use `meteor remove force-ssl` to remove redirection to the `https` protocol.  To restore, `meteor add force-ssl`.  When developing locally, you should not have to remove https as Meteor internally redirects all `localhost` requests to the `http` protocol. However, if you are running on a VM, or using Vagrant, you should run `meteor remove force-ssl` and remove this package.

**Failed to load c++ Json message**

You can ignore this error, but if it annoys you can run `xcode-select --install` (on a mac) or `sudo apt-get install gcc make build-essential` (on ubuntu)

**env: node: No such file or directory**

Caused by a broken node, npm installation. Reinstall Node.js with NPM (or when packaged separately, reinstall them both).

**windows OpenSSL errors prevent startup**

Install OpenSSL per: [https://github.com/meteor/meteor/blob/devel/packages/non-core/npm-node-aes-gcm/README.md](https://github.com/meteor/meteor/blob/devel/packages/non-core/npm-node-aes-gcm/README.md)

**windows bower install errors**

We use bower to install some core dependencies. To use Bower on Windows, you must install msysgit. See: [https://github.com/bower/bower/tree/master#windows-users](https://github.com/bower/bower/tree/master#windows-users)
