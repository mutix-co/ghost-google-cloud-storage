# Ghost with Google Cloud Storage

In current version of ghost(v5.2.3) storage split into three kinds of Adapters, image, media, file and we follow the default storage adapters(LocalStorageBase) to create same file structure in Google Cloud Storage (image in `content/image`, media in `content/media`, files in `content/files`)

## Usage

1. create bucket and service account, then generate key.json and permission binding (gcloud,gsutil CLI required)

```sh
# fill variable inside script and run it
./utils/createBucket.sh
```

2. run command with storage configuration

```sh
# test command on zsh with MacOS
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

3. see http://localhost:8080 and upload images, media, files to test configuration
