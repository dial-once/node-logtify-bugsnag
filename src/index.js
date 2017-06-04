const BugsnagAdapter = require('./adapters/bugsnag');
const BugsnagLink = require('./bugsnag-link');
const logtify = require('logtify');

const chainBuffer = logtify.chainBuffer;
const { chain } = logtify();

/**
  @param config {object} - configuration for the chain link and adapter
  @return {object} - chain link config with a class
**/
module.exports = (config) => {
  const configs = Object.assign({
    BUGS_TOKEN: process.env.BUGS_TOKEN || process.env.BUGSNAG_TOKEN
  }, config);
  const chainLinkData = {
    class: BugsnagLink,
    config: configs,
    adapter: {
      name: 'notifier',
      class: BugsnagAdapter
    }
  };

  chainBuffer.addChainLink(chainLinkData);
  const mergedConfigs = Object.assign({}, configs, chain.settings);
  chain.push(new BugsnagLink(mergedConfigs));
  chain.bindAdapter('notifier', new BugsnagAdapter(chain, mergedConfigs));

  return chainLinkData;
};
module.exports.BugsnagChainLink = BugsnagLink;
module.exports.BugsnagAdapter = BugsnagAdapter;
