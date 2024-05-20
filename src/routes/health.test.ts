import { build } from "../app";
import { test } from 'tap';

test('health check', async (t) => {
  const app = build();

  const response = await app.inject({
    method: 'GET',
    url: '/health'
  });

  t.equal(response.statusCode, 200, 'health check should be ok');
});