/*
 * @copyright 2023 John Wiley & Sons, Inc.
 * @license MIT
 */
const axios = require('axios');
const chalk = require('chalk');
// const fs = require('fs');
// const path = require('path');
const inquirer = require('inquirer');
const shared = require('../lib/shared');
const { CLOUDFLARE_BASE_URL } = require('../lib/global'); // TODO ...or move constants to index.js

const withoutExtension = (filename) => filename.replace(/\.[^/.]+$/, '');
const in_sync = chalk.green('[OK] ');
const cross = chalk.red('[MISSING FROM YAML] ');
const edit = chalk.blue('[UPDATE] ');
const add = chalk.blue('[TO ADD] ');
// const tick = chalk.green('\u2713');
// const cross = chalk.red('\u2717');
// const edit = chalk.blue('✎');

const checkSettings = (localSettings, remoteSettings) => {
  // TODO compare values...
  // Object.entries(localSettings).map(([key, value]) => { console.log(`MAP ${key}`) });

  // console.log(localSettings);
  const result = Object.entries(localSettings).map(([key, value]) => {
    // console.log(`${key} => ${value}`);
    // console.log(remoteSettings.filter((obj) => obj.id === key));
    const remoteSetting = remoteSettings.filter((obj) => obj.id === key);
    const remoteValue = remoteSetting.length > 0 ? remoteSetting[0].value : undefined;
    // console.log(remoteValue);
    // console.log(value === remoteValue);
    if (value !== remoteValue) {
      return {
        setting: key,
        match: value === remoteValue
      };
    }
    return {};
  });
  return result;
};

exports.command = 'sync';
exports.describe = 'Check and optionally update domains in the current Cloudflare account';
exports.builder = {
  update: {
    describe: 'Update Cloudflare configuration from YAML configuration.',
    alias: 'u'
  },
  force: {
    describe: 'Don\'t prompt before making updates - just do it!',
    alias: 'f'
  },
  verbose: {
    describe: 'Output verbose data regarding differences.',
    alias: 'v'
  },
  workerKvNamespace: {
  }
};
exports.handler = async (argv) => {
  // DEBUG
  // console.debug('argv', argv);

  // confirm update (TODO should be after displaying differences)
  if (argv.update) {
    const answer = await inquirer.prompt({
      type: 'confirm',
      name: 'update',
      message: `${chalk.yellow('The update parameter is set. Do you want to continue?')}`,
      default: false
    });
    if (!answer.update) {
      console.log('Exiting...');
      process.exit(0);
    }
  }

  // axios pre-config
  axios.defaults.baseURL = CLOUDFLARE_BASE_URL;
  axios.defaults.headers.common.Authorization = `Bearer ${argv.cloudflareToken}`;

  // fetch list of all zones in account
  const zones = await shared.gatherZones(argv.accountId);
  const zmap = new Map();
  zones.forEach((zone) => zmap.set(zone.name, { cloudflare: zone }));

  // fetch list of all zones defined in yaml configuration
  const zoneFiles = argv.configDir.contents.map((filename) => {
    if (filename[0] !== '.') {
      return filename;
    }
    return false;
  }).filter((r) => r);

  // merge the data
  zoneFiles.forEach((filename) => {
    const zone = withoutExtension(filename);
    const value = zmap.get(zone);
    if (value) {
      zmap.set(zone, { ...value, yaml: true });
    } else {
      zmap.set(zone, { yaml: true });
    }
  });

  // get local zone settings
  const localZoneSettings = await shared.getLocalZoneSettings(argv.configDir);

  // output comparison of zones present/not present
  const sortedZmap = new Map([...zmap.entries()].sort());
  sortedZmap.forEach(async (value, key) => {
    // TODO zone comparison
    // 1. is zone in YAML config - if not flag as issue, do nothing more?
    if (!value.yaml) {
      console.log(`${cross} ${key}`);
      return;
    }
    // 2. is zone in cloudflare - if not output yaml config and prompt to add?
    if (!value.cloudflare) {
      console.log(`${add} ${key}`);
      // prompt
      // add
      return;
    }
    // 3. compare config to see if in sync - if not output differences and prompt to update?
    const remoteZoneSettings = await shared.getZoneSettings(value.cloudflare.id);
    // console.log(`value:\n${JSON.stringify(value, null, '  ')}`);
    // console.log(`zone_settings:\n${JSON.stringify(zone_settings, null, '  ')}`);

    const settings_in_sync = checkSettings(localZoneSettings, remoteZoneSettings);
    console.log(settings_in_sync);
    if (!settings_in_sync) {
      console.log(`${edit} ${key}`);
      // 3a. zone settings

      // 3b. zone dns

      // 3c. zone redirects
    }
    // 4. otherwise must be in sync
    console.log(`${in_sync} ${key}`);
  });
};
