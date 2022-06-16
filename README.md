# Ghost with Google Cloud Storage


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

3. upload images, media, files to test configuration
