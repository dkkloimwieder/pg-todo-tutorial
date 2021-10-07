import React, { useState } from 'react';
import Todo from './Todo';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TODOS, CREATE_TODO } from './graphql';

export default function TodoList() {
  const [input, setInput] = useState('');
  const [createTodo] = useMutation(CREATE_TODO, {
    update: (cache, mutationResult) => {
      cache.writeQuery({
        query: GET_TODOS,
        data: {
          ...cache.readQuery({ query: GET_TODOS }),
          todos: {
            __typename: 'TodosConnection',
            nodes: [...nodes, mutationResult.data.createTodo.todo],
          },
        },
      });
    },
    /*refetchQueries: [GET_TODOS],*/
  });
  const { data, error, loading } = useQuery(GET_TODOS);
  if (error) return <h1>Error...</h1>;
  if (loading) return <h1>loading...</h1>;

  const { nodes } = data.todos;

  return (
    <div>
      {nodes.map((todo) => {
        const { id } = todo;
        return <Todo key={id} {...todo} />;
      })}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await createTodo({ variables: { task: input } });
          setInput('');
        }}
      >
        <label>
          New To Do <br />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}
