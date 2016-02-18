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

    var b2 = new B2({
        accountId: options.projectId,
        applicationKey: options.key
    });
    var self = this;
    self.downloadUrl = "";
    self.bucketId = options.bucketId;
    self.bucketName = options.bucketId;
    b2.authorize().then(function(data) {
      self.downloadUrl = data.downloadUrl + '/' +self.bucketName;
    });


}

util.inherits(BStore, baseStore);

BStore.prototype.save = function(image) {
    var _self = this;
    if (!options) return Promise.reject('b2 cloud storage is not configured');

    var targetDir = _self.getTargetDir(),
    targetFilename;

    return this.getUniqueFileName(this, image, targetDir).then(function (filename) {
        targetFilename = filename
        var opts = {
            destination: targetDir + targetFilename
        };
        return new Promise(function(resolve, reject) {
            b2.getUploadUrl(_self.bucketId).then(function(data){
              b2.uploadFile({

              }).then(function(fn){
                resolve(_self.downloadUrl + targetFilename);
              }).catch(function(e){
                reject(e);
              });
            });
        })
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
