import React from 'react';
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

  const handleDeleteClick = (id) => {
    deleteTodo({ variables: { id: id } });
  };
  const handleCheckClick = (id) => {
    updateCompleted({
      variables: { id: id, completed: !completed },
    });
  };

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
          className="todo-list__button--dark"
          onClick={() => handleCheckClick(id)}
        >
          Complete
        </button>
        <button
          className="todo-list__button--dark"
          onClick={() => handleDeleteClick(id)}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
