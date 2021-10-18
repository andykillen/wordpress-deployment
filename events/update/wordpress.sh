#!/bin/bash

# Get the working directory from the first argument ( $2 is wordpress install type, $3 server type )
WORKING_DIRECTORY=$1

echo $WORKING_DIRECTORY
# change to doc root of the server (working directory)
cd $WORKING_DIRECTORY
# check the db connection, if this fails (WP CLI is not installed) it will exit
wp db check || exit 1
# run the core update of the db to do any table updates
wp core update-db
# exit
exit 0
