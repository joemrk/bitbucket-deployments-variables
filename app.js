import axios from 'axios';
import { readFile } from 'fs/promises';
import * as dotenv from 'dotenv';
dotenv.config();

const targetEnvPath = './target.env';

const getTargetEnv = async () => {
 try {
  const fileData = await readFile(targetEnvPath, 'utf-8');
  const rows = fileData.split('\n');

  if(!rows.length) {
    throw new Error('target.env have no rows');
  }

  return rows;
 } catch (error) {
  throw new Error('can`t read target.env');
 }
};

const mapEnvToRequestObject = (row, secured = false) => {
  const [key, value] = row.split('=');
  return { key, value, secured };
};

;(async () => {
const baseUrl = process.env.BITBUCKET_BASE_URL;
const project = process.env.REPO_PROJECT;
const repoName = process.env.REPO_NAME;
const envId = process.env.ENVIRONMENT_ID;
const bearerToken = process.env.BEARER_TOKEN;
const secured = process.env.SECURED


const env = (await getTargetEnv()).filter(Boolean);
const mappedRows = env.map(e => mapEnvToRequestObject(e, secured));

const reqUrl = `${baseUrl}/internal/repositories/${project}/${repoName}/deployments_config/environments/${envId}/variables/`;
axios.defaults.baseURL = reqUrl;
axios.defaults.headers = {
  Authorization: 'Bearer ' + bearerToken
}

const requests = mappedRows.map(r => axios.post('/', r));

const results = await Promise.all(requests)
results.forEach(r => {
  console.log(r.status);
});
})();

