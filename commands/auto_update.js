/**
 * @copyright 2020 John Wiley & Sons, Inc.
 * @license MIT
 */

const chalk = require('chalk');
const api = require('../lib/api');

/**
 * Fetch available zones/sites in Cloudflare and decide if there
 * are configured redirects that can be updated.
 * 
 * As this is intended to be used for automated redirect updates,
 * it should avoid destructive actions (perhaps depending on runtime parameters).
 * 
 * Perhaps have a dry-run mode? And a 'force' mode?
 * 
 */
exports.command = ['auto_update', 'update'];
exports.describe = 'WIP auto-update redirects where possible';
exports.handler = (argv) => {
  api.getZones(argv)
  .then((all_zones) => {
    all_zones.forEach((zone) => {
      console.log(`${zone.name} [status=${zone.status}, paused=${zone.paused}, type=${zone.type}]`);
      if (zone.status === 'active' && !zone.paused && zone.type === 'full') {
        console.log(`Process redirects...?`)

        const redir_filename = argv.configDir.contents.filter((f) => f.substr(0, zone.name.length) === zone.name)[0];
        if (undefined === redir_filename) {
          console.log(chalk.keyword('purple')(`No redirect description for ${chalk.bold(zone.name)} was found.`));
        } else {
          console.log(`Found redirects?!?!?`)
          // console.log(`${JSON.stringify(zone, null, 2)}`)
        }
      }
    });
  });
}

