var app = require('app');
var ipc = require('ipc');
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
      console.log("Access Token: "+ access_token);
      if(access_token) {
        authWindow.close();
      }
    });
  });
});
