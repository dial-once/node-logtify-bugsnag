# logtify-bugsnag
Bugsnag execution chain link for [logtify](https://github.com/dial-once/node-logtify) logger

## Installation
```
npm i -S @dialonce/logtify-bugsnag
```

## Usage
When requiring a [logtify](https://github.com/dial-once/node-logtify) module, include it's chainLink into the chain and it's adapter if needed.

**Variant 1** (Auto adapter initialization): 
```js
const { BugsnagAdapter, BugsnagChainLink } = require('@dialonce/logtify-bugsnag');
const { notifier } = require('@dialonce/logtify')({
  BUGS_TOKEN: 'YOUR_BUGSNAG_TOKEN',
  chainLinks: [ BugsnagChainLink ]
});
```

**Variant 2** (Settings passed as global logger settings, ability to change notifier label:): 
```js
const { BugsnagAdapter, BugsnagChainLink } = require('@dialonce/logtify-bugsnag');
const { myNotifier } = require('@dialonce/logtify')({
  BUGS_TOKEN: 'YOUR_BUGSNAG_TOKEN',
  chainLinks: [ BugsnagChainLink ],
  adapters: { myNotifier: BugsnagAdapter }
});
```

**Variant 3** (Settings passed into a chain link wrapper):
```js
const bugsnag = require('@dialonce/logtify-bugsnag');
const { notifier } = require('@dialonce/logtify')({
  chainLinks: [ bugsnag({ BUGS_TOKEN: 'YOUR_BUGSNAG_TOKEN' })],
  adapters: { notifier: bugsnag.BugsnagAdapter }
});

notifier.notify(new Error('Test error'));
notifier.notify('Hello world!');
```
The chainLink will make sure that a message will be sent to Bugsnag if:
* ``message.level === 'error'``
* ``process.env.BUGSNAG_LOGGING === 'true' || settings.BUGSNAG_LOGGING === true``

To set the message.level to be ``error``, make sure to use one of the following:
```js
const { chain, logger } = require('@dialonce/logtify')();

chain.log('error', new Error('Hello world'), { my: 'metadata' }); // error can also be passed as an arg
logger.log('error', 'Hello world', { my: 'metadata' }); // or a string
logger.error('Hello world', { my: 'metadata'});
```
Or if also incuded a ``BugsnagAdapter``:
```js
const { notifier } = require('@dialonce/logtify')();

notifier.notify('Hello world');
```

An adapter also exposes standard bugsnag's ``requestHandler`` and ``errorHandler``:
```js
const { BugsnagAdapter } = require('@dialonce/logtify-bugsnag');
const { notifier} = require('@dialonce/logtify')({
  adapters: { notifier: BugsnagAdapter }
});

notifier.requestHandler;
notifier.errorHandler;
```

## Configuration
* ``process.env.BUGSNAG_LOGGING = 'true' || BUGSNAG_LOGGING: true`` - Switching on / off the chain link and adapter
* ``process.env.BUGS_TOKEN = 'TOKEN' || BUGS_TOKEN: 'TOKEN'`` - your Bugsnag token
