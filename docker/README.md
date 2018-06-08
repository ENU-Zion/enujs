Dockerized enumivo instance for development and testing.  This container
is designed to reset its blockchain and wallet state upon shutdown.

# Start enunoded

Starting and stopping an enumivo instance:

```js
./up.sh
docker-compose down
```

# Load commands like `enucli`

```bash
. ./dockrc.sh
```

# Unit Test

Run all unit test in a temporary instance.  Note, this script will run
`npm install` in the enujs directory.

`./run_tests.sh`

# Running container

After ./up.sh

```bash
docker exec docker_enunoded_1 ls /opt/enumivo/bin
docker exec docker_enunoded_1 ls /contracts
docker cp docker_enunoded_1:/opt/enumivo/bin/enunode .

# Or setup an environment:
. ./dockerc.sh
enuwallet ls /opt/enumivo/bin
enucli --help
```

# Stopped container

```bash
# Note, update release
docker run --rm -it enumivo/enu:latest ls /opt/enumivo/bin
docker run -v "$(pwd):/share" --rm -it enumivo/enu:latest cp /opt/enumivo/bin/enunode /share
```

