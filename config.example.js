/**
 * Example configuration for the angularSocialSignin provider.
 *
 * Copy the shape of this object into your application and pass it to
 * angularSocialSigninProvider.setConfig(config) inside a module .config() block:
 *
 *   angular.module('myApp', ['angular-social-signin'])
 *     .config(function(angularSocialSigninProvider) {
 *       angularSocialSigninProvider.setConfig({
 *         google: { id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' },
 *         facebook: { id: 'YOUR_FACEBOOK_APP_ID' }
 *       });
 *     });
 *
 * Both google.id and facebook.id are required; setConfig throws if either is
 * missing.
 */
'use strict';

var angularSocialSigninConfig = {
  google: {
    // OAuth 2.0 client ID from https://console.developers.google.com/apis/credentials
    id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
  },
  facebook: {
    // App ID from https://developers.facebook.com/apps
    id: 'YOUR_FACEBOOK_APP_ID'
  }
};