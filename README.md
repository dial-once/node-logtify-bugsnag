# logtify-bugsnag
[![Sonar](http://proxy.dialonce.net/sonar/api/badges/gate?key=node-logtify-bugsnag)](http://sonar.dialonce.net/dashboard?id=node-logtify-bugsnag)
[![Sonar](http://proxy.dialonce.net/sonar/api/badges/measure?key=node-logtify-bugsnag&metric=ncloc)](http://sonar.dialonce.net/dashboard?id=node-logtify-bugsnag)
[![Sonar](http://proxy.dialonce.net/sonar/api/badges/measure?key=node-logtify-bugsnag&metric=coverage)](http://sonar.dialonce.net/dashboard?id=node-logtify-bugsnag)
[![Sonar](http://proxy.dialonce.net/sonar/api/badges/measure?key=node-logtify-bugsnag&metric=code_smells)](http://proxy.dialonce.net/sonar/api/badges/measure?key=node-logtify-bugsnag&metric=coverage)
[![Sonar](http://proxy.dialonce.net/sonar/api/badges/measure?key=node-logtify-bugsnag&metric=bugs)](http://sonar.dialonce.net/dashboard?id=node-logtify-bugsnag)
[![Sonar](http://proxy.dialonce.net/sonar/api/badges/measure?key=node-logtify-bugsnag&metric=sqale_debt_ratio)](http://sonar.dialonce.net/dashboard?id=node-logtify-bugsnag)

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
* ``process.env.BUGSNAG_LOGGING === 'true' || settings.BUGSNAG_LOGGING === true``

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

**Settings**:
Module can be configured by both env variables or config object. However, env variables have a higher priority.
```js
{
  BUGSNAG_LOGGING: true|false
  BUGS_TOKEN: 'YOUR_BUGSNAG_TOKEN'
  BUGSNAG_RELEASE_STAGES: ''
  BUGSNAG_APP_VERSION: '1.2.3'
  LOG_TIMESTAMP = 'true'
  LOG_ENVIRONMENT = 'true'
  LOG_LEVEL = 'true'
  LOG_REQID = 'true' // only included when provided with metadata
  LOG_CALLER_PREFIX = 'true' // additional prefix with info about caller module/project/function
}
```
