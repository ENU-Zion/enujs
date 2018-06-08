const schema = Object.assign(
  {},
  require('./chain_types.json'),
  require('./enu_system.json'),
  require('./enu_token.json')
)

module.exports = schema
