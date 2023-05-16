/*
 * @copyright 2023 John Wiley & Sons, Inc.
 * @license MIT
 */

const axios = require('axios');
const chalk = require('chalk');
const shared = require('../lib/shared');
const { CLOUDFLARE_BASE_URL } = require('../lib/global'); // TODO ...or move constants to index.js

const withoutExtension = (filename) => filename.replace(/\.[^/.]+$/, '');
const tick = chalk.green('\u2713');
const cross = chalk.red('\u2717');
const edit = chalk.blue('✎');

exports.command = 'sync';
exports.describe = 'Check and optionally update domains in the current Cloudflare account';
exports.builder = () => {};
exports.handler = async (argv) => {
  // axios pre-config
  axios.defaults.baseURL = CLOUDFLARE_BASE_URL;
  axios.defaults.headers.common.Authorization = `Bearer ${argv.cloudflareToken}`;
  // fetch list of all zones in account
  const zones = await shared.gatherZones(argv.accountId);
  const zmap = new Map();
  zones.forEach((zone) => zmap.set(zone.name, { cloudflare: zone }));
  // fetch list of all zones defined in configuration
  const zoneFiles = argv.configDir.contents.map((filename) => {
    if (filename[0] !== '.') {
      return filename;
    }
    return false;
  }).filter((r) => r);
  zoneFiles.forEach((filename) => {
    const zone = withoutExtension(filename);
    const value = zmap.get(zone);
    if (value) {
      zmap.set(zone, { ...value, yaml: true });
    } else {
      zmap.set(zone, { yaml: true });
    }
  });
  // output comparison of zones present/not present
  const sortedZmap = new Map([...zmap.entries()].sort());
  sortedZmap.forEach((value, key) => {
    const defined = value.yaml === true;
    const cloudflare = value.cloudflare ? true : false;
    const prefix = defined && cloudflare ? tick : (defined ? edit : cross);

    console.log(`${prefix} ${key} [yaml=${defined}; cf=${cloudflare}]`);
  });
};
