# Todo exercise

min requirements

- Implement small store with Ngrx and signals✔️
- Create task✔️
- Edit task✔️
- Delete task✔️
- Check/Uncheck task✔️
- Create category✔️
- Edit category✔️
- Delete category✔️
- Filter by category✔️
- Add category in task✔️
- implement persistance with firestore✔️
- infinite scroll (I impelment a small part in completed tasks, this improve a little bit the performance in UI but in reality, I should implement like pagination with firestore, however for a todo app I dont see necesary implement in that way, but exist the posibility. note: I use AI for test and implement a small version of infity scroll) ✔️

- exhaust manual testing✔️
- show all categories with chips???✔️

- Compile android and ios with cordoba

- firebase✔️
- feature flag remote config✔️
- demo✔️

#### Cream

- unit tests⌛
- i11n⌛
- progress✔️
- reaminig✔️
- security (I dont have so much time but I would implement something with firebase and use JWT)

### take in account

- lazy loading (by default and only 1 route)✔️
- large lists✔️
- onPush✔️
- memory optimization🤔

cordova doenst works well, I decided to change to capacitor, ionic recomended so here there are the steps

1. ionic build
2. npx cap add android
3. npx cap sync
4. npx cap run android

### To send

- APK✔️
- IPA (I could not generate this file) 😓
- repository✔️
- screenshot or videos✔️
- answer questions✔️

## VIDEO DEMO

[video Demo](https://youtube.com/shorts/qpIGRG1l9uYs)

## APK

[Apk](https://drive.google.com/drive/folders/1GV4coeaB6pFbypyVxeEaGXcj02pDxpjT?usp=sharing)

## QUESTIONS

- ¿Cuáles fueron los principales desafíos que enfrentaste al implementar
  las nuevas funcionalidades?: nunca había trabajado con remote config, sin embargo con documentacion y seguir tutoriales se logro el objetivo, por otra parte, cordova no me funciono, intente muchas maneras sin embargo decidí usar capacitor ya que es lo recomendable por las mismas personas de Ionic, por último el tema de IOS, intente varias maneras, con servicios en la nube, máquinas virtuales y no lo logre.
- ¿Qué técnicas de optimización de rendimiento aplicaste y por qué?: Implemente standalone components para reducir boilerplate, trackBy en las listas para decirle a angular que cambiar específicamente y no toda la lista en general además de tener en cuenta de que la app en si es basada en listas, lazy loading para las rutas para cargar solo lo que sea necesario (quería implementar otra ruta llamada history pero quedará para otra ocasión), implemente un infinite scroll aunque falto unirlo con la parte de Firestore por último la optimización más importante es changeDetection On push para cambiar solo necesario y uso de signals para mejor rendimiento.
- ¿Cómo aseguramos la calidad y mantenibilidad del código?: Utilizando las últimas implementaciones de angular, signals, onPush, zoneless, standalone components, lazyLoading, etc, con esto me aseguro la calidad del código, con respecto a la mantenibilidad, la arquitectura que seguí fue la más básica dividida por services, separando responsabilidades, nombrando funciones y variables de la mejor manera, agregando comentarios para mejor entendimiento, usando interfaces, entre otros.
