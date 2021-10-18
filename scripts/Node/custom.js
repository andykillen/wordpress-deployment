const fs = require('fs');

let rawdata = fs.readFileSync('composer.json');
let output = JSON.parse(rawdata);
let required = output.require;
let serverDirectory = output.extra['wordpress-install-dir'];

let gitignore = '';

function checkIfPluginOrTheme(stub) {
    ['themes', 'plugins'].map(dir => {
        let path = serverDirectory + "/wp-content/"+dir+"/" + stub;

        if (fs.existsSync(path)) {
            appendLine(path);
        }
    })
}

function appendLine(text) {
    gitignore += text + "\n";
}

appendLine("# package managers");
appendLine("node_modules");
appendLine("vendor");
appendLine("# uploads directory");
appendLine(serverDirectory + "/wp-content/uploads");
appendLine("# wordpress directories");
appendLine(serverDirectory + "/wp-admin");
appendLine(serverDirectory + "/wp-includes");
appendLine("# composer explicitly installed themes and plugins");

for (const [key] of Object.entries(required)) {    
    checkIfPluginOrTheme(key.split("/")[1]);     
}

appendLine("# WordPress root directory items installed by composer")

fs.readdirSync( serverDirectory).forEach(file => {
    if (file !== '.htaccess' && file !== 'wp-config.php' && file != 'robots.txt' ) {
        appendLine( serverDirectory + "/" + file );
    }
});

appendLine("# settings file");
appendLine("settings.php");

fs.writeFileSync('.gitignore',gitignore);