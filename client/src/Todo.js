import React from 'react';

export default function Todo({ id, task, completed }) {

  const handleDeleteClick =  () => {};
  const handleCompleteClick =  () => {};

  return (
    <li className="todo-list__element">
      <div
        className="todo-list__text"
        style={{ textDecoration: completed ? 'line-through' : 'none' }}
      >
        {task}
      </div>
      <div className="todo-list__button-container">
        <button
          className="todo-list__button"
          onClick={() => handleCompleteClick()}
        >
          Complete
        </button>
        <button
          className="todo-list__button"
          onClick={() => handleDeleteClick()}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
