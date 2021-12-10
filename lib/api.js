/*
 * Cloudflare API calls for web-redirects-cli
 */

const axios = require('axios');
const API_PAGE_SIZE = 50;
const API_BASE_URL = 'https://api.cloudflare.com/client/v4';

/*
 * Returns a JSON list of zones from Cloudflare /zones API call.
 */
exports.getZones = (argv) => {
  axios.defaults.baseURL = API_BASE_URL;
  axios.defaults.headers.common.Authorization = `Bearer ${argv.cloudflareToken}`;
  let promise = axios.get(`/zones?per_page=${API_PAGE_SIZE}&account.id=${argv.accountId}`)
  .then((resp) => {
    const all_zones = [];
    resp.data.result.forEach((zone) => {
      all_zones.push(zone);
    });
    if ('result_info' in resp.data) {
      const { per_page, total_count, total_pages } = resp.data.result_info;
      const possible_pages = total_count / per_page;
      if (possible_pages > 1) {
        // get the rest of the pages in one go
        const promises = [...Array(total_pages - 1).keys()]
          .map((i) => axios.get(`/zones?per_page=${API_PAGE_SIZE}&page=${i + 2}&account.id=${argv.accountId}`));
        return Promise.all(promises)
          .then((results) => {
            results.forEach((r) => {
              if (r.status === 200) {
                r.data.result.forEach((zone) => {
                  all_zones.push(zone);
                });
              }
            });
            return all_zones;
          });
      }
    }
    return all_zones;
  })
  return promise;
};
