# WordPress deployments via composer
The big question to answer is, why use this and not directly John P Bloch excellent work on making [composer work for WordPress](https://github.com/johnpbloch/wordpress).

- Firstly, and most importantly, this removes the need to install WordPress in a sub-directory.
- Auto creates a robots.txt and if needed a .htacces
- setup a proper .gitignore so that it excludes all the right things to allow for deployment via git, with the option to exclude at a composer repo level, or the generic plugins/themes directories 
- includes patching capiblity for those annoying times when a plugin developer is not implementing your fixes
- After composer repo install/update has happened, checks for scripts to run.  Already seutp to ```run wp core db-update``` after a WordPress Core install. Scripts can be php or bash based
- optional settings.php pre-ignored in the root if you want to use it. 

## Most basic usage
There are 2 ways to install this, either create a project, or clone the repo.  Its your choice, but creating the project is slightly less to do. 

### Setup WordPress via Composer crete project
```
// create the project
composer create-project andykillen/wordpress-deployment project-directory-name
// change to the directory
cd project-directory-name
// install composer dependencies
composer install
// change to web root
cd public_html
// Get your web server working directory
pwd
```


### Setup WordPress via Git Clone
```
// clone the repo using SSH
git clone git@github.com:andykillen/wordpress-deployment.git
// OR clone the repo using HTTPS (recommend ^^^ SSH, not HTTPS)
git clone https://github.com/andykillen/wordpress-deployment.git
// change to the newly created directory
cd wordpress-deployment
// delete the .git directory so its not links to the main repo any more
rm -rf .git
// run composer to load the most up to date version of everything
composer update
// change to the server doc root
cd public_html
// find out where you are so you can use this next for the server
pwd
```
### Setup the server
#### Apache example
Add a virtual host, which points at the public_html directory. The directory
```/var/www/wordpress-deployment/public_html``` is the directory you just got
from the last command in the "setup WordPress". Change it to wherever your the pwd output is.  

*note* this is for a development setup, not the server. Its quite open.

You'll need to enable this site 
```
<VirtualHost *:80>
        ServerAdmin andrew@bas-works.com
        ServerName localnameofsite.com
        DocumentRoot /var/www/wordpress-deployment/public_html

        ErrorLog ${APACHE_LOG_DIR}/nameofsite-error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
        <Directory /var/www/wordpress-deployment/public_html>
            Options FollowSymLinks -Indexes
            AllowOverride All
        </Directory>
</VirtualHost>
```
#### Nginx example
This is a simple nginx example, the main thing to notice is the directive ```root /var/www/wordpress-deployment/public_html;``` which is pointing at the sub directory where the web server is.

You'll need to enable this site.
```
upstream php {
        server unix:/run/php/php7.4-fpm.sock;
}

server {
       
        server_name local.nameofsite.com;
       
        root /var/www/wordpress-deployment/public_html;
       
        index index.php;
       
        location = /favicon.ico {
                log_not_found off;
                access_log off;
        }
       
        location = /robots.txt {
                allow all;
                log_not_found off;
                access_log off;
        }
       
        location / {
                try_files $uri $uri/ /index.php?$args;
        }
       
        location ~ \.php$ {
                include fastcgi.conf;
                fastcgi_intercept_errors on;
                fastcgi_pass php;
        }
        location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
                expires max;
                log_not_found off;
        }
}
```

### Installing WordPress
Now that your server of choice is enabled, and the virtual host his pointing at the right place, open a 
browser and go to the server and setup WordPress as normal. 

If you want, you can put the wp-config.php in the public_html directory, or one directory above to add a little security. 

## Git options

### Named server directory
Create the webserver directory with the name of the site. Whatever you put at the end will be the name of the directory that will be created
```
git clone git@github.com:andykillen/wordpress-deployment.git nameofsite.com
```

### Current empty directory
Clone in to the current **empty** directory
```
git clone git@github.com:andykillen/wordpress-deployment.git .
```

### Change the repo to point at your GIT
```
git remote set-url origin git@github.com:yourname/site-deployment-name.git
```

**don't forget to delete the .git directory or change to your repo**

## Composer Options

### Add new themes or plugins via composer

Either hand edit the require section to add your wanted theme or plugin.  
```
"require": {
		"cweagans/composer-patches": "^1.7",
		"composer/composer": "*",
		"composer/installers": "^2.0",
		"johnpbloch/wordpress": "*",
		"wpackagist-plugin/akismet":"*",
		"wpackagist-theme/twentytwenty":"*"	
	}
```
### Adaptions to EXTRA

```
"extra": {
		"composer-exit-on-patch-failure": true,
		"patches-file": "composer.patches.json",
		"enable-patching": true,
		"installer-paths": {
			"public_html/wp-content/plugins/{$name}/": [
				"type:wordpress-plugin"
			],
			"public_html/wp-content/themes/{$name}/": [
				"type:wordpress-theme"
			]
		},
		"wordpress-install-dir": "public_html",
		"wordpress-type" : "single",
		"server-type" : "apache"
	},
```
#### Adapt the WordPress server directory

In the extra section, wherever you see ```public_html``` change it to be the directory name you want. There are 3 places.

#### Change the WordPress type 
Adapt the ```wordpress-type``` value to be one of the following

- single
- subdirectory
- subdomain

This will auto add the default WordPress .htaccess (if apache based) for that type of install into the webroot.

#### Change the Server Type
Change the ```server-type``` away from being apache, to anything you like, and it will not try to copy the .htaccess to the root of the server.


## Post install scripts

### Post composer install/update
After every install of every composer item [theme, plugin, core], the composer scripts will look into the directory 
```/events/install``` or ```/events/update``` for a bash script or a php script with the corresponding name that matches the name of the item installed. 

If its a Bash script (.sh) file found, it will try to run it with three arguments on the command line. 
```
./script-being-run.sh [/absolute/path/to/server] [wordpress-type] [server-type]
```
Most scripts will only ever use the first argument. 

If its a php file that is found, it will ```require()``` it, thus giving you scope to do whatever you want with php. 

**note** : after installing or updating WordPress core, it will try to run ``` wp core update-db ``` so that the db schema is up to date, this will only work if you have WP CLI installed.

### Patching
There are many times that you find a problem with an item [plugin, theme, core] where it does not perform as expected.  So like the good person you are, you create a fork on git up and a Pull Request, or perhaps sumbit a track ticket
with the fix included. BUT..... after many months your fix is still not inclueded, and you fear you will have to update the codebase by hand after every install..... Well, you don't have to.

Here is an example. I created this [pull request/commit](https://github.com/alordiel/dropdown-multisite-selector/pull/14/commits/8cd1bb018a4d0a2bbc7b2b88770f3e795adc128a) for the plugin "dropdown-multisite-selector", because the apply filters did not actually save the output to a varable that could be used. 

Its now October 2021, and I made this pull request in June 2021. 

Its super simple to apply this patch after every time this plugin is installed by editing the composer.patches.json file and adding the relevent wp packigest info, and the link to the commit with the extension of .patch at the end

```
{
    "patches": {
 	"wpackagist-plugin/dropdown-multisite-selector" : "https://github.com/alordiel/dropdown-multisite-selector/pull/14/commits/8cd1bb018a4d0a2bbc7b2b88770f3e795adc128a.patch"
    }
}
```

Alternatively you can create your own DIFF of code and keep it locally in the patches directory and reference it as a file not a url.  

The good news is, if the person who owns the codebase finally updates to include your code, the patch will fail gracefully and not be applied. The bad news is, if they change other code that changes the row numbers, this will break the patch. But if you keep the code base version number locked, this will never be an issue that you can't test first before deployment to production. 

### Robots.txt

In the ```/files``` directory, there is a robots.txt file that will automatically be copied into the webroot on ```composer install```, you can edit this to have things like your sitemap directive if you want to use this in your CI/CD deployments. If this means nothing to you, just know this is a standard robots.txt file that tells search engines and other bots what they should and should not look at. 
**note**: This will not overwite an existing robots.txt if there is one there. 

### .htaccess
In the ```/files``` directory, there is a number of different .htaccess files. These will automatically copy the correct htaccess for your server type and WordPress install type, as defined in the composer.json.  If you are not running an apache server (as defined in the composer.json) it will not copy anything.  These htaccess copies in the files directory are named based on your purpose [single, (multisute)subdirectory, (multisite)subdomain].  
**note**: This will not overwrite an existing .htaccess if there is one there, and if your server is listed as not being of type apache it will not even attempt anything

## Developer/Release tools

### Generating a .gitignore
There is a pair of command line tools that will automattically create a .gitignore file for you.  

#### When you are only running themes or plugins that are available on WordPress.org
This will exclude the entire /wp-content/plugins, /wp-content/themes, /wp-content/uploads, /wp-adming, /wp-includes  directories and the root directory files.
```
npm run org
```
#### When you have premium plugins or self created themes or plugins
Very similar to above, except it checks for the composer installed plugins or themes and specifically names them, so that for example

/wp-content/plugins/akismet
/wp-content/themes/twentytwenty

are added to the .gitignore, but your premium plugins or themes, or anything else **not** listed as a dependency in the composer.json is not added to the .gitignore file

```
npm run custom
```

These have been created as a startpoint for those that use git and want to build the codebase on the server rather than have everything in the repo.

It if ofter necessary for premium plugins to be in the repo rather than composer, so that they can be updated properly. 

You might want to add extra directories to this .gitignore, such as /wp-content/cache, just go for it.  These tools are here to help you create the first .gitignore, and as destructive in nature, so if you run them again they will overwrite things that were there before.

**note** : Both scripts add a file called settings.php to the .gitignore

### Suggestion on wp-config.php

I really recommend that when you create the wp-config.php you put it a directory above the web root. I personally use a settings.php file in the root of the project to hold all the db info.  This makes it easy for many developers to work on the same project with differing credentials. 

All you need to do is something like this in the wp-config.php

```
if(file_exists('settings.php'){
    require 'settings.php';
} else {

// standard WordPress credentials as a fallback
}
```


