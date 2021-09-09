// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
//
// TEMPNOTE: Better, use --configuration="production", or ="test", or ="anythingwecreate".
// TEMPNOTE: That allows more than just prod/notprod. Add new files, and 
// TEMPNOTE: new configurations in angular.json. The default, without
// TEMPNOTE: a --configuration, is just "dev".

export const environment = {
  production: false,
  envName: 'dev' 
};
