import React from 'react';
import Todo from './Todo';
import { useQuery, useApolloClient } from '@apollo/client';
import { GET_TODOS, SUBSCRIBE_TODOS } from './graphql';

export default function TodoList() {
  const client = useApolloClient();
  const { subscribeToMore, data, error, loading } = useQuery(GET_TODOS);
  //  if (error) return <p className="alert">{error.message}</p>;
  //  if (loading) return <p className="alert">loading...</p>;
  React.useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: SUBSCRIBE_TODOS,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        if (!subscriptionData.data.listen.relatedNode) {
          return {
            todosConnection: {
              ...prev.todosConnection,
              nodes: prev.todosConnection.nodes.map((todo) =>
                todo.id === subscriptionData.data.listen.relatedNodeId
                  ? { ...todo, deleted: true }
                  : todo
              ),
            },
          };
        } else {
          let incomingTodo = prev.todosConnection.nodes.find(
            (todo) =>
              todo.id === `${subscriptionData.data.listen.relatedNodeId}`
          );
          if (incomingTodo) {
            return {
              todosConnection: {
                ...prev.todosConnection,
                nodes: prev.todosConnection.nodes.map((todo) =>
                  todo.id === subscriptionData.data.listen.relatedNodeId
                    ? {
                        ...todo,
                        completed:
                          subscriptionData.data.listen.relatedNode.completed,
                      }
                    : todo
                ),
              },
            };
          } else {
            return {
              todosConnection: {
                ...prev.todosConnection,
                nodes: [
                  ...prev.todosConnection.nodes,
                  {
                    id: subscriptionData.data.listen.relatedNodeId,
                    ...subscriptionData.data.listen.relatedNode,
                  },
                ],
              },
            };
          }
        }
      },
    });
    return unsubscribe;
  }, [subscribeToMore, client.cache]);

  if (loading) return <h1>loading</h1>;
  if (error) return <h1>error</h1>;
  const {
    todosConnection: { nodes },
  } = data;
  return (
    <div className="todo-list">
      {nodes.map((todo) => {
        return <Todo key={todo.id} {...todo} />;
      })}
    </div>
  );
}
