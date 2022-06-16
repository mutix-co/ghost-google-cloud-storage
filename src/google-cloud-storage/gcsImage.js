const StorageBase = require('ghost-storage-base');
const GoogleCloudStorage = require('./googleCloudStorage');

class gcsImage extends StorageBase {
  constructor(config = {}) {
    super();
    this.storage = new GoogleCloudStorage({
      name: 'cloud-storage-image',
      storagePath: 'content/images',
      ...config,
    });
  }

  exists = (filename, targetDir) => this.storage.exists(filename, targetDir)
  save = (file, targetDir) => this.storage.save(file, targetDir)
  read = (options = {}) => this.storage.read(options)
  delete = (filename, targetDir) => this.storage.delete(filename, targetDir);
  serve = () => this.storage.serve();
}

module.exports = gcsImage;
