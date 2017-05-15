const bugsnag = require('bugsnag');
/**
  @class BugsnagLink
  A Bugsnag notification chain link
  This chain link is responsible for firing a notification to the bugsnag endpoint

  Has the following configurations (either env var or settings param):
  - BUGSNAG_LOGGING {'true'|'false'} - switches on / off the use of this chain link
  @see ChainLink @class for info on the log level priorities
  If a message's level is >= than a error - it will be notified. Otherwise - skipped

  Environment variables have a higher priority over a settings object parameters
**/
class BugsnagLink {
  /**
    @constructor
    Construct an instance of a BugsnagLink @class
    @param configs {Object} - LoggerChain configuration object
  **/
  constructor(configs) {
    this.settings = configs || {};
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
    @function next
    @param message {Object} - a message package object
    Envoke the handle @function of the next chain link if provided
  **/
  next(message) {
    if (this.nextLink) {
      this.nextLink.handle(message);
    }
  }

  /**
    @function link
    Links current chain link to a next chain link
    @param nextLink {Object} - an optional next link for current chain link
  **/
  link(nextLink) {
    this.nextLink = nextLink;
  }

  /**
    @function isReady
    Check if a chain link is configured properly and is ready to be used
    @return {boolean}
  **/
  isReady() {
    return !!this.notifier;
  }

  /**
    @function isEnabled
    Check if a chain link will be used
    Depends on configuration env variables / settings object parameters
    Checks BUGSNAG_LOGGING env / settings object param
    @return {boolean} - if this chain link is switched on / off
  **/
  isEnabled() {
    return ['true', 'false'].includes(process.env.BUGSNAG_LOGGING) ?
      process.env.BUGSNAG_LOGGING === 'true' : !!this.settings.BUGSNAG_LOGGING;
  }

  /**
    @function handle
    Process a message and notify it if the chain link is switched on and message's log level is >= than MIN_LOG_LEVEL
    Finally, pass the message to the next chain link if any
    @param message {Object} - message package object
    @see LoggerChain message package object structure description

    This function is NOT ALLOWED to modify the message
    This function HAS to invoke the next() @function and pass the message further along the chain
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
    this.next(message);
  }
}

module.exports = BugsnagLink;
