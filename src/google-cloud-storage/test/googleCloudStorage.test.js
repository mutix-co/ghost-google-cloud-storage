const googleCloudStorage = require('../googleCloudStorage');

test('There should be required functions existed', () => {
  // follow docs by https://ghost.org/docs/config/#creating-a-custom-storage-adapter
  // 2022/07/11 Ghost v5.2.3 required ['save', 'exists', 'serve', 'delete', 'read']
  const config = { bucketName: 'test' }
  const adapter = new googleCloudStorage(config);
  for (const requiredFn of adapter.requiredFns) {
    expect(typeof adapter[requiredFn]).toEqual('function')
  }
});

test('Create instance failed if keyFilename not exists', () => {
  const config = {
    bucketName: 'test',
    keyFilename: './nothing',
  }

  let adapter;
  try {
    adapter = new googleCloudStorage(config)
  } catch (error) {
    expect(error.message).toEqual('key file not exists');
  }
});

test('Create instance failed if bucket not set', () => {
  const config = {}

  let adapter;
  try {
    adapter = new googleCloudStorage(config)
  } catch (error) {
    expect(error.message).toEqual('bucket name not set');
  }
});

test('Storage path can be custom', async () => {
  const config = { bucketName: 'test' }
  const adapter = new googleCloudStorage(config);
  const filePath = await adapter.getTargetDir('content/images');
  expect(filePath).toEqual(expect.stringMatching(/^content\/images\/\d{4}\/\d{2}/));
});
