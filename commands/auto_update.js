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
      // debug: zone details
      // console.log(zone);
      console.log(chalk.grey(`${zone.name} ${zone.id} [status=${zone.status}, paused=${zone.paused}, type=${zone.type}]`));
      if (zone.status === 'active' && !zone.paused && zone.type === 'full') {
        const redir_filename = argv.configDir.contents.filter((f) => f.substr(0, zone.name.length) === zone.name)[0];
        if (undefined === redir_filename) {
          // no redirect description found
          console.log(chalk.magenta.bold(`No redirect description for ${zone.name} was found.`));
        } else {
          // check redirect descriptions
          console.log(chalk.blue.bold(`Check redirect descriptions.`));

          // TODO

          api.getPageRules(argv, zone.id)
          .then((resp) => {
            console.log(resp);
          })

        }
      }
    });
  });

  // TODO list summary of zones without redirects defined?

  // TODO should also list any redirects files that have no active zone
}

