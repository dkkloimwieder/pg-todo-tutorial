# Postgraphile and Graphql: Structure for Everyone

In this section we will create a [react][react] frontend that will use [apollo-client][apollo-client] to communicate with our new [postgraphile][postgraphile]/[postgresql][postgres] backend.

[postgraphile]: https://www.graphile.org/postgraphile/
[react]: https://reactjs.org/
[apollo-client]: https://www.apollographql.com/docs/react/
[postgres]: https://www.postgresql.org/

## Section 3, React & Apollo

If you are following along jump to **Start Section 3** below but if you are just now starting the tutorial at branch `section-3` you will want to make sure you have a postgres instance up and running with an appropriately configured `.env`. I have provided defaults that are not at all secure, at the very least a password change might be in order. Make sure to add `.env` to your `.gitignore` and then:

```sh
 yarn install && yarn global add db-migrate
 docker-compose -f todo_db/docker-compose.yml up -d
 db-migrate up
```

To install both server and client projects (inside the project root directory):

```sh
yarn install && cd client && yarn install
```

---

### Start Section 3

As users of a todo list what could possibly motivate us to want or require subscriptions? Perhaps the list is a shared resource and we would like to stay up to date with the most current version. An alternative might be to poll the server every so often for updates. Polling is simpler, but less efficient use of network resources (nevermind that I am on a single machine with the list at this point). But primarily I want subscriptions on a simple todo list because it is a good opportunity to learn and venture into a little bit of PL/pgSQL programming.

The initial setup that we will require for websockets communication between postgraphile and apollo has been completed. It is primarily straight from the [apollo subscription][apollo-subscription] and [postgraphile subscription][postgraphile-subscription] documentation.

[apollo-subscription]<https://www.apollographql.com/docs/react/data/subscriptions/>
[postgraphile-subscription]<https://www.graphile.org/postgraphile/subscriptions/>

Note that if you have not started "fresh" in this section and are following along in the series of turoials you will need to merge the relevant parts in `src/postgraphile.js` and `client/src/index.js` and additionally `yarn install @graphile/pg-pubsub` in the project root.

Let's take a look at the setup:

```js
/* src/postgraphile.js */

const { postgraphile, makePluginHook } = require('postgraphile');
const PgSimplifyInflectorPlugin = require('@graphile-contrib/pg-simplify-inflector');
const { default: PgPubsub } = require('@graphile/pg-pubsub');

const pluginHook = makePluginHook([PgPubsub]);

const {
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
} = process.env;

module.exports = postgraphile(
  {
    database: POSTGRES_DB,
    host: POSTGRES_HOST,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    port: POSTGRES_PORT,
  },
  'todo_public',
  {
    appendPlugins: [PgSimplifyInflectorPlugin],
    watchPg: true,
    graphiql: true,
    enhanceGraphiql: true,
    simpleCollections: 'only',
    graphileBuildOptions: { pgOmitListSuffix: true },
    classicIds: true,
    pluginHook,
    subscriptions: true,
    simpleSubscriptions: true,
  }
);
```

The changes in this file are minor. After the new imports, we make use of the `pg-pubsub` plugin via `makePluginHook` and pass it to the postgraphile options object along with `subscriptions: true` and `simpleSubscriptions: true`. Note that "plugin hooks" are used for server plugins, while the `appendPlugins` option is used for schema plugins. We are using `simpleSubscriptions` which will allows us to listen on arbitrary channels and optional recieve a graphql nodeId and node. This will be made more clear once we start implenting our subscriptions.

```js
/* client/src/index.js */
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  split,
  HttpLink,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
});

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphiql',
  options: {
    reconnect: true,
  },
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          todos: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
  }),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);
```

The client's `index.js` requires importing a several things all from `@apollo/client`. From there we define and `httpLink` (what we were using previously) and a new `wsLink` for our subscriptions. `splitLink` allows us to define a function as its first argument and then returns either its second or third argument depending on whether that function evaluates to "truthy" or "falsey", respectively. In this case if the incoming operation is a subscription then we return our `wsLink`, and if not, our regular old `httpLink`. Then we pass the `splitLink` to our client. Both these files are almost verbatim from the excellent documentation. Make sure to check it out!

The server and client should both run without any issues at this point but in order to make use of subscriptions over websockets we first need our database to notify our client of changes. First we should decide of what we would like to be notified. Newly created todos sound like a good place to start. We must migrate!

```sh
db-migrate create trigger-function-todo
```

As a refresher this will generate two new .sql stubs for us to edit in `migrations/sqls`.

```sql
-- migrations/sqls/########-trigger-function-todo-up.sql

CREATE OR REPLACE FUNCTION notify_todo()
   RETURNS trigger AS $$
   BEGIN
     PERFORM pg_notify(
         'postgraphile:todo',
         json_build_object('__node__', json_build_array('todos', NEW.id))::text);
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

```

Oh My! There are some things going on here. First we define a new function that returns with the type "trigger". Functions that return triggers never take arguments so the signature will almost always be:

```sql
CREATE OR REPLACE FUNCTION notify_todo() RETURNS trigger AS
```

`$$` is a form of quotes that does not require us to escape single quotes. The closes thing in JS is probably a backtick. The function is then enclosed in `BEGIN ... END;` Now for the actual function:

`PERFORM` is used here in place of a `SELECT` statement because we are not assigning the return value of `pg_notify()`. pg_notify in turn is a function used as an alternative to `NOTIFY` in postgres. Its signature is:

pg_notify(text, text) where the first argument will be the channel and the second argument will be the payload. In our case channel is 'postgraphile:todo'. Note that postgraphile prefixes the topic 'todo' with 'postgraphile:' when it builds the schema for a subscription, so this will always be the case for this field (Parenthetical note: This behavior can be overhidden). Our payload is slightly more complicated:

json_build_object() - postgres function that takes an even number of arguments to build object of the form{argument0:argument1, argument2:argument3... }. In our case we are just building the relevant graphql node as text:

{'\_\_node\_\_': [table_name(see note from documentation), primary_key]}::text

> From postgraphile docs: "IMPORTANT: this is not always exactly the table name; base64 decode an existing nodeId to see what it should be." An example in our case: id of "WyJ0b2RvcyIsMTAyXQ==" turns into "["todos",102]" so "todos" works just fine.

The primary key is obtained through `NEW.id`. `NEW` is a special variable that we get for free when creating a trigger. Postgres passes the new row that has triggered the function so that we can make use it (Postgres actually passes many things to us, but we will see that in a bit). The primary key on `todos` is `id`.

json_build_array() is another Postgres helper function used to create a array and `::text` is postgres syntax to cast to `text`.

Then we return `NEW`. Trigger functions for inserts need to return `NEW` or `NULL`. We are actually building an `AFTER` trigger so we could return `NULL`, Postgres will not make use of it, but if we _wanted_ a `BEFORE` trigger we will be returning the proper result. The [documentation][trigger] goes into all of the details but trigger functions will return `NEW`, `OLD`, or `NULL`, and on inserts go with `NEW`

And thats it.

Ha no its not. We need the `TRIGGER`:

```sql
 CREATE TRIGGER trigger_todo
    AFTER INSERT
    ON todo_public.todo
    FOR EACH ROW
    EXECUTE PROCEDURE notify_todo();
```

The trigger is a little less complex than the function. The first line names the trigger. Lines 2 and 3 define the operation that is doing the actual triggering. In this case it is and insert operation on our todo table. `FOR EACH ROW` defines that it is a row level trigger; It fires once per inserted row, regardless of us inserting a single row or 1000 rows. The last line calls the function that we previously defined. Easy breezy. We will append that to our
up migration and now we will write the corresponding down migration:

```sql
--migrations/sqls/#######-trigger-function-todo-down.sql

DROP TRIGGER IF EXISTS trigger_todo ON todo_public.todo;
DROP FUNCTION IF EXISTS notify_todo();
```

Here we just drop the trigger followed by the function. Note that `DROP TRIGGER` requires a table, and that in postgres DROP FUNCTION requires the arguments of the function. Now let's bring up the migration and test out subscriptions!

If you docker container is not yet running:

```sh
docker-compose -f todo_db/docker-compose.yml up -d
```

Migrate and start the server:

```sh
db-migrate up
yarn start
```

Now lets open up graphiql in the browser which should be running at 127.0.0.1:4000/graphiql. Our new subscription:

```gql
subscription NotifyTodo {
  listen(topic: "todo") {
    relatedNode {
      ... on Todo {
        task
        completed
        createdAt
      }
    }
    relatedNodeId
  }
}
```

The graphiql documentation section (column/panel 4 in the browser) is a little lacking here. It will get you as far as `listen(topic:String!) ListenPayload!`, and that ListenPayload takes the from of `relatedNode: Node` and `relatedNodeId: ID`. If we checkout Node we can see it has only one field: id. So we can get the id of our created node twice... Not so useful. From [graphql.org][nodes]:

[nodes]: https://graphql.org/learn/global-object-identification/#node-interface

> The server must provide an interface called Node. That interface must include exactly one field, called id that returns a non-null ID.
> This id should be a globally unique identifier for this object, and given just this id, the server should be able to refetch the object.

So in graphql land `Todo` implements `Node` and `... on Todo` is the graphql syntax for specifying the fields specific to `Todo`. Why would we need `relatedNodeId`? If we were to perform an operation that removed our `Todo`, the server will return `null` for our `relatedNode` and we might have a use case for identifying what was deleted, like updating the frontend.

Now we can run the subscription query!

`"Waiting for subscription to yield data…"`

So now to another graphiql browser window at 127.0.0.1:4000/graphiql so we can create a todo, trigger pg_notify() in our database, and then receieve the relevant data via our graphql subsciption.

```gql
mutation {
  createTodo(input: { todo: { task: "subscribe to some todos" } }) {
    todo {
      id
    }
  }
}
```

Upon execution, we should recieve the new todo via our subscription in browser window one:

```json
{
  "data": {
    "listen": {
      "relatedNode": {
        "id": "WyJ0b2RvcyIsNzI1XQ==",
        "task": "subscribe to todos",
        "createdAt": "2021-10-15T13:08:04.563593+00:00",
        "completed": false
      },
      "relatedNodeId": "WyJ0b2RvcyIsNzI1XQ=="
    }
  }
}
```

Within a few milliseconds we have recieved the newly created todo! But we can not yet check off this particular task. In order to "subscribe to todos" I think we need to subscribe to the entirety of their functionality. In our case we are missing updating the completion field and deleting. There are two ways we could go about doing this:

1. Subscribe to each event serparately though 3 separate triggers.
2. Subscribe to insert, delete, and update together and process the events with logic in the frontend

I think subscribing separately has the merit of granularity, which is one of our end goals of using graphql; However, the three operations will likely always be grouped together with our todos so a single subscription makes sense here. We are here to learn (I am at the very least) so lets first write three seperate triggers and then we can look at grouping them all together. We have written the create/insert function/trigger so let's look at update and delete. First lets bring down our subscription migration.

```sh
db-migrate down
```

For simplicty we will simply edit our `########-trigger-function-todo-up.sql` instead of creating new migrations.

```sql
-- migrations/sqls/########-trigger-function-todo-up.sql

CREATE OR REPLACE FUNCTION notify_todo_create()
   RETURNS trigger AS $$
   BEGIN
     PERFORM pg_notify(
         'postgraphile:createTodo',
         json_build_object('__node__', json_build_array('todos', NEW.id))::text);
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION notify_todo_update()
   RETURNS trigger AS $$
   BEGIN
     PERFORM pg_notify(
         'postgraphile:updateTodo',
         json_build_object('__node__', json_build_array('todos', NEW.id))::text);
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION notify_todo_delete()
   RETURNS trigger AS $$
   BEGIN
     PERFORM pg_notify(
         'postgraphile:deleteTodo',
         json_build_object('__node__', json_build_array('todos', OLD.id))::text);
     RETURN OLD;
   END;
   $$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_todo
    AFTER INSERT
    ON todo_public.todo
    FOR EACH ROW
    EXECUTE PROCEDURE notify_todo_create();

CREATE TRIGGER trigger_todo
    AFTER INSERT
    ON todo_public.todo
    FOR EACH ROW
    EXECUTE PROCEDURE notify_todo_update();

CREATE TRIGGER trigger_todo
    AFTER INSERT
    ON todo_public.todo
    FOR EACH ROW
    EXECUTE PROCEDURE notify_todo_delete();
```

Whoa! The sql is yelling all the same words over and over. Important to note is that the delete operation requires the use of the `OLD` record that postgres gifts us.
