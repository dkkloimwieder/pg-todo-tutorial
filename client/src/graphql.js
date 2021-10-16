import { gql } from '@apollo/client';

/* get all todos */
export const GET_TODOS = gql`
  query GetTodos {
    todos {
      id
      task
      completed
    }
  }
`;

/* create a todo */
export const CREATE_TODO = gql`
  mutation CreateTodo($task: String!) {
    createTodo(input: { todo: { task: $task } }) {
      todo {
        id
        task
        completed
      }
    }
  }
`;

/* update "completed" field */
export const UPDATE_COMPLETED = gql`
  mutation UpdateCompleted($completed: Boolean!, $id: ID!) {
    updateTodoById(input: { patch: { completed: $completed }, id: $id }) {
      todo {
        id
      }
    }
  }
`;

/* delete a todo */
export const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodoById(input: { id: $id }) {
      deletedTodoId
    }
  }
`;

export const SUBSCRIBE_TODOS = gql`
  subscription {
    listen(topic: "todo") {
      relatedNode {
        id
        ... on Todo {
          task
          createdAt
          completed
        }
      }
      relatedNodeId
    }
  }
`;
