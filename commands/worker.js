const fs = require('fs');
const path = require('path');

const axios = require('axios');
const chalk = require('chalk');
const YAML = require('js-yaml');
const { exit } = require('process');

// foundational HTTP setup to Cloudflare's API
axios.defaults.baseURL = 'https://api.cloudflare.com/client/v4'; 

/**
 * Describe a redirect as a YAML file
 */
exports.command = ['worker <domain>'];
exports.describe = 'Setup a Cloudflare Worker for these redirects';
exports.builder = (yargs) => yargs.demandOption('configDir')
  .positional('domain', {
    describe: 'Domain to redirect',
    type: 'string'
  });
exports.handler = async (argv) => {
  // Check 
  axios.defaults.headers.common.Authorization = `Bearer ${argv.cloudflareToken}`;

  const { configDir, domain } = argv;
  // open the redirects file
  const filepath = path.join(configDir.name, `${domain}.yaml`);
  const description = YAML.load(fs.readFileSync(filepath));

  try {
    let data;

    // Get zone id
    ({ data } = await axios.get(`/zones?name=${domain}`));
    if (data.result.length === 0) {
      console.error('ERROR: No matching domain found!');
      exit(1);
    }
    if (data.result.length > 1) {
      console.error(`ERROR: Multiple domains found! result = ${data.result}`);
      exit(1);
    }
    let zone_id = data.result[0].id;

    // Store the KV redirect values
    // TODO: check (earlier than here!) whether WR_WORKER_KV_NAMESPACE is set
    ({ data } = await axios.put(`/accounts/${argv.accountId}/storage/kv/namespaces/${argv.workerKvNamespace}/values/${domain}`, description));
    if (data.success) {
      console.log('Redirect description stored in Key Value storage successfully!');
    } else {
      console.error('FAILED to store the redirect description in Key Value storage!');
      exit(1);
    }

    // TODO: handle situations where more than just `www` and the apex redirect
    [domain, `www.${domain}`].forEach(async (hostname) => {
      // setup the Worker route or Worker custom domain
      ({data} = await axios.put(`/accounts/${argv.accountId}/workers/domains`, {
        zone_id,
        hostname,
        service: 'redir',
        environment: 'production'
      }));
      if (data.success) {
        console.log(`Setup ${hostname} to point to the ${chalk.bold('redir')} Worker.`);
      } else {
        console.error(`FAILED to create custom domain for ${hostname}!`);
      }
    });

  } catch(err) {
    if (err.response) {
      console.error(`ERROR: Response = ${err.response.status} ${err.response.statusText}; Request = ${err.response.config.method.toUpperCase()} ${err.response.config.url}`);
    } else {
      console.error(err);
    }
  }

};
