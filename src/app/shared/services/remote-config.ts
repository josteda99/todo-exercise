import { Injectable } from '@angular/core';
import { FirebaseRemoteConfig } from '@capacitor-firebase/remote-config';

@Injectable({
  providedIn: 'root',
})
export class RemoteConfig {
  async initialize(): Promise<void> {
    await FirebaseRemoteConfig.setDefaults({
      defaults: {
        show_reset_storage: false,
      },
    });
    await FirebaseRemoteConfig.setSettings({
      minimumFetchIntervalInSeconds: 0,
    });

    await FirebaseRemoteConfig.fetchConfig();
    await FirebaseRemoteConfig.activate();
  }

  async getBoolean(key: string): Promise<boolean> {
    const result = await FirebaseRemoteConfig.getBoolean({
      key,
    });

    return result.value;
  }

  async getString(key: string): Promise<string> {
    const result = await FirebaseRemoteConfig.getString({
      key,
    });

    return result.value;
  }
}
