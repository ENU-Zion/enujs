# Enujs

General purpose library for Enumivo blockchains.

### Usage

Ways to instantiate enujs.

```js
Enu = require('enujs')

// Private key or keys (array) provided statically or by way of a function.
// For multiple keys, the get_required_keys API is used (more on that below).
keyProvider: '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3'

// Localhost Testnet (run ./docker/up.sh)
enu = Enu({keyProvider})

// Connect to a testnet or mainnet
enu = Enu({httpEndpoint, chainId, keyProvider})

// Cold-storage
enu = Enu({httpEndpoint: null, chainId, keyProvider})

// Read-only instance when 'enujs' is already a dependency
enu = Enu.modules.api({/*config*/})

// Read-only instance when an application never needs to write (smaller library)
EnuApi = require('enujs-api')
enu = EnuApi({/*config*/})
```

No-arguments prints usage.

```js
enu.getBlock()
```
```json
USAGE
getBlock - Fetch a block from the blockchain.

PARAMETERS
{
  "block_num_or_id": "string"
}
```

Start a enunoded process.  The docker in this repository provides a setup
the supports the examples in this README.

```bash
cd ./docker && ./up.sh
```

All functions read only or transactional follow this pattern for parameters.

```js
// If the last argument is a function it is treated as a callback
enu.getBlock(1, (error, result) => {})

// If a callback is not provided, a Promise is returned
enu.getBlock(1) // @returns {Promise}

// Parameters can be positional or an object
enu.getBlock({block_num_or_id: 1})

// An API with no parameters is invoked with an empty object or callback (avoids logging usage)
enu.getInfo({}) // @returns {Promise}
enu.getInfo((error, result) => { console.log(error, result) })
```

Chain and history API functions are available after creating the `enu` object.
API methods and documentation are generated from the chain and history json files.

* [chain.json](https://github.com/enumivo/enujs-api/blob/master/src/api/v1/chain.json)
* [history.json](https://github.com/enumivo/enujs-api/blob/master/src/api/v1/history.json)

Until we generate a markdown for these, please convert the names in these
json to camel case functions.

* `"get_info": ..` is `enu.getInfo(..)`

### Configuration

```js
Enu = require('enujs')

// Default configuration (additional options below)
config = {
  chainId: null, // 32 byte (64 char) hex string
  keyProvider: ['PrivateKeys...'], // WIF string or array of keys..
  httpEndpoint: 'http://127.0.0.1:8888',
  expireInSeconds: 60,
  broadcast: true,
  verbose: false, // API activity
  sign: true
}

enu = Enu(config)
```

* **chainId** `hex` - Unique ID for the blockchain you're connecting too.  This
  is required for valid transaction signing.  The chainId is provided via the
  [get_info](http://ayeaye.cypherglass.com:8888/v1/chain/get_info) API call.

  Identifies a chain by its initial genesis block.  All transactions signed will
  only be valid the blockchain with this chainId.  Verify the chainId for
  security reasons.

* **keyProvider** `[array<string>|string|function]` - Provides private keys
  used to sign transaction.  If multiple private keys are found, the API
  `get_required_keys` is called to discover which signing keys to use.  If a
  function is provided, this function is called for each transaction.

* **httpEndpoint** `string` - http or https location of a enunoded server
  providing a chain API.  When using enujs from a browser remember to configure
  the same origin policy in enunoded or proxy server.  For testing, enunoded
  configuration `access-control-allow-origin = *` could be used.

  Set this value to **null** for a cold-storage (no network) configuration.

* **expireInSeconds** `number` - number of seconds before the transaction
  will expire.  The time is based on the enunoded's clock.  An unexpired
  transaction that may have had an error is a liability until the expiration
  is reached, this time should be brief.

* **broadcast** `[boolean=true]` - post the transaction to
  the blockchain.  Use false to obtain a fully signed transaction.

* **verbose** `[boolean=false]` - verbose logging such as API activity.

* **debug** `[boolean=false]` - low level debug logging (serialization).

* **sign** `[boolean=true]` - sign the transaction with a private key.  Leaving
  a transaction unsigned avoids the need to provide a private key.

* **mockTransactions** (advanced)
  * `mockTransactions: () => null // 'pass',  or 'fail'`
  * `pass` - do not broadcast, always pretend that the transaction worked
  * `fail` - do not broadcast, pretend the transaction failed
  * `null|undefined` - broadcast as usual

* **transactionHeaders** (advanced) - manually calculate transaction header.  This
  may be provided so enujs does not need to make header related API calls to
  enunode.  Used in environments like cold-storage.  This callback is called for
  every transaction. Headers are documented here [enujs-api#headers](https://github.com/enumivo/enujs-api/blob/HEAD/docs/index.md#headers--object).
  * `transactionHeaders: (expireInSeconds, callback) => {callback(null/*error*/, headers)}`

* **logger** - default logging configuration.
  ```js
  logger: {
    log: config.verbose ? console.log : null,
    error: console.error // null to disable
  }
  ```

  Turn off all error logging: `config.logger = {error: null}`

### Options

Options may be provided after parameters.

```js
options = {
  authorization: 'alice@active',
  broadcast: true,
  sign: true
}
```

```js
enu.transfer('alice', 'bob', '1.0000 ENU', '', options)
```

* **authorization** `[array<auth>|auth]` - identifies the
  signing account and permission typically in a multisig
  configuration.  Authorization may be a string formatted as
  `account@permission` or an `object<{actor: account, permission}>`.
  * If missing default authorizations will be calculated.
  * If provided additional authorizations will not be added.
  * Performs deterministic sorting by account name

  If a default authorization is calculated the action's 1st field must be
  an account_name.  The account_name in the 1st field gets added as the
  active key authorization for the action.

* **broadcast** `[boolean=true]` - post the transaction to
  the blockchain.  Use false to obtain a fully signed transaction.

* **sign** `[boolean=true]` - sign the transaction with a private key.  Leaving
  a transaction unsigned avoids the need to provide a private key.

### Transaction

The transaction function accepts the standard blockchain transaction.

Required transaction header fields will be added unless your signing without a
network connection (httpEndpoint == null). In that case provide you own headers:

```js
// only needed in cold-storage or for offline transactions
const headers = {
  expiration: '2018-06-14T18:16:10'
  ref_block_num: 1,
  ref_block_prefix: 452435776
}
```

Create and send (broadcast) a transaction:

```javascript
/** @return {Promise} */
enu.transaction(
  {
    // ...headers,
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
          quantity: '7.0000 ENU',
          memo: ''
        }
      }
    ]
  }
  // options -- example: {broadcast: false}
)
```

### Named action functions

More concise functions are provided for applications that may use actions
more frequently.  This avoids having lots of JSON in the code.

```javascript
// Run with no arguments to print usage.
enu.transfer()

// Callback is last, when omitted a promise is returned
enu.transfer('inita', 'initb', '1.0000 ENU', '', (error, result) => {})
enu.transfer('inita', 'initb', '1.1000 ENU', '') // @returns {Promise}

// positional parameters
enu.transfer('inita', 'initb', '1.2000 ENU', '')

// named parameters
enu.transfer({from: 'inita', to: 'initb', quantity: '1.3000 ENU', memo: ''})

// options appear after parameters
options = {broadcast: true, sign: true}

// `false` is a shortcut for {broadcast: false}
enu.transfer('inita', 'initb', '1.4000 ENU', '', false)
```

Read-write API methods and documentation are generated from the enumivo
[token](https://github.com/enumivo/enujs/blob/master/src/schema/enu_token.json) and
[system](https://github.com/enumivo/enujs/blob/master/src/schema/enumivo_system.json).

Assets amounts require zero padding.  For a better user-experience, if you know
the correct precision you may use DecimalPad to add the padding.

```js
DecimalPad = Enu.modules.format.DecimalPad
userInput = '10.2'
precision = 4
assert.equal('10.2000', DecimalPad(userInput, precision))
```

For more advanced signing, see `keyProvider` and `signProvider` in
[index.test.js](https://github.com/enumivo/enujs/blob/master/src/index.test.js).

### Shorthand

Shorthand is available for some types such as Asset and Authority.  This syntax
is only for concise functions and does not work when providing entire transaction
objects to `enu.transaction`..

For example:
* permission `inita` defaults `inita@active`
* authority `'ENU6MRy..'` expands `{threshold: 1, keys: [key: 'ENU6MRy..', weight: 1]}`
* authority `inita` expands `{{threshold: 1, accounts: [..actor: 'inita', permission: 'active', weight: 1]}}`

### New Account

New accounts will likely require some staked tokens for RAM and bandwidth.

```javascript
wif = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3'
pubkey = 'ENU6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'

enu.transaction(tr => {
  tr.newaccount({
    creator: 'enumivo',
    name: 'myaccount',
    owner: pubkey,
    active: pubkey
  })

  tr.buyrambytes({
    payer: 'enumivo',
    receiver: 'myaccount',
    bytes: 8192
  })

  tr.delegatebw({
    from: 'enumivo',
    receiver: 'myaccount',
    stake_net_quantity: '10.0000 ENU',
    stake_cpu_quantity: '10.0000 ENU',
    transfer: 0
  })
})
```

### Contract

Deploy and call smart contracts.

#### Compile

If you're loading a **wasm** file, you do not need binaryen. If you're loading
a **wast** file you can include and configure the binaryen compiler, this is
used to compile to **wasm** automatically when calling **setcode**.

Versions of binaryen may be [problematic](https://github.com/enumivo/enu/issues/2187).

```bash
$ npm install binaryen@37.0.0
```

```js
binaryen = require('binaryen')
enu = Enu({keyProvider, binaryen})
```

#### Deploy

```javascript
wasm = fs.readFileSync(`docker/contracts/enu.token/enu.token.wasm`)
abi = fs.readFileSync(`docker/contracts/enu.token/enu.token.abi`)

// Publish contract to the blockchain
enu.setcode('myaccount', 0, 0, wasm) // @returns {Promise}
enu.setabi('myaccount', JSON.parse(abi)) // @returns {Promise}
```

#### Fetch a smart contract

```js
// @returns {Promise}
enu.contract('myaccount', [options], [callback])

// Run immediately, `myaction` returns a Promise
enu.contract('myaccount').then(myaccount => myaccount.myaction(..))

// Group actions. `transaction` returns a Promise but `myaction` does not
enu.transaction('myaccount', myaccount => { myaccount.myaction(..) })

// Transaction with multiple contracts
enu.transaction(['myaccount', 'myaccount2'], ({myaccount, myaccount2}) => {
   myaccount.myaction(..)
   myaccount2.myaction(..)
})
```

#### Offline or cold-storage contract

```js
enu = Enu({httpEndpoint: null})

abi = fs.readFileSync(`docker/contracts/enu.token/enu.token.abi`)
enu.fc.abiCache.abi('myaccount', JSON.parse(abi))

// Check that the ABI is available (print usage)
enu.contract('myaccount').then(myaccount => myaccount.create())
```
#### Offline or cold-storage transaction

```js
// ONLINE

// Prepare headers
expireInSeconds = 60 * 60 // 1 hour

enu = Enu(/* {httpEndpoint: 'https://..'} */)

info = await enu.getInfo({})
chainDate = new Date(info.head_block_time + 'Z')
expiration = new Date(chainDate.getTime() + expireInSeconds * 1000)
expiration = expiration.toISOString().split('.')[0]

block = await enu.getBlock(info.last_irreversible_block_num)

transactionHeaders = {
  expiration,
  ref_block_num: info.last_irreversible_block_num & 0xFFFF,
  ref_block_prefix: block.ref_block_prefix
}

// OFFLINE (bring `transactionHeaders`)

// All keys in keyProvider will sign.
enu = Enu({httpEndpoint: null, chainId, keyProvider, transactionHeaders})

transfer = await enu.transfer('inita', 'initb', '1.0000 SYS', '')
transferTransaction = transfer.transaction

// ONLINE (bring `transferTransaction`)

enu = Enu(/* {httpEndpoint: 'https://..'} */)

processedTransaction = await enu.pushTransaction(transferTransaction)
```

#### Custom Token

```js
// more on the contract / transaction syntax

await enu.transaction('myaccount', myaccount => {

  // Create the initial token with its max supply
  // const options = {authorization: 'myaccount'} // default
  myaccount.create('myaccount', '10000000.000 TOK')//, options)

  // Issue some of the max supply for circulation into an arbitrary account
  myaccount.issue('myaccount', '10000.000 TOK', 'issue')
})

const balance = await enu.getCurrencyBalance('myaccount', 'myaccount', 'TOK')
console.log('Currency Balance', balance)
```

### Calling Actions

Other ways to use contracts and transactions.

```javascript
// if either transfer fails, both will fail (1 transaction, 2 messages)
await enu.transaction(enu =>
  {
    enu.transfer('inita', 'initb', '1.0000 SYS', ''/*memo*/)
    enu.transfer('inita', 'initc', '1.0000 SYS', ''/*memo*/)
    // Returning a promise is optional (but handled as expected)
  }
  // [options],
  // [callback]
)

// transaction on a single contract
await enu.transaction('myaccount', myaccount => {
  myaccount.transfer('myaccount', 'inita', '10.000 TOK@myaccount', '')
})

// mix contracts in the same transaction
await enu.transaction(['myaccount', 'enu.token'], ({myaccount, enu_token}) => {
  myaccount.transfer('inita', 'initb', '1.000 TOK@myaccount', '')
  enumivo_token.transfer('inita', 'initb', '1.0000 SYS', '')
})

// The contract method does not take an array so must be called once for
// each contract that is needed.
const myaccount = await enu.contract('myaccount')
await myaccount.transfer('myaccount', 'inita', '1.000 TOK', '')

// a transaction to a contract instance can specify multiple actions
await myaccount.transaction(myaccountTr => {
  myaccountTr.transfer('inita', 'initb', '1.000 TOK', '')
  myaccountTr.transfer('initb', 'inita', '1.000 TOK', '')
})
```

# Development

From time-to-time the enujs and enunode binary format will change between releases
so you may need to start `enunode` with the `--skip-transaction-signatures` parameter
to get your transactions to pass.

Note, `package.json` has a "main" pointing to `./lib`.  The `./lib` folder is for
es2015 code built in a separate step. If you're changing and testing code,
import from `./src` instead.

```javascript
Enu = require('./src')

// forceActionDataHex = false helps transaction readability but may trigger back-end bugs
config = {verbose: true, debug: false, broadcast: true, forceActionDataHex: true, keyProvider}

enu = Enu(config)
```

#### Fcbuffer

The `enu` instance can provide serialization:

```javascript
// 'asset' is a type but could be any struct or type like: transaction or uint8
type = {type: 1, data: '00ff'}
buffer = enu.fc.toBuffer('extensions_type', type)
assert.deepEqual(type, enu.fc.fromBuffer('extensions_type', buffer))

// ABI Serialization
enu.contract('enu.token', (error, enu_token) => {
  create = {issuer: 'inita', maximum_supply: '1.0000 ENU'}
  buffer = enu_token.fc.toBuffer('create', create)
  assert.deepEqual(create, enu_token.fc.fromBuffer('create', buffer))
})
```

Use Node v10+ for `package-lock.json`.

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
