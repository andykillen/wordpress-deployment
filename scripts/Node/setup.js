const inquirer = require('inquirer');
const {execSync} = require('child_process');

inquirer
  .prompt([
    {
      type: 'list',
      name: 'setup',
      message: 'Which .gitignore file do you want created?\norg = exclude wp-content/themes & plugins directory\ncustom = exclude the actual directories of each theme or plugin composer installed\nnone = do nothing ',
      choices: ['org', 'custom', 'none'],
    },
  ])
  .then(answers => {
     switch(answers.setup){
         case 'org':
            execSync('npm run org'); 
         break;
         case 'custom':
            execSync('npm run custom');
         break;
     }
  });
  