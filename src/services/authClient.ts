import { Storage } from './storage';

type AuthenticatedUser = {
  username?: string;
  requestToken?: string;
  accessToken?: string;
};

type AuthConfig = {
  baseUrl: string;
  consumerKey: string;
  redirectUri: string;
};

type HttpOptions = {
  useAuth?: boolean;
  contentType?: string;
  responseType?: 'json' | 'text' | 'blob';
};

type ApiResponse<T> = {
  data: T;
  errors: any[];
};

export class AuthClient {
  private static config: AuthConfig = {
    consumerKey: '103442-1856441b1eb8ddc18f59334',
    baseUrl:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:8100/https://getpocket.com'
        : 'https://getpocket.com',
    redirectUri:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000/#/oauth'
        : 'https://pock.nothing.dev/oauth',
  };

  // Helpers

  public static buildApiUrl(path: string): URL {
    return new URL(`${this.config.baseUrl}${path}`);
  }

  // User

  private static _user: AuthenticatedUser | null = null;

  public static get user() {
    return this._user || Storage.getItem('pock_authenticated_user') || null;
  }

  public static set user(val: AuthenticatedUser | null) {
    this._user = val;
    Storage.setItem('pock_authenticated_user', val);
  }

  public static async logout(): Promise<void> {
    console.log('logout');
    this.user = null;
  }

  public static getUser(): AuthenticatedUser {
    if (!this.user) {
      throw new Error('User is not defined');
    }

    return this.user;
  }

  // Authentication

  private static async getRequestToken(): Promise<void> {
    const result = await this.httpPost<{ code: string }>(
      this.buildApiUrl('/v3/oauth/request').toString(),
      {
        consumer_key: this.config.consumerKey,
        redirect_uri: this.config.redirectUri,
      },
      { contentType: 'application/json', responseType: 'json', useAuth: false }
    );

    this.user = {
      requestToken: result.code,
    };
  }

  public static async buildLoginUrl(): Promise<string> {
    await this.getRequestToken();

    const url = new URL('https://getpocket.com/auth/authorize');
    url.searchParams.append('request_token', this.user.requestToken);
    url.searchParams.append('redirect_uri', this.config.redirectUri);
    url.searchParams.append('mobile', '1');

    return url.toString();
  }

  static async getAccessToken(): Promise<void> {
    const tokens = await this.httpPost<any>(
      this.buildApiUrl(`/v3/oauth/authorize`).toString(),
      {
        consumer_key: this.config.consumerKey,
        code: this.user.requestToken,
      },
      {
        useAuth: false,
        contentType: 'application/json',
        responseType: 'json',
      }
    );

    this.user = {
      ...this.user,
      username: tokens.username,
      accessToken: tokens.access_token,
    };
  }

  // HTTP Methods

  static httpGet<T>(url: string, options?: HttpOptions): Promise<T> {
    const opts: HttpOptions = {
      useAuth: options?.useAuth ?? true,
      contentType: options?.contentType ?? 'application/json',
      responseType: options?.responseType ?? 'json',
    };

    return new Promise(async (resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const xhr: XMLHttpRequest = new (XMLHttpRequest as any)({
        mozSystem: true,
      });
      if (options?.responseType === 'blob') {
        xhr.responseType = 'blob';
      }
      xhr.addEventListener('load', () => {
        if (xhr.status >= 400) {
          return reject({
            statusCode: xhr.status,
            message: `Failed to GET ${url}`,
          });
        }

        if (opts?.responseType === 'text') {
          resolve(xhr.response);
        } else {
          resolve(JSON.parse(xhr.response));
        }
      });
      xhr.addEventListener('error', () => reject({ message: `Failed to GET ${url}` }));
      xhr.open('GET', url, true);
      if (opts?.useAuth) {
        const user = this.getUser();
        xhr.setRequestHeader('Authorization', `Bearer ${user.accessToken}`);
      }
      if (opts?.contentType) {
        xhr.setRequestHeader('Content-Type', opts.contentType);
        xhr.setRequestHeader('X-Accept', opts.contentType);
      }
      xhr.send();
    });
  }

  static httpPost<T>(url: string, body: any, options?: HttpOptions): Promise<T> {
    const opts: HttpOptions = {
      useAuth: options?.useAuth ?? true,
      contentType: options?.contentType ?? 'application/json',
      responseType: options?.responseType ?? 'json',
    };

    return new Promise(async (resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const xhr: XMLHttpRequest = new (XMLHttpRequest as any)({
        mozSystem: true,
      });
      xhr.addEventListener('load', () => {
        if (xhr.status >= 400) {
          return reject({
            statusCode: xhr.status,
            message: `Failed to POST ${url}`,
          });
        }

        resolve(JSON.parse(xhr.response));
      });
      xhr.addEventListener('error', () => reject({ message: `Failed to POST ${url}` }));
      xhr.open('POST', url, true);
      if (opts?.useAuth) {
        const user = this.getUser();
        body = {
          ...body,
          consumer_key: this.config.consumerKey,
          access_token: user.accessToken,
        };
      }
      if (opts?.contentType) {
        xhr.setRequestHeader('Content-Type', opts.contentType);
        xhr.setRequestHeader('X-Accept', opts.contentType);
      }
      xhr.send(opts.contentType === 'application/json' ? JSON.stringify(body) : body);
    });
  }

  static httpDelete<T>(url: string, options?: HttpOptions): Promise<T> {
    const opts: HttpOptions = {
      useAuth: options?.useAuth ?? true,
      contentType: options?.contentType ?? 'application/json',
      responseType: options?.responseType ?? 'json',
    };

    return new Promise(async (resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const xhr: XMLHttpRequest = new (XMLHttpRequest as any)({
        mozSystem: true,
      });
      xhr.addEventListener('load', () => {
        if (xhr.status >= 400) {
          return reject({
            statusCode: xhr.status,
            message: `Failed to DELETE ${url}`,
          });
        }

        resolve(JSON.parse(xhr.response));
      });
      xhr.addEventListener('error', () => reject({ message: `Failed to DELETE ${url}` }));
      xhr.open('DELETE', url, true);
      if (opts?.useAuth) {
        const user = this.getUser();
        xhr.setRequestHeader('Authorization', `Bearer ${user.accessToken}`);
      }
      if (opts?.contentType) {
        xhr.setRequestHeader('Content-Type', opts.contentType);
        xhr.setRequestHeader('X-Accept', opts.contentType);
      }
      xhr.send();
    });
  }
}
