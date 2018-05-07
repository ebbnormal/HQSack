function loadConfig() {
  if (process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'production') {
    return require('./config.production.json');
  }

  return require('./config.development.json');
}

module.exports = loadConfig();