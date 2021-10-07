import { gql } from '@apollo/client';

/* Get all To Dos */
export const GET_TODOS = gql`
  query {
    todosList {
      nodeId
      id
      task
      completed
    }
  }
`;

/* add a todo */
export const CREATE_TODO = gql`
  mutation CreateTodo($task: String!) {
    createTodo(input: { todo: { task: $task } }) {
      todo {
        nodeId
        id
        task
        completed
      }
    }
  }
`;

/* update "completed" */
export const UPDATE_COMPLETED = gql`
  mutation updateCompleted($completed: Boolean!, $id: Int!) {
    updateTodo(input: { patch: { completed: $completed }, id: $id }) {
      todo {
        nodeId
        id
        completed
      }
    }
  }
`;

export const DELETE_TODO = gql`
  mutation deleteTodo($id: Int!) {
    deleteTodo(input: { id: $id }) {
      deletedTodoNodeId
    }
  }
`;
