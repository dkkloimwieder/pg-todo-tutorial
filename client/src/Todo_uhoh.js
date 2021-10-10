import React, { useState } from 'react';
import { UPDATE_COMPLETED, DELETE_TODO, GET_TODOS } from './graphql';
import { useMutation } from '@apollo/client';

export default function Todo({ id, task, completed }) {
  const [updateCompleted] = useMutation(UPDATE_COMPLETED);
  const [deleteTodo] = useMutation(DELETE_TODO, {
    update: (cache, mutationResult) => {
      /*const { todos } = cache.readQuery({ query: GET_TODOS });
      cache.writeQuery({
        query: GET_TODOS,
        data: {
          todos: todos.filter(
            (todo) =>
              todo.id !== mutationResult.data.deleteTodoById.deletedTodoId
          ),
        },
      });*/
      /*
      cache.modify({
        id: 'ROOT_QUERY',
        fields: {
          todos(existingRefs) {
            return existingRefs.filter(
              (todo) =>
                todo.__ref !==
                `Todo:${mutationResult.data.deleteTodoById.deletedTodoId}`
            );
          },
        },
      });
      */
      cache.evict({
        id: `Todo:${mutationResult.data.deleteTodoById.deletedTodoId}`,
      });
      cache.gc();
    },
  });

  const [checked, setChecked] = useState(completed);

  const handleChange = async (id) => {
    const { data } = await updateCompleted({
      variables: { id: id, completed: !checked },
    });
    setChecked(data.updateTodoById.todo.completed);
  };

  const handleClick = (id) => {
    deleteTodo({ variables: { id: id } });
  };

  return (
    <li className="todo">
      <label style={{ textDecoration: checked ? 'line-through' : 'none' }}>
        🗸 {task}
        <input
          type="checkbox"
          id={id}
          name="todo"
          checked={checked}
          onChange={() => handleChange(id)}
        />
      </label>
      <button onClick={() => handleClick(id)}>×</button>
    </li>
  );
}
