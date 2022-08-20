export class Device {
  static async openLinkInBrowser(url: string): Promise<void> {
    const result = await this.callActivity('view', { type: 'url', url });
  }

  private static callActivity<T>(name: string, data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const MozActivity = (window as any).MozActivity;
      if (!MozActivity) {
        console.log(`Failed to call ${name} since we're not running on a KaiOS device`);
        return reject(`Failed to call ${name} since we're not running on a KaiOS device`);
      }

      const activity = new MozActivity({
        name,
        data,
      });
      activity.onsuccess = function () {
        resolve(this.result);
      };
      activity.onerror = function () {
        reject();
      };
    });
  }
}
