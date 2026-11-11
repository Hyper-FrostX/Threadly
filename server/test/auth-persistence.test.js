import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { randomBytes, randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import path from 'node:path'
import { after, test } from 'node:test'

const tempDir = mkdtempSync(path.join(os.tmpdir(), 'threadly-test-'))
const databasePath = path.join(tempDir, 'threadly.sqlite')
const serverDirectory = fileURLToPath(new URL('..', import.meta.url))
const jwtSecret = randomBytes(48).toString('base64url')
process.env.DATABASE_PATH = databasePath
process.env.JWT_SECRET = jwtSecret
process.env.NODE_ENV = 'test'
process.env.CLIENT_URL = 'http://localhost:5173'

const [{ default: app }, { closeDatabase }] = await Promise.all([
  import('../app.js'),
  import('../repositories/platformRepository.js'),
])

let server
let serverUrl
let databaseClosed = false

after(() => {
  if (server?.listening) server.close()
  if (!databaseClosed) closeDatabase()
  rmSync(tempDir, { recursive: true, force: true })
})

async function request(pathname, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${serverUrl}/api${pathname}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = response.status === 204 ? null : await response.json()
  return { response, data }
}

test('accounts and social records persist and protected routes enforce session ownership', async () => {
  server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  serverUrl = `http://127.0.0.1:${server.address().port}`

  const suffix = randomUUID().replaceAll('-', '').slice(0, 10)
  const account = {
    username: `member_${suffix}`,
    displayName: 'Integration Member',
    email: `${suffix}@example.test`,
    password: 'ThreadlySafePass123!',
    confirmPassword: 'ThreadlySafePass123!',
  }
  const registered = await request('/auth/register', { method: 'POST', body: account })
  assert.equal(registered.response.status, 201)
  assert.equal(registered.data.data.user.username, account.username)
  const token = registered.data.data.accessToken
  const userId = registered.data.data.user.id

  const me = await request('/auth/me', { token })
  assert.equal(me.response.status, 200)
  assert.equal(me.data.data.email, account.email)
  assert.equal('passwordHash' in me.data.data, false)

  const updatedProfile = await request('/users/profile', {
    method: 'PUT',
    token,
    body: {
      displayName: 'Updated Integration Member',
      bio: 'A profile update that should persist.',
      location: 'Test City',
    },
  })
  assert.equal(updatedProfile.response.status, 200)
  assert.equal(updatedProfile.data.data.displayName, 'Updated Integration Member')
  assert.equal(updatedProfile.data.data.bio, 'A profile update that should persist.')
  assert.equal(updatedProfile.data.data.location, 'Test City')
  assert.equal('email' in updatedProfile.data.data, false)

  const duplicate = await request('/auth/register', { method: 'POST', body: account })
  assert.equal(duplicate.response.status, 409)

  const secondAccount = { ...account, username: `other_${suffix}`, email: `other_${suffix}@example.test` }
  const second = await request('/auth/register', { method: 'POST', body: secondAccount })
  assert.equal(second.response.status, 201)
  const secondId = second.data.data.user.id

  const community = await request('/communities', {
    method: 'POST',
    token,
    body: {
      name: `space_${suffix}`,
      title: 'Persistent Space',
      description: 'A test space persisted in SQLite.',
    },
  })
  assert.equal(community.response.status, 201)

  const post = await request('/posts', {
    method: 'POST',
    token,
    body: {
      communityId: community.data.data.id,
      title: 'Persistent integration post',
      body: 'This post should remain available after the server restarts.',
    },
  })
  assert.equal(post.response.status, 201)
  const postId = post.data.data.id

  const vote = await request(`/posts/${postId}/vote`, {
    method: 'POST',
    token,
    body: { value: 1 },
  })
  assert.equal(vote.data.data.score, 1)

  const bookmark = await request(`/posts/${postId}/bookmark`, { method: 'POST', token })
  assert.equal(bookmark.data.data.bookmarked, true)
  const saved = await request('/posts/saved', { token })
  assert.equal(saved.data.data.some((item) => item.id === postId), true)

  const comment = await request(`/posts/${postId}/comments`, {
    method: 'POST',
    token,
    body: { body: 'A persisted comment.' },
  })
  const reply = await request(`/comments/${comment.data.data.id}/replies`, {
    method: 'POST',
    token,
    body: { body: 'A nested persisted reply.' },
  })
  assert.equal(reply.data.data.parentCommentId, comment.data.data.id)

  const forbiddenEdit = await request(`/posts/${postId}`, {
    method: 'PUT',
    token: second.data.data.accessToken,
    body: { title: 'Someone else edited this post' },
  })
  assert.equal(forbiddenEdit.response.status, 403)

  const following = await request(`/users/${secondId}/follow`, {
    method: 'POST',
    token,
  })
  assert.equal(following.response.status, 200)
  const notifications = await request('/notifications', { token: second.data.data.accessToken })
  assert.equal(notifications.data.data.some((item) => item.type === 'follow'), true)

  const logout = await request('/auth/logout', { method: 'POST', token })
  assert.equal(logout.response.status, 204)
  const revokedSession = await request('/auth/me', { token })
  assert.equal(revokedSession.response.status, 401)

  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  closeDatabase()
  databaseClosed = true

  const childScript = `
    import app from './app.js';
    const server = app.listen(0, async () => {
      try {
        const response = await fetch('http://127.0.0.1:' + server.address().port + '/api/posts/${postId}');
        const payload = await response.json();
        console.log(JSON.stringify({ status: response.status, title: payload.data?.title }));
      } catch (error) {
        console.error(error);
        process.exitCode = 1;
      } finally {
        server.close();
      }
    });
  `
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', childScript], {
    cwd: serverDirectory,
    encoding: 'utf8',
    env: { ...process.env, DATABASE_PATH: databasePath, JWT_SECRET: jwtSecret },
  })
  assert.equal(child.status, 0, child.stderr)
  assert.deepEqual(JSON.parse(child.stdout.trim()), { status: 200, title: 'Persistent integration post' })
})
