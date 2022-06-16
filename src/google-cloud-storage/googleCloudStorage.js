const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const StorageBase = require('ghost-storage-base');

class GoogleCloudStorage extends StorageBase {
  constructor({ keyFilename, bucketName, storagePath, name }) {
    super();
    const instanceName = name || 'google-cloud-storage';
    this.debug = require('debug')(instanceName);
    const {
      GOOGLE_CLOUD_STORAGE_BUCKET,
      GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT_KEY,
    } = process.env;
    this.keyFilename = keyFilename || GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT_KEY;
    this.bucketName = bucketName || GOOGLE_CLOUD_STORAGE_BUCKET;
    if (!this.keyFilename) throw Error('keyFilename not set');
    if (!this.bucketName) throw Error('bucket name not set');
    if (!fs.existsSync(this.keyFilename)) throw Error('key file not exists', );
    this.storage = new Storage({ keyFilename: this.keyFilename });
    this.bucket = this.storage.bucket(this.bucketName);
    this.assetDomain = `${this.bucketName}.storage.googleapis.com`;
    this.storagePath = storagePath || '';
  }

  exists(filename, targetDir) {
    const filePath = path.join(targetDir || this.storagePath, filename);
    this.debug(`exists - fileName: ${filename}`);
    this.debug(`exists - targetDir: ${targetDir}`);
    this.debug(`exists - path.join ${path.join(targetDir, filename)}`);
    return this.bucket.file(filePath).exists()
      .then((data) => {
        this.debug('exists - data: true');
        return data[0];
      })
      .catch((error) => {
        this.debug(`exists - error: ${error}`);
        return Promise.reject(error);
      });
  }

  save(file, targetDir) {
    let targetFilename;
    // NOTE: the base implementation of `getTargetDir` returns the format this.storagePath/YYYY/MM
    targetDir = targetDir || this.getTargetDir(this.storagePath);

    this.debug(`save - file.path: ${file.path}`);
    this.debug(`save - targetDir: ${targetDir}`);
    return this.getUniqueFileName(file, targetDir)
      .then(filename => {
        this.debug(`save - getUniqueFileName, filename ${filename}`);
        targetFilename = filename;
        const options = {
          destination: filename,
          metadata: {
            cacheControl: `public, max-age=${3600 * 24 * 180}`
          },
          public: true
        };
        return this.bucket.upload(file.path, options);
      })
      .then(() => {
        const fullUrl = `https://${this.assetDomain}/${targetFilename}`;
        this.debug(`save - full url: ${fullUrl}`);
        return fullUrl
      })
      .catch(error => {
        this.debug('save - error' , error);
        Promise.reject(error)
      })
  }

  read(options = {}) {
    this.debug(`read - ${options}`);
    const prefix = `https://${this.assetDomain}/`
    let path = options.path;
    if (path.indexOf(prefix) === 0) {
      path = path.slice(prefix.length);
    }

    return new Promise((resolve, reject) => {
      let res = [];
      let readStream = this.bucket.file(path).createReadStream();
      readStream.on('error', function(error) {
        this.debug(`read - error ${error}`);
        return reject(error);
      });
      readStream.on('data', chunk => {
        res.push(chunk);
      });
      readStream.on('end', () => {
        return resolve(Buffer.concat(res));
      });
    })
  }

  delete(filename, targetDir) {
    this.debug(`delete - targetDir: ${targetDir}`);
    this.debug(`delete - filename: ${filename}`);
    const filePath = path.join(targetDir, filename);
    return this.bucket.file(filePath).delete();
  }

  serve() {
    this.debug(`serve`);
    return function (req, res, next) { next(); };
  }
}

module.exports = GoogleCloudStorage;
