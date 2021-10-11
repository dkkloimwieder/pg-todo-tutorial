import React, { useState } from 'react';
import Todo from './Todo';

export default function TodoList() {
  const [input, setInput] = useState('');

  const todos = [{ task: 'replace meeeee!', id: '1', completed: false }];
  return (
    <div>
      <ul className="todo-list">
        {todos.map((todo) => {
          return <Todo key={todo.id} {...todo} />;
        })}
      </ul>
      <form
        className="todo-list__form"
        onSubmit={ (e) => {}}
      >
        <input
          className="todo-list__input"
          type="text"
          placeholder="Enter Todo"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <br></br>
        <input
          className="todo-list__button"
          type="submit"
          value="Create Todo"
        />
      </form>
    </div>
  );
}
