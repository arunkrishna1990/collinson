import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { client } from './graphql/client'; // make sure this path is correct
import App from './app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>
);