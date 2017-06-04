const Bugsnag = require('../../src/adapters/bugsnag');
const sinon = require('sinon');
const assert = require('assert');
const { chain } = require('logtify')();

describe('Bugsnag adapter ', () => {
  it('should be initialized', () => {
    const notifier = new Bugsnag(chain, { BUGS_TOKEN: '00000000-0000-0000-0000-000000000000' });
    assert.equal(typeof notifier, 'object');
    assert(notifier.settings);
    assert(notifier.bugsnag);
    assert(notifier.notify);
    assert.equal(typeof notifier.requestHandler, 'function');
    assert.equal(typeof notifier.errorHandler, 'function');
  });

  it('should be initialized', () => {
    const notifier = new Bugsnag(chain, {});
    assert.equal(typeof notifier, 'object');
    assert(notifier.settings);
    assert(notifier.bugsnag);
    assert(notifier.notify);
    assert.equal(notifier.requestHandler, undefined);
    assert.equal(notifier.errorHandler, undefined);
  });

  it('should not break down when null is notified', () => {
    const notifier = new Bugsnag(chain, { BUGS_TOKEN: '00000000-0000-0000-0000-000000000000' });
    const spy = sinon.spy(notifier, 'notify');
    notifier.notify(null);
    assert(spy.called);
  });
});
