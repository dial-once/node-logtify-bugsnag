const BugsnagAdapter = require('./adapters/bugsnag');
const BugsnagLink = require('./bugsnag-link');
const logtify = require('logtify');

const streamBuffer = logtify.streamBuffer;
const { stream } = logtify();

/**
  @param config {object} - configuration for the stream link and adapter
  @return {object} - stream link config with a class
**/
module.exports = (config) => {
  const configs = Object.assign({
    BUGS_TOKEN: process.env.BUGS_TOKEN || process.env.BUGSNAG_TOKEN
  }, config);
  const subscriberData = {
    class: BugsnagLink,
    config: configs,
    adapter: {
      name: 'notifier',
      class: BugsnagAdapter
    }
  };

  streamBuffer.addSubscriber(subscriberData);
  const mergedConfigs = Object.assign({}, configs, stream.settings);
  stream.subscribe(new BugsnagLink(mergedConfigs));
  stream.bindAdapter('notifier', new BugsnagAdapter(stream, mergedConfigs));

  return subscriberData;
};
module.exports.BugsnagSubscriber = BugsnagLink;
module.exports.BugsnagAdapter = BugsnagAdapter;
