# WordPress deployments via composer
The big question to answer is, why use this and not directly John P Bloch excellent work on making [composer work for WordPress](https://github.com/johnpbloch/wordpress).

- Firstly, and most importantly, this removes the need to install WordPress in a sub-directory.
- Auto creates a robots.txt and if needed a .htacces
- setup a proper .gitignore so that it excludes all the right things to allow for deployment via git, with the option to exclude at a composer repo level, or the generic plugins/themes directories 
- includes patching capiblity for those annoying times when a plugin developer is not implementing your fixes
- After composer repo install/update has happened, checks for scripts to run.  Already seutp to ```run wp core db-update``` after a WordPress Core install. Scripts can be php or bash based
- optional settings.php pre-ignored in the root if you want to use it. 

## Most basic usage
### Setup WordPress
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