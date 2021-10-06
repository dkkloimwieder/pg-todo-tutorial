# Postgraphile and Graphql: Structure for Everyone

In this section we will get to play with [postgraphile][postgraphile] via CLI and then setup [express.js][express] as a more permanent solution.

[postgraphile]: <https://www.graphile.org/postgraphile/>
[express]: <https://expressjs.com/>

## Section 2, Postgraphile and Friends

If you are following along jump to **Start Section 2** below but if you are just now starting the tutorial at branch `section-2` you will want to make sure you have a postgres instance up and running with an appropriately configured `.env`. I have provided defaults that are not at all secure, at the very least a password change might be in order. Make sure to add `.env` to your `.gitignore` and then:

```sh
 yarn install && yarn global add db-migrate
 docker-compose -f todo_db/docker-compose.yml up -d
 db-migrate up
```

---

**Start Section 2**

Now lets test the database with `pgcli` or `psql` (You can use any postgres client really)

```sh
pgcli "postgres://postgres:SAMPLE_PASSWORD@127.0.0.1/todo_db"
```

Now at the prompt we will list the contents of our `todo` table on our `todo_public` schema:

```psql
postgres@127:todo_db> \d todo_public.todo 
```

This should produce the output:

```psql
+------------+--------------------------+----------------------------------------------------------------+
| Column     | Type                     | Modifiers                                                      |
|------------+--------------------------+----------------------------------------------------------------|
| id         | integer                  |  not null default nextval('todo_public.todo_id_seq'::regclass) |
| task       | text                     |  not null                                                      |
| completed  | boolean                  |  default false                                                 |
| created_at | timestamp with time zone |  default now()                                                 |
+------------+--------------------------+----------------------------------------------------------------+
Indexes:
    "todo_pkey" PRIMARY KEY, btree (id)

Time: 0.015s
postgres@127:todo_db>
```

If your client cannot connect or you cannot list the table something has gone awry. Try `\dt todo_public.*` to see if any table has been created under the schema `todo_public`. If you cannot connect check that your environmental variables are correct. The connection string is of the form `"postgres://POSTGRES_USER:POSTGRES_PASSWORD@POSTGRES_HOST/POSTGRES_DB"`. I am certain you will have it figured out in no time. If not, open an issue on the [github][source].

Install `postgraphile` and a plugin to simplify naming **globally**. Do not worry we will get rid of our global install when we are don with them. For now it is convenient for command line usage.

`yarn global add postgraphile @graphile-contrib/pg-simplify-inflector`

In a new terminal let's run postgraphile from the command line:

```sh
postgraphile "postgres://postgres:SAMPLE_PASSWORD@127.0.0.1/todo_db -s todo_public --enhance-graphiql --append-plugins @graphile-contrib/pg-simplify-inflector --watch`
```

We are greeted by

```sh
PostGraphile v4.12.4 server listening on port 5000 🚀

  ‣ GraphQL API:         http://localhost:5000/graphql
  ‣ GraphiQL GUI/IDE:    http://localhost:5000/graphiql
  ‣ Postgres connection: postgres://postgres:[SECRET]@127.0.0.1/todo_db
  ‣ Postgres schema(s):  todo_public
  ‣ Documentation:       https://graphile.org/postgraphile/introduction/
  ‣ Node.js version:     v14.17.5 on linux x64
  ‣ Join Postlight in supporting PostGraphile development: https://graphile.org/sponsor/

* * *
```

Click the "GraphiQL GUI/IDE" link or open localhost:5000/graphiql in your browser.

<details>
<summary>Here is a screenshot if you would like to compare</summary>

![graphiql in the browser](assets/pg-todo-tutorial_graphiql.png)
</details>

Voila! We have easy access to our `todo` table. The `graphiql` explorer is primarily divided into four panes. The first is populated with queries or mutations depending on which you select that can built. The second is the actual interface to graphql queries. Clicking on items in the first pane will incrementally build queries in the second. The third pane is the output from the queries and the final pane is our documentation that postgraphile automagically generates for us.

```gql
query MyQuery {
  todos {
    totalCount
  }
}
```

Lets use the first pane to build a query. Select the `todos` dropdown and then check the `totalCount` box. Notices that it builds the query for us. Pressing the "play" button or `ctl-Enter` will run the query.

```json
{
  "data": {
    "todos": {
      "totalCount": 0
    }
  }
}
```

>Note: The pg-simplify-inflector simplifies the "inflection" or the method that it uses to create names when analyzing the database. Postgraphile is by default very verbose/explicit with naming as it [leads to less accidental conflicts][inflection]. In out example there is very little difference but try starting postgraphile without it and you will get the general idea of what it does.

[inflections]: <https://www.graphile.org/postgraphile/inflection/>

Before we move on lets explore the documentation and see what postgraphile has generated for us so far.
We are primarily interested in adding a todo at this point, as we have none. Browse `mutations` and then `input:CreateTodoInput`. And then `todo:TodoInput`. Now we know! Although not really. The fields for input are listed but what if our coworker also wanted to explore our newly created API? Maybe we should add some helpful coments in out database that describe the fields that we will be using. Back to the SQL!

Another migration: `db-migrate create todo-comments`. Edit `migrations/sqls/#####-todo-comments-up.sql`

```sql
COMMENT ON TABLE todo_public.todo IS 'task and associated fields to accomplish';
COMMENT ON COLUMN todo_public.todo.id IS 'primary key/identifier of todo';
COMMENT ON COLUMN todo_public.todo.task IS 'the specific objective of todo';
COMMENT ON COLUMN todo_public.todo.created_at IS 'time of todo creation';
COMMENT ON COLUMN todo_public.todo.completed IS 'status of todo';
```

and corresponding `migrations/sqls/######-todo-comments-down.sql`

```sql
COMMENT ON TABLE todo_public.todo IS NULL; 
COMMENT ON COLUMN todo_public.todo.id IS NULL;
COMMENT ON COLUMN todo_public.todo.task IS NULL; 
COMMENT ON COLUMN todo_public.todo.created_at IS NULL;
COMMENT ON COLUMN todo_public.todo.completed IS NULL;
```

>Note: COMMENT is postgreql specific

`db-migrate up`

Now back to the browser. Our documentation is magically updated. Who knew databases were so good at centralizing the storage of information?

So lets create a todo. If we look in the leftmost panel we see only queries. Go to the second panel and clear it and then try `ctl-space`. This is perhaps the most helpful feature besides generating all of our schemas, serving them, and documenting them. It should list four options. We want a mutation. The first panel will now show our available schemas. Select `createTodo` and then the required fields(they are indicated by an asterisk: input -> todo -> task). Now we must simply enter a task and... Also specify what we want our mutation to return. In our case it will be `todo`. Select all the fields. We want to be able to take a look at the new todo that has been generated. Out mutation now looks like:

```gql
mutation {
  createTodo(input: {todo: {task: "Finish Section 2"}}) {
    todo {
      id
      completed
      createdAt
      task
      nodeId
    }
  }
}
```

Run it and take a look at the output. Here is my browser in case there is any confusion.

<details>

<summary>click to expand screenshot</summary>

![graphiql mutations](assets/pg-todo-tutorial_graphiql-createTodo.png)

</details>

Everything looks as it should. You will notice the `id` field in my example is not `1` but yours likely will be as it corresponds to the first `todo` that has been created in the database. Serial `id` keys are not always optimal but for our purpose they are sufficient. There is a new field that is not in the database: `NodeId`.

Ohhhh `NodeId`, where do you come from? Look in the documentation. It will tell you something like

`The ID scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as "4") or integer (such as 4) input value will be accepted as an ID.`

Graphql is gets much of its power and usefulness from the fact that it *normalizes* our data. Each piece of data in graphql gets a unique identifier. The key is a hash of the data and allows us to query our endpoint with laser precision, and then also to cache the query. We will not need the NodeId for quite some time, but it is nice to know we can get a hold of any of our nodes(todos) by NodeId if the need arises (like client side cache manipulation).

Have fun with graphiql for a little while. Make sure that you can fetch all the todos and fields, and perform an update and a deletion. Hint: The explorer (the first panel in graphiql) is your friend. Drop downs follow if you get stuck.

<details>
<summary>All Todos</summary>

```gql
Total count of all todos and all of the fields:

{
  todos {
    totalCount
    nodes {
      completed
      createdAt
      id
      nodeId
      task
    }
  }
}
```

</details>

<details>
<summary>Delete todo</summary>

```gql
Delete todo with id 3 and return deleted todo with all fields:

mutation {
  deleteTodo(input: {id: 3}) {
    todo {
      nodeId
      completed
      createdAt
      id
      task
    }
  }
}
```

</details>

<details>
<summary>Update completed</summary>

```gql

Update completed to true of todo id 4 and return todo with all fields:

mutation {
  updateTodo(input: {patch: {completed: true}, id: 4}) {
    todo {
      completed
      createdAt
      id
      nodeId
      task
    }
  }
}

```

</details>
