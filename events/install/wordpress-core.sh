#!/bin/bash
# get the working directory from the first argument
WORKING_DIRECTORY=$1
# change to doc root of the server (working directory)
cd $WORKING_DIRECTORY
# check if extra directory exists that can be removed
[ -d "wp-content/wp-content" ] && rm -rf wp-content/wp-content 
