import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_TODO } from './graphql';

export default function TodoInput() {
  const [input, setInput] = useState('');
  const [createTodo] = useMutation(CREATE_TODO);
  return (
    <form
      className="todo-list__form"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await createTodo({
            variables: { task: input },
          });
        } catch (error) {
          console.error(error);
        }
        setInput('');
      }}
    >
      <input
        className="todo-list__input"
        type="text"
        placeholder="Enter Todo"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <br></br>
      <input className="todo-list__button" type="submit" value="Create Todo" />
    </form>
  );
}
