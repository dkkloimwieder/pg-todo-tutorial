# WIP - Postgraphile Todo Tutorial - WIP
  
  Plenty to cover (in relatively harmless doses)

  - postgres via docker-compose
  - db-migrate / db-migrate-pg
  - SQL SQL SQL (also plpgsql)
  - postgraphile
  - graphiql (this is the fun part)
  - express
  - apollo-client
  - pg_notify and pubsub with... SQL
  - react (it plays nice with apollo client)

##Prerequisites

  The largest prerequisite is to have docker and docker-compose installed
  locally for the postgresql database, or have a running local postgres instance that you don't mind experimenting on. Knowledge of javascript, the node.js ecosystem, and a basic understanding of react.js is assumed. React might get glossed over a little as there are thousands of great resources on the subject.

##Branches

  This repo is divided into a few sections that allow you to skip over some bolierplatey setup if you like. I have tried to centralize the environmental variables to make life easier on everyone. The provided source will start from the beginning of each section and the tutorial will get you (hopefully) to the end.

    [x] section-1 - Setup of docker-compose with postgres, initial migrations to setup a schema and table in postgres
    [x] section-2 - Postgraphile CLI, fun with graphiql, express
    [] section-3 - Apollo-client, React, pubsub with websockets
    [x] main - current 

