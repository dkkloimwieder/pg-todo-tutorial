import React from 'react';
import TodoInput from './TodoInput';
import TodoList from './TodoList';
import './App.css';

export default function App(props) {
  return (
    <>
      <TodoInput />
      <TodoList {...props} />
    </>
  );
}
