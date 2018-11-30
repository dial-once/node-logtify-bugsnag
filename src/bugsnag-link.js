const bugsnag = require('bugsnag');
const cloneError = require('utils-copy-error');
const { stream } = require('logtify')();
/**
  @class BugsnagLink
  A Bugsnag notification stream link
  This stream link is responsible for firing a notification to the bugsnag endpoint

  Has the following configurations (either env var or settings param):
  - BUGSNAG_LOGGING {'true'|'false'} - switches on / off the use of this stream link
  - BUGSNAG_RELEASE_STAGES {string} - comma separated list of release stages
  If a message's level is >= than a error - it will be notified. Otherwise - skipped

  Environment variables have a higher priority over a settings object parameters
* */
class BugsnagLink extends stream.Subscriber {
  /**
    @constructor
    Construct an instance of a BugsnagLink @class
    @param configs {Object} - LoggerStream configuration object
  * */
  constructor(configs) {
    super();
    this.settings = configs || {};
    this.name = 'BUGSNAG';
    if (this.settings.presets && this.settings.presets.includes('dial-once')) {
      this.settings.BUGSNAG_RELEASE_STAGES = ['production', 'staging'];
    }
    if (this.settings.BUGS_TOKEN) {
      const notifyReleaseStages = process.env.BUGSNAG_RELEASE_STAGES
        ? process.env.BUGSNAG_RELEASE_STAGES.split(',') : this.settings.BUGSNAG_RELEASE_STAGES;
      bugsnag.register(this.settings.BUGS_TOKEN, {
        releaseStage: process.env.NODE_ENV || 'local',
        appVersion: process.env.BUGSNAG_APP_VERSION || this.settings.BUGSNAG_APP_VERSION || '',
        notifyReleaseStages
      });
      this.notifier = bugsnag;
    } else {
      console.warn('Bugsnag logging was not initialized due to a missing token'); // eslint-disable-line no-console
    }
  }

  /**
    @function isReady
    Check if a stream link is configured properly and is ready to be used
    @return {boolean}
  * */
  isReady() {
    return !!this.notifier;
  }

  /**
    @function isEnabled
    Check if a stream link will be used
    Depends on configuration env variables / settings object parameters
    Checks BUGSNAG_LOGGING env / settings object param
    @return {boolean} - if this stream link is switched on / off
  * */
  isEnabled() {
    const result = ['true', 'false'].includes(process.env.BUGSNAG_LOGGING)
      ? process.env.BUGSNAG_LOGGING === 'true' : this.settings.BUGSNAG_LOGGING;
    return [null, undefined].includes(result) ? true : result;
  }

  /**
    @function handle
    Process a message and notify it if the stream link is switched on and message's log level is >= than MIN_LOG_LEVEL
    Finally, pass the message to the next stream link if any
    @param message {Object} - message package object
    @see LoggerStream message package object structure description
  * */
  handle(message) {
    const shouldBeUsed = this.isEnabled();
    if (this.isReady() && shouldBeUsed && message) {
      const content = message.payload;
      // true by default, unless switched off / provided some boolean
      const notify = (typeof content.meta.notify === 'boolean') ? content.meta.notify : shouldBeUsed;
      if (content.level === 'error' && notify) {
        let { error } = content.meta;
        // if message main message is not an error
        if (!error) {
          // look for one in metadata
          for (const key of Object.keys(content.meta)) {
            if (content.meta[key] instanceof Error) {
              error = content.meta[key];
              break;
            }
          }
        }
        const prefix = message.getPrefix(this.settings);
        let prefixText = !prefix.isEmpty
          ? `[${prefix.timestamp}${prefix.environment}${prefix.logLevel}${prefix.reqId}] ` : '';
        // if prefix contains these props, then caller module prefix was configured by settings/env
        if ({}.hasOwnProperty.call(prefix, 'module')
            && {}.hasOwnProperty.call(prefix, 'function')
            && {}.hasOwnProperty.call(prefix, 'project')) {
          prefixText += `[${prefix.project}${prefix.module}${prefix.function}] `;
        }
        // if error found
        if (error) {
          error = cloneError(error);
          error.message = `${prefixText}${error.message}`;
          this.notifier.notify(error, { user: content.meta });
        } else {
          // if just some message to notify
          const messageText = `${prefixText}${content.text}`;
          this.notifier.notify(messageText, { user: content.meta });
        }
      }
    }
  }
}

module.exports = BugsnagLink;
