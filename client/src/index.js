import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

console.log(process.env);

const client = new ApolloClient({
  uri: 'http://127.0.0.1:3333/graphql' /* variables from toplevel project .env */,
  cache:
    new InMemoryCache() /*NOTHING TO SEEEE!!{ dataIdFromObject: (object) => object.nodeId }*/,
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);
