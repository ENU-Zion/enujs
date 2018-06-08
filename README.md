# Enujs

General purpose library for the ENU blockchain.

### Usage (read-only)

```javascript
Enu = require('enujs') // Enu = require('./src')

enu = Enu() // 127.0.0.1:8888

// All API methods print help when called with no-arguments.
enu.getBlock()

// Next, your going to need enunoded running on localhost:8888 (see ./docker)

// If a callback is not provided, a Promise is returned
enu.getBlock(1).then(result => {console.log(result)})

// Parameters can be sequential or an object
enu.getBlock({block_num_or_id: 1}).then(result => console.log(result))

// Callbacks are similar
callback = (err, res) => {err ? console.error(err) : console.log(res)}
enu.getBlock(1, callback)
enu.getBlock({block_num_or_id: 1}, callback)

// Provide an empty object or a callback if an API call has no arguments
enu.getInfo({}).then(result => {console.log(result)})
```

API methods and documentation are generated from:
* [chain.json](https://github.com/enumivo/enujs-api/blob/master/src/api/v1/chain.json)
* [history.json](https://github.com/enumivo/enujs-api/blob/master/src/api/v1/history.json)

### Configuration

```js
Enu = require('enujs') // Enu = require('./src')

// Optional configuration..
config = {
  chainId: null, // 32 byte (64 char) hex string
  keyProvider: ['PrivateKeys...'], // WIF string or array of keys..
  httpEndpoint: 'http://127.0.0.1:8888',
  mockTransactions: () => 'pass', // or 'fail'
  transactionHeaders: (expireInSeconds, callback) => {
    callback(null/*error*/, headers)
  },
  expireInSeconds: 60,
  broadcast: true,
  debug: false, // API and transactions
  sign: true
}

enu = Enu(config)
```

* **chainId** - Unique ID for the blockchain your connecting too.  This is
  required for valid transaction signing.  The chainId is provided via the
  [get_info](http://ayeaye.cypherglass.com:8888/v1/chain/get_info) API call.

* `mockTransactions` (optional)
  * `pass` - do not broadcast, always pretend that the transaction worked
  * `fail` - do not broadcast, pretend the transaction failed
  * `null|undefined` - broadcast as usual

* `transactionHeaders` (optional) - manually calculate transaction header.  This
  may be provided so enujs does not need to make header related API calls to
  enunode.  This callback is called for every transaction.
  Headers are documented here [enujs-api#headers](https://github.com/enumivo/enujs-api/blob/HEAD/docs/index.md#headers--object).

### Options

Options may be provided immediately after parameters.

Example: `enu.transfer(params, options)`

```js
options = {
  broadcast: true,
  sign: true,
  authorization: null
}
```

* **authorization** `{array<auth>|auth}` - identifies the
  signing account and permission typically in a multi-sig
  configuration.  Authorization may be a string formatted as
  `account@permission` or an `object<{actor: account, permission}>`.
  * If missing default authorizations will be calculated.
  * If provided additional authorizations will not be added.
  * Sorting is always performed (by account name).

### Usage (read/write)

You'll need to provide the private key in keyProvider.

```javascript
Enu = require('enujs') // Enu = require('./src')

enu = Enu({keyProvider: '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3'})

// Run with no arguments to print usage.
enu.transfer()

// Usage with options (options are always optional)
options = {broadcast: false}

enu.transfer({from: 'inita', to: 'initb', quantity: '1 SYS', memo: ''}, options)

// Object or ordered args may be used.
enu.transfer('inita', 'initb', '2 SYS', 'memo', options)

// A broadcast boolean may be provided as a shortcut for {broadcast: false}
enu.transfer('inita', 'initb', '1 SYS', '', false)
```

Read-write API methods and documentation are generated from the [enu_system](https://github.com/enumivo/enujs/blob/master/src/schema/enu_token.json) schema.

For more advanced signing, see `keyProvider` in
[enujs-keygen](https://github.com/enumivo/enujs-keygen) or
[unit test](https://github.com/enumivo/enujs/blob/master/src/index.test.js).

### Shorthand

Shorthand is available for some types such as Asset and Authority.

For example:
* stake_net_quantity: `'1 SYS'` is shorthand for `1.0000 SYS`
* owner: `'ENU6MRy..'` is shorthand for `{threshold: 1, keys: [key: 'ENU6MRy..', weight: 1]}`
* active: `inita` or `inita@active` is shorthand for
  * `{{threshold: 1, accounts: [..actor: inita, permission: active, weight: 1]}}`
  * `inita@other` would replace the permission `active` with `other`


```javascript
Enu = require('enujs') // Enu = require('./src')

wif = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3'
pubkey = 'ENU6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'

enu = Enu({keyProvider: wif})

enu.transaction(tr => {
  tr.newaccount({
    creator: 'inita',
    name: 'mycontract11',
    owner: pubkey,
    active: pubkey
  })
  tr.buyrambytes({
    payer: 'inita',
    receiver: 'mycontract11',
    bytes: 8192
  })
  tr.delegatebw({
    from: 'inita',
    receiver: 'mycontract11',
    stake_net_quantity: '100.0000 SYS',
    stake_cpu_quantity: '100.0000 SYS',
    transfer: 0
  })
})

```

### Contract

Deploy a smart contract.

The `setcode` command accepts WASM text and converts this to binary before
signing and broadcasting.  For this, the Binaryen library is used.  Because
this is a large library it is not included in `enujs` by default.

Add binaryen to your project:

```bash
npm i binaryen@37.0.0
```

Although the ENU back-end does seek to be up-to-date and have
binaryen backwards compatibility, new versions of binaryen may be
[problematic](https://github.com/enumivo/enu/issues/2187).

Import and include the library when you configure Enu:

```javascript
binaryen = require('binaryen')
enu = Enu({..., binaryen})
```

Complete example:

```javascript
Enu = require('enujs') // Enu = require('./src')

keyProvider = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3'

// If your loading a wasm file, you do not need binaryen.  If your loading
// a "wast" file you can include and configure the binaryen compiler:
//
// $ npm install binaryen@37.0.0
// binaryen = require('binaryen')
// enu = Enu({keyProvider, binaryen})

enu = Enu({keyProvider})

wasm = fs.readFileSync(`docker/contracts/enu.token/enu.token.wasm`)
abi = fs.readFileSync(`docker/contracts/enu.token/enu.token.abi`)

// Publish contract to the blockchain
enu.setcode('inita', 0, 0, wasm)
enu.setabi('inita', JSON.parse(abi))

// Error reading contract; https://github.com/enumivo/enu/issues/3159
enu.contract('inita').then(c => inita = c)
inita.create('inita', '1000.0000 CUR', {authorization: 'inita'})
```

### Atomic Operations

Blockchain level atomic operations.  All will pass or fail.

```javascript
Enu = require('enujs') // Enu = require('./src')

keyProvider = [
  '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3',
  Enu.modules.ecc.seedPrivate('currency')
]

enu = Enu({keyProvider})

// if either transfer fails, both will fail (1 transaction, 2 messages)
enu.transaction(enu =>
  {
    enu.transfer('inita', 'initb', '1 SYS', '')
    enu.transfer('inita', 'initc', '1 SYS', '')
    // Returning a promise is optional (but handled as expected)
  }
  // [options],
  // [callback]
)

// transaction on a single contract
enu.transaction('currency', currency => {
  currency.transfer('inita', 'initb', '1 CUR', '')
})

// mix contracts in the same transaction
enu.transaction(['currency', 'enu.token'], ({currency, enu_token}) => {
  currency.transfer('inita', 'initb', '1 CUR', '')
  enu_token.transfer('inita', 'initb', '1 SYS', '')
})

// contract lookups then transactions
enu.contract('currency').then(currency => {
  currency.transaction(cur => {
    cur.transfer('inita', 'initb', '1 CUR', '')
    cur.transfer('initb', 'initc', '1 CUR', '')
  })
  currency.transfer('inita', 'initb', '1 CUR', '')
})

// Note, the contract method does not take an array.  Just use Await or yield
// if multiple contracts are needed outside of a transaction.

```

### Usage (manual)

A manual transaction provides for more flexibility.

```javascript
Enu = require('enujs') // Enu = require('./src')

enu = Enu({keyProvider: '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3'})

// returns Promise
enu.transaction({
  actions: [
    {
      account: 'enu.token',
      name: 'transfer',
      authorization: [{
        actor: 'inita',
        permission: 'active'
      }],
      data: {
        from: 'inita',
        to: 'initb',
        quantity: '7 SYS',
        memo: ''
      }
    }
  ]
})

```

# Development

From time-to-time the enujs and enunode binary format will change between releases
so you may need to start `enunode` with the `--skip-transaction-signatures` parameter
to get your transactions to pass.

Note, `package.json` has a "main" pointing to `./lib`.  The `./lib` folder is for
es2015 code built in a separate step.  If your changing and testing code,
import from `./src` instead.

```javascript
Enu = require('./src')
enu = Enu()
```

* Fcbuffer

The `enu` instance can provide serialization:

```javascript
// 'asset' is a type but could be any struct or type like: transaction or uint8
type = {type: 1, data: '00ff'}
buffer = enu.fc.toBuffer('extensions_type', type)
assert.deepEqual(type, enu.fc.fromBuffer('extensions_type', buffer))

// ABI Serialization
enu.contract('enu.token', (error, c) => enu_token = c)
create = {issuer: 'inita', maximum_supply: '1.0000 SYS'}
buffer = enu_token.fc.toBuffer('create', create)
assert.deepEqual(create, enu_token.fc.fromBuffer('create', buffer))
```

Use Node v8+ to `package-lock.json`.

# Related Libraries

These libraries are integrated into `enujs` seamlessly so you probably do not
need to use them directly.  They are exported here giving more API access or
in some cases may be used standalone.

```javascript
var {format, api, ecc, json, Fcbuffer} = Enu.modules
```
* format [./format.md](./docs/format.md)
  * Blockchain name validation
  * Asset string formatting

* enujs-api [[Github](https://github.com/enumivo/enujs-api), [NPM](https://www.npmjs.org/package/enujs-api)]
  * Remote API to an ENU blockchain node (enunode)
  * Use this library directly if you need read-only access to the blockchain
    (don't need to sign transactions).

* enujs-ecc [[Github](https://github.com/enumivo/enujs-ecc), [NPM](https://www.npmjs.org/package/enujs-ecc)]
  * Private Key, Public Key, Signature, AES, Encryption / Decryption
  * Validate public or private keys
  * Encrypt or decrypt with ENU compatible checksums
  * Calculate a shared secret

* json {[api](https://github.com/enumivo/enujs-api/blob/master/src/api), [schema](https://github.com/enumivo/enujs/blob/master/src/schema)},
  * Blockchain definitions (api method names, blockchain schema)

* enujs-keygen [[Github](https://github.com/enumivo/enujs-keygen), [NPM](https://www.npmjs.org/package/enujs-keygen)]
  * private key storage and key management

* Fcbuffer [[Github](https://github.com/enumivo/enujs-fcbuffer), [NPM](https://www.npmjs.org/package/fcbuffer)]
  * Binary serialization used by the blockchain
  * Clients sign the binary form of the transaction
  * Allows client to know what it is signing


# Browser

```bash
git clone https://github.com/enumivo/enujs.git
cd enujs
npm install
npm run build_browser
# builds: ./dist/enu.js load with ./dist/index.html

npm run build_browser_test
# builds: ./dist/test.js run with ./dist/test.html
```

```html
<script src="enu.js"></script>
<script>
var enu = Enu()
//...
</script>
```

# Environment

Node and browser (es2015)
