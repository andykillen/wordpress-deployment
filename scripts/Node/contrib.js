const fs = require('fs');

let rawdata = fs.readFileSync('composer.json');
let output = JSON.parse(rawdata);
let required = output.require;
let serverDirectory = output.extra['wordpress-install-dir'];

let gitignore = '';

function appendLine(text) {
    gitignore += text + "\n";
}

appendLine("# package managers");
appendLine("node_modules");
appendLine("vendor");
appendLine("# wordpress directories");
appendLine(serverDirectory + "/wp-admin");
appendLine(serverDirectory + "/wp-includes");
appendLine(serverDirectory + "/wp-content/themes");
appendLine(serverDirectory + "/wp-content/plugins");
appendLine(serverDirectory + "/wp-content/uploads");

appendLine("# WordPress root directory items installed by composer")

fs.readdirSync( serverDirectory).forEach(file => {
    if (file !== '.htaccess' && file !== 'wp-config.php' && file != 'robots.txt' ) {
        appendLine( serverDirectory + "/" + file );
    }
});

appendLine("# settings file");
appendLine("settings.php");

fs.writeFileSync('.gitignore',gitignore);