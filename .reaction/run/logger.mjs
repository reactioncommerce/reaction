import chalk from 'chalk';

/* eslint-disable no-console */

const loggers = {
  info(msg) {
    console.log(chalk.blue(`${msg}`));
  },
  success(msg) {
    console.log(chalk.green(`${msg}`));
  },
  warn(msg) {
    console.log(chalk.yellow(`${msg}`));
  },
  error(msg) {
    console.log(chalk.bold.red(`${msg}`));
  },
  debug(msg) {
    if (process.env.REACTION_CLI_DEBUG === 'true') {
      console.log(chalk.yellow('[DEBUG]:'), msg);
    }
  },
  args(args) {
    if (process.env.REACTION_CLI_DEBUG === 'true') {
      console.log(chalk.yellow('\n[Reaction CLI Debug]\n\n'), args, '\n');
    }
  },
  default(msg) {
    console.log(msg);
  }
};

// extend chalk with custom log methods
export default Object.assign(chalk, loggers);
