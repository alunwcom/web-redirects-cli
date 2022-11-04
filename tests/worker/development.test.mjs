import { loadRedirectData, redirectTest } from "./shared.mjs";

describe('under development', () => {

  beforeAll(async () => {
    loadRedirectData("foo.com");
    loadRedirectData("bar.com");
    loadRedirectData("example.com");
  })

  test('www redirect #1', async () => {
    await redirectTest(
      'http://www.example.com/old/one-a.html', 
      'https://foo.com/new/one-a.html', 
      301
    );
  });

});

