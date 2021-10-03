import { NgModule } from '@angular/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloClientOptions, InMemoryCache, split } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';


const uri = 'http://localhost:8080/v1/graphql';
export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {


  const http = httpLink.create({
    uri
  });


  const ws = new WebSocketLink({
    uri: `ws://localhost:4000/graphql`,
    options: {
      reconnect: true,
    },
  });

  const link = split(
    ({ query }) => {
      const meta = getMainDefinition(query);
      return (
        meta?.kind === 'OperationDefinition' && meta?.operation === 'subscription'
      );
    },
    ws,
    http,
  );

  return {
    link: link,
    cache: new InMemoryCache(),
  };
}

@NgModule({
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule { }
