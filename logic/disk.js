const fs = require("fs");
const path = require("path");
const constants = require("utils/const.js");
const diskService = require("services/disk");

// TODO - consider moving these unit conversions to utils/const.js
const GB_TO_MiB = 953.674;
const MB_TO_MiB = 0.953674;

const DEFAULT_ADVANCED_SETTINGS = {
  clearnet: true,
  torProxyForClearnet: false,
  tor: true,
  i2p: true,
  incomingConnections: false,
  cacheSizeMB: 450,
  mempoolFullRbf: false,
  prune: {
    enabled: false,
    pruneSizeGB: 300,
  },
  reindex: false,
  network: constants.ethereum_DEFAULT_NETWORK
}

async function getJsonStore() {
  try {
    const jsonStore = await diskService.readJsonFile(constants.JSON_STORE_FILE);
    return { ...DEFAULT_ADVANCED_SETTINGS, ...jsonStore };
  } catch (error) {
    return DEFAULT_ADVANCED_SETTINGS;
  }
}

async function applyCustomethereumConfig(ethereumConfig) {
  await applyethereumConfig(ethereumConfig, false);
}

async function applyDefaultethereumConfig() {
  await applyethereumConfig(DEFAULT_ADVANCED_SETTINGS, true);
}

async function applyethereumConfig(ethereumConfig, shouldOverwriteExistingFile) {
  await Promise.all([
    updateJsonStore(ethereumConfig),
    generateUmbrelethereumConfig(ethereumConfig),
    generateethereumConfig(shouldOverwriteExistingFile),
  ]);
}

// There's a race condition here if you do two updates in parallel but it's fine for our current use case
async function updateJsonStore(newProps) {
  const jsonStore = await getJsonStore();
  return diskService.writeJsonFile(constants.JSON_STORE_FILE, {
    ...jsonStore,
    ...newProps
  });
}

// creates umbrel-ethereum.conf
function generateUmbrelethereumConfig(settings) {
  const confString = settingsToMultilineConfString(settings);
  return diskService.writePlainTextFile(constants.UMBREL_ethereum_CONF_FILEPATH, confString);
}

// creates ethereum.conf with includeconf=umbrel-ethereum.conf
async function generateethereumConfig(shouldOverwriteExistingFile = false) {
  const baseName = path.basename(constants.UMBREL_ethereum_CONF_FILEPATH);
  const includeConfString = `# Load additional configuration file, relative to the data directory.\nincludeconf=${baseName}`;

  const fileExists = await diskService.fileExists(constants.ethereum_CONF_FILEPATH);

  // if ethereum.conf does not exist or should be overwritten, create it with includeconf=umbrel-ethereum.conf
  if (!fileExists || shouldOverwriteExistingFile) {
    return await diskService.writePlainTextFile(constants.ethereum_CONF_FILEPATH, includeConfString);
  }

  const existingConfContents = await diskService.readUtf8File(constants.ethereum_CONF_FILEPATH);
  
  // if ethereum.conf exists but does not include includeconf=umbrel-ethereum.conf, add includeconf=umbrel-ethereum.conf to the top of the file
  if (!existingConfContents.includes(includeConfString)) {
    return await diskService.writePlainTextFile(constants.ethereum_CONF_FILEPATH, `${includeConfString}\n${existingConfContents}`);
  }

  // do nothing if ethereum.conf exists and contains includeconf=umbrel-ethereum.conf
}

function settingsToMultilineConfString(settings) {
  const umbrelethereumConfig = [];

  // [CHAIN]
  umbrelethereumConfig.push("# [chain]"); 
  if (settings.network !== 'main') {
    umbrelethereumConfig.push(`chain=${settings.network}`)
  }

  // [CORE]
  umbrelethereumConfig.push(""); 
  umbrelethereumConfig.push("# [core]"); 

  // dbcache
  umbrelethereumConfig.push("# Maximum database cache size in MiB"); 
  umbrelethereumConfig.push(`dbcache=${Math.round(settings.cacheSizeMB * MB_TO_MiB)}`); 

  // mempoolfullrbf
  if (settings.mempoolFullRbf) {
    umbrelethereumConfig.push("# Allow any transaction in the mempool of ethereum Node to be replaced with newer versions of the same transaction that include a higher fee."); 
    umbrelethereumConfig.push('mempoolfullrbf=1'); 
  }

  // prune
  if (settings.prune.enabled) {
    umbrelethereumConfig.push("# Reduce disk space requirements to this many MiB by enabling pruning (deleting) of old blocks. This mode is incompatible with -txindex and -coinstatsindex. WARNING: Reverting this setting requires re-downloading the entire blockchain. (default: 0 = disable pruning blocks, 1 = allow manual pruning via RPC, greater than or equal to 550 = automatically prune blocks to stay under target size in MiB).");
    umbrelethereumConfig.push(`prune=${Math.round(settings.prune.pruneSizeGB * GB_TO_MiB)}`);
  }
  
  // reindex
  if (settings.reindex) {
    umbrelethereumConfig.push('# Rebuild chain state and block index from the blk*.dat files on disk.');
    umbrelethereumConfig.push('reindex=1');  
  }


  // [NETWORK]
  umbrelethereumConfig.push(""); 
  umbrelethereumConfig.push("# [network]"); 

  // clearnet
  if (settings.clearnet) {
    umbrelethereumConfig.push('# Connect to peers over the clearnet.')
    umbrelethereumConfig.push('onlynet=ipv4');
    umbrelethereumConfig.push('onlynet=ipv6');
  }
  
  if (settings.torProxyForClearnet) {
    umbrelethereumConfig.push('# Connect through <ip:port> SOCKS5 proxy.');
    umbrelethereumConfig.push(`proxy=${constants.TOR_PROXY_IP}:${constants.TOR_PROXY_PORT}`); 
  }

  // tor
  if (settings.tor) {
    umbrelethereumConfig.push('# Use separate SOCKS5 proxy <ip:port> to reach peers via Tor hidden services.');
    umbrelethereumConfig.push('onlynet=onion');
    umbrelethereumConfig.push(`onion=${constants.TOR_PROXY_IP}:${constants.TOR_PROXY_PORT}`);
    umbrelethereumConfig.push('# Tor control <ip:port> and password to use when onion listening enabled.');
    umbrelethereumConfig.push(`torcontrol=${constants.TOR_PROXY_IP}:${constants.TOR_PROXY_CONTROL_PORT}`);
    umbrelethereumConfig.push(`torpassword=${constants.TOR_PROXY_CONTROL_PASSWORD}`);
  }

  // i2p
  if (settings.i2p) {
    umbrelethereumConfig.push('# I2P SAM proxy <ip:port> to reach I2P peers.');
    umbrelethereumConfig.push(`i2psam=${constants.I2P_DAEMON_IP}:${constants.I2P_DAEMON_PORT}`);
    umbrelethereumConfig.push('onlynet=i2p');
  }

  // incoming connections
  umbrelethereumConfig.push('# Enable/disable incoming connections from peers.');
  const listen = settings.incomingConnections ? 1 : 0;
  umbrelethereumConfig.push(`listen=1`);
  umbrelethereumConfig.push(`listenonion=${listen}`);
  umbrelethereumConfig.push(`i2pacceptincoming=${listen}`);

  umbrelethereumConfig.push(`# Required to configure Tor control port properly`);
  umbrelethereumConfig.push(`[${settings.network}]`);
  umbrelethereumConfig.push(`bind=0.0.0.0:8333`);
  umbrelethereumConfig.push(`bind=${constants.ethereumD_IP}:8334=onion`);

  return umbrelethereumConfig.join('\n');
}

module.exports = {
  getJsonStore,
  applyCustomethereumConfig,
  applyDefaultethereumConfig,
};
