import { randomBytes } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { env } from '../config/env.js'
import {
  communities as seedCommunities,
  comments as seedComments,
  notifications as seedNotifications,
  posts as seedPosts,
  users as seedUsers,
} from '../data/sampleData.js'

mkdirSync(path.dirname(env.databasePath), { recursive: true })

const database = new DatabaseSync(env.databasePath)
database.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS auth_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    revoked_at TEXT
  );
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL COLLATE NOCASE UNIQUE,
    email TEXT COLLATE NOCASE UNIQUE,
    password_hash TEXT,
    display_name TEXT NOT NULL,
    bio TEXT NOT NULL DEFAULT '',
    karma INTEGER NOT NULL DEFAULT 0,
    location TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    avatar_url TEXT,
    cover_url TEXT,
    preferences TEXT NOT NULL DEFAULT '{}'
  );
  CREATE TABLE IF NOT EXISTS communities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL COLLATE NOCASE UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    about TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '#AD624E',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS community_members (
    community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TEXT NOT NULL,
    PRIMARY KEY (community_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS follows (
    follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    PRIMARY KEY (follower_id, followed_id),
    CHECK (follower_id <> followed_id)
  );
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    community_id TEXT NOT NULL REFERENCES communities(id),
    author_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    image TEXT,
    base_score INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS post_votes (
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    value INTEGER NOT NULL CHECK (value IN (-1, 1)),
    created_at TEXT NOT NULL,
    PRIMARY KEY (post_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS bookmarks (
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    PRIMARY KEY (post_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    base_score INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT
  );
  CREATE TABLE IF NOT EXISTS comment_votes (
    comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    value INTEGER NOT NULL CHECK (value IN (-1, 1)),
    PRIMARY KEY (comment_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    target_url TEXT,
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
  CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments(post_id, created_at);
  CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, read, created_at DESC);
`)

const commentColumns = database.prepare('PRAGMA table_info(comments)').all().map((column) => column.name)
if (!commentColumns.includes('base_score')) {
  database.exec('ALTER TABLE comments ADD COLUMN base_score INTEGER NOT NULL DEFAULT 0')
}

const postColumns = database.prepare('PRAGMA table_info(posts)').all().map((column) => column.name)
if (!postColumns.includes('base_score')) {
  database.exec('ALTER TABLE posts ADD COLUMN base_score INTEGER NOT NULL DEFAULT 0')
}

const countUsers = database.prepare('SELECT COUNT(*) AS count FROM users').get().count
if (countUsers === 0) {
  const insertUser = database.prepare(`
    INSERT INTO users (id, username, email, password_hash, display_name, bio, karma, location, created_at)
    VALUES (?, ?, NULL, NULL, ?, ?, ?, ?, ?)
  `)
  const insertCommunity = database.prepare(`
    INSERT INTO communities (id, name, title, description, about, color, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  const insertMember = database.prepare(`
    INSERT INTO community_members (community_id, user_id, created_at) VALUES (?, ?, ?)
  `)
  const insertFollow = database.prepare(`
    INSERT INTO follows (follower_id, followed_id, created_at) VALUES (?, ?, ?)
  `)
  const insertPost = database.prepare(`
    INSERT INTO posts (id, community_id, author_id, title, body, image, base_score, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertBookmark = database.prepare(`
    INSERT INTO bookmarks (post_id, user_id, created_at) VALUES (?, ?, ?)
  `)
  const insertComment = database.prepare(`
    INSERT INTO comments (id, post_id, author_id, parent_comment_id, body, base_score, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  const insertNotification = database.prepare(`
    INSERT INTO notifications (id, user_id, type, title, body, read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  database.exec('BEGIN IMMEDIATE')
  try {
    for (const user of seedUsers) {
      insertUser.run(user.id, user.username, user.displayName, user.bio, user.karma, user.location, user.createdAt)
    }
    for (const community of seedCommunities) {
      insertCommunity.run(
        community.id, community.name, community.title, community.description,
        community.about, community.color, community.createdAt,
      )
      for (const memberId of community.members) insertMember.run(community.id, memberId, community.createdAt)
    }
    for (const user of seedUsers) {
      for (const followedId of user.following) insertFollow.run(user.id, followedId, user.createdAt)
    }
    for (const post of seedPosts) {
      insertPost.run(
        post.id, post.communityId, post.authorId, post.title, post.body,
        post.image, post.score, post.createdAt, post.updatedAt,
      )
      for (const userId of post.bookmarks) insertBookmark.run(post.id, userId, post.createdAt)
    }
    for (const comment of seedComments) {
      insertComment.run(
        comment.id, comment.postId, comment.authorId, comment.parentCommentId,
        comment.body, comment.score, comment.createdAt,
      )
    }
    for (const notification of seedNotifications) {
      insertNotification.run(
        notification.id, notification.userId, notification.type, notification.title,
        notification.body, notification.read ? 1 : 0, notification.createdAt,
      )
    }
    database.exec('COMMIT')
  } catch (error) {
    database.exec('ROLLBACK')
    throw error
  }
}

export function getSigningSecret(configuredSecret) {
  if (configuredSecret) return configuredSecret
  const existing = database.prepare('SELECT value FROM metadata WHERE key = ?').get('jwt_secret')
  if (existing) return existing.value
  const value = randomBytes(48).toString('base64url')
  database.prepare('INSERT INTO metadata (key, value) VALUES (?, ?)').run('jwt_secret', value)
  return value
}

function mapUser(row) {
  if (!row) return null
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    passwordHash: row.password_hash,
    displayName: row.display_name,
    bio: row.bio,
    karma: row.karma,
    location: row.location,
    createdAt: row.created_at,
    role: row.role,
    avatarUrl: row.avatar_url,
    coverUrl: row.cover_url,
    preferences: JSON.parse(row.preferences),
  }
}

function mapCommunity(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    description: row.description,
    about: row.about,
    color: row.color,
    createdAt: row.created_at,
    members: database.prepare('SELECT user_id FROM community_members WHERE community_id = ?')
      .all(row.id).map((member) => member.user_id),
  }
}

function mapPost(row) {
  if (!row) return null
  const votes = Object.fromEntries(database.prepare('SELECT user_id, value FROM post_votes WHERE post_id = ?')
    .all(row.id).map((vote) => [vote.user_id, vote.value]))
  const bookmarks = database.prepare('SELECT user_id FROM bookmarks WHERE post_id = ?')
    .all(row.id).map((bookmark) => bookmark.user_id)
  return {
    id: row.id,
    communityId: row.community_id,
    authorId: row.author_id,
    title: row.title,
    body: row.body,
    image: row.image,
    score: row.base_score + Object.values(votes).reduce((sum, value) => sum + value, 0),
    votes,
    bookmarks,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapComment(row) {
  if (!row) return null
  const votes = Object.fromEntries(database.prepare('SELECT user_id, value FROM comment_votes WHERE comment_id = ?')
    .all(row.id).map((vote) => [vote.user_id, vote.value]))
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    parentCommentId: row.parent_comment_id,
    body: row.body,
    score: row.base_score + Object.values(votes).reduce((sum, value) => sum + value, 0),
    votes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const usersRepository = {
  list() {
    return database.prepare('SELECT * FROM users ORDER BY created_at').all().map(mapUser)
  },
  find(idOrUsername) {
    return mapUser(database.prepare('SELECT * FROM users WHERE id = ? OR username = ? COLLATE NOCASE')
      .get(idOrUsername, idOrUsername))
  },
  findByEmailOrUsername(identity) {
    return mapUser(database.prepare(`
      SELECT * FROM users WHERE email = ? COLLATE NOCASE OR username = ? COLLATE NOCASE
    `).get(identity, identity))
  },
  insert(user) {
    database.prepare(`
      INSERT INTO users (id, username, email, password_hash, display_name, bio, created_at, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      user.id, user.username, user.email, user.passwordHash, user.displayName,
      user.bio, user.createdAt, user.role || 'user',
    )
    return this.find(user.id)
  },
  update(id, updates) {
    const fields = {
      displayName: 'display_name',
      bio: 'bio',
      location: 'location',
      avatarUrl: 'avatar_url',
      coverUrl: 'cover_url',
      preferences: 'preferences',
    }
    const entries = Object.entries(updates).filter(([field]) => fields[field])
    if (!entries.length) return this.find(id)
    const values = entries.map(([field, value]) => field === 'preferences' ? JSON.stringify(value) : value)
    const assignments = entries.map(([field]) => `${fields[field]} = ?`).join(', ')
    database.prepare(`UPDATE users SET ${assignments} WHERE id = ?`).run(...values, id)
    return this.find(id)
  },
}

export const authSessionsRepository = {
  create(id, userId, expiresAt) {
    database.prepare('INSERT INTO auth_sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
      .run(id, userId, expiresAt)
  },
  isActive(id, userId) {
    return Boolean(database.prepare(`
      SELECT 1 FROM auth_sessions
      WHERE id = ? AND user_id = ? AND revoked_at IS NULL AND expires_at > ?
    `).get(id, userId, new Date().toISOString()))
  },
  revoke(id, userId) {
    database.prepare(`
      UPDATE auth_sessions SET revoked_at = ?
      WHERE id = ? AND user_id = ? AND revoked_at IS NULL
    `).run(new Date().toISOString(), id, userId)
  },
}

export const communitiesRepository = {
  list() {
    return database.prepare('SELECT * FROM communities ORDER BY created_at DESC').all().map(mapCommunity)
  },
  find(idOrName) {
    return mapCommunity(database.prepare('SELECT * FROM communities WHERE id = ? OR name = ? COLLATE NOCASE')
      .get(idOrName, idOrName))
  },
  insert(community) {
    database.prepare(`
      INSERT INTO communities (id, name, title, description, about, color, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      community.id, community.name, community.title, community.description,
      community.about, community.color, community.createdAt,
    )
    for (const userId of community.members) {
      database.prepare('INSERT INTO community_members (community_id, user_id, created_at) VALUES (?, ?, ?)')
        .run(community.id, userId, community.createdAt)
    }
    return this.find(community.id)
  },
  join(communityId, userId) {
    database.prepare(`
      INSERT OR IGNORE INTO community_members (community_id, user_id, created_at) VALUES (?, ?, ?)
    `).run(communityId, userId, new Date().toISOString())
    return this.find(communityId)
  },
  leave(communityId, userId) {
    database.prepare('DELETE FROM community_members WHERE community_id = ? AND user_id = ?')
      .run(communityId, userId)
    return this.find(communityId)
  },
}

export const followsRepository = {
  listForUser(userId) {
    return database.prepare('SELECT followed_id FROM follows WHERE follower_id = ?')
      .all(userId).map((row) => row.followed_id)
  },
  listFollowers(userId) {
    return database.prepare('SELECT follower_id FROM follows WHERE followed_id = ?')
      .all(userId).map((row) => row.follower_id)
  },
  add(followerId, followedId) {
    database.prepare('INSERT OR IGNORE INTO follows (follower_id, followed_id, created_at) VALUES (?, ?, ?)')
      .run(followerId, followedId, new Date().toISOString())
  },
  remove(followerId, followedId) {
    database.prepare('DELETE FROM follows WHERE follower_id = ? AND followed_id = ?').run(followerId, followedId)
  },
  countByFollowed(followedId) {
    return database.prepare('SELECT COUNT(*) AS count FROM follows WHERE followed_id = ?').get(followedId).count
  },
}

export const postsRepository = {
  list() {
    return database.prepare('SELECT * FROM posts').all().map(mapPost)
  },
  find(id) {
    return mapPost(database.prepare('SELECT * FROM posts WHERE id = ?').get(id))
  },
  listBookmarkedBy(userId) {
    return database.prepare(`
      SELECT posts.* FROM posts
      JOIN bookmarks ON bookmarks.post_id = posts.id
      WHERE bookmarks.user_id = ?
      ORDER BY bookmarks.created_at DESC
    `).all(userId).map(mapPost)
  },
  insert(post) {
    database.prepare(`
      INSERT INTO posts (id, community_id, author_id, title, body, image, base_score, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      post.id, post.communityId, post.authorId, post.title, post.body, post.image,
      post.score || 0, post.createdAt, post.updatedAt,
    )
    return this.find(post.id)
  },
  update(id, updates) {
    const fields = { communityId: 'community_id', title: 'title', body: 'body', image: 'image' }
    const entries = Object.entries(updates).filter(([field]) => fields[field])
    if (!entries.length) return this.find(id)
    const assignments = entries.map(([field]) => `${fields[field]} = ?`).join(', ')
    database.prepare(`UPDATE posts SET ${assignments}, updated_at = ? WHERE id = ?`)
      .run(...entries.map(([, value]) => value), new Date().toISOString(), id)
    return this.find(id)
  },
  delete(id) {
    database.prepare('DELETE FROM posts WHERE id = ?').run(id)
  },
  vote(postId, userId, value) {
    if (value === 0) {
      database.prepare('DELETE FROM post_votes WHERE post_id = ? AND user_id = ?').run(postId, userId)
    } else {
      database.prepare(`
        INSERT INTO post_votes (post_id, user_id, value, created_at) VALUES (?, ?, ?, ?)
        ON CONFLICT(post_id, user_id) DO UPDATE SET value = excluded.value
      `).run(postId, userId, value, new Date().toISOString())
    }
    return this.find(postId)
  },
  toggleBookmark(postId, userId) {
    const found = database.prepare('SELECT 1 FROM bookmarks WHERE post_id = ? AND user_id = ?')
      .get(postId, userId)
    if (found) {
      database.prepare('DELETE FROM bookmarks WHERE post_id = ? AND user_id = ?').run(postId, userId)
    } else {
      database.prepare('INSERT INTO bookmarks (post_id, user_id, created_at) VALUES (?, ?, ?)')
        .run(postId, userId, new Date().toISOString())
    }
    return { ...this.find(postId), bookmarked: !found }
  },
}

export const commentsRepository = {
  listForPost(postId) {
    return database.prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at').all(postId).map(mapComment)
  },
  find(id) {
    return mapComment(database.prepare('SELECT * FROM comments WHERE id = ?').get(id))
  },
  insert(comment) {
    database.prepare(`
      INSERT INTO comments (id, post_id, author_id, parent_comment_id, body, base_score, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      comment.id, comment.postId, comment.authorId, comment.parentCommentId,
      comment.body, comment.score, comment.createdAt,
    )
    return this.find(comment.id)
  },
  delete(id) {
    database.prepare('DELETE FROM comments WHERE id = ?').run(id)
  },
  update(id, body) {
    database.prepare('UPDATE comments SET body = ?, updated_at = ? WHERE id = ?')
      .run(body, new Date().toISOString(), id)
    return this.find(id)
  },
  vote(commentId, userId, value) {
    if (value === 0) {
      database.prepare('DELETE FROM comment_votes WHERE comment_id = ? AND user_id = ?').run(commentId, userId)
    } else {
      database.prepare(`
        INSERT INTO comment_votes (comment_id, user_id, value) VALUES (?, ?, ?)
        ON CONFLICT(comment_id, user_id) DO UPDATE SET value = excluded.value
      `).run(commentId, userId, value)
    }
    return this.find(commentId)
  },
}

export const notificationsRepository = {
  listForUser(userId) {
    return database.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId).map((row) => ({
        id: row.id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        body: row.body,
        targetUrl: row.target_url,
        read: Boolean(row.read),
        createdAt: row.created_at,
      }))
  },
  insert(notification) {
    database.prepare(`
      INSERT INTO notifications (id, user_id, type, title, body, target_url, read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      notification.id, notification.userId, notification.type, notification.title,
      notification.body || '', notification.targetUrl || null, notification.read ? 1 : 0,
      notification.createdAt,
    )
  },
  findForUser(id, userId) {
    const row = database.prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?')
      .get(id, userId)
    if (!row) return null
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      body: row.body,
      targetUrl: row.target_url,
      read: Boolean(row.read),
      createdAt: row.created_at,
    }
  },
  markRead(id, userId, read) {
    database.prepare('UPDATE notifications SET read = ? WHERE id = ? AND user_id = ?')
      .run(read ? 1 : 0, id, userId)
    return this.findForUser(id, userId)
  },
}

export function closeDatabase() {
  database.close()
}
