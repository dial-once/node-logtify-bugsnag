const assert = require('assert');
const BugsnagStreamLink = require('../bugsnag-link');

/**
  @class Bugsnag
  Adapter for the bugsnag subscriber.
  Exposes the notify function as if a standard bugsnag module was used
  @constructor consumes the instance of a LoggerStream @class
* */
class Bugsnag {
  /**
    @constructor
    Construct an instance of a bugsnag adapter
    @param stream {Object} - an instance of a @class LoggerStream
    @param settings {Object} - stream settings
  * */
  constructor(stream, settings) {
    assert(stream);
    this.settings = settings;
    this.Message = stream.Message;
    // if notify @function is called, a user probably just wants it to be notified without progressing further along the stream
    // that is why we use a seprate instance of a subscriber instead of a loggerStream.bugsnagSubscriber
    this.bugsnag = new BugsnagStreamLink(settings);
    this.requestHandler = this.bugsnag.notifier ? this.bugsnag.notifier.requestHandler : undefined;
    this.errorHandler = this.bugsnag.notifier ? this.bugsnag.notifier.errorHandler : undefined;
  }

  /**
    @function notify
    A function to fire a notify request to bugsnag api
    @param message {String|Object|Error} - an object to include into a notification
    @param metadatas {Object} - metadata to include into the notification
  * */
  notify(message, ...metadatas) {
    this.bugsnag.handle(new this.Message('error', message, ...metadatas));
  }
}

module.exports = Bugsnag;
