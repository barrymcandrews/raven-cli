import * as os from 'os';
import * as fs from 'fs';
import inquirer from 'inquirer';
import jsyaml from 'js-yaml';
import {constants} from 'fs';
import O_CREAT = constants.O_CREAT;
import O_WRONLY = constants.O_WRONLY;

const configPath = os.homedir() + '/.raven';

interface Configuration {
  userPoolId: string,
  clientId: string,
  username?: string,
  idToken?: string,
  accessToken?: string,
  refreshToken?: string,
}
type ConfigurationKey = keyof Configuration;

const defaultConfiguration: Configuration = {
  userPoolId: 'us-east-1_XRj8Hgtje',
  clientId: '1b70rbnqrr76bpqbo8jlgk95rj',
}

let configuration: Configuration;

export async function createConfig() {
  let answers = await inquirer.prompt([
    {
      name: 'customConfig',
      message: 'Would you like to customize the connection settings?',
      type: 'confirm',
      default: false,
    }
  ]);

  const getConnectionSettings = async () => await inquirer.prompt([
    {
      name: 'userPoolId',
      message: 'What is your UserPoolId?',
      default: defaultConfiguration.userPoolId,
    },
    {
      name: 'clientId',
      message: 'What is your ClientId?',
      default: defaultConfiguration.clientId,
    },
  ]);
  configuration = (answers.customConfig) ? await getConnectionSettings() : defaultConfiguration;

  await fs.promises.writeFile(configPath, jsyaml.dump(configuration));
}

export async function ensureConfig() {
  if (fs.existsSync(configPath)) return;
  console.log("No configuration file found (~/.raven)");
  await createConfig();
}

export async function getConfig(): Promise<Configuration> {
  if (!configuration) {
    try {
      let rawFile = await fs.promises.readFile(configPath);
      configuration = jsyaml.load(rawFile.toString());
    } catch (e) {
      return defaultConfiguration;
    }
  }
  return configuration;
}

export async function setValues(values: {[key: string]: string}) {
  if (!configuration) configuration = defaultConfiguration;
  Object.keys(values).forEach(k => {
    configuration[k as ConfigurationKey] = values[k];
  });
  await fs.promises.writeFile(configPath, jsyaml.dump(configuration), {
    flag: O_WRONLY | O_CREAT,
    mode: 0o644
  });
}
