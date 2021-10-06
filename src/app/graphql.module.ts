import {NgModule} from '@angular/core';
import {APOLLO_OPTIONS} from 'apollo-angular';
import {ApolloClientOptions, InMemoryCache, split} from '@apollo/client/core';
import {HttpLink} from 'apollo-angular/http';
import {WebSocketLink} from '@apollo/client/link/ws';
import {getMainDefinition} from '@apollo/client/utilities';
import {HttpHeaders} from '@angular/common/http';
import {environment as env} from '../environments/environment';

const getHeaders = () => {
  const headers: any = {};
  headers[env.HASURA.HASURA_ADMIN_SECRET_KEY] =
    env.HASURA.HASURA_ADMIN_SECRET_VALUE;
  headers['content-type'] = 'application/json';
  return headers;
};

export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
  const http = httpLink.create({
    uri: env.HASURA.HASURA_HTTP_LINK,
    headers: new HttpHeaders().append(
      env.HASURA.HASURA_ADMIN_SECRET_KEY,
      env.HASURA.HASURA_ADMIN_SECRET_VALUE
    ),
  });

  const ws = new WebSocketLink({
    uri: env.HASURA.HASURA_WS_LINK,
    options: {
      reconnect: true,
      connectionParams: () => {
        return {headers: getHeaders()};
      },
    },
  });

  const link = split(
    ({ query }) => {
      const meta = getMainDefinition(query);
      return (
        meta?.kind === 'OperationDefinition' &&
        meta?.operation === 'subscription'
      );
    },
    ws,
    http
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
export class GraphQLModule {
}
