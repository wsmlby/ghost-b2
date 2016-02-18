# Ghost Backblaze(B2) Cloud Storage Plugin
A simple plugin to add Backblaze(B2) Cloud Storage support for a Ghost Blog

## Installation

    npm install --save ghost-b2-cloud-storage

## Create storage module

Create index.js file with folder path 'content/storage/bcloud/index.js' (manually create folder if not exist)

    'use strict';
    module.exports = require('ghost-b2-cloud-storage');

## Configuration

Create a bucket on your Backblaze(B2) Cloud storage project.

Add this key on your root ghost folder or any folder you want.

Add `storage` block to file `config.js` in each environment as below:


    storage: {
      active: 'bcloud',
      'bcloud': {
          projectId: 'Your_project_id',
          bucketId: 'Your_bucket_id',
          bucketName: 'Your_bucket_name',
          key: 'Your_api_key'
      }
    }
