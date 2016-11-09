module.exports = {
  dbConnectionOptions: {
    host: 's2rwotdbinstance.cd1atnljqjnm.us-west-2.rds.amazonaws.com',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'password',
    database: 'wot',
    ssl: "Amazon RDS"
  },

  port: process.env.PORT || 3000,

  wgAppID: '7c6bb9f5b4ebb263c4fecfe190103f40',

  updateDbOnStart: process.env.UPDATE_DB || false


}