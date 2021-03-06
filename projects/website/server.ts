import 'zone.js/dist/zone-node';
import fetch from 'node-fetch';
import { join } from 'path';
import { existsSync } from 'fs';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as useragent from 'express-useragent';
import * as bodyParser from 'body-parser';

import * as email from '@sendgrid/mail';
import { APP_BASE_HREF } from '@angular/common';
import { ngExpressEngine } from '@nguniversal/express-engine';

import { AppServerModule } from './src/main.server';

dotenv.config();

const API_URL_GITHUB = 'https://api.github.com';
const API_TOKEN_GITHUB = Buffer.from(
  `tomastrajan:${process.env.API_TOKEN_GITHUB}`
).toString('base64');

email.setApiKey(process.env.API_TOKEN_SENDGRID);

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  server.use(bodyParser.json());
  server.use(useragent.express());
  // server.use(requireHTTPS);

  const distFolder = join(process.cwd(), 'dist/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html'))
    ? 'index.original.html'
    : 'index';

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine(
    'html',
    ngExpressEngine({
      bootstrap: AppServerModule,
    })
  );

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  // Example Express Rest API endpoints
  server.get('/api/github/repositories', (req, res) => {
    const options = { headers: { Authorization: `Basic ${API_TOKEN_GITHUB}` } };
    Promise.all([
      fetch(`${API_URL_GITHUB}/users/angular/repos?per_page=10`, options),
      fetch(`${API_URL_GITHUB}/users/tomastrajan/repos?per_page=100`, options),
      fetch(`${API_URL_GITHUB}/users/angular-extensions/repos`, options),
    ])
      .then((responses) => Promise.all(responses.map((r) => r.json())))
      .then((responses) =>
        responses.reduce((result, next) => result.concat(next), [])
      )
      .then((repos) => res.json(repos));
  });
  server.post('/api/email', (req: express.Request, res: express.Response) => {
    const msg = {
      to: 'tomas.trajan@gmail.com',
      from: req.body.email,
      subject: 'tomastrajan.com - Get in touch form',
      text: `
      From: ${req.body.firstname} ${req.body.lastname}
      Email: ${req.body.email}
      Company: ${req.body.company}
      Message: ${req.body.message}
    `,
    };
    email
      .send(msg)
      .then(() => res.status(200).json('success'))
      .catch((error) => res.send(error));
  });

  // Serve static files from /browser
  server.get(
    '*.*',
    express.static(distFolder, {
      maxAge: '1y',
    })
  );

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, {
      req,
      providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
    });
  });

  return server;
}

function run(): void {
  // Start up the Node server
  const port = process.env.PORT || 4000;
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';

export { renderModule, renderModuleFactory } from '@angular/platform-server';

function requireHTTPS(req, res, next) {
  // The 'x-forwarded-proto' check is for Heroku
  if (
    !req.secure &&
    req.get('x-forwarded-proto') !== 'https' &&
    process.env.ENV !== 'development'
  ) {
    return res.redirect(`https://${req.get('host')}${req.url}`);
  }
  next();
}
