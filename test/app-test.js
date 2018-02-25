import http from 'http';
import assert from 'assert';

import '../src/app';

describe('Briscola Server App', () => {
  it('should return 200', (done) => {
    http.get('http://localhost:8080', (res) => {
      assert.equal(res.statusCode, 200);
      done();
    });
  });
});
