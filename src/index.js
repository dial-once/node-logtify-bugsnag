const BugsnagAdapter = require('./adapters/bugsnag');
const BugsnagSubscriber = require('./bugsnag-link');
const logtify = require('logtify');

const streamBuffer = logtify.streamBuffer;
const { stream } = logtify();

/**
  @param config {object} - configuration for the subscriber and adapter
  @return {object} - subscriber config with a class
**/
module.exports = (config) => {
  const configs = Object.assign({
    BUGS_TOKEN: process.env.BUGS_TOKEN || process.env.BUGSNAG_TOKEN
  }, config);
  const subscriberData = {
    class: BugsnagSubscriber,
    config: configs,
    adapter: {
      name: 'notifier',
      class: BugsnagAdapter
    }
  };

  streamBuffer.addSubscriber(subscriberData);
  const mergedConfigs = Object.assign({}, configs, stream.settings);
  stream.subscribe(new BugsnagSubscriber(mergedConfigs));
  stream.bindAdapter('notifier', new BugsnagAdapter(stream, mergedConfigs));

  return subscriberData;
};
module.exports.BugsnagSubscriber = BugsnagSubscriber;
module.exports.BugsnagAdapter = BugsnagAdapter;
