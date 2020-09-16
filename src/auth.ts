import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails, CognitoUserSession,
} from 'amazon-cognito-identity-js';


let userPool = new CognitoUserPool({
  UserPoolId : 'us-east-1_XRj8Hgtje',
  ClientId : '1b70rbnqrr76bpqbo8jlgk95rj',
});

let cognitoUser: CognitoUser | undefined;
let session: CognitoUserSession | undefined;

export interface AuthDetails {
  username: string,
  password: string,
}


async function createSession(details: AuthDetails): Promise<CognitoUserSession> {
  let authenticationDetails = new AuthenticationDetails({
    Username: details.username,
    Password: details.password,
  });

  cognitoUser = new CognitoUser({
    Username: details.username,
    Pool: userPool
  });

  return new Promise<CognitoUserSession>((accept, reject) => {
    cognitoUser!.authenticateUser(authenticationDetails, {
      onSuccess: accept,
      onFailure: reject,
    });
  });
}

async function refresh(): Promise<CognitoUserSession> {
  return await new Promise<CognitoUserSession>((accept, reject) => {
    cognitoUser!.refreshSession(session!.getRefreshToken(), (err, result) => {
      if (err) reject(err);
      else accept(result);
    });
  });
}

export async function logIn(details: AuthDetails) {
  session = await createSession(details);
  return session;
}

export async function getSession(): Promise<CognitoUserSession> {
  if (!session || !cognitoUser) throw Error("Not logged In.");
  if (!session.isValid()) session = await refresh();
  return session;
}

export function getUser(): CognitoUser | undefined {
  return cognitoUser;
}
