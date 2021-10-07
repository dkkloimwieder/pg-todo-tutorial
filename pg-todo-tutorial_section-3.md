# Postgraphile and Graphql: Structure for Everyone

In this section we will create a [react][react] frontend that will use [apollo-client][apollo-client] to communicate with our new [postgraphile][postgraphile]/[postgresql][postgres] backend.

[postgraphile]: <https://www.graphile.org/postgraphile/>
[react]: <https://reactjs.org/>
[apollo-client]:<https://www.apollographql.com/docs/react/> 
[postgres]:<https://www.postgresql.org/>

## Section 3, React & Apollo 

If you are following along jump to **Start Section 3** below but if you are just now starting the tutorial at branch `section-3` you will want to make sure you have a postgres instance up and running with an appropriately configured `.env`. I have provided defaults that are not at all secure, at the very least a password change might be in order. Make sure to add `.env` to your `.gitignore` and then:

```sh
 yarn install && yarn global add db-migrate
 docker-compose -f todo_db/docker-compose.yml up -d
 db-migrate up
```

---

**Start Section 3**

First things first lets create a react app. 

```sh
npx create-react-app client
```

It's just that easy. Now as a user of the todo frontend what do I want to be able to do with the all the todos that I might have in the `todo_db`? Thats a lot of "todo" in one single sentence. Minimum viable product is likely just to display the list of todos. We will need `@apollo/client` and `graphql` to interface with `postgraphile`.

```sh
yarn add @apollo/client graphql
```

And then pretty much straight from the Apollo [documentation](<https://www.apollographql.com/docs/react/get-started/>)

```js

/* client/index.js */

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client";

const client = new ApolloClient({
  uri: '127.0.0.1:4000/graphql', /* this should look familiar from our server index.js */
  cache: new InMemoryCache()
});

ReactDOM.render(
  <ApolloProvider client={client}> 
    <App />
  </ApolloProvider>,  document.getElementById('root'),
);

```

We define a new apollo client and then wrap the top level react component with it. This wrapping should look familiar if you have ever used a state management library like redux or even react context. Except our store is a caching graphql client backed by a postgres database. Neato!

But we need an actual app component and probably some graphql queries. 