var gulp = require("gulp")
  , glob = require("glob")
  , fs = require('fs')
  , coffee = require("gulp-coffee")
  , replace = require("gulp-replace")
  , browserify = require('browserify')
  , builtins = require('browserify/lib/builtins.js')
  , source = require("vinyl-source-stream")
  , transform = require("vinyl-transform")

builtins.http = require.resolve('http-chrome')
builtins.timers = require.resolve("timers-browserify-full");


gulp.task("assets", function(){
  var cwd = "./node_modules/wiki/"
  var path = cwd + "node_modules/wiki-+(plugin|client)*/!(node_modules|test)/**/*.+(js|html|css|png)*"
  glob(path,function(er,files){
    console.log(files)
    var writer = fs.createWriteStream("./tmp/assets.js")
    fs.readFile("./wrap_assets.js",function(er,data){
      console.log(er,data)
      writer.write(data)
      files.forEach(function(file){
        if (typeof file === "string"){
          var localPath = file.substr(cwd.length);
          writer.write("assets.files['" + localPath + "'] = new Buffer('" + fs.readFileSync(file).toString("hex") + "', 'hex');\n\n");
        }
      })


    })
  })
})

gulp.task("server", function(){
  gulp.src('./node_modules/wiki-server/lib/*.coffee')
    .pipe(replace("writeFileAtomic = require 'write-file-atomic'", "writeFileAtomic = fs.writeFile"))
    .pipe(replace("require('coffee-trace')", ''))
    .pipe(replace("'wiki-client/", "'./wiki-client/"))
    .pipe(coffee({bare: true}))
    .pipe(gulp.dest('./tmp/'))

  gulp.src('./node_modules/wiki-client/lib/*.coffee')
    .pipe(replace("writeFileAtomic = require 'write-file-atomic'", "writeFileAtomic = fs.writeFile"))
    .pipe(replace("require('coffee-trace')", ''))
    .pipe(coffee({bare: true}))
    .pipe(gulp.dest('./tmp/wiki-client/lib/'))

  /*
  gulp.src('./node_modules/body-parser/index.js')
    .pipe(replace("var parsers = Object.create(null)", "var parsers = Object.create(null);\n\n parsers.qs = require('qs')"))
    .pipe(gulp.dest("./node_modules/body-parser/index.js", ))

  gulp.src('./node_modules/body-parser/lib/types/urlencoded.js')
    .pipe(replace("var parsers = Object.create(null)", "var parsers = Object.create(null);\n\n parsers.qs = require('qs')"))
    .pipe(gulp.dest("./node_modules/body-parser/lib/types/urlencoded.js"))
    */
})

gulp.task("bundle",function(){
  var browserified = transform(function(filename) {
    var b = browserify(filename);
    return b.bundle();
  });

  return browserify("./index.background.js")
          .require("browserify-fs", { expose: "fs" })
          .bundle()
          .pipe(source("background.js"))

      .pipe(gulp.dest("./dist/"))
})

gulp.task('eval',function(){
  return gulp.src('./dist/background.js')
              .pipe(replace(/(deprecatedfn).{3}(eval)((.*)\n)((.*)\n)((.*)\n)((.*)\n)((.*)\))/g
               , "deprecatedfn = (function(){log.call(deprecate,message,site);return fn.apply(this,arguments)});"))
              .pipe(replace("process.hrtime()","Date.now()"))
              .pipe(gulp.dest("./dist"))
})
