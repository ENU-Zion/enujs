#!/usr/bin/env bash
set -o errexit
set -o xtrace

. ./dockrc.sh

# Reset the volumes
docker-compose down

# Update docker
#docker-compose pull

# Start the server for testing
docker-compose up -d
docker-compose logs -f | egrep -v 'Produced block 0' &
sleep 2

enucli wallet create

# Create accounts must happen before enu.system is installed

# Test accounts (for enujs)
enucli create account enumivo inita $owner_pubkey $active_pubkey
enucli create account enumivo initb $owner_pubkey $active_pubkey
enucli create account enumivo initc $owner_pubkey $active_pubkey

# System accounts for enunoded
enucli create account enumivo enumivo.bpay $owner_pubkey $active_pubkey
enucli create account enumivo enumivo.msig $owner_pubkey $active_pubkey
enucli create account enumivo enumivo.names $owner_pubkey $active_pubkey
enucli create account enumivo enumivo.ram $owner_pubkey $active_pubkey
enucli create account enumivo enumivo.ramfee $owner_pubkey $active_pubkey
enucli create account enumivo enumivo.saving $owner_pubkey $active_pubkey
enucli create account enumivo enumivo.stake $owner_pubkey $active_pubkey
enucli create account enumivo enu.token $owner_pubkey $active_pubkey
enucli create account enumivo enumivo.vpay $owner_pubkey $active_pubkey

# Deploy, create and issue SYS token to enu.token
# enucli create account enumivo enu.token $owner_pubkey $active_pubkey
enucli set contract enu.token contracts/enu.token -p enu.token@active
enucli push action enu.token create\
  '{"issuer":"enu.token", "maximum_supply": "1000000000.0000 SYS"}' -p enu.token@active
enucli push action enu.token issue\
  '{"to":"enu.token", "quantity": "1000000000.0000 SYS", "memo": "issue"}' -p enu.token@active

# Deprecated: `currency` will be replaced by `currency3.14` below
enucli create account enumivo currency $owner_pubkey $active_pubkey
enucli set contract currency contracts/enu.token -p currency@active
enucli push action currency create\
  '{"issuer":"currency", "maximum_supply": "1000000000.0000 CUR"}' -p currency@active
enucli push action currency issue\
  '{"to":"currency", "quantity": "1000000000.0000 CUR", "memo": "issue"}' -p currency@active

# enumivo.* accounts  allowed only before lockdown

# Lockdown (deploy enu.system or enu.bios to the enumivo account)
enucli set contract enumivo contracts/enu.system -p enumivo@active

# Non-privileged operations (after lockdown)

# SYS (main token)
enucli transfer enu.token enumivo '1000 SYS'
enucli transfer enu.token inita '1000 SYS'
enucli transfer enu.token initb '1000 SYS'
enucli transfer enu.token initc '1000 SYS'

# User-issued asset(s)..

# PHI (user-issued main token)
enucli push action enu.token create\
  '{"issuer":"enu.token", "maximum_supply": "1000000000.000 PHI"}' -p enu.token@active
enucli push action enu.token issue\
  '{"to":"enu.token", "quantity": "1000000000.000 PHI", "memo": "issue"}' -p enu.token@active
enucli transfer enu.token inita '100000 PHI'
enucli transfer enu.token initb '100000 PHI'

# CUR (user issued own contract)
# newaccount enumivo currency3.14 $owner_pubkey $active_pubkey
# enucli set contract currency3.14 contracts/enu.token -p currency3.14@active
# enucli push action currency3.14 create\
#   '{"issuer":"currency3.14", "maximum_supply": "1000000000.0000 CUR"}' -p currency3.14@active
# enucli push action currency3.14 issue\
#   '{"to":"currency3.14", "quantity": "1000000000.0000 CUR", "memo": "issue"}' -p currency3.14@active
#
# # enunoded error: "Symbol CUR is not supported by token contract enu.token"
# enucli transfer currency3.14 inita '100000 CUR'
# enucli transfer currency3.14 initb '100000 CUR'
