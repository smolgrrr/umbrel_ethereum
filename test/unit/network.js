/* globals assert */
/* eslint-disable max-len */

const proxyquire = require('proxyquire');
const ethereumdMocks = require('../mocks/ethereumd.js');

describe('networkLogic', function() {

  describe('getethereumdAddresses', function() {

    it('should return an ipv4 address', function(done) {

      const peerInfo = ethereumdMocks.getPeerInfo();

      const ipv4 = '10.11.12.13';
      const port = '10000';
      peerInfo.result[0].addrlocal = ipv4 + ':' + port;

      const ethereumdServiceStub = {
        'services/ethereumd.js': {
          getPeerInfo: () => Promise.resolve(peerInfo),
          getNetworkInfo: () => Promise.resolve(ethereumdMocks.getNetworkInfoWithoutTor()),
        }
      };

      const networkLogic = proxyquire('logic/network.js', ethereumdServiceStub);

      networkLogic.getethereumdAddresses().then(function(response) {
        assert.equal(response.length, 1);
        assert.equal(response[0], ipv4);

        done();
      });
    });

    it('should return an ipv4 address and onion address', function(done) {

      const peerInfo = ethereumdMocks.getPeerInfo();

      const ipv4 = '10.11.12.13';
      const port = '10000';
      peerInfo.result[0].addrlocal = ipv4 + ':' + port;

      const ethereumdServiceStub = {
        'services/ethereumd.js': {
          getPeerInfo: () => Promise.resolve(peerInfo),
          getNetworkInfo: () => Promise.resolve(ethereumdMocks.getNetworkInfoWithTor()),
        }
      };

      const networkLogic = proxyquire('logic/network.js', ethereumdServiceStub);

      networkLogic.getethereumdAddresses().then(function(response) {
        assert.equal(response.length, 2);
        assert.equal(response[0], ipv4);
        assert.equal(true, response[1].includes('onion'));

        done();
      });
    });

    it('should return an ipv6 address', function(done) {

      const peerInfo = ethereumdMocks.getPeerInfo();

      const ipv6 = '566f:2401:22be:9a6d:23ef:2558:5545:b3fe';
      const port = '10000';

      for (const peer of peerInfo.result) {
        peer.addrlocal = ipv6 + ':' + port;
      }

      const ethereumdServiceStub = {
        'services/ethereumd.js': {
          getPeerInfo: () => Promise.resolve(peerInfo),
          getNetworkInfo: () => Promise.resolve(ethereumdMocks.getNetworkInfoWithoutTor()),
        }
      };

      const networkLogic = proxyquire('logic/network.js', ethereumdServiceStub);

      networkLogic.getethereumdAddresses().then(function(response) {
        assert.equal(response.length, 1);
        assert.equal(response[0], ipv6);

        done();
      });
    });

    it('should handle missing addrlocal information', function(done) {

      const peerInfo = ethereumdMocks.getPeerInfo();

      const ipv4 = '10.11.12.13';
      delete peerInfo.result[0].addrlocal;

      const ethereumdServiceStub = {
        'services/ethereumd.js': {
          getPeerInfo: () => Promise.resolve(peerInfo),
          getNetworkInfo: () => Promise.resolve(ethereumdMocks.getNetworkInfoWithoutTor()),
        }
      };

      const networkLogic = proxyquire('logic/network.js', ethereumdServiceStub);

      networkLogic.getethereumdAddresses().then(function(response) {
        assert.equal(response.length, 1);
        assert.equal(response[0], ipv4);

        done();
      });
    });

    it('should handle discrepancies in ip addresses', function(done) {

      const peerInfo = ethereumdMocks.getPeerInfo();

      const ipv4 = '10.11.12.14';
      const port = '10000';
      peerInfo.result[0].addrlocal = ipv4 + ':' + port;

      const ethereumdServiceStub = {
        'services/ethereumd.js': {
          getPeerInfo: () => Promise.resolve(peerInfo),
          getNetworkInfo: () => Promise.resolve(ethereumdMocks.getNetworkInfoWithoutTor()),
        }
      };

      const networkLogic = proxyquire('logic/network.js', ethereumdServiceStub);

      networkLogic.getethereumdAddresses().then(function(response) {
        assert.equal(response.length, 1);
        assert.equal(response[0], '10.11.12.13');

        done();
      });
    });

    it('should handle calls to ipinfo for ipv4', function(done) {

      const ipv4 = '10.11.12.15';
      const peerInfo = ethereumdMocks.getPeerInfoEmpty();
      const ipInfo = {
        out: ipv4 + '\n'
      };

      const serviceStubs = {
        'services/bash.js': {
          exec: () => Promise.resolve(ipInfo)
        },
        'services/ethereumd.js': {
          getPeerInfo: () => Promise.resolve(peerInfo),
          getNetworkInfo: () => Promise.resolve(ethereumdMocks.getNetworkInfoWithoutTor()),
        }
      };

      const networkLogic = proxyquire('logic/network.js', serviceStubs);

      networkLogic.getethereumdAddresses().then(function(response) {
        assert.equal(response.length, 1);
        assert.equal(response[0], ipv4);

        done();
      });
    });

    it('should handle calls to ipinfo for ipv6', function(done) {

      const ipv6 = '566f:2401:22be:9a6d:23ef:2558:5545:b3fe';
      const peerInfo = ethereumdMocks.getPeerInfoEmpty();
      const ipInfo = {
        out: ipv6 + '\n'
      };

      const serviceStubs = {
        'services/bash.js': {
          exec: () => Promise.resolve(ipInfo)
        },
        'services/ethereumd.js': {
          getPeerInfo: () => Promise.resolve(peerInfo),
          getNetworkInfo: () => Promise.resolve(ethereumdMocks.getNetworkInfoWithoutTor()),
        }
      };

      const networkLogic = proxyquire('logic/network.js', serviceStubs);

      networkLogic.getethereumdAddresses().then(function(response) {
        assert.equal(response.length, 1);
        assert.equal(response[0], ipv6);

        done();
      });
    });

  });
});
