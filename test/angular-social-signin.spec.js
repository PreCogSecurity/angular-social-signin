'use strict';

describe('angularSocialSignin provider', function() {
  var service, $rootScope, provider, fakeAuth2, gapiMock, fbMock;

  function createGapiMock() {
    fakeAuth2 = {
      signIn: jasmine.createSpy('auth2.signIn').and.returnValue('signIn-result'),
      signOut: jasmine.createSpy('auth2.signOut').and.returnValue('signOut-result'),
      grantOfflineAccess: jasmine.createSpy('auth2.grantOfflineAccess').and.returnValue('grant-result'),
      disconnect: jasmine.createSpy('auth2.disconnect').and.returnValue('disconnect-result')
    };
    gapiMock = {
      load: jasmine.createSpy('gapi.load').and.callFake(function(apiName, callback) {
        callback();
      }),
      client: {
        load: jasmine.createSpy('gapi.client.load').and.returnValue({
          then: function(callback) {
            callback();
          }
        }),
        plus: {
          people: {
            get: jasmine.createSpy('gapi.client.plus.people.get').and.returnValue('profile-result')
          }
        }
      },
      auth2: {
        init: jasmine.createSpy('gapi.auth2.init').and.returnValue({
          then: function(callback) {
            callback();
          }
        }),
        getAuthInstance: jasmine.createSpy('gapi.auth2.getAuthInstance').and.returnValue(fakeAuth2)
      }
    };
  }

  function createFbMock() {
    fbMock = {
      init: jasmine.createSpy('FB.init'),
      Event: {
        subscribe: jasmine.createSpy('FB.Event.subscribe')
      },
      login: jasmine.createSpy('FB.login'),
      logout: jasmine.createSpy('FB.logout'),
      api: jasmine.createSpy('FB.api')
    };
  }

  beforeEach(function() {
    // Prevent the SDK loader from injecting <script> tags into the document:
    // pretend the SDK scripts are already present.
    var originalGetElementById = document.getElementById.bind(document);
    document.getElementById = function(id) {
      if (id === 'google-jssdk' || id === 'facebook-jssdk') {
        return {};
      }
      return originalGetElementById(id);
    };

    createGapiMock();
    createFbMock();
    window.gapi = gapiMock;
    window.FB = fbMock;

    module('angular-social-signin', function(angularSocialSigninProvider) {
      provider = angularSocialSigninProvider;
      provider.setConfig({
        google: { id: 'google-test-client-id' },
        facebook: { id: 'facebook-test-app-id' }
      });
    });

    inject(function($injector) {
      service = $injector.get('angularSocialSignin');
      $rootScope = $injector.get('$rootScope');
    });
  });

  afterEach(function() {
    delete window.gapi;
    delete window.FB;
    delete window.googleInit;
    delete window.fbAsyncInit;
  });

  describe('setConfig validation', function() {
    it('requires a config object', function() {
      expect(function() { provider.setConfig(); }).toThrow();
      expect(function() { provider.setConfig(null); }).toThrow();
      expect(function() { provider.setConfig('nope'); }).toThrow();
    });

    it('requires google.id and facebook.id', function() {
      expect(function() { provider.setConfig({ google: { id: 'g' } }); }).toThrow();
      expect(function() { provider.setConfig({ facebook: { id: 'f' } }); }).toThrow();
      expect(function() { provider.setConfig({ google: {}, facebook: { id: 'f' } }); }).toThrow();
      expect(function() {
        provider.setConfig({ google: { id: 'g' }, facebook: { id: 'f' } });
      }).not.toThrow();
    });
  });

  describe('GoogleSignin', function() {
    it('exposes a google service instance', function() {
      expect(service.google).toBeDefined();
    });

    it('initializes the Google SDK with the configured client id', function() {
      window.googleInit();

      expect(gapiMock.load).toHaveBeenCalledWith('auth2', jasmine.any(Function));
      expect(gapiMock.client.load).toHaveBeenCalledWith('plus', 'v1');
      expect(gapiMock.auth2.init).toHaveBeenCalledWith(jasmine.objectContaining({
        client_id: 'google-test-client-id'
      }));
      expect(service.google.auth2).toBe(fakeAuth2);
    });

    it('signIn delegates to the auth2 instance', function() {
      window.googleInit();

      expect(service.google.signIn()).toBe('signIn-result');
      expect(fakeAuth2.signIn).toHaveBeenCalled();
    });

    it('signIn passes params through to the auth2 instance', function() {
      window.googleInit();
      var params = { prompt: 'select_account' };

      service.google.signIn(params);

      expect(fakeAuth2.signIn).toHaveBeenCalledWith(params);
    });

    it('signIn rejects when the SDK is not initialized', function() {
      var rejected = false;
      service.google.signIn().catch(function() {
        rejected = true;
      });
      $rootScope.$digest();

      expect(rejected).toBe(true);
    });

    it('signOut delegates to the auth2 instance', function() {
      window.googleInit();

      expect(service.google.signOut()).toBe('signOut-result');
      expect(fakeAuth2.signOut).toHaveBeenCalled();
    });

    it('signOut rejects when the SDK is not initialized', function() {
      var rejected = false;
      service.google.signOut().catch(function() {
        rejected = true;
      });
      $rootScope.$digest();

      expect(rejected).toBe(true);
    });

    it('grantAccess delegates to grantOfflineAccess', function() {
      window.googleInit();

      expect(service.google.grantAccess()).toBe('grant-result');
      expect(fakeAuth2.grantOfflineAccess).toHaveBeenCalled();
    });

    it('revokeAccess delegates to disconnect', function() {
      window.googleInit();

      expect(service.google.revokeAccess()).toBe('disconnect-result');
      expect(fakeAuth2.disconnect).toHaveBeenCalled();
    });

    it('getProfile delegates to the Google+ API', function() {
      window.googleInit();

      expect(service.google.getProfile()).toBe('profile-result');
      expect(gapiMock.client.plus.people.get).toHaveBeenCalledWith({ 'userId': 'me' });
    });

    it('getProfile rejects when the Google+ API is not loaded', function() {
      delete window.gapi;
      var rejected = false;
      service.google.getProfile().catch(function() {
        rejected = true;
      });
      $rootScope.$digest();

      expect(rejected).toBe(true);
    });
  });

  describe('FacebookSignin', function() {
    it('exposes a facebook service instance', function() {
      expect(service.facebook).toBeDefined();
    });

    it('initializes the Facebook SDK with the configured app id', function() {
      window.fbAsyncInit();

      expect(fbMock.init).toHaveBeenCalledWith(jasmine.objectContaining({
        appId: 'facebook-test-app-id'
      }));
      expect(fbMock.Event.subscribe).toHaveBeenCalledWith(
        'auth.authResponseChange', jasmine.any(Function)
      );
    });

    it('signIn resolves with the auth response when connected', function() {
      var response = { status: 'connected', authResponse: { accessToken: 'abc' } };
      fbMock.login.and.callFake(function(callback) {
        callback(response);
      });

      var result;
      service.facebook.signIn().then(function(r) {
        result = r;
      });
      $rootScope.$digest();

      expect(result).toBe(response);
      expect(fbMock.login).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({ scope: 'public_profile,email,user_friends' })
      );
    });

    it('signIn rejects when the user is not connected', function() {
      var response = { status: 'unknown' };
      fbMock.login.and.callFake(function(callback) {
        callback(response);
      });

      var rejected;
      service.facebook.signIn().catch(function(r) {
        rejected = r;
      });
      $rootScope.$digest();

      expect(rejected).toBe(response);
    });

    it('signOut resolves with the logout response', function() {
      var response = { status: 'unknown' };
      fbMock.logout.and.callFake(function(callback) {
        callback(response);
      });

      var result;
      service.facebook.signOut().then(function(r) {
        result = r;
      });
      $rootScope.$digest();

      expect(result).toBe(response);
    });

    it('getProfile resolves with the profile', function() {
      var profile = { id: '123', name: 'Test User' };
      fbMock.api.and.callFake(function(path, callback) {
        callback(profile);
      });

      var result;
      service.facebook.getProfile().then(function(r) {
        result = r;
      });
      $rootScope.$digest();

      expect(result).toBe(profile);
      expect(fbMock.api).toHaveBeenCalledWith('/me', jasmine.any(Function));
    });

    it('getProfile rejects when the API returns an error', function() {
      var error = { error: { message: 'An access token is required' } };
      fbMock.api.and.callFake(function(path, callback) {
        callback(error);
      });

      var rejected;
      service.facebook.getProfile().catch(function(r) {
        rejected = r;
      });
      $rootScope.$digest();

      expect(rejected).toBe(error);
    });
  });
});