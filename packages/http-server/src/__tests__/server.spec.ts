import { IHttpOperation } from '@stoplight/types';

import { createServer } from '../';
import { IPrismHttpServer } from '../types';

describe('server', () => {
  let server: IPrismHttpServer<IHttpOperation[]>;

  beforeAll(async () => {
    const operations: IHttpOperation[] = [
      {
        id: '1',
        method: 'get',
        path: '/',
        servers: [{ url: 'http://localhost:3000' }],
        security: [],
        request: {
          path: [],
          query: [],
          headers: [],
          cookie: [],
        },
        responses: [
          {
            code: '200',
            headers: [],
            contents: [
              {
                mediaType: 'application/json',
                schema: { type: 'string' },
                examples: [],
                encodings: [],
              },
            ],
          },
        ],
      },
      {
        id: '1',
        method: 'post',
        path: '/todos',
        security: [],
        request: {
          path: [],
          query: [],
          headers: [],
          cookie: [],
        },
        servers: [{ url: 'http://localhost:3000' }],
        responses: [
          {
            code: '201',
            headers: [],
            contents: [
              {
                mediaType: 'application/json',
                schema: { type: 'string' },
                examples: [],
                encodings: [],
              },
            ],
          },
          {
            code: '401',
            headers: [],
            contents: [
              {
                mediaType: 'application/json',
                schema: { type: 'string' },
                examples: [],
                encodings: [],
              },
            ],
          },
        ],
      },
    ];

    server = createServer<IHttpOperation[]>(operations, {
      components: {
        // TODO: once validator is implemented, don't unset it here
        validator: undefined,

        // set a custom loader for testing to mock back some HttpOperations
        loader: {
          load: async ops => {
            if (!ops) {
              return [];
            }

            return ops;
          },
        },
      },
    });

    await server.prism.load(operations);
  });

  afterAll(async () => {
    await new Promise(resolve => server.fastify.close(resolve));
  });

  test('should mock back root path', async () => {
    const response = await server.fastify.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.statusCode).toBe(200);
  });

  test('should default to 2xx', async () => {
    const response = await server.fastify.inject({
      method: 'POST',
      url: '/todos',
    });

    expect(response.statusCode).toBe(201);
  });

  test('should support choosing a response code', async () => {
    const response = await server.fastify.inject({
      method: 'POST',
      url: '/todos?__code=401',
    });

    expect(response.statusCode).toBe(401);
  });
});
