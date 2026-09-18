# angular-social-signin

AngularJS module that simplifies web sign-in using social media accounts. It wraps the official Google and Facebook JavaScript SDKs behind a small AngularJS provider/service.

## Installation

```sh
npm install angular-social-signin
```

or with bower:

```sh
bower install angular-social-signin
```

## Usage

1. Include `angular.js` and `angular-social-signin.js` in your page.
2. Add the module as a dependency and configure the provider with your app credentials:

```js
angular.module('myApp', ['angular-social-signin'])
  .config(function(angularSocialSigninProvider) {
    angularSocialSigninProvider.setConfig({
      google: {
        id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
      },
      facebook: {
        id: 'YOUR_FACEBOOK_APP_ID'
      }
    });
  });
```

3. Inject the service and call the sign-in methods:

```js
angular.module('myApp')
  .controller('MainCtrl', function($scope, angularSocialSignin) {

    $scope.loginGoogle = function() {
      angularSocialSignin.google.signIn().then(function() {
        return angularSocialSignin.google.getProfile();
      }).then(function(profile) {
        $scope.googleAccount = profile.result;
      });
    };

    $scope.loginFacebook = function() {
      angularSocialSignin.facebook.signIn().then(function() {
        return angularSocialSignin.facebook.getProfile();
      }).then(function(profile) {
        $scope.facebookAccount = profile;
      });
    };
  });
```

See `demo/index.html` for a complete example and `config.example.js` for the expected configuration shape.

## API

### `angularSocialSignin.google`

| Method | Description |
| --- | --- |
| `signIn(params)` | Opens the Google sign-in flow. Resolves with the `GoogleUser`. |
| `signOut()` | Signs the current user out. |
| `grantAccess(params)` | Requests offline access (`grantOfflineAccess`). |
| `revokeAccess(params)` | Disconnects the current user. |
| `getProfile()` | Fetches the current user's Google+ profile. |

### `angularSocialSignin.facebook`

| Method | Description |
| --- | --- |
| `signIn()` | Opens the Facebook login dialog. Resolves when the status is `connected`. |
| `signOut()` | Logs the current user out. |
| `getProfile()` | Fetches the current user's profile via `/me`. |

## Configuration

`setConfig` requires both `google.id` and `facebook.id`; it throws an error at bootstrap if either is missing. See `config.example.js`.

## Running the tests

```sh
npm install
npm test
```

The suite runs with Karma + Jasmine in headless Chrome and covers the Google and Facebook SDK flows with mocked `gapi` and `FB` globals.

## Lint

```sh
npm run lint
```

## License

MIT