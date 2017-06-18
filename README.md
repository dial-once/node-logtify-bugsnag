# logtify-bugsnag
Bugsnag execution subscriber for [logtify](https://github.com/dial-once/node-logtify) logger

## Installation
```
npm i -S logtify-bugsnag
```

## Usage
Used with [logtify](https://github.com/dial-once/node-logtify) module.

```js
require('logtify-bugsnag')({ BUGS_TOKEN: 'YOUR_BUGSNAG_TOKEN' });
const { notifier } = require('logtify')();

notifier.notify(new Error('Test error'));
notifier.notify('Hello world!');
```

__BEWARE!!__
```js
// if required after subscriber, adapter will be undefined
let { notifier } = require('logtify')();
require('logtify-bugsnag')({ BUGS_TOKEN: 'YOUR_BUGSNAG_TOKEN' });
// notifier is undefined

// So, you need to refresh the logtify module:
let { notifier } = require('logtify')();

// typeof notifier === 'object'

notifier.notify(new Error('Test error'));
notifier.notify('Hello world!');
```

However you can overcome it if you use plain ES5 require syntax:
```js
const logtify = require('logtify')();
require('logtify-bugsnag')({ BUGS_TOKEN: 'YOUR_BUGSNAG_TOKEN' });
const notifier = logtify.notifier;

// typeof notifier === 'object'

notifier.notify(new Error('Test error'));
notifier.notify('Hello world!');
```

The subscriber will make sure that a message will be sent to Bugsnag if:
* ``message.level === 'error'``
* ``process.env.BUGSNAG_LOGGING !== 'true' || settings.BUGSNAG_LOGGING !== true``

To set the message.level to be ``error``, make sure to use one of the following:
```js
const { stream, logger } = require('logtify')();

stream.log('error', new Error('Hello world'), { my: 'metadata' }); // error can also be passed as an arg
logger.log('error', 'Hello world', { my: 'metadata' }); // or a string
logger.error('Hello world', { my: 'metadata'});
```
Or with a ``BugsnagAdapter``:
```js
const { notifier } = require('logtify')();

notifier.notify('Hello world');
```

An adapter also exposes standard bugsnag's ``requestHandler`` and ``errorHandler``:
```js
require('logtify-bugsnag')();
const { notifier } = require('logtify')();

notifier.requestHandler;
notifier.errorHandler;
```

## Configuration
* ``process.env.BUGSNAG_LOGGING = 'true' || BUGSNAG_LOGGING: true`` - Switching on / off the subscriber and adapter. On by default
* ``process.env.BUGS_TOKEN = 'TOKEN' || BUGS_TOKEN: 'TOKEN'`` - your Bugsnag token
* ``process.env.BUGSNAG_RELEASE_STAGES = 'production,staging'`` - comma separated list of bugsnag release stages
