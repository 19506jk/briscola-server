import http from 'http';
import assert from 'assert';
import io from 'socket.io-client';
import { config } from '../package.json';

import '../src/app';

const URL = `http://localhost:${config.serverPort}`;

describe('Briscola Server App', () => {
  it('should return 200', (done) => {
    http.get(URL, (res) => {
      assert.equal(res.statusCode, 200);
      done();
    });
  });

  describe('/api', () => {
    describe('/debug', () => {
      describe('/reset', () => {
        it('should return 200', (done) => {
          http.get(`${URL}/api/debug/reset`, (res) => {
            assert.equal(res.statusCode, 200);
            done();
          });
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
          });
        });
      });
    });

    describe('socketIO', () => {
      it('should connect socket successfully', (done) => {
        const client = io.connect(`http://localhost:${config.serverSocketPort}`, { forceNew: true });
        client.on('connect', () => {
          assert.ok(true, 'connection is successful');
          client.disconnect();
          done();
        });
      });
    });
  });
});
