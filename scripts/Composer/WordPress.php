<?php

namespace Deployments\Composer;

use Composer\Script\Event;
use Composer\Installer\PackageEvent;

/**
 * Class WordPressInstall.
 *
 * @package RnwMedia\composer
 */
class WordPress {

  protected static $loadable = [ '.php', '.sh' ];
  /**
   * Add version info to info.yml of RNW Media Drupal packages.
   *
   * @param \Composer\Installer\PackageEvent $event
   *   The Post Package Install event.
   */
  public static function postPackageInstall(PackageEvent $event) 
  {
    self::afterEventScript($event, 'install');
  }

  public static function postPackageUpdate(PackageEvent $event)
  {
      self::afterEventScript($event, 'update');
  }

  protected static function afterEventScript(PackageEvent $event, $event_type ) 
  {
    $operation = $event->getOperation();

    $package = method_exists($operation, 'getPackage')
        ? $operation->getPackage()
        : $operation->getInitialPackage();

    $packageName = explode("/", $package->getName() )[1];  
    
    $vendor_dir = $event->getComposer()->getConfig()->get('vendor-dir');

    $extra = $event->getComposer()->getPackage()->getExtra();

    $web_root = $extra['wordpress-install-dir'];

    if(isset($extra['server-type'])) {
      $server = $extra['server-type'];
    } else {
      $server = 'apache';
    }

    if(isset($extra['wordpress-type'])) {
      $wordpress_type = $extra['wordpress-type'];
    } else {
      $wordpress_type = 'single';
    }
    
    $wordpress_dir = str_replace('vendor', $web_root, $vendor_dir);

    $events_dir = str_replace('vendor','events', $vendor_dir);

    $try_file = "$events_dir/$event_type/$packageName";
    
    foreach( self::$loadable as $filetype) {

      if( file_exists($try_file . $filetype) ) {
        
         switch($filetype){
            case '.php':
              require_once($try_file . $filetype);
            break;
            case '.sh':
              $command = "{$try_file}{$filetype}  {$wordpress_dir} {$wordpress_type} {$server}";
              shell_exec($command);
            break;
         }

      }

    }

  }

}
