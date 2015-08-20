var resolve = require('path').resolve;
var assert = require('assert');
var debug = require('debug')('koa-static');
var send = require('koa-send');

function serve(root, opts) {
  opts = opts || {};

  assert(root, 'root directory is required to serve files');

  // options
  debug('static "%s" %j', root, opts);
  opts.root = resolve(root);
  opts.index = opts.index || 'index.html';


  if (!opts.defer) {
    return function *serve(next){
      if (this.method == 'HEAD' || this.method == 'GET') {
        var filePath =opts.prefix?  this.path.replace( new RegExp(`^${opts.prefix.replace('/','\/')}`), '') : this.path
        if (yield send(this, filePath, opts)) return;
      }
      yield* next;
    };
  }

  return function *serve(next){
    yield* next;

    if (this.method != 'HEAD' && this.method != 'GET') return;
    // response is already handled
    if (this.body != null || this.status != 404) return;
    var filePath =opts.prefix?  this.path.replace( new RegExp(`^${opts.prefix.replace('/','\/')}`), '') : this.path
    yield send(this, filePath, opts);
  };
}

module.exports = serve