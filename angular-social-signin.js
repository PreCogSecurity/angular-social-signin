'use strict';

angular.module('angular-social-signin', [])
  .provider('angularSocialSignin', function() {

    this.config = {};
    this.setConfig = function (config) {
      if (!config || typeof config !== 'object') {
        throw new Error('angularSocialSigninProvider.setConfig requires a config object');
      }
      if (!config.google || !config.google.id) {
        throw new Error('angularSocialSigninProvider.setConfig requires config.google.id');
      }
      if (!config.facebook || !config.facebook.id) {
        throw new Error('angularSocialSigninProvider.setConfig requires config.facebook.id');
      }
      return this.config = config;
    };
    this.$get = function ($window, $q) {
      var selfModule = this;
      function GoogleSignin() {
          var self = this;

          $window.googleInit = function() {
              gapi.load('auth2', function(){

                  // Load GPlus Client Library. Your Application must enable this API from developer console
                  gapi.client.load('plus','v1').then(function() {
                      // Retrieve the singleton for the GoogleAuth library and setup the client.
                      gapi.auth2.init({
                        client_id: selfModule.config.google.id,
                        cookiepolicy: 'single_host_origin',
                        fetch_basic_profile: false,
                        scope: 'https://www.googleapis.com/auth/plus.login'
                      }).then(function (){
                        self.auth2 = gapi.auth2.getAuthInstance();
                      });
                  });

              });
          };
          (function(d) {
              var js, id = 'google-jssdk', ref = d.getElementsByTagName('script')[0];
              if (d.getElementById(id)) {
                  return;
              }
              js = d.createElement('script');
              js.id = id;
              js.async = true;
              js.defer = true;
              js.src = "https://apis.google.com/js/client:platform.js?onload=googleInit";
              ref.parentNode.insertBefore(js, ref);
          }(document));
      }

      GoogleSignin.prototype = {
        auth2: {},

        signIn: function(params) {
          if (!this.auth2 || typeof this.auth2.signIn !== 'function') {
            return $q.reject(new Error('Google Sign-In SDK is not initialized yet'));
          }
          return this.auth2.signIn(params);
        },

        signOut: function() {
          if (!this.auth2 || typeof this.auth2.signOut !== 'function') {
            return $q.reject(new Error('Google Sign-In SDK is not initialized yet'));
          }
          return this.auth2.signOut();
        },

        grantAccess: function(params) {
          if (!this.auth2 || typeof this.auth2.grantOfflineAccess !== 'function') {
            return $q.reject(new Error('Google Sign-In SDK is not initialized yet'));
          }
          return this.auth2.grantOfflineAccess(params);
        },

        revokeAccess: function(params) {
          if (!this.auth2 || typeof this.auth2.disconnect !== 'function') {
            return $q.reject(new Error('Google Sign-In SDK is not initialized yet'));
          }
          return this.auth2.disconnect(params);
        },

        getProfile: function() {
          if (typeof gapi === 'undefined' || !gapi.client || !gapi.client.plus) {
            return $q.reject(new Error('Google+ API is not loaded yet'));
          }
          return gapi.client.plus.people.get({
            'userId': 'me'
          });
        }
      };

      function FacebookSignin() {
        var self = this;

        // Facebook SDK
        $window.fbAsyncInit = function() {
          FB.init({
              appId: selfModule.config.facebook.id, // App ID
              channelUrl:'/channel.html', // Channel File
              status:true, // check login status
              cookie:true, // enable cookies to allow the server to access the
              // session
              xfbml:true, // parse XFBML
              version: 'v2.4'
          });
          FB.Event.subscribe('auth.authResponseChange', function(response) {
              self.auth2 = response;
          });
        };
        ( function(d) {
            var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement('script');
            js.id = id;
            js.async = true;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            ref.parentNode.insertBefore(js, ref);
        }(document));

      }

      FacebookSignin.prototype = {
        auth2: null,

        signIn: function() {
          var deferred = $q.defer();
          FB.login(function(response) {
            if (response && response.status === 'connected') {
              deferred.resolve(response);
            } else {
              deferred.reject(response);
            }
          }, { scope: 'public_profile,email,user_friends' });
          return deferred.promise;
        },

        signOut: function() {
          var deferred = $q.defer();
          FB.logout(function(response) {
              deferred.resolve(response);
          });
          return deferred.promise;
        },

        getProfile: function() {
          var deferred = $q.defer();
          FB.api('/me', function(response) {
            if (response && response.error) {
              deferred.reject(response);
            } else {
              deferred.resolve(response);
            }
          });
          return deferred.promise;
        }
      };

      return {
        google: new GoogleSignin(),
        facebook: new FacebookSignin()
      };
    };
  });