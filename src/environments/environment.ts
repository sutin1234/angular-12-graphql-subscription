// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  HASURA: {
    HASURA_HTTP_LINK: 'https://witty-elk-53.hasura.app/v1/graphql',
    HASURA_WS_LINK: 'wss://witty-elk-53.hasura.app/v1/graphql',
    HASURA_ADMIN_SECRET_KEY: 'x-hasura-admin-secret',
    HASURA_ADMIN_SECRET_VALUE:
      'FxUv79aADITeVuz2J2z5mcin9fGwbn8kZ4rFwWu4fc52dJAR0kfzpXz0BLo4kvId',
  },
};
