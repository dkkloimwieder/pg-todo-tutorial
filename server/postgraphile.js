const { postgraphile } = require('postgraphile');
const PgSimplifyInflectorPlugin = require('@graphile-contrib/pg-simplify-inflector');

const {POSTGRES_DB, POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT} = process.env

module.exports = postgraphile(
  {
    database: POSTGRES_DB,
    host: POSTGRES_HOST,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    port: POSTGRES_PORT
  },
  'todo_public',
  {
    appendPlugins: [PgSimplifyInflectorPlugin],
    watchPg: true,
    graphiql: true,
    enhanceGraphiql: true
  }
)

