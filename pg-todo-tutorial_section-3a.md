# Postgraphile and Graphql: Structure for Everyone

In this section we will create a [react][react] frontend that will use [apollo-client][apollo-client] to communicate with our new [postgraphile][postgraphile]/[postgresql][postgres] backend.

[postgraphile]: https://www.graphile.org/postgraphile/
[react]: https://reactjs.org/
[apollo-client]: https://www.apollographql.com/docs/react/
[postgres]: https://www.postgresql.org/

## Section 3a, React & Apollo - A Brief Interlude

If you are following along jump to **Start Section 3** below but if you are just now starting the tutorial at branch `section-3` you will want to make sure you have a postgres instance up and running with an appropriately configured `.env`. I have provided defaults that are not at all secure, at the very least a password change might be in order. Make sure to add `.env` to your `.gitignore` and then:

```sh
 yarn install && yarn global add db-migrate
 docker-compose -f todo_db/docker-compose.yml up -d
 db-migrate up
```

---

**Start Section 3**

First things first lets create a react app...

```sh
npx create-react-app client
```

It's just that easy. Now as a user of the todo frontend what do I want to be able to do with the all the todos that I might have in the `todo_db`? Thats a lot of "todo" in one single sentence. Minimum viable product is likely just to display the list of todos. We will need `@apollo/client` and `graphql` to interface with `postgraphile`.

```sh
yarn add @apollo/client graphql
```

And then pretty much straight from the Apollo [documentation](https://www.apollographql.com/docs/react/get-started/)

```js
/* client/index.js */

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
  uri: '127.0.0.1:3333/graphql' /* this should look familiar from our server index.js */,
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);
```

We define a new apollo client and then wrap the top level react component with it. This wrapping should look familiar if you have ever used a state management library like redux or even react context. Except our store is a caching graphql client backed by a postgres database. Neato!

Now we need some react components and probably some graphql queries. Our component structure will be typical of a react todo tutorial App.js -> TodoList.js -> Todo.js, and we will place all of our graphql queries in a graphql.js

Starting with the queries/mutations as we have already worked those out in our graphiql browser interface.Note that the format is slightly different as we need to take input as a variable. Let's take a moment and explore how we might go about doing that in `graphiql` before we start hard coding the queries in `client/src/graphql.js`. In `server/postgraphile.js` we have a couple settings that allow us to continue to experiment in graphiql `graphiql: true` and `enhanceGraphiql: true`. Go ahead and browse to `127.0.0.1/PORT` (PORT is set in .env and unless you have changed it, will be 3333). In the second column/pane of the graphiql interface lets define a new query which will take a variable as its argument:

```gql
query getTodo($todoId: Int!) {
  todo(id: $todoId) {
    id
    task
    completed
  }
}
```

Query `getTodo` will take an argument `$todoId` that is an `Int` type(`!` for required) and will execute `todo()` with the `id` field set to `$todoId`. If we were to run this query graphiql will get angry and will not produce any useful results. We need to define `$todoId` with a value in the small pane labled "query variables" at the bottom of the second column:

```gql
{"todoId": 4}
```

Assuming that you have a todo with the id of 4, its fields will be fetched and displayed in the third column. And if you do not, maybe first query all the todos, or maybe we should just make a new todo with our new variable syntax. Try making a new todo with the task of "take over the world" or whatever you might like.

<details>
<summary>Check here</summary>

```gql
mutation NewTodo($newInput: CreateTodoInput!) {
  createTodo(input: $newInput) {
    todo {
      id
      task
      completed
    }
  }
}
```

In "query variables":

```gql
{
  "newInput": {
   "todo": {
     "task": "take over the world"
   }
 }
}
```

or...

```gql
mutation NewTodo($newTask: String!) {
  createTodo(input: { todo: { task: newTask } }) {
    todo {
      id
      task
      completed
    }
  }
}
```

In "query variables"

```gql
{"newTask":"Take over the world"}
```

I prefer the second approach and it will the one that will be used throughout the rest of the tutorial.

<details>

The documentation on [queries][queries] on graphql.org is excellent. Have a look.

[queries]: https://graphql.org/learn/queries/

```js
/* client/src/graphql.js */

import { gql } from '@apollo/client';

/* Get all To Dos */
export const GET_TODOS = gql`
  query {
    todos {
      nodes {
        id
        task
        completed
      }
    }
  }
`;

/* add a todo */
export const CREATE_TODO = gql`
  mutation CreateTodo($task: String!) {
    createTodo(input: { todo: { task: $task } }) {
      todo {
        id
        task
        completed
      }
    }
  }
`;
```

```js
/* client/src/Todo.js */

import React from react;




/* We know that at the lowest level we need a component that will render some of
   the fields(properties) of out todo - we will go with id, task, and completed */

export default function Todo({id, task, completed}) {

  const [toggleCompleted] = useMutation(TOGGLE_COMPLETED);

  return (
    <div className="todo">
      <input
        type="checkbox"
        id={id} name="todo"
        checked={completed}
        onChange={toggleCompleted()}>
      <label for={id}>{task}</label>
  )
}

```

```js
/* client/src/TodoList.js */
```

```js
/* client/src/Todo.js */
```
