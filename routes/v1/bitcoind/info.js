const express = require('express');
const router = express.Router();
const networkLogic = require('logic/network.js');
const ethereumd = require('logic/ethereumd.js');
const safeHandler = require('utils/safeHandler');

router.get('/mempool', safeHandler((req, res) =>
  ethereumd.getMempoolInfo()
    .then(mempool => res.json(mempool.result))
));

router.get('/addresses', safeHandler((req, res) =>
  networkLogic.getethereumdAddresses()
    .then(addresses => res.json(addresses))
));

router.get('/blockcount', safeHandler((req, res) =>
  ethereumd.getBlockCount()
    .then(blockCount => res.json(blockCount))
));

router.get('/connections', safeHandler((req, res) =>
  ethereumd.getConnectionsCount()
    .then(connections => res.json(connections))
));

router.get('/status', safeHandler((req, res) =>
  ethereumd.getStatus()
    .then(status => res.json(status))
));

router.get('/sync', safeHandler((req, res) =>
  ethereumd.getSyncStatus()
    .then(status => res.json(status))
));

router.get('/version', safeHandler((req, res) =>
  ethereumd.getVersion()
    .then(version => res.json(version))
));

router.get('/statsDump', safeHandler((req, res) =>
  ethereumd.nodeStatusDump()
    .then(statusdump => res.json(statusdump))
));

router.get('/stats', safeHandler((req, res) =>
  ethereumd.nodeStatusSummary()
    .then(statussumarry => res.json(statussumarry))
));

router.get('/block', safeHandler((req, res) => {
  if (req.query.hash !== undefined && req.query.hash !== null) {
    ethereumd.getBlock(req.query.hash)
      .then(blockhash => res.json(blockhash))
  } else if (req.query.height !== undefined && req.query.height !== null) {
    ethereumd.getBlockHash(req.query.height)
      .then(blockhash => res.json(blockhash))
  }
}
));

// /v1/ethereumd/info/block/<hash>
router.get('/block/:id', safeHandler((req, res) =>
  ethereumd.getBlock(req.params.id)
    .then(blockhash => res.json(blockhash))
));

router.get('/blocks', safeHandler((req, res) => {
  const fromHeight = parseInt(req.query.from);
  const toHeight = parseInt(req.query.to);

  if (toHeight - fromHeight > 500) {
    res.status(500).json('Range query must be less than 500');
    return;
  }

  ethereumd.getBlocks(fromHeight, toHeight)
    .then(blocks => res.json(blocks))
}
));

router.get('/txid/:id', safeHandler((req, res) =>
  ethereumd.getTransaction(req.params.id)
    .then(txhash => res.json(txhash))
));

module.exports = router;
