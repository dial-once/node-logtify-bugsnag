const bugsnag = require('bugsnag');
const { stream } = require('logtify')();
/**
  @class BugsnagLink
  A Bugsnag notification subscriber
  This subscriber is responsible for firing a notification to the bugsnag endpoint

  Has the following configurations (either env var or settings param):
  - BUGSNAG_LOGGING {'true'|'false'} - switches on / off the use of this subscriber
  - BUGSNAG_RELEASE_STAGES {string} - comma separated list of release stages
  If a message's level is >= than a error - it will be notified. Otherwise - skipped

  Environment variables have a higher priority over a settings object parameters
**/
class BugsnagSubscriber extends stream.Subscriber {
  /**
    @constructor
    Construct an instance of a BugsnagLink @class
    @param configs {Object} - LoggerStream configuration object
  **/
  constructor(configs) {
    super();
    this.settings = configs || {};
    this.name = 'BUGSNAG';
    if (this.settings.BUGS_TOKEN) {
      const notifyReleaseStages = process.env.BUGSNAG_RELEASE_STAGES ?
      process.env.BUGSNAG_RELEASE_STAGES.split(',') : this.settings.BUGSNAG_RELEASE_STAGES;
      bugsnag.register(this.settings.BUGS_TOKEN, {
        releaseStage: process.env.NODE_ENV || 'local',
        notifyReleaseStages
      });
      this.notifier = bugsnag;
    } else {
      console.warn('Bugsnag logging was not initialized due to a missing token');
    }
  }

  /**
    @function isReady
    Check if a subscriber is configured properly and is ready to be used
    @return {boolean}
  **/
  isReady() {
    return !!this.notifier;
  }

  /**
    @function isEnabled
    Check if a subscriber will be used
    Depends on configuration env variables / settings object parameters
    Checks BUGSNAG_LOGGING env / settings object param
    @return {boolean} - if this subscriber is switched on / off
  **/
  isEnabled() {
    const result = ['true', 'false'].includes(process.env.BUGSNAG_LOGGING) ?
      process.env.BUGSNAG_LOGGING === 'true' : this.settings.BUGSNAG_LOGGING;
    return [null, undefined].includes(result) ? true : result;
  }

  /**
    @function handle
    Process a message and notify it if the subscriber is switched on and message's log level is >= than MIN_LOG_LEVEL
    Finally, pass the message to the next subscriber if any
    @param message {Object} - message package object
    @see LoggerStream message package object structure description
  **/
  handle(message) {
    const shouldBeUsed = this.isEnabled();
    if (this.isReady() && shouldBeUsed && message) {
      const content = message.payload;
      const notify = (typeof content.meta.notify === 'boolean') ? content.meta.notify : shouldBeUsed;
      if (content.level === 'error' && notify) {
        if (content.meta.stack !== undefined) {
          const error = new Error(content.text);
          error.stack = content.meta.stack;
          this.notifier.notify(error, { user: content.meta });
        } else {
          this.notifier.notify(content.text, { user: content.meta });
        }
      }
    }
  }
}

module.exports = BugsnagSubscriber;
