set -o errexit
set -o xtrace

function process() {
  docker cp docker_enunoded_1:/contracts/${1}/${1}.abi .
  node ./enumivo-abi-update.js $1 $2
  mv ./$2 ../src/schema
}

process enu.token enu_token.json
process enu.system enu_system.json
