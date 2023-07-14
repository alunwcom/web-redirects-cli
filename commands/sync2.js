/*
 * @copyright 2023 John Wiley & Sons, Inc.
 * @license MIT
 */
// const axios = require('axios');
// const chalk = require('chalk');
// const fs = require('fs');
// const path = require('path');
// const inquirer = require('inquirer');
// const { isEqual } = require('lodash/fp');
const shared = require('../lib/shared2');
const ZoneCache = require('../lib/ZoneCache');
// const { CLOUDFLARE_BASE_URL } = require('../lib/global');
// const withoutExtension = (filename) => filename.replace(/\.[^/.]+$/, '');
// const in_sync = chalk.green('[OK] ');
// const cross = chalk.red('[MISSING FROM YAML] ');
// const edit = chalk.blue('[UPDATE] ');
// const add = chalk.blue('[TO ADD] ');

exports.command = 'sync2';
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
  console.debug('argv', argv);

  // need a cache module/class which can be augmented later (starting with a simple map)

  // load local config to cache (fail on error - e.g. missing params)
  const localZoneSettings = await shared.getLocalYamlSettings(argv.configDir);
  console.debug('localZoneSettings', localZoneSettings);

  // // fetch list of all zones defined in yaml configuration
  const cache = new ZoneCache();
  shared.getLocalYamlZones(argv.configDir, cache);
  console.debug(cache.getMap());

  // load remote config to cache (fail on error - e.g. missing params/credentials)
  // const zones = await shared.gatherZones(argv.accountId);

  // need to load other data for pluggable modules? do it now.

  // compare data (pluggable modules - interface to be defined)

  // output results (pluggable modules - interface to be defined)

  // update cloudflare (pluggable modules - interface to be defined)

  // opt. persist remote config (pluggable modules - interface to be defined)
};
