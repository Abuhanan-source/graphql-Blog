import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from "./store.ts";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: "http://localhost:4000/graphql",
    credentials: "include",
  }),
  cache: new InMemoryCache(),
});

createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={client}>
     <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </Provider>
  </ApolloProvider>,
)
