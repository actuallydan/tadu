App.info({
	id: 'com.herokuapp.tadu',
	name: 'Tadu',
	description: 'The Sensible Scheduler',
	author: 'Dan Kral',
	email: 'dankral01@gmail.com',
	website: 'http://tadu.herokuapp.com'
});
// Set up resources such as icons and launch screens.
App.icons({
	'iphone_2x': 'public/img/iOS/Resources/icons/Icon-60@2x.png',
	'iphone_3x': 'public/img/iOS/Resources/icons/Icon-60@3x.png',
	'android_mdpi' : 'public/img/Android/res/drawable-mdpi/icon.png',
	'android_hdpi' : 'public/img/Android/res/drawable-hdpi/icon.png',
	'android_xhdpi' : 'public/img/Android/res/drawable-xhdpi/icon.png',
	'android_xxhdpi' : 'public/img/Android/res/drawable-xxhdpi/icon.png',
	'android_xxxhdpi' : 'public/img/Android/res/drawable-xxxhdpi/icon.png',
  // More screen sizes and platforms...
});
// App.icons({
// 	'iphone_2x' : '/img/iOS/icon-120.png';
// 'iphone_3x' : '/img/iOS/icon-180.png';
// 'ipad' : '/img/iOS/icon-76.png';
// 'ipad_2x' : '/img/iOS/icon-152.png';
// 'ipad_pro' : '/img/iOS/icon-167.png';
// 'ios_settings' : '/img/iOS/icon-29.png';
// 'ios_settings_2x' : '/img/iOS/icon-58.png';
// 'ios_settings_3x' : '/img/iOS/icon-87.png';
// 'ios_spotlight' : '/img/iOS/icon-40.png';
// 'ios_spotlight_2x' : '/img/iOS/icon-80.png';
// 'android_mdpi' : '/img/android/icon-48.png';
// 'android_hdpi' : '/img/android/icon-72.png';
// 'android_xhdpi' : '/img/android/icon-96.png';
// 'android_xxhdpi' : '/img/android/icon-144.png';
// 'android_xxxhdpi' : '/img/android/icon-192.png';
//   // More screen sizes and platforms...
// });
App.launchScreens({
	'iphone5': 'public/img/TaduLaunch.png',
	'iphone6': 'public/img/TaduLaunch.png',
	'iphone6p_portrait' : 'public/img/TaduLaunch.png',
	'iphone_2x': 'public/img/TaduLaunch.png',
  // More screen sizes and platforms...
});

App.setPreference('StatusBarOverlaysWebView', 'false');
App.setPreference('StatusBarBackgroundColor', '#242424');
App.setPreference("StatusBarStyle", "lightcontent");