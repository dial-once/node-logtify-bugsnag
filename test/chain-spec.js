const logtify = require('logtify');
const sinon = require('sinon');
const assert = require('assert');
const BugsnagLink = require('../src/index');
const BugsnagAdapter = require('../src/adapters/bugsnag');

describe('Bugsnag inside chain', () => {
  describe('Chain link', () => {
    beforeEach(() => {
      this.sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
      this.sandbox.restore();
    });

    it('should be able to insert into a chain without a conflict [no token] [switched off]', () => {
      const { chain, logger } = logtify();
      const bugsnagChainLink = new BugsnagLink.BugsnagChainLink(chain);
      assert.equal(bugsnagChainLink.notifier, undefined);
      const spy = this.sandbox.spy(bugsnagChainLink, 'handle');
      const index = chain.push(bugsnagChainLink);
      assert.equal(index, chain.chainLinks.length - 1);
      chain.link();
      logger.error('Hello world');
      assert(spy.called);
    });

    it('should be able to insert into a chain without a conflict [with token] [switched off]', () => {
      const { chain } = logtify();
      const bugsnagChainLink = new BugsnagLink.BugsnagChainLink({
        BUGS_TOKEN: '00000000-0000-0000-0000-000000000000'
      });
      assert.notEqual(bugsnagChainLink.notifier, undefined);
      const spy = this.sandbox.spy(bugsnagChainLink, 'handle');
      const index = chain.push(bugsnagChainLink);
      assert.equal(index, chain.chainLinks.length - 1);
      chain.link();
      chain.log('error', 'Hello world');
      assert(spy.called);
    });

    it('should be able to insert into a chain without a conflict [with token] [switched on]', () => {
      const { chain, logger } = logtify();
      const bugsnagChainLink = new BugsnagLink.BugsnagChainLink({
        BUGS_TOKEN: '00000000-0000-0000-0000-000000000000',
        BUGSNAG_LOGGING: true
      });
      assert.notEqual(bugsnagChainLink.notifier, undefined);
      const spy = this.sandbox.spy(bugsnagChainLink, 'handle');
      const index = chain.push(bugsnagChainLink);
      assert.equal(index, chain.chainLinks.length - 1);
      chain.link();
      logger.error('Hello world');
      assert(spy.called);
    });
    it('should be able to insert into a chain without a conflict [auto push v2] [with token] [switched on]', () => {
      const { chain } = logtify({
        chainLinks: [
          BugsnagLink({
            BUGS_TOKEN: '00000000-0000-0000-0000-000000000000',
            BUGSNAG_LOGGING: true
          })
        ]
      });
      assert.equal(chain.chainLinks.length, 2);
      const bugsnagChainLink = chain.chainEnd;
      assert.notEqual(bugsnagChainLink.notifier, undefined);
      const spy = sinon.spy(bugsnagChainLink, 'handle');
      chain.log(null, 'Hello world');
      assert(spy.called);
    });

    it('should be able to insert into a chain without a conflict [auto push v1] [with token] [switched on]', () => {
      const { chain } = logtify({
        BUGS_TOKEN: '00000000-0000-0000-0000-000000000000',
        BUGSNAG_LOGGING: true,
        chainLinks: [BugsnagLink().class]
      });
      assert.equal(chain.chainLinks.length, 2);
      const bugsnagChainLink = chain.chainEnd;
      assert.notEqual(bugsnagChainLink.notifier, undefined);
      const spy = sinon.spy(bugsnagChainLink, 'handle');
      chain.log(null, 'Hello world');
      assert(spy.called);
    });

    it('should be able to insert into a chain without a conflict [auto push v1] [with token] [switched on]', () => {
      const { chain } = logtify({
        LOGS_TOKEN: '00000000-0000-0000-0000-000000000000',
        LOGENTRIES_LOGGING: true,
        chainLinks: [BugsnagLink.BugsnagChainLink]
      });
      assert.equal(chain.chainLinks.length, 2);
      const bugsnagChainLink = chain.chainEnd;
      assert.notEqual(bugsnagChainLink, undefined);
      const spy = sinon.spy(bugsnagChainLink, 'handle');
      chain.log(null, 'Hello world');
      assert(spy.called);
    });
  });
  describe('Adapter', () => {
    it('should be exposed once added to the chain v1', () => {
      const logtifyInstance = logtify();
      assert.equal(logtifyInstance.notifier, undefined);
      logtifyInstance.chain.bindAdapter('notifier', new BugsnagAdapter(logtifyInstance.chain));
      assert.notEqual(logtifyInstance.notifier, undefined);
      assert.equal(typeof logtifyInstance.notifier.notify, 'function');
    });

    it('should be exposed once added to the chain v2', () => {
      const { notifier } = logtify({
        adapters: { notifier: BugsnagAdapter }
      });
      assert.notEqual(notifier, undefined);
      assert.equal(typeof notifier.notify, 'function');
    });
  });
});
