var mkdirp = require("mkdirp")
  , fs = require("browserify-fs")
  , assets = {files:{}};

assets.import = function(){
  var proms = [];
  Object.keys(assets.files).forEach(function(path){
    var dir = path.split("/")
    dir.pop()
    dir = dir.join("/");
    console.log("mkdirp", dir)
    proms.push(new Promise(function(resolve,reject){
      mkdirp(dir, {fs: fs},function(err){
        if (err)
          return reject(err)

        fs.writeFile(path, assets.files[path],function(err){
          if (err)
            return reject(err)
          resolve();
        })
      })
    }))
  })

  return Promise.all(proms);
}

chrome.runtime.onInstalled.addListener(function(details){
    console.log("This is a first install!");
    assets.import()
          .then(function(){
            console.log("assets installed")
          })
          .catch(function(er){
            console.log("error installing assets",er)
          })
});
