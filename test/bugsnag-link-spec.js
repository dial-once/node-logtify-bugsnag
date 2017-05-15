const assert = require('assert');
const sinon = require('sinon');
const { chain } = require('logtify')();
const BugsnagLink = require('../src/index').BugsnagChainLink;

describe('Bugsnag chain link ', () => {
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

  it('should not throw if no settings are given', () => {
    assert(typeof BugsnagLink, 'function');
    const bugsnag = new BugsnagLink();
    assert.equal(bugsnag.notifier, undefined);
  });

  it('should expose its main functions', () => {
    const bugsnag = new BugsnagLink({});
    assert(typeof bugsnag, 'object');
    assert.equal(typeof bugsnag.next, 'function');
    assert.equal(typeof bugsnag.link, 'function');
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
    assert.equal(bugsnag.isEnabled(), false);
  });

  it('should indicate if it is switched on/off [envs]', () => {
    const bugsnag = new BugsnagLink({});
    assert.equal(bugsnag.isEnabled(), false);
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
    const message = new chain.Message('error', new Error('hello world'));
    bugsnag.handle(message);
    assert(spy.called);
  });

  it('should not notify message if BUGSNAG_LOGGING = false', () => {
    const bugsnag = new BugsnagLink({ BUGS_TOKEN: '00000000-0000-0000-0000-000000000000', BUGSNAG_LOGGING: false });
    const spy = this.sandbox.spy(bugsnag.notifier, 'notify');
    const message = new chain.Message('error');
    bugsnag.handle(message);
    assert(!spy.called);
  });

  it('should not notify if message level !== error', () => {
    const bugsnag = new BugsnagLink({
      BUGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      BUGSNAG_LOGGING: true,
      MIN_LOG_LEVEL: 'error'
    });
    const spy = this.sandbox.spy(bugsnag.notifier.notify);
    bugsnag.notifier.notify = spy;
    const message = new chain.Message();
    bugsnag.handle(message);
    assert(!spy.called);
  });

  it('should notify if message level = error', () => {
    const bugsnag = new BugsnagLink({
      BUGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      BUGSNAG_LOGGING: true
    });
    const spy = this.sandbox.spy(bugsnag.notifier.notify);
    bugsnag.notifier.notify = spy;
    const message = new chain.Message('error');
    bugsnag.handle(message);
    assert(spy.called);
  });

  it('should be able to block notify with a message meta notify parameter', () => {
    const bugsnag = new BugsnagLink({
      BUGS_TOKEN: '00000000-0000-0000-0000-000000000000',
      BUGSNAG_LOGGING: true
    });
    const spy = this.sandbox.spy(bugsnag.notifier.notify);
    bugsnag.notifier.notify = spy;
    const message = new chain.Message(null, null, { notify: false });
    bugsnag.handle(message);
    assert(!spy.called);
  });

  it('should not throw if next link does not exist', () => {
    const bugsnag = new BugsnagLink();
    bugsnag.next();
  });

  it('should link a new chainLink', () => {
    const bugsnag = new BugsnagLink();
    const spy = sinon.spy(sinon.stub());
    const mock = { handle: spy };
    assert.equal(bugsnag.nextLink, null);
    bugsnag.link(mock);
    assert.equal(typeof bugsnag.nextLink, 'object');
    bugsnag.next();
    assert(spy.called);
  });
});
