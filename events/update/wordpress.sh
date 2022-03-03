#!/bin/bash
# get the working directory from the first argument
WORKING_DIRECTORY=$1
# get the wordpress install type [single/subdirectory/subdomain]
WORDPRESS_TYPE=$2
# Server type [apache/nginx/whatever else]
SERVER_TYPE=$3
# get the root of the project 
PROJECT_ROOT_DIRECTORY="$(dirname "$WORKING_DIRECTORY")"
# copy the .htaccess if apache server
if [ "$SERVER_TYPE" == "apache" ]; then
    # check if .htaccess already exists, do not overwrite
    if [ ! -f "$WORKING_DIRECTORY/.htaccess" ]; then
        cp "$PROJECT_ROOT_DIRECTORY/files/htaccess-$WORDPRESS_TYPE.txt" "$WORKING_DIRECTORY/.htaccess"
    fi    
fi
# check for robots.txt, create if it does not exist
if [ ! -f "$WORKING_DIRECTORY/robots.txt" ]; then
        cp "$PROJECT_ROOT_DIRECTORY/files/robots.txt" "$WORKING_DIRECTORY/robots.txt"
fi

echo $WORKING_DIRECTORY
# change to doc root of the server (working directory)
cd $WORKING_DIRECTORY
# check the db connection, if this fails (WP CLI is not installed) it will exit
wp db check || exit 1
# run the core update of the db to do any table updates
wp core update-db
# exit
exit 0
