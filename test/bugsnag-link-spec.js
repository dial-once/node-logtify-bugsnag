const assert = require('assert');
const sinon = require('sinon');
const cloneError = require('utils-copy-error');
const Bugsnag = require('../src/index');
const { stream } = require('logtify')();

const { Message } = stream;
const BugsnagLink = Bugsnag.BugsnagSubscriber;

describe('Bugsnag subscriber ', () => {
  before(() => {
    delete process.env.BUGSNAG_LOGGING;
    delete process.env.MIN_LOG_LEVEL;
  });

  beforeEach(() => {
    this.sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    delete process.env.BUGSNAG_LOGGING;
    delete process.env.MIN_LOG_LEVEL;
    delete process.env.MIN_LOG_LEVEL_BUGSNAG;
    this.sandbox.restore();
  });

  it('should set notify release stages on dial-once preset', () => {
    const bugsnagLink = new BugsnagLink({ BUGS_TOKEN: '00000000-0000-0000-0000-000000000000', presets: ['dial-once'] });
    assert.deepEqual(bugsnagLink.settings.BUGSNAG_RELEASE_STAGES, ['production', 'staging']);
  });

  it('should expose main parts', () => {
    const setup = Bugsnag({ SOME_CONFIG: 'HelloWorld' });
    assert.equal(typeof setup, 'object');
    assert.equal(setup.config.SOME_CONFIG, 'HelloWorld');
    assert(setup.class);
    assert.equal(typeof setup.adapter, 'object');
    assert(setup.adapter.class);
    assert.equal(setup.adapter.name, 'notifier');
  });

  it('should not throw if no settings are given', () => {
    assert(typeof BugsnagLink, 'function');
    const bugsnag = new BugsnagLink();
    assert.equal(bugsnag.notifier, undefined);
  });

  it('should expose its main functions', () => {
    const bugsnag = new BugsnagLink({});
    assert(typeof bugsnag, 'object');
    assert.equal(typeof bugsnag.isReady, 'function');
    assert.equal(typeof bugsnag.isEnabled, 'function');
    assert.equal(typeof bugsnag.handle, 'function');
  });

  it('should print out a warning if no token provided', () => {
    const spy = this.sandbox.spy(console, 'warn');
    const bugsnag = new BugsnagLink({});
    assert(spy.calledWith('Bugsnag logging was not initialized due to a missing token'));
    assert.equal(bugsnag.notifier, undefined);
  });

  it('should initialize with a token', () => {
    const bugsnag = new BugsnagLink({ BUGS_TOKEN: '00000000-0000-0000-0000-000000000000' });
    assert.notEqual(bugsnag.notifier, undefined);
  });

  it('should return true/false if initialized/not initialized', () => {
    const bugsnag = new BugsnagLink({}, null);
    assert.equal(bugsnag.isReady(), false);
  });

  it('should indicate if it is switched on/off [settings]', () => {
    let bugsnag = new BugsnagLink({ BUGSNAG_LOGGING: true });
    assert.equal(bugsnag.isEnabled(), true);
    bugsnag = new BugsnagLink({ BUGSNAG_LOGGING: false });
    assert.equal(bugsnag.isEnabled(), false);
    bugsnag = new BugsnagLink({});
    assert.equal(bugsnag.isEnabled(), true);
  });

  it('should indicate if it is switched on/off [envs]', () => {
    const bugsnag = new BugsnagLink({});
    assert.equal(bugsnag.isEnabled(), true);
    process.env.BUGSNAG_LOGGING = true;
    assert.equal(bugsnag.isEnabled(), true);
    process.env.BUGSNAG_LOGGING = false;
    assert.equal(bugsnag.isEnabled(), false);
  });

  it('should indicate if it is switched on/off [envs should have more privilege]', () => {
    const bugsnag = new BugsnagLink({ BUGSNAG_LOGGING: true });
    assert.equal(bugsnag.isEnabled(), true);
    process.env.BUGSNAG_LOGGING = false;
    assert.equal(bugsnag.isEnabled(), false);
    process.env.BUGSNAG_LOGGING = undefined;
    assert.equal(bugsnag.isEnabled(), true);
  });

  it('should not break down if null is notified', () => {
    const bugsnag = new BugsnagLink({ BUGS_TOKEN: '00000000-0000-0000-0000-000000000000', BUGSNAG_LOGGING: true });
    bugsnag.handle(null);
  });

  it('should notify message if BUGSNAG_LOGGING = true', () => {
    const bugsnag = new BugsnagLink({ BUGS_TOKEN: '00000000-0000-0000-0000-000000000000', BUGSNAG_LOGGING: true });
    const spy = this.sandbox.spy(bugsnag.notifier, 'notify');
    const message = new Message('error', new Error('hello world'));
    bugsnag.handle(message);
    assert(spy.called);
  });

  it('should not notify message if BUGSNAG_LOGGING = false', () => {
    const bugsnag = new BugsnagLink({ BUGS_TOKEN: '00000000-0000-0000-0000-000000000000', BUGSNAG_LOGGING: false });
    const spy = this.sandbox.spy(bugsnag.notifier, 'notify');
    const message = new Message('error');
    bugsnag.handle(message);
    assert(!spy.called);
  });

  it('should not notify if message level !== error', () => {
    const bugsnag = new BugsnagLink({
      BUGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      BUGSNAG_LOGGING: true,
      MIN_LOG_LEVEL: 'error'
    });
    const spy = this.sandbox.spy(bugsnag.notifier, 'notify');
    const message = new Message();
    bugsnag.handle(message);
    assert(!spy.called);
  });

  it('should notify if message level = error', () => {
    const bugsnag = new BugsnagLink({
      BUGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      BUGSNAG_LOGGING: true
    });
    const spy = this.sandbox.spy(bugsnag.notifier, 'notify');
    const message = new Message('error');
    bugsnag.handle(message);
    assert(spy.called);
  });

  it('should be able to block notify with a message meta notify parameter', () => {
    const bugsnag = new BugsnagLink({
      BUGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      BUGSNAG_LOGGING: true
    });
    const spy = this.sandbox.spy(bugsnag.notifier, 'notify');
    const message = new Message(null, null, { notify: false });
    bugsnag.handle(message);
    assert(!spy.called);
  });

  it('should be able to notify raw error without modifications of the error object', () => {
    const bugsnag = new BugsnagLink({
      BUGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      BUGSNAG_LOGGING: true
    });

    const spy = this.sandbox.spy(bugsnag.notifier, 'notify');
    const error = new Error('Hello world');
    const message = new Message('error', error);
    bugsnag.handle(message);

    const prefix = message.getPrefix({ LOG_TIMESTAMP: true });
    let prefixText = !prefix.isEmpty ?
      `[${prefix.timestamp}${prefix.environment}${prefix.logLevel}${prefix.reqId}] ` : '';
    // if prefix contains these props, then caller module prefix was configured by settings/env
    if ({}.hasOwnProperty.call(prefix, 'module') &&
      {}.hasOwnProperty.call(prefix, 'function') &&
      {}.hasOwnProperty.call(prefix, 'project')) {
      prefixText += `[${prefix.project}${prefix.module}${prefix.function}] `;
    }
    assert.equal(error.message, 'Hello world');
    const errorClone = cloneError(error);
    errorClone.message = `${prefixText}${error.message}`;
    assert(spy.called);
    assert(spy.calledWith(errorClone));
  });

  it('should be able to notify error in metadata by default key "error" not modifying it', () => {
    const bugsnag = new BugsnagLink({
      BUGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      BUGSNAG_LOGGING: true
    });

    const spy = this.sandbox.spy(bugsnag.notifier, 'notify');
    const error = new Error('Hello world');
    const message = new Message('error', 'Hello world', { error });
    bugsnag.handle(message);

    const prefix = message.getPrefix({ LOG_TIMESTAMP: true });
    let prefixText = !prefix.isEmpty ?
      `[${prefix.timestamp}${prefix.environment}${prefix.logLevel}${prefix.reqId}] ` : '';
    // if prefix contains these props, then caller module prefix was configured by settings/env
    if ({}.hasOwnProperty.call(prefix, 'module') &&
      {}.hasOwnProperty.call(prefix, 'function') &&
      {}.hasOwnProperty.call(prefix, 'project')) {
      prefixText += `[${prefix.project}${prefix.module}${prefix.function}] `;
    }
    assert.equal(error.message, 'Hello world');
    const errorClone = cloneError(error);
    errorClone.message = `${prefixText}${error.message}`;
    assert(spy.called);
    assert(spy.calledWith(errorClone));
  });

  it('should be able to notify error in metadata by custom key without modifications of the error object', () => {
    const bugsnag = new BugsnagLink({
      BUGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      BUGSNAG_LOGGING: true
    });

    const spy = this.sandbox.spy(bugsnag.notifier, 'notify');
    const error = new Error('Hello world');
    const message = new Message('error', 'Hello world', { something: error });
    bugsnag.handle(message);

    const prefix = message.getPrefix({ LOG_TIMESTAMP: true });
    let prefixText = !prefix.isEmpty ?
      `[${prefix.timestamp}${prefix.environment}${prefix.logLevel}${prefix.reqId}] ` : '';
    // if prefix contains these props, then caller module prefix was configured by settings/env
    if ({}.hasOwnProperty.call(prefix, 'module') &&
      {}.hasOwnProperty.call(prefix, 'function') &&
      {}.hasOwnProperty.call(prefix, 'project')) {
      prefixText += `[${prefix.project}${prefix.module}${prefix.function}] `;
    }
    assert.equal(error.message, 'Hello world');
    const errorClone = cloneError(error);
    errorClone.message = `${prefixText}${error.message}`;
    assert(spy.called);
    assert(spy.calledWith(errorClone));
  });

  it('should be able to notify message', () => {
    const bugsnag = new BugsnagLink({
      BUGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      BUGSNAG_LOGGING: true,
      LOG_ENVIRONMENT: true
    });

    const spy = this.sandbox.spy(bugsnag.notifier, 'notify');
    const message = new Message('error', 'Hello world');
    bugsnag.handle(message);

    const prefix = message.getPrefix({ LOG_ENVIRONMENT: true });
    let prefixText = !prefix.isEmpty ?
      `[${prefix.timestamp}${prefix.environment}${prefix.logLevel}${prefix.reqId}] ` : '';
    // if prefix contains these props, then caller module prefix was configured by settings/env
    if ({}.hasOwnProperty.call(prefix, 'module') &&
      {}.hasOwnProperty.call(prefix, 'function') &&
      {}.hasOwnProperty.call(prefix, 'project')) {
      prefixText += `[${prefix.project}${prefix.module}${prefix.function}] `;
    }
    assert(spy.called);
    assert(spy.calledWith(`${prefixText}Hello world`));
  });
});
