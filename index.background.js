
window.http = require("http-chrome");
window.wiki = require("./tmp/server.js");
window.fs = require("browserify-fs");
window._http = require("http")
window.app = wiki({_isChrome:true
                , root: "/"
                , data: "data"
                , packageDir:"node_modules"
                , _nolog:true
                , _main: function(req,res){
                    fs.createReadStream("./node_modules/wiki-client/views/static.html")
                      .pipe(res)
                    }
                })

chrome.app.runtime.onLaunched.addListener(function() {
  window.serv = http.createServer(app)
  serv.listen(3000,function(){
    chrome.app.window.create('index.html', {
      id: 'MyWindowID',
      bounds: {
        width: 800,
        height: 600,
        left: 100,
        top: 100
      },
      minWidth: 800,
      minHeight: 600
    });
  })

});
