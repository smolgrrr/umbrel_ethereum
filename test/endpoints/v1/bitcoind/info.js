/* eslint-disable max-len,id-length */
/* globals requester, reset */
const sinon = require('sinon');
const ethereumdMocks = require('../../../mocks/ethereumd.js');

describe('v1/ethereumd/info endpoint', () => {
  let token;

  before(async() => {
    reset();

    token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtdXNlciIsImlhdCI6MTU3NTIyNjQxMn0.N06esl2dhN1mFqn-0o4KQmmAaDW9OsHA39calpp_N9B3Ig3aXWgl064XAR9YVK0qwX7zMOnK9UrJ48KUZ-Sb4A';
  });

  describe('/addresses GET', function() {
    let ethereumdRPCGetPeerInfo;
    let ethereumdRPCGetNetworkInfo;

    afterEach(() => {
      ethereumdRPCGetPeerInfo.restore();
      ethereumdRPCGetNetworkInfo.restore();
    });

    it('should respond for an IPv4 address', done => {
      ethereumdRPCGetPeerInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getPeerInfo').callsFake(callback => callback(undefined, {
        result:
          [
            {
              addrlocal: '100.101.102.103:10249'
            }
          ]
      }));
      ethereumdRPCGetNetworkInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getNetworkInfo')
        .callsFake(callback => callback(undefined, ethereumdMocks.getNetworkInfoWithoutTor()));
      requester
        .get('/v1/ethereumd/info/addresses')
        .set('authorization', `JWT ${token}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.should.be.json;
          res.body.length.should.equal(1);
          res.body[0].should.equal('100.101.102.103');
          done();
        });
    });

    it('should respond for an IPv6 address', done => {
      ethereumdRPCGetPeerInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getPeerInfo').callsFake(callback => callback(undefined, {
        result:
          [
            {
              addrlocal: '2001:0db8:85a3:0000:0000:8a2e:0370:10249'
            }
          ]
      }));
      ethereumdRPCGetNetworkInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getNetworkInfo')
        .callsFake(callback => callback(undefined, ethereumdMocks.getNetworkInfoWithoutTor()));
      requester
        .get('/v1/ethereumd/info/addresses')
        .set('authorization', `JWT ${token}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.should.be.json;
          res.body.length.should.equal(1);
          res.body[0].should.equal('2001:0db8:85a3:0000:0000:8a2e:0370');
          done();
        });
    });

    it('should 401 without a valid token', done => {
      requester
        .get('/v1/ethereumd/info/addresses')
        .set('authorization', 'JWT invalid')
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(401);
          done();
        });
    });

    it('should 500 on error', done => {
      ethereumdRPCGetPeerInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getPeerInfo').callsFake(callback => callback('error', {}));
      requester
        .get('/v1/ethereumd/info/addresses')
        .set('authorization', `JWT ${token}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(500);
          res.body.should.equal('Unable to obtain peer info');
          res.should.be.json;
          done();
        });
    });
  });

  describe('/blockCount GET', function() {
    let ethereumdRPCGetBlockCount;

    afterEach(() => {
      ethereumdRPCGetBlockCount.restore();
    });

    it('should respond with blockCount', done => {
      ethereumdRPCGetBlockCount = sinon.stub(require('ethereumd-rpc').prototype, 'getBlockCount').callsFake(callback => callback(undefined, {result: 515055}));
      requester
        .get('/v1/ethereumd/info/blockcount')
        .set('authorization', `JWT ${token}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('blockCount');
          res.body.blockCount.should.equal(515055);
          done();
        });
    });

    it('should 401 without a valid token', done => {
      requester
        .get('/v1/ethereumd/info/blockcount')
        .set('authorization', 'JWT invalid')
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(401);
          done();
        });
    });

    it('should 500 on error', done => {
      ethereumdRPCGetBlockCount = sinon.stub(require('ethereumd-rpc').prototype, 'getBlockCount').callsFake(callback => callback('error', {}));
      requester
        .get('/v1/ethereumd/info/blockcount')
        .set('authorization', `JWT ${token}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(500);
          res.body.should.equal('Unable to obtain block count');
          res.should.be.json;
          done();
        });
    });
  });

  describe('/connections GET', function() {
    let ethereumdRPCGetPeerInfo;

    afterEach(() => {
      ethereumdRPCGetPeerInfo.restore();
    });

    it('should respond with connections', done => {
      ethereumdRPCGetPeerInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getPeerInfo')
        .callsFake(callback => callback(undefined, {
          result: [
            {
              inbound: false
            },
            {
              inbound: false
            },
            {
              inbound: true
            }
          ]
        }));
      requester
        .get('/v1/ethereumd/info/connections')
        .set('authorization', `JWT ${token}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.should.be.json;
          res.body.total.should.equal(3);
          res.body.inbound.should.equal(1);
          res.body.outbound.should.equal(2);
          done();
        });
    });

    it('should respond with zero connections', done => {
      ethereumdRPCGetPeerInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getPeerInfo')
        .callsFake(callback => callback(undefined, {
          result: []
        }));
      requester
        .get('/v1/ethereumd/info/connections')
        .set('authorization', `JWT ${token}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.should.be.json;
          res.body.total.should.equal(0);
          res.body.inbound.should.equal(0);
          res.body.outbound.should.equal(0);
          done();
        });
    });

    it('should 401 without a valid token', done => {
      requester
        .get('/v1/ethereumd/info/connections')
        .set('authorization', 'JWT invalid')
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(401);
          done();
        });
    });

    it('should 500 on error', done => {
      ethereumdRPCGetPeerInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getPeerInfo').callsFake(callback => callback('error', {}));
      requester
        .get('/v1/ethereumd/info/connections')
        .set('authorization', `JWT ${token}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(500);
          res.body.should.equal('Unable to obtain peer info');
          res.should.be.json;
          done();
        });
    });
  });

  describe('/status GET', function() {
    let ethereumdRPCGetHelp;

    afterEach(() => {
      ethereumdRPCGetHelp.restore();
    });

    it('should respond operational true', done => {
      ethereumdRPCGetHelp = sinon.stub(require('ethereumd-rpc').prototype, 'help').callsFake(callback => callback(undefined, {}));
      requester
        .get('/v1/ethereumd/info/status')
        .set('authorization', `JWT ${token}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('operational');
          res.body.operational.should.equal(true);
          done();
        });
    });

    it('should 401 without a valid token', done => {
      requester
        .get('/v1/ethereumd/info/status')
        .set('authorization', 'JWT invalid')
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(401);
          done();
        });
    });

    it('should respond operational false on error', done => {
      ethereumdRPCGetHelp = sinon.stub(require('ethereumd-rpc').prototype, 'help').callsFake(callback => callback('error', {}));
      requester
        .get('/v1/ethereumd/info/status')
        .set('authorization', `JWT ${token}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('operational');
          res.body.operational.should.equal(false);
          done();
        });
    });
  });

  describe('/sync GET', function() {
    let ethereumdRPCGetPeerInfo;
    let ethereumdRPCGetBlockChainInfo;

    afterEach(() => {
      ethereumdRPCGetPeerInfo.restore();

      if (ethereumdRPCGetBlockChainInfo) {
        ethereumdRPCGetBlockChainInfo.restore();
      }
    });

    it('should respond with local info if no peers', done => {
      ethereumdRPCGetPeerInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getPeerInfo')
        .callsFake(callback => callback(undefined, {
          result: []
        }));
      ethereumdRPCGetBlockChainInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getBlockchainInfo')
        .callsFake(callback => callback(undefined, {
          result: {
            blocks: 515055,
            headers: 515055,
          }
        }));
      requester
        .get('/v1/ethereumd/info/sync')
        .set('authorization', `JWT ${token}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }

          res.should.have.status(200);
          res.should.be.json;
          res.body.should.not.have.property('status');
          res.body.currentBlock.should.equal(515055);
          res.body.headerCount.should.equal(515055);
          res.body.percent.should.equal('1.0000'); // testing precision
          done();
        });
    });

    it('should respond with local info if one peer without headers', done => {
      ethereumdRPCGetPeerInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getPeerInfo')
        .callsFake(callback => callback(undefined, {
          result: [
            {
              syncedHeaders: -1,
            },
          ]
        }));
      ethereumdRPCGetBlockChainInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getBlockchainInfo')
        .callsFake(callback => callback(undefined, {
          result: {
            blocks: 515055,
            headers: 515055,
          }
        }));
      requester
        .get('/v1/ethereumd/info/sync')
        .set('authorization', `JWT ${token}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }

          res.should.have.status(200);
          res.should.be.json;
          res.body.should.not.have.property('status');
          res.body.currentBlock.should.equal(515055);
          res.body.headerCount.should.equal(515055);
          res.body.percent.should.equal('1.0000'); // testing precision
          done();
        });
    });

    it('should respond with peer data if active peers ahead of local', done => {
      ethereumdRPCGetPeerInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getPeerInfo')
        .callsFake(callback => callback(undefined, {
          result: [
            {
              syncedHeaders: -1,
            },
            {
              syncedHeaders: 515055,
            }
          ]
        }));
      ethereumdRPCGetBlockChainInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getBlockchainInfo')
        .callsFake(callback => callback(undefined, {
          result: {
            blocks: 515035,
            headers: 515045,
          }
        }));
      requester
        .get('/v1/ethereumd/info/sync')
        .set('authorization', `JWT ${token}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }

          res.should.have.status(200);
          res.should.be.json;
          res.body.should.not.have.property('status');
          res.body.currentBlock.should.equal(515035);
          res.body.headerCount.should.equal(515055);
          res.body.percent.should.not.equal(1.0000); // testing precision
          done();
        });
    });

    it('should respond with local data if active peers behind local', done => {
      ethereumdRPCGetPeerInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getPeerInfo')
        .callsFake(callback => callback(undefined, {
          result: [
            {
              syncedHeaders: -1,
            },
            {
              syncedHeaders: 515035,
            }
          ]
        }));
      ethereumdRPCGetBlockChainInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getBlockchainInfo')
        .callsFake(callback => callback(undefined, {
          result: {
            blocks: 515035,
            headers: 515055,
          }
        }));
      requester
        .get('/v1/ethereumd/info/sync')
        .set('authorization', `JWT ${token}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }

          res.should.have.status(200);
          res.should.be.json;
          res.body.should.not.have.property('status');
          res.body.currentBlock.should.equal(515035);
          res.body.headerCount.should.equal(515055);
          res.body.percent.should.not.equal(1.0000); // testing precision
          done();
        });
    });

    it('should 401 without a valid token', done => {
      requester
        .get('/v1/ethereumd/info/sync')
        .set('authorization', 'JWT invalid')
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(401);
          done();
        });
    });

    it('should 500 on getPeerInfo error', done => {
      ethereumdRPCGetPeerInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getPeerInfo').callsFake(callback => callback('error', {}));
      requester
        .get('/v1/ethereumd/info/sync')
        .set('authorization', `JWT ${token}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(500);
          res.body.should.equal('Unable to obtain peer info');
          res.should.be.json;
          done();
        });
    });

    it('should 500 on getBlockchainInfo error', done => {
      ethereumdRPCGetPeerInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getPeerInfo')
        .callsFake(callback => callback(undefined, {
          result: [
            {
              syncedHeaders: 515055,
            }
          ]
        }));
      ethereumdRPCGetBlockChainInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getBlockchainInfo')
        .callsFake(callback => callback('error', {}));
      requester
        .get('/v1/ethereumd/info/sync')
        .set('authorization', `JWT ${token}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(500);
          res.body.should.equal('Unable to obtain blockchain info');
          res.should.be.json;
          done();
        });
    });
  });

  describe('/version GET', function() {
    let ethereumdRPCGetNetworkInfo;

    afterEach(() => {
      ethereumdRPCGetNetworkInfo.restore();
    });

    it('should respond with a valid version', done => {
      ethereumdRPCGetNetworkInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getNetworkInfo').callsFake(callback => callback(undefined, {
        result:
          {
            subversion: '/Satoshi:0.17.0/'
          }
      }));
      requester
        .get('/v1/ethereumd/info/version')
        .set('authorization', `JWT ${token}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('version');
          res.body.version.should.equal('0.17.0');
          done();
        });
    });

    it('should 401 without a valid token', done => {
      requester
        .get('/v1/ethereumd/info/version')
        .set('authorization', 'JWT invalid')
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(401);
          done();
        });
    });

    it('should 500 on error', done => {
      ethereumdRPCGetNetworkInfo = sinon.stub(require('ethereumd-rpc').prototype, 'getNetworkInfo').callsFake(callback => callback('error', {}));
      requester
        .get('/v1/ethereumd/info/version')
        .set('authorization', `JWT ${token}`)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(500);
          res.body.should.equal('Unable to obtain network info');
          res.should.be.json;
          done();
        });
    });
  });
});
