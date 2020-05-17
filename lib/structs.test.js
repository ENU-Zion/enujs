'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */
var assert = require('assert');
var Fcbuffer = require('fcbuffer');
var ByteBuffer = require('bytebuffer');

var Enu = require('.');

describe('shorthand', function () {

  it('authority', function _callee() {
    var enu, enumivo, authority, pubkey, auth;
    return _regenerator2.default.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            enu = Enu({ keyPrefix: 'PUB' });
            _context.next = 3;
            return _regenerator2.default.awrap(enu.contract('enumivo'));

          case 3:
            enumivo = _context.sent;
            authority = enumivo.fc.structs.authority;
            pubkey = 'PUB6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV';
            auth = { threshold: 1, keys: [{ key: pubkey, weight: 1 }] };


            assert.deepEqual(authority.fromObject(pubkey), auth);
            assert.deepEqual(authority.fromObject(auth), Object.assign({}, auth, { accounts: [], waits: [] }));

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, null, undefined);
  });

  it('PublicKey sorting', function _callee2() {
    var enu, enumivo, authority, pubkeys, authSorted, authUnsorted;
    return _regenerator2.default.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            enu = Enu();
            _context2.next = 3;
            return _regenerator2.default.awrap(enu.contract('enumivo'));

          case 3:
            enumivo = _context2.sent;
            authority = enumivo.fc.structs.authority;
            pubkeys = ['ENU7wBGPvBgRVa4wQN2zm5CjgBF6S7tP7R3JavtSa2unHUoVQGhey', 'ENU6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'];
            authSorted = { threshold: 1, keys: [{ key: pubkeys[1], weight: 1 }, { key: pubkeys[0], weight: 1 }], accounts: [], waits: [] };
            authUnsorted = { threshold: 1, keys: [{ key: pubkeys[0], weight: 1 }, { key: pubkeys[1], weight: 1 }], accounts: [], waits: []

              // assert.deepEqual(authority.fromObject(pubkey), auth)
            };
            assert.deepEqual(authority.fromObject(authUnsorted), authSorted);

          case 9:
          case 'end':
            return _context2.stop();
        }
      }
    }, null, undefined);
  });

  it('public_key', function () {
    var enu = Enu({ keyPrefix: 'PUB' });
    var _enu$fc = enu.fc,
        structs = _enu$fc.structs,
        types = _enu$fc.types;

    var PublicKeyType = types.public_key();
    var pubkey = 'PUB6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV';
    // 02c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cf
    assertSerializer(PublicKeyType, pubkey);
  });

  it('symbol', function () {
    var enu = Enu();
    var types = enu.fc.types;

    var _Symbol = types.symbol();
    assertSerializer(_Symbol, '4,ENU', '4,ENU', 'ENU');
  });

  it('symbol_code', function () {
    var enu = Enu({ defaults: true });
    var types = enu.fc.types;

    var SymbolCode = types.symbol_code();
    assertSerializer(SymbolCode, SymbolCode.toObject());
  });

  it('extended_symbol', function () {
    var enu = Enu({ defaults: true });
    var esType = enu.fc.types.extended_symbol();
    // const esString = esType.toObject()
    assertSerializer(esType, '4,ENU@contract');
  });

  it('asset', function () {
    var enu = Enu();
    var types = enu.fc.types;

    var aType = types.asset();
    assertSerializer(aType, '1.0001 ENU');
  });

  it('extended_asset', function () {
    var enu = Enu({ defaults: true });
    var eaType = enu.fc.types.extended_asset();
    assertSerializer(eaType, eaType.toObject());
  });

  it('signature', function () {
    var enu = Enu();
    var types = enu.fc.types;

    var SignatureType = types.signature();
    var signatureString = 'SIG_K1_JwxtqesXpPdaZB9fdoVyzmbWkd8tuX742EQfnQNexTBfqryt2nn9PomT5xwsVnUB4m7KqTgTBQKYf2FTYbhkB5c7Kk9EsH';
    //const signatureString = 'SIG_K1_Jzdpi5RCzHLGsQbpGhndXBzcFs8vT5LHAtWLMxPzBdwRHSmJkcCdVu6oqPUQn1hbGUdErHvxtdSTS1YA73BThQFwV1v4G5'
    assertSerializer(SignatureType, signatureString);
  });
});

describe('Enumivo Abi', function () {

  function checkContract(name) {
    it(name + ' contract parses', function (done) {
      var enu = Enu();

      enu.contract('enu.token', function (error, enu_token) {
        assert(!error, error);
        assert(enu_token.transfer, 'enu.token contract');
        assert(enu_token.issue, 'enu.token contract');
        done();
      });
    });
  }
  checkContract('enumivo');
  checkContract('enu.token');

  it('abi', function _callee3() {
    var enu, abi_def, setabi, obj, json;
    return _regenerator2.default.async(function _callee3$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            setabi = function setabi(abi) {
              var buf;
              return _regenerator2.default.async(function setabi$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      _context3.next = 2;
                      return _regenerator2.default.awrap(enu.setabi('inita', abi));

                    case 2:
                      // See README
                      buf = enu.fc.toBuffer('abi_def', abi);
                      _context3.next = 5;
                      return _regenerator2.default.awrap(enu.setabi('inita', buf));

                    case 5:
                      _context3.next = 7;
                      return _regenerator2.default.awrap(enu.setabi('inita', buf.toString('hex')));

                    case 7:
                    case 'end':
                      return _context3.stop();
                  }
                }
              }, null, this);
            };

            enu = Enu({ defaults: true, broadcast: false, sign: false });
            abi_def = enu.fc.structs.abi_def;
            obj = abi_def.toObject();
            json = JSON.stringify(obj);
            _context4.next = 7;
            return _regenerator2.default.awrap(setabi(obj));

          case 7:
            _context4.next = 9;
            return _regenerator2.default.awrap(setabi(abi_def.fromObject(obj)));

          case 9:
            _context4.next = 11;
            return _regenerator2.default.awrap(setabi(abi_def.fromObject(json)));

          case 11:
            _context4.next = 13;
            return _regenerator2.default.awrap(setabi(abi_def.fromObject(Buffer.from(json).toString('hex'))));

          case 13:
            _context4.next = 15;
            return _regenerator2.default.awrap(setabi(abi_def.fromObject(Buffer.from(json))));

          case 15:
          case 'end':
            return _context4.stop();
        }
      }
    }, null, undefined);
  });
});

describe('Action.data', function () {
  it('json', function () {
    var enu = Enu({ forceActionDataHex: false });
    var _enu$fc2 = enu.fc,
        structs = _enu$fc2.structs,
        types = _enu$fc2.types;

    var value = {
      account: 'enu.token',
      name: 'transfer',
      data: {
        from: 'inita',
        to: 'initb',
        quantity: '1.0000 ENU',
        memo: ''
      },
      authorization: []
    };
    assertSerializer(structs.action, value);
  });

  it('force hex', function () {
    var enu = Enu({ forceActionDataHex: true });
    var _enu$fc3 = enu.fc,
        structs = _enu$fc3.structs,
        types = _enu$fc3.types;

    var value = {
      account: 'enu.token',
      name: 'transfer',
      data: {
        from: 'inita',
        to: 'initb',
        quantity: '1.0000 ENU',
        memo: ''
      },
      authorization: []
    };
    assertSerializer(structs.action, value, value);
  });

  it('unknown action', function () {
    var enu = Enu({ forceActionDataHex: false });
    var _enu$fc4 = enu.fc,
        structs = _enu$fc4.structs,
        types = _enu$fc4.types;

    var value = {
      account: 'enu.token',
      name: 'mytype',
      data: '030a0b0c',
      authorization: []
    };
    assert.throws(function () {
      return assertSerializer(structs.action, value);
    }, /Missing ABI action/);
  });
});

function assertSerializer(type, value) {
  var fromObjectResult = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var toObjectResult = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : fromObjectResult;

  var obj = type.fromObject(value); // tests fromObject
  var buf = Fcbuffer.toBuffer(type, value); // tests appendByteBuffer
  var obj2 = Fcbuffer.fromBuffer(type, buf); // tests fromByteBuffer
  var obj3 = type.toObject(obj); // tests toObject

  if (!fromObjectResult && !toObjectResult) {
    assert.deepEqual(value, obj3, 'serialize object');
    assert.deepEqual(obj3, obj2, 'serialize buffer');
    return;
  }

  if (fromObjectResult) {
    assert(fromObjectResult, obj, 'fromObjectResult');
    assert(fromObjectResult, obj2, 'fromObjectResult');
  }

  if (toObjectResult) {
    assert(toObjectResult, obj3, 'toObjectResult');
  }
}