const BugsnagAdapter = require('./adapters/bugsnag');
const BugsnagLink = require('./bugsnag-link');

/**
  @param config {object} - configuration for the chain link and adapter
  @return {object} - chain link config with a class
**/
module.exports = (config) => {
  const configs = Object.assign({
    BUGS_TOKEN: process.env.BUGS_TOKEN || process.env.BUGSNAG_TOKEN
  }, config);
  return {
    class: BugsnagLink,
    config: configs,
    adapter: {
      name: 'notifier',
      class: BugsnagAdapter
    }
  };
};
module.exports.BugsnagChainLink = BugsnagLink;
module.exports.BugsnagAdapter = BugsnagAdapter;
