import { AuthClient } from './authClient';
import { Database } from './database';

const database = new Database();

export class System {
  static async logout(): Promise<void> {
    await database.delete();
    AuthClient.logout();
    localStorage.clear();
  }
}
