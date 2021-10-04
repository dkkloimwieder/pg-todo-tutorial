# Postgres and Graphql: Structure for Everyone
  
  **TL;DR** The structured nature of [Postgres][postgres] (A relational database mangement system) allows [Postgraphile][postgraphile] to generate a wonderful interface to [Graphql][graphql]. [Project Source at Github][source]
  
  [source]:<https://github.com/dkkloimwieder/pg-todo-tutorial>
  [postgres]:<https://www.postgresql.org/>
  [postgraphile]:<https://www.graphile.org/postgraphile/>
  [graphql]:<https://graphql.org/>

## Why Postgres and Graphql?

[Postgres][postgres] (AKA PostgreSQL) is an opensource relational database management system that is well established and time tested. [Graphql][graphql] is a very modern method of fetching data from api endpoints that offers some unique advatages over more traditional approaches. Besides the some letters in their respective names, both technologies provide the developer with the advantage of a structured schema and normalized data. [Postgraphile][postgraphile] is an open source project which translates Postgres structure(tables, schemas, functions, etc.) to Graphql structure (schema and resolvers). Queries made with graphql are efficiently translated into sql, allowing a developer to fetch exactly the data neccesary with all the niceties that come for free with Postgres (performance, stability, security...)

This project will provide a brief overview of the underlying tools used to connect a javascript frontend to a postgres backend via graphql to build a very simple todo list using Postgraphile, Apollo, and React.

## Project Requirements

This project requires a basic working knowledge of [Git][git], [Node][node], and a local install of [Docker][docker] with [Docker-Compose][docker-compose] for creating an isolated Postgres database. Please refer to the official documentation for installation as it varies by operating system and is outside the scope of this tutorial. If you would prefer to use a local installation of Postgres this tutorial will still apply; skip the the docker-compose configuration and adjust the provided .env as neccesary. The corresponding [repo][source] is divided into branches in case you would like to start with a relatively clean slate or jump ahead.

[git]:<https://git-scm.com/>
[node]:<https://nodejs.org/en/>
[docker]:<https://www.docker.com/>
[docker-compose]:<https://docs.docker.com/compose/>

## Create a Postgres instance

This section begins with the `section-1` branch and includes a little directory structure, a `.env`, `database.json`, and a `docker-config.yml`. Let's begin: `git checkout section-1`

>Note: In the root directory of the project first please have a look at the provided `.env` file.  Please note that typically `.env` would ==**never**== be included in a public git repository. Its purpose is to provide a central place for environemtal variables which may or may not be super secret stuff like passwords or connection settings. Please make sure to add `.env` to your local .gitignore before proceeding: ` echo '.env' >> .gitignore `

Let's take a look at the `.env`. The first three lines will be used by docker-compose to configure the new postgres instance with a required user, password and database name:

```.env
  POSTGRES_USER=postgres
  POSTGRES_PASSWORD=SAMPLE_PASSWORD
  POSTGRES_DB=todo_db
```

The two additional lines will be used by `db-migrate`, `postgraphile`, and `express` and will correspond to the port and host of our soon to be running dockerized postgres instance:

```.env
  POSTGRES_PORT=5432
  POSTGRES_HOST=127.0.0.1
```

Next lets take a look at out `todo_db/docker-compose.yml`

```yml
  version: "3.8"
  services:
    postgres:
      image: "postgres"
      ports:
        - "5432:5432"
      volumes:
        - todovolume:/var/lib/postgresql/data/
      env_file:
        - ../.env
  volumes:
    todovolume:
```

This file is responsible for the configuration of `docker-compose`. It specifies that we will use the official `postgres` docker image. `ports` specifies the exposed external port followed by the internal port postgres is using. Specifying `volumes` allows us to persist out database data. The volume will be created the first time that the container is brought up. `env_file` allows us to centralize(for the most part) our environment details. Refer to the [official][docker-compose] documentation if you would like to know more about the structure and specifics of `docker-compose.yml`.

Now lets spin up postgres!

```sh
docker-compose up -d
```

You are at this point greeted with some output indicating success. The `-d` flag simply detatches the process from the terminal so that we can continue to use it.

## Migrations

At this point we need a way to manage the modifications we make to postgres. In the database world these modifications are commonly known as migrations. There are many tools that are great at doing this job and a variety of languages that are used to script migrations including javascript, ruby, and go. Despite the availability of tools which allow us to use other languages, we will opt for using raw SQL and the very simple [db-migrate][db-migrate] available through npm. Using SQL to modify a postgres database is infinitely more documented than other methods, which for our purposes (education) makes life a little easier. We will make sure we are in the root project directory (`pg-todo-tutorial`) and:

```sh
yarn install
```

This will install `db-migrate`, `db-migrate-pg`, and `dotenv`. Then we will:

```sh
yarn global add db-migrate
```

Why do we need `db-migrate`available globally? It is recommended as the method for install by the official documentation as it is primarily used on the command line. It will find the local install when running globally and in fact use it so there are no worries about project specific versioning.

[db-migrate]:<https://db-migrate.readthedocs.io/en/latest/>

Next lets look at `.db-migraterc`:

```.rc
  {
    "sql-file" : true
  }
```

This allows us to avoid specifying the type of migration that we will generate via command line argument.
Now lets take a look at `database.json`:

```json
{
  "dev": {
    "driver": "pg",
    "user": {"ENV": "POSTGRES_USER"},
    "password": {"ENV": "POSTGRES_PASSWORD"},
    "host": {"ENV": "POSTGRES_HOST"},
    "database": {"ENV": "POSTGRES_DB"},
    "port": {"ENV": "POSTGRES_PORT"}
  }
}
```

`database.json` will pull in out environmental variables from our `.env` because we have installed `dotenv`.

Now lets create a migration!

```sh
  db-migrate create create-schema
```

This command generates a migration script in the newly created `migrations` folder and 2 files in the newly created `sqls` subfolder. These files begin with several numbers corresponding to the time they were created. We are only interested in the `.sql` files.

In the `#############-create-schema-up.sql` file lets write some SQL!

```sql
CREATE SCHEMA IF NOT EXISTS todo_public;
```

and now a corresponding down migrationg in `##############-create-schema-down.sql`

  ```SQL
  DROP SCHEMA todo_public;
  ```

So what's going on here? If you have not seen too much sql and it appears its yelling at you with a harsh tone of capitalization, do not worry, that is just a formality. SQL is case insensitive so often times it increases readability if SQL keywords are capitalized. Feel free to use all lowercase everything if you prefer. Why do we need to migrations? For everything we do to modify the database, we want to be able to easily revert our changes. This practice is somewhat [contested][stackoverflow-migration], although I tend to like it, especially during projects like this which are primarily for experimentation.

[stackoverflow-migration]:<https://nickcraver.com/blog/2016/05/03/stack-overflow-how-we-do-deployment-2016-edition/#database-migrations>

Now lets run the first migration: `db-migrate up`

Now we are good to go with a fresh schema. Postgraphile uses schema as namespaces and later on in this series you will understand how separating our database into schemas will help when we get to best security practices. For now just know its a way for us to identify specifically where we want postgraphile to track for building graphql resolvers. Take a look into your database with `pgcli` and list the table with `\dt`. You will notice the migrations are actually stored in the database itself. `\dn` will show your newly created schema. `\dt todo_public.*` will list all the tables in the schema, which at this point should be exactly none.

Next we will add a migration for our todos. `db-migrate create create-todo-table`. This will generate two new empty sql files in `migrations/sqls` and we will fill them with sql to create and drop a new table.

`migrations/sqls/############-create-todo-table-up`:

```sql
CREATE TABLE todo_public.todo (
  id serial PRIMARY KEY,
  task text NOT NULL,
  completed boolean DEFAULT FALSE,
  created_at timestamptz DEFAULT now()
);
```

This will create a new table named `todo` on our `todo_public` schema with an `id`, a `task`, a `completed` boolean defaulted to false and a timestamp(with time zone), `created_at` that will default to the current time.

`migrations/sqls/#############-create-todo-table-down`:

```sql
DROP TABLE todo_public.todo;
```

The down migrations simply drops the table.

`db-migrate up` and we are off to the next section.


