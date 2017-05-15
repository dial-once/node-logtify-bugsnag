const assert = require('assert');
const BugsnagChainLink = require('../bugsnag-link');

/**
  @class Bugsnag
  Adapter for the bugsnag chain link.
  Exposes the notify function as if a standard bugsnag module was used
  @constructor consumes the instance of a LoggerChain @class
**/
class Bugsnag {
  /**
    @constructor
    Construct an instance of a bugsnag adapter
    @param chain {Object} - an instance of a @class LoggerChain
    @param settings {Object} - chain settings
  **/
  constructor(chain, settings) {
    assert(chain);
    this.settings = settings;
    this.Message = chain.Message;
    // if notify @function is called, a user probably just wants it to be notified without progressing further along the chain
    // that is why we use a seprate instance of a chain link instead of a loggerChain.bugsnagChailLink
    this.bugsnag = new BugsnagChainLink(settings);
    this.requestHandler = this.bugsnag.notifier ? this.bugsnag.notifier.requestHandler : undefined;
  }

  /**
    @function notify
    A function to fire a notify request to bugsnag api
    @param message {String|Object|Error} - an object to include into a notification
    @param args {Object} - metadata to include into the notification
  **/
  notify(message, ...metadata) {
    this.bugsnag.handle(new this.Message('error', message, ...metadata));
  }
}

module.exports = Bugsnag;
