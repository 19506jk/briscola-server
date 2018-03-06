import http from 'http';
import assert from 'assert';

import '../src/app';

const URL = 'http://localhost:8080';

describe('Briscola Server App', () => {
  it('should return 200', (done) => {
    http.get(URL, (res) => {
      assert.equal(res.statusCode, 200);
      done();
    });
  });

  describe('/api', () => {
    describe('/reset', () => {
      it('should return 200', (done) => {
        http.get(`${URL}/api/reset`, (res) => {
          assert.equal(res.statusCode, 200);
          done();
        });
      });
    });

    describe('/deck', () => {
      it('should return the standard deck', (done) => {
        http.get(`${URL}/api/deck`, (res) => {
          res.setEncoding('utf8');
          res.on('data', (body) => {
            assert.equal(JSON.parse(body).length, 40, 'response should contain 40 cards');
            done();
          })
        });
      });
    });
  });
});
