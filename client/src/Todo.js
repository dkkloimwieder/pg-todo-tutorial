import React, { useState } from 'react';
import { UPDATE_COMPLETED, DELETE_TODO } from './graphql';
import { useMutation } from '@apollo/client';

export default function Todo({ id, task, completed }) {
  const [updateCompleted] = useMutation(UPDATE_COMPLETED);
  const [deleteTodo] = useMutation(DELETE_TODO, {
    update: (cache, mutationResult) => {
      cache.evict({
        id: 'ROOT_QUERY',
        field: cache.identify({
          __ref: mutationResult.data.deleteTodo.deletedTodoNodeId,
        }),
      });
      cache.gc();
    },
  });

  const [checked, setChecked] = useState(completed);

  const handleChange = async (id) => {
    const { data } = await updateCompleted({
      variables: { id: id, completed: !checked },
    });
    setChecked(data.updateTodo.todo.completed);
  };

  const handleClick = (id) => {
    deleteTodo({ variables: { id: id } });
  };

  return (
    <div className="todo">
      <label style={{ textDecoration: checked ? 'line-through' : 'none' }}>
        {task}
        <input
          type="checkbox"
          id={id}
          name="todo"
          checked={checked}
          onChange={() => handleChange(id)}
        />
      </label>
      <button onClick={() => handleClick(id)}>delete</button>
    </div>
  );
}
