module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'kmax-api',
      script: 'server.js',
      env: {
        NODE_ENV: 'local',
        instances: 0,
        exec_mode: 'cluster',
      },
      env_development: {
        NODE_ENV: 'development',
        instances: 0,
        exec_mode: 'cluster',
      },
      env_production: {
        NODE_ENV: 'production',
        instances: 0,
        exec_mode: 'cluster',
      },
    },
  ],
};
