const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
// const axios = require('axios');
const chalk = require('chalk');
// const isEqual = require('lodash.isequal');
// const SimpleTable = require('cli-simple-table');
// const uniqWith = require('lodash.uniqwith');

const withoutExtension = (filename) => filename.replace(/\.[^/.]+$/, '');

// most basic implmentation of our cache
exports.getCache = () => new Map();

exports.getLocalYamlSettings = async (configDir) => {
  // settings are in `.settings.yaml` in ${configDir} folder
  if (configDir.contents.indexOf('.settings.yaml') > -1) {
    const settings_path = path.join(process.cwd(), configDir.name, '.settings.yaml');
    try {
      return yaml.load(fs.readFileSync(settings_path));
    } catch (error) {
      console.log(chalk.redBright(`JS_YAML ERROR: Error while attempting to parse ${settings_path}`));
    }
  }
  return {};
};

exports.getLocalYamlZones = async (configDir, cache) => {
  // fetch list of all zones defined in yaml configuration
  const zoneFiles = configDir.contents.map((filename) => {
    if (filename[0] !== '.') {
      return filename;
    }
    return false;
  }).filter((r) => r);
  // merge the data into the cache
  zoneFiles.forEach((filename) => {
    const zone = withoutExtension(filename);
    const description = yaml.load(fs.readFileSync(path.join(process.cwd(), configDir.name, filename)));
    // console.log(description);
    // const value = cache.get(zone);
    // if (value) {
    //   cache.set(zone, { ...value, yaml: description });
    // } else {
    //   cache.set(zone, { yaml: description });
    // }
    cache.store(zone, { yaml: description });
  });
};
