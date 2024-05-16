import { build } from "./app";

const test = async () => {
  const app = build();

  const response = await app.inject({
    method: 'GET',
    url: '/health'
  });

  console.log('status code: ', response.statusCode);
  console.log('body: ', response.body);
}; test();