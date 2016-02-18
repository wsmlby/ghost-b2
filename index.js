'use strict';

var fs          = require('fs'),
    path        = require('path'),
    Promise     = require('bluebird'),
    util        = require('util'),
    B2          = require('backblaze-b2'),
    errors      = require('../../core/server/errors'),
    utils       = require('../../core/server/utils'),
    baseStore   = require('../../core/server/storage/base'),
    options     = {},
    bucket;

function BStore(config) {
    options = config || {};
    var self = this;
    self.b2 = new B2({
        accountId: options.projectId,
        applicationKey: options.key
    });

    self.downloadUrl = "";
    self.bucketId = options.bucketId;
    self.bucketName = options.bucketName;
    self.b2.authorize().then(function(data) {
      self.downloadUrl = data.downloadUrl + '/file/' +self.bucketName + '/';
    });


}

util.inherits(BStore, baseStore);

BStore.prototype.save = function(image) {
    var _self = this;
    if (!options) return Promise.reject('b2 cloud storage is not configured');

    var targetDir = _self.getTargetDir(),
    destination;
    return Promise.props({data: new Promise(function(resolve, reject) {
      fs.readFile(image.path, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    }), url: this.getUniqueFileName(this, image, targetDir).then(function (filename) {
        destination =  filename;
        return _self.b2.getUploadUrl(_self.bucketId);
    })}).then(function(obj) {
      return _self.b2.uploadFile({
        uploadUrl:obj.url.uploadUrl,
        uploadAuthToken: obj.url.authorizationToken,
        filename: destination,
        data: obj.data
      });
    }).then(function(fn){
      return _self.downloadUrl + destination;
    }).catch(function(e){
    });
};

// middleware for serving the files
BStore.prototype.serve = function() {
    // a no-op, these are absolute URLs
    return function (req, res, next) {
      next();
    };
};

BStore.prototype.exists = function (filename) {
  return new Promise(function (resolve) {
    fs.exists(filename, function (exists) {
      resolve(exists);
    });
  });
};


module.exports = BStore;
