import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { FirebaseRemoteConfig } from '@capacitor-firebase/remote-config';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  async ngOnInit() {
    try {
      await FirebaseRemoteConfig.setSettings({
        minimumFetchIntervalInSeconds: 0,
      });

      await FirebaseRemoteConfig.fetchConfig();
      await FirebaseRemoteConfig.activate();

      const result = await FirebaseRemoteConfig.getString({
        key: 'welcome_message',
      });

      console.log('REMOTE CONFIG:', result.value);
    } catch (error) {
      console.error('REMOTE CONFIG ERROR:', error);
    }
  }
}
