const express = require('express');
const router = express.Router();

const systemLogic = require('logic/system.js');
const diskLogic = require('logic/disk');
const ethereumdLogic = require('logic/ethereumd.js');
const safeHandler = require('utils/safeHandler');

router.get('/ethereum-p2p-connection-details', safeHandler(async(req, res) => {
  const connectionDetails = systemLogic.getethereumP2PConnectionDetails();

  return res.json(connectionDetails);
}));

router.get('/ethereum-rpc-connection-details', safeHandler(async(req, res) => {
  const connectionDetails = systemLogic.getethereumRPCConnectionDetails();

  return res.json(connectionDetails);
}));

router.get('/ethereum-config', safeHandler(async(req, res) => {
  const ethereumConfig = await diskLogic.getJsonStore();
  return res.json(ethereumConfig);
}));

// updateJsonStore / generateUmbrelethereumConfig / generateethereumConfig are all called through these routes below so that even if user closes the browser prematurely, the backend will complete the update.

router.post('/update-ethereum-config', safeHandler(async(req, res) => {
  // store old ethereumConfig in memory to revert to in case of errors setting new config and restarting ethereumd
  const oldethereumConfig = await diskLogic.getJsonStore();
  const newethereumConfig = req.body.ethereumConfig;
  
  try {
    await diskLogic.applyCustomethereumConfig(newethereumConfig);
    await ethereumdLogic.stop();

    res.json({success: true});
    
  } catch (error) {
    // revert everything to old config values
    await diskLogic.applyCustomethereumConfig(oldethereumConfig);

    res.json({success: false}); // show error to user in UI
  }
}));

router.post('/restore-default-ethereum-config', safeHandler(async(req, res) => {
  // store old ethereumConfig in memory to revert to in case of errors setting new config and restarting ethereumd
  const oldethereumConfig = await diskLogic.getJsonStore();
  
  try {
    await diskLogic.applyDefaultethereumConfig();
    await ethereumdLogic.stop();

    res.json({success: true});
    
  } catch (error) {
    // revert everything to old config values
    await diskLogic.applyCustomethereumConfig(oldethereumConfig);

    res.json({success: false}); // show error to user in UI
  }
}));

module.exports = router;