import { loadRedirectData, redirectTest } from "./shared.mjs";

beforeAll(async () => {
  loadRedirectData("foo.com");
  loadRedirectData("bar.com");
  loadRedirectData("example.com");
  loadRedirectData("example.org");
})

describe('redirect rule without base value (only defined routes)', () => {

  test('simple match apex', async () => {
    await redirectTest(
      'http://example.com/old/one-c.html', 
      'https://foo.com/new/one-c.html', 
      301
    );
  });

  test('simple match test', async () => {
    await redirectTest(
      'http://test.example.com/old/one-c.html', 
      'https://foo.com/new/one-c.html', 
      301
    );
  });

  test('simple match www.qa.internal', async () => {
    await redirectTest(
      'http://www.qa.internal.example.com/old/one-c.html', 
      'https://foo.com/new/one-c.html', 
      301
    );
  });

  test.skip('unmatched route value foo', async () => {
    await redirectTest(
      'http://foo.example.com/old/one-c.html', 
      null, 
      404
    );
  });

  test.skip('unmatched route value www.test', async () => {
    await redirectTest(
      'http://www.test.example.com/old/one-c.html', 
      null, 
      404
    );
  });

});

describe('redirect rule with base value', () => {

  test('match base value www', async () => {
    await redirectTest(
      'http://www.example.com/old/one-a.html', 
      'https://foo.com/new/one-a.html', 
      301
    );
  });

  test.skip('unmatched base value @ (apex)', async () => {
    await redirectTest(
      'http://example.com/old/one-a.html', 
      null, 
      404
    );
  });

  test.skip('unmatched base value blog', async () => {
    await redirectTest(
      'http://blog.example.com/old/one-a.html', 
      null, 
      404
    );
  });

  test.skip('unmatched base and subdomain value xxx', async () => {
    await redirectTest(
      'http://xxx.example.com/old/one-a.html', 
      null, 
      404
    );
  });

  test.skip('unmatched base and subdomain value www.foo.bar', async () => {
    await redirectTest(
      'http://www.foo.bar.example.com/old/one-a.html', 
      null, 
      404
    );
  });

});

describe('redirect rule with base value list', () => {

  test('match base value blog', async () => {
    await redirectTest(
      'http://blog.example.com/old/one-b.html', 
      'https://foo.com/new/one-b.html', 
      301
    );
  });

  test.skip('unmatched base value @ (apex)', async () => {
    await redirectTest(
      'http://example.com/old/one-b.html', 
      null, 
      404
    );
  });

  test.skip('unmatched base value test', async () => {
    await redirectTest(
      'http://test.example.com/old/one-b.html', 
      null, 
      404
    );
  });

  test.skip('unmatched base and subdomain value xxx', async () => {
    await redirectTest(
      'http://xxx.example.com/old/one-b.html', 
      null, 
      404
    );
  });

  test.skip('unmatched base and subdomain value www.foo.bar', async () => {
    await redirectTest(
      'http://www.foo.bar.example.com/old/one-b.html', 
      null, 
      404
    );
  });

});

describe('redirect rule with only default routes', () => {

  test('simple match apex', async () => {
    await redirectTest(
      'http://example.org/xyz.html', 
      'https://foo.com/xyz.html', 
      301
    );
  });

  test('simple match www', async () => {
    await redirectTest(
      'http://www.example.org/xyz.html', 
      'https://foo.com/xyz.html', 
      301
    );
  });

  test('catch-all match apex', async () => {
    await redirectTest(
      'http://example.org/abc.html', 
      'https://foo.com/default.html', 
      301
    );
  });

  test('catch-all match www', async () => {
    await redirectTest(
      'http://www.example.org/abc.html', 
      'https://foo.com/default.html', 
      301
    );
  });

  test.skip('no match', async () => {
    await redirectTest(
      'http://test.example.org/abc.html', 
      null, 
      404
    );
  });



});
