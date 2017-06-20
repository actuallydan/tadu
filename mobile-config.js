App.info({
	id: 'com.herokuapp.tadu',
	name: 'Tadu',
	description: 'The Sensible Scheduler',
	author: 'Dan Kral',
	email: 'dankral01@gmail.com',
	website: 'http://tadu.herokuapp.com'
});

App.icons({
	'iphone_2x' : 'public/img/app-icon/tadu_logo-120.jpg',
	'iphone_3x' : 'public/img/app-icon/tadu_logo-180.jpg',
	'ipad' : 'public/img/app-icon/tadu_logo-76.jpg',
	'ipad_2x' : 'public/img/app-icon/tadu_logo-152.jpg',
	'ipad_pro' : 'public/img/app-icon/tadu_logo-167.jpg',
	'ios_settings' : 'public/img/app-icon/tadu_logo-29.jpg',
	'ios_settings_2x' : 'public/img/app-icon/tadu_logo-58.jpg',
	'ios_settings_3x' : 'public/img/app-icon/tadu_logo-87.jpg',
	'ios_spotlight' : 'public/img/app-icon/tadu_logo-40.jpg',
	'ios_spotlight_2x' : 'public/img/app-icon/tadu_logo-80.jpg',
	'android_mdpi' : 'public/img/app-icon/tadu_logo-48.jpg',
	'android_hdpi' : 'public/img/app-icon/tadu_logo-72.jpg',
	'android_xhdpi' : 'public/img/app-icon/tadu_logo-96.jpg',
	'android_xxhdpi' : 'public/img/app-icon/tadu_logo-144.jpg',
	'android_xxxhdpi' : 'public/img/app-icon/tadu_logo-192.jpg',
});
App.launchScreens({
	'iphone_2x' : 'public/img/launch-screens/tadu-launch-640x960.jpg',
	'iphone5' : 'public/img/launch-screens/tadu-launch-640x1136.jpg',
	'iphone6' : 'public/img/launch-screens/tadu-launch-750x1334.jpg',
	'iphone6p_portrait' : 'public/img/launch-screens/tadu-launch-1242x2208.jpg',
	'iphone6p_landscape' : 'public/img/launch-screens/tadu-launch-2208x1242.jpg',
	'ipad_portrait' : 'public/img/launch-screens/tadu-launch-768x1024.jpg',
	'ipad_portrait_2x' : 'public/img/launch-screens/tadu-launch-1536x2048.jpg',
	'ipad_landscape' : 'public/img/launch-screens/tadu-launch-1024x768.jpg',
	'ipad_landscape_2x' : 'public/img/launch-screens/tadu-launch-2048x1536.jpg',
	'android_mdpi_portrait' : 'public/img/launch-screens/tadu-launch-320x470.jpg',
	'android_mdpi_landscape' : 'public/img/launch-screens/tadu-launch-470x320.jpg',
	'android_hdpi_portrait' : 'public/img/launch-screens/tadu-launch-480x640.jpg',
	'android_hdpi_landscape' : 'public/img/launch-screens/tadu-launch-640x480.jpg',
	'android_xhdpi_portrait' : 'public/img/launch-screens/tadu-launch-720x960.jpg',
	'android_xhdpi_landscape' : 'public/img/launch-screens/tadu-launch-960x720.jpg',
	'android_xxhdpi_portrait' : 'public/img/launch-screens/tadu-launch-1080x1440.jpg',
	'android_xxhdpi_landscape' : 'public/img/launch-screens/tadu-launch-1440x1080.jpg',
});

App.setPreference('StatusBarOverlaysWebView', 'false');
App.setPreference('StatusBarBackgroundColor', '#242424');
App.setPreference("StatusBarStyle", "lightcontent");