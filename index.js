var app = require('app');
var ipc = require('ipc');
var FB = require('fb');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: 'pwcgi6F2Iat8B6sxbqBHDTod0',
    consumerSecret: 'IlSHOiH28fWCtSYRnKe5AolTCfMhCxmqoDOMoNAmorpVzLbfRC',
    requestToken: '',
    callback: 'oob'
});
var BrowserWindow = require('browser-window');
var mainWindow = null;

app.on('window-all-closed', function () {
    app.quit();
});

app.on('ready', function () {
  mainWindow = new BrowserWindow({width: 800, height: 600});
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  mainWindow.loadUrl('file:///' + __dirname + "/app/index.html");

  ipc.on("facebook-button-clicked",function (event, arg) {
    var options = {
      client_id: '1633225286959017',
      scopes: "public_profile",
      redirect_uri: "https://www.facebook.com/connect/login_success.html"
    };
    var authWindow = new BrowserWindow({ width: 450, height: 300, show: false, 'node-integration': false });
    var facebookAuthURL = "https://www.facebook.com/dialog/oauth?client_id=" + options.client_id + "&redirect_uri=" + options.redirect_uri + "&response_type=token,granted_scopes&scope=" + options.scopes + "&display=popup";
    authWindow.loadUrl(facebookAuthURL);
    authWindow.show();
    authWindow.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
      var raw_code = /access_token=([^&]*)/.exec(newUrl) || null;
      access_token = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
      error = /\?error=(.+)$/.exec(newUrl);
      if(access_token) {
        FB.setAccessToken(access_token);
        FB.api('/me', { fields: ['id', 'name', 'picture.width(800).height(800)'] }, function (res) {
          mainWindow.webContents.executeJavaScript("document.getElementById(\"fb-name\").innerHTML = \" Name: " + res.name + "\"");
          mainWindow.webContents.executeJavaScript("document.getElementById(\"fb-id\").innerHTML = \" ID: " + res.id + "\"");
          mainWindow.webContents.executeJavaScript("document.getElementById(\"fb-dp\").src = \"" + res.picture.data.url + "\"");
        });
        authWindow.close();
      }
    });
  });

  ipc.on("twitter-button-clicked", function (event, arg) {
    var oAuthRequestToken;
    var oAuthRequestTokenSecret;
    twitter.getRequestToken(function (error, requestToken, requestTokenSecret, results) {
      if (error) {
        console.log("Error occured while fetching oAuth Request Token..");
      }
      else {
        oAuthRequestToken = requestToken;
        oAuthRequestTokenSecret = requestTokenSecret;
        eventEmitter.emit('got-request-token');
      }
    });
    eventEmitter.on("got-request-token", function () {
      var twitterAuthWindow = new BrowserWindow({ width: 700, height: 480, show: false, 'node-integration': false });
      var twitterAuthURL = "https://twitter.com/oauth/authenticate?oauth_token="+ oAuthRequestToken;
      twitterAuthWindow.loadUrl(twitterAuthURL);
      twitterAuthWindow.show();
      twitterAuthWindow.webContents.on('did-get-response-details', function (event, oldUrl, newUrl) {
        console.log("Specified: " + newUrl);
      });
    });
  });
});
