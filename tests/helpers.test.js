const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const helpers = require('../skills/playwright-skill/lib/helpers');

test('parses a single configured header', () => {
  const previous = {
    name: process.env.PW_HEADER_NAME,
    value: process.env.PW_HEADER_VALUE,
    extra: process.env.PW_EXTRA_HEADERS,
  };

  process.env.PW_HEADER_NAME = 'X-Test';
  process.env.PW_HEADER_VALUE = 'true';
  delete process.env.PW_EXTRA_HEADERS;

  assert.deepEqual(helpers.getExtraHeadersFromEnv(), { 'X-Test': 'true' });

  restoreEnv(previous);
});

test('parses multiple configured headers', () => {
  const previous = {
    name: process.env.PW_HEADER_NAME,
    value: process.env.PW_HEADER_VALUE,
    extra: process.env.PW_EXTRA_HEADERS,
  };

  delete process.env.PW_HEADER_NAME;
  delete process.env.PW_HEADER_VALUE;
  process.env.PW_EXTRA_HEADERS = JSON.stringify({ 'X-One': '1', 'X-Two': '2' });

  assert.deepEqual(helpers.getExtraHeadersFromEnv(), { 'X-One': '1', 'X-Two': '2' });

  restoreEnv(previous);
});

test('detects a running HTTP server on a custom port', async () => {
  const server = http.createServer((request, response) => {
    response.writeHead(200);
    response.end();
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  try {
    const servers = await helpers.detectDevServers([port]);
    assert.ok(servers.includes(`http://localhost:${port}`));
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('creates a configured screenshot directory', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'playwright-skill-'));
  const previous = process.env.PW_ARTIFACT_DIR;
  process.env.PW_ARTIFACT_DIR = path.join(directory, 'artifacts');

  const page = { screenshot: async options => fs.writeFileSync(options.path, 'test') };
  const filename = await helpers.takeScreenshot(page, 'result');

  assert.equal(fs.existsSync(filename), true);
  if (previous === undefined) delete process.env.PW_ARTIFACT_DIR;
  else process.env.PW_ARTIFACT_DIR = previous;
  fs.rmSync(directory, { recursive: true, force: true });
});

test('createContext follows the system locale unless PW_LOCALE pins it', async () => {
  const fakeBrowser = { newContext: async options => options };

  const defaults = await helpers.createContext(fakeBrowser);
  assert.equal(defaults.locale, undefined);
  assert.equal(defaults.timezoneId, undefined);

  const previous = { locale: process.env.PW_LOCALE, timezone: process.env.PW_TIMEZONE };
  process.env.PW_LOCALE = 'zh-CN';
  process.env.PW_TIMEZONE = 'Asia/Shanghai';
  try {
    const pinned = await helpers.createContext(fakeBrowser);
    assert.equal(pinned.locale, 'zh-CN');
    assert.equal(pinned.timezoneId, 'Asia/Shanghai');
  } finally {
    setOrDelete('PW_LOCALE', previous.locale);
    setOrDelete('PW_TIMEZONE', previous.timezone);
  }
});

test('allScopes walks pages and their iframes', () => {
  const main = { url: () => 'http://a.example/' };
  const embed = { url: () => 'http://b.example/embed' };
  const pageOne = { url: () => 'http://a.example/', mainFrame: () => main, frames: () => [main] };
  const pageTwo = { url: () => 'http://b.example/', mainFrame: () => main, frames: () => [main, embed] };

  const scopes = helpers.allScopes({ pages: () => [pageOne, pageTwo] });

  assert.deepEqual(scopes.map(scope => scope.label), [
    'page http://a.example/',
    'page http://b.example/',
    'iframe http://b.example/embed',
  ]);
});

test('clickTextAnywhere matches across scopes and escapes regex text', async () => {
  const clicks = [];
  const filterCalls = [];
  // Playwright locators chain: filter() returns another locator.
  const makeLocator = (count, onClick) => {
    const stub = {
      filter: options => { filterCalls.push(options); return stub; },
      count: async () => count,
      first: () => ({ click: onClick ?? (async () => {}) }),
    };
    return stub;
  };
  const noMatch = makeLocator(0);
  const match = makeLocator(1, async () => clicks.push('clicked'));
  const frameMatching = (url, matchingText) => ({
    url: () => url,
    getByRole: () => noMatch,
    getByText: candidate => (candidate === matchingText ? match : noMatch),
    locator: () => noMatch,
  });

  const main = frameMatching('http://a.example/', 'Sign in elsewhere');
  const iframe = frameMatching('http://b.example/embed', 'Log in (v2)');
  const page = { url: () => 'http://a.example/', mainFrame: () => main, frames: () => [main, iframe] };

  assert.equal(await helpers.clickTextAnywhere(page, 'Log in (v2)'), true);
  assert.deepEqual(clicks, ['clicked']);
  assert.ok(
    filterCalls.some(options => options.hasText?.source === '^\\s*Log in \\(v2\\)\\s*$'),
    filterCalls.map(options => options.hasText?.source).join(' | ')
  );

  assert.equal(await helpers.clickTextAnywhere(page, 'Not present'), false);
  assert.deepEqual(clicks, ['clicked']);
});

function restoreEnv(previous) {
  setOrDelete('PW_HEADER_NAME', previous.name);
  setOrDelete('PW_HEADER_VALUE', previous.value);
  setOrDelete('PW_EXTRA_HEADERS', previous.extra);
}

function setOrDelete(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
