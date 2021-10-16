import React from 'react';
import { UPDATE_COMPLETED, DELETE_TODO } from './graphql';
import { useMutation } from '@apollo/client';

export default function Todo({ id, task, completed }) {
  const [updateCompleted] = useMutation(UPDATE_COMPLETED);

  const [deleteTodo] = useMutation(DELETE_TODO);

  const handleDeleteClick = async (id) => {
    try {
      await deleteTodo({ variables: { id: id } });
    } catch (error) {
      console.error(error);
    }
  };
  const handleCompleteClick = async (id) => {
    try {
      await updateCompleted({
        variables: { id: id, completed: !completed },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="todo-list__element">
      <div
        className="todo-list__text"
        style={{ textDecoration: completed ? 'line-through' : 'none' }}
      >
        {task}
      </div>
      <div className="todo-list__button-container">
        <button
          className="todo-list__button"
          onClick={() => handleCompleteClick(id)}
        >
          Complete
        </button>
        <button
          className="todo-list__button"
          onClick={() => handleDeleteClick(id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
