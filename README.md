# Ghost with Google Cloud Storage

In current version of ghost(v5.2.3) storage split into three kinds of Adapters, image, media, file and we follow the default storage adapters(LocalStorageBase) to create same file structure in Google Cloud Storage (image in `content/image`, media in `content/media`, files in `content/files`)

## Setup

1. create bucket and service account, then generate key.json and permission binding (gcloud, gsutil CLI required)

```sh
# fill variable inside script and run it
./utils/createBucket.sh
```

2. run command with storage configuration

  * by env

  ```sh
  # command tested with zsh in MacOS
  docker run -it --rm \
    -p 8080:2368 \
    -e url=http://localhost:8080 \
    -e GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT_KEY=/var/lib/ghost/key.json \
    -e GOOGLE_CLOUD_STORAGE_BUCKET=<your bucket> \
    -e storage__active=gcsImage \
    -e storage__media=gcsMedia \
    -e storage__files=gcsFiles \
    -e storage__gcsImage={} \
    -e storage__gcsMedia={} \
    -e storage__gcsFiles={} \
    -e DEBUG="cloud-storage-*" \
    -v "${PWD}"/key.json:/var/lib/ghost/key.json \
    mutix/ghost-google-cloud-storage:5
  ```

  * by config file, add storage section to your `config.production.json`

  ```json
  {
    "storage": {
      "active": "gcsImage",
      "media": "gcsMedia",
      "files": "gcsFiles",
      "gcsImage" : {
        "keyFilename": "/var/lib/ghost/gcloud-key.json",
        "bucketName": "<your bucket>"
      },
      "gcsMedia" : {
        "keyFilename": "/var/lib/ghost/gcloud-key.json",
        "bucketName": "<your bucket>"
      },
      "gcsFiles" : {
        "keyFilename": "/var/lib/ghost/gcloud-key.json",
        "bucketName": "<your bucket>"
      }
    }
  }
  ```

3. see http://localhost:8080 and upload images, media, files to test configuration

4. public whole cloud storage for web, to display images, medias and files.
```sh
gsutil iam ch allUsers:objectViewer gs://<your bucket>
```


## update Image location from local to Google Cloud Storage

Use image  `mutix/ghost-google-cloud-storage`  to support Google Cloud Storage with Ghost v5

* found image src structure from export json

```html
<img src="__GHOST_URL__/content/images/2022/07/34.png" class="kg-image" alt loading="lazy" width="1600" height="1066" srcset="__GHOST_URL__/content/images/size/w60  0/2022/07/34.png 600w, __GHOST_URL__/content/images/size/w1000/2022/07/34.png 1000w, __GHOST_URL__/content/images/2022/07/34.png 1600w" sizes="(min-width: 720px) 720px">
```
* find and replace those URL with bucket URL in database

```sql
use `service-a`;
UPDATE posts SET mobiledoc = REPLACE(mobiledoc, '__GHOST_URL__/content/images/', 'https://service-a.storage.googleapis.com/content/images/');
UPDATE posts SET html = REPLACE(html, '__GHOST_URL__/content/images/', 'https://service-a.storage.googleapis.com/content/images/');
UPDATE posts SET plaintext = REPLACE(plaintext, '__GHOST_URL__/content/images/', 'https://service-a.storage.googleapis.com/content/images/');
UPDATE posts SET feature_image = REPLACE(feature_image, '__GHOST_URL__/content/images/', 'https://service-a.storage.googleapis.com/content/images/');
```

* Add `storage` section in `config.production.json` or use environment variable, which bucket used and key for accessing bucket

```json
{
  "storage": {
    "active": "gcsImage",
    "media": "gcsMedia",
    "files": "gcsFiles",
    "gcsImage" : {
      "keyFilename": "/var/lib/ghost/gcloud-key.json",
      "bucketName": "service-a"
    },
    "gcsMedia" : {
      "keyFilename": "/var/lib/ghost/gcloud-key.json",
      "bucketName": "service-a"
    },
    "gcsFiles" : {
      "keyFilename": "/var/lib/ghost/gcloud-key.json",
      "bucketName": "service-a"
    }
  }
}
```

* if any content existed, copy to Google Cloud Storage with `gsutils`

```shell
gsutil rsync -r ghost-content/images gs://serviceA/content/images
```

* Start Ghost and Check result

```sh
docker run -it --rm --name ghost \
  -p 2368:2368 \
  -v `{pwd}`/test-install/.ghost-cli:/var/lib/ghost/.ghost-cli \
  -v `{pwd}`/gcloud-xxxxx-f0c020acefa8.json:/var/lib/ghost/gcloud-key.json \
  --user node \
  mutix/ghost-google-cloud-storage:5
```
