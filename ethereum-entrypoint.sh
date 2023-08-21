#!/opt/homebrew/bin/bash bash

CORE_PORT=8545
CORE_RPCPORT=8545

arguments=""
for env in "${!CORE_@}"
do
  value=${!env}
  uppercase_flag=${env#CORE_}
  lowercase_flag=${uppercase_flag,,}
  arguments="${arguments} -${lowercase_flag,,}=${!env}"
done
echo $arguments
# -port=8545 -rpcport=8545