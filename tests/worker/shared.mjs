import { handleRequest } from "../../worker/index.mjs";
import yaml from "js-yaml";
import path from "path";
import { readFileSync } from "fs";

export const loadRedirectData = async (zone) => {
  // load redirects to test KV
  const filepath = path.join('tests', 'worker', `${zone}.yaml`);
  const description = yaml.load(readFileSync(filepath));
  // 'descriptions' namespace defined in jest.config.js
  await descriptions.put(zone, JSON.stringify(description));
}

const makeRequest = async (url) => {
  const env = getMiniflareBindings();
  const req = new Request(url);
  const res = await handleRequest(req, env);
  let result = {};
  result.status = res.status;
  result.location = res.headers.get('Location');
  return result;
}

export const redirectTest = async (url, expectedLocation, expectedStatus) => {
  let { status, location } = await makeRequest(url);
  expect(status).toBe(expectedStatus);
  expect(location).toBe(expectedLocation);
}
