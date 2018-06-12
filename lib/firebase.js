const client = require('firebase-tools');
const { exec } = require('child_process');
const cmd = require('node-cmd');
const pkg = require('../package.json');
const Configstore = require('configstore');
const CLI = require('clui');

const { Spinner } = CLI;
const conf = new Configstore(pkg.name);

module.exports = {
  getStoredFBToken: () => conf.get('firebase.token'),
  async setFBToken(resolve) {
    console.log('Launching Firebase authentication in the browser...');
    await cmd.get('firebase login:ci --interactive', (err, data, stderr) => {
      if (!err) {
        const token = data.slice(data.indexOf('server:') + 8, data.indexOf('Example')).trim();
        console.log('Your token:', token);
        conf.set('firebase.token', token);
        resolve(token);
        // return token;
      } else console.log('Error:', err);
    });
  },
  installFB() { // TODO: check if FB installed first
    const status = new Spinner('Installing/Updating Firebase...');
    status.start();
    exec('npm install -g firebase-tools', (err, stdout, stderr) => {
      if (stderr) {
        console.error(`exec error: ${stderr}`);
        return;
      }
      status.stop();
      console.log('Installed Firebase');
      this.FBLogin();
    });
  },
  async FBLogin(projectDirName) {
    // Run getStoredFBToken to check for token
    let token = this.getStoredFBToken();
    if (!token) {
      let promise = new Promise((resolve, reject) => {
        this.setFBToken(resolve);
      });
      token = await promise;
    }
    process.env.FIREBASE_TOKEN = token;
    this.useAdd(projectDirName);
    // setFBToken based on token check
    // if (!token) token = await this.setFBToken();
    // assign process env FIREBASE_TOKEN to token
    // process.env.FIREBASE_TOKEN = token;
    // await this.useAdd(projectDirName);
  },
  useAdd(projectDirName) {
    console.log('Doing use add');
    cmd.get('yes | firebase use --add --interactive', (err, data, stderr) => {
      if (!err) {
        console.log(`We good bruh: ${process.cwd()}`);
        this.deploy(projectDirName);
    }
      else console.log('Error:', err);
    });
  },
  deploy(projectDirName) {
    client.deploy({
      project: projectDirName,
      token: process.env.FIREBASE_TOKEN,
      cwd: process.cwd(),
    }).then(() => {
      console.log(`${projectDirName} has been deployed at: https://${projectDirName}.firebaseapp.com 😊`);
      process.exit();
    }).catch((err) => {
      // handle error
      console.log(`Unable to deploy 😔. Error: ${err}`);
    });
  },
};