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