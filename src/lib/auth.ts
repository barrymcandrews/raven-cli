import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails, CognitoUserSession, CognitoRefreshToken,
} from 'amazon-cognito-identity-js';
import * as Config from './config';
import inquirer from 'inquirer';

export interface UserLogin {
  username: string,
  password: string,
}

export class Authenticator {
  cognitoUser!: CognitoUser;
  session!: CognitoUserSession;


  async getSession(): Promise<CognitoUserSession> {
    if (!this.session || !this.cognitoUser) throw Error("Not logged In.");
    if (!this.session.isValid()) this.session = await this.refresh();
    return this.session;
  }


  getUser(): CognitoUser | undefined {
    return this.cognitoUser;
  }


  async refresh(token?: string): Promise<CognitoUserSession> {
    let refreshToken = (!token) ? this.session!.getRefreshToken() : new CognitoRefreshToken({RefreshToken: token});
    this.session = await new Promise<CognitoUserSession>((accept, reject) => {
      this.cognitoUser!.refreshSession(refreshToken, (err, result) => {
        if (err) reject(err);
        else accept(result);
      });
    });
    await this.updateConfig();
    return this.session;
  }


  async authenticate(useToken = true): Promise<CognitoUserSession> {
    if (useToken && this.session) {
      try {
        this.session = await this.refresh();
        return this.session;
      } catch (e) {}
    }

    const config = await Config.getConfig();
    if (useToken && 'refreshToken' in config && 'username' in config) {
      try {
      this.cognitoUser = new CognitoUser({
        Username: config.username!,
        Pool: new CognitoUserPool({
          UserPoolId: config.userPoolId,
          ClientId: config.clientId,
        })
      });
      return await this.refresh(config.refreshToken);
      } catch (e) {}
    }

    let answers = await inquirer.prompt([
      {
        name: 'username',
        message: 'What is your username?',
      },
      {
        name: 'password',
        message: 'What is your password?',
        type: 'password'
      },
    ]);
    return await this.createSession(answers);
  }


  private async updateConfig() {
    await Config.setValues({
      username: this.cognitoUser.getUsername(),
      refreshToken: this.session.getRefreshToken().getToken(),
      idToken: this.session.getIdToken().getJwtToken(),
      accessToken: this.session.getAccessToken().getJwtToken()
    });
  }


  private async createSession(details: UserLogin): Promise<CognitoUserSession> {
    const config = await Config.getConfig();

    this.cognitoUser = new CognitoUser({
      Username: details.username,
      Pool: new CognitoUserPool({
        UserPoolId: config.userPoolId,
        ClientId: config.clientId,
      })
    });

    let authenticationDetails = new AuthenticationDetails({
      Username: details.username,
      Password: details.password,
    });

    this.session = await new Promise<CognitoUserSession>((accept, reject) => {
      this.cognitoUser!.authenticateUser(authenticationDetails, {
        onSuccess: accept,
        onFailure: reject,
      });
    });

    await this.updateConfig();
    return this.session;
  }
}

export const Auth = new Authenticator();
