#!/bin/bash
# Get the working directory from the first argument ( $2 is wordpress install type, $3 server type )
WORKING_DIRECTORY=$1
# change to doc root of the server (working directory)
cd $WORKING_DIRECTORY
# check if extra directory exists that can be removed
[ -d "wp-content/wp-content" ] && rm -rf wp-content/wp-content 
