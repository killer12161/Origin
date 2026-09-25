const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'origin.json');
const LEGACY_DB_FILE = path.join(DATA_DIR, 'stratum.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Migrate legacy file if needed
if (!fs.existsSync(DB_FILE) && fs.existsSync(LEGACY_DB_FILE)) {
  try {
    fs.copyFileSync(LEGACY_DB_FILE, DB_FILE);
  } catch (e) {}
}

// Initial default schema
const defaultData = {
  users: [],
  sessions: [],
  chats: []
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
      return defaultData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database:', err);
    return defaultData;
  }
}

function writeDb(data) {
  try {
    const tempFile = DB_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing database:', err);
  }
}

// ============================================================================
// User & Session Operations
// ============================================================================

function findOrCreateUserByGoogle(profile) {
  const db = readDb();
  let user = db.users.find(u => u.googleId === profile.sub || u.email === profile.email);
  const now = new Date().toISOString();

  if (user) {
    user.name = profile.name || user.name;
    user.picture = profile.picture || user.picture;
    user.lastLoginAt = now;
  } else {
    user = {
      id: 'usr_' + crypto.randomBytes(8).toString('hex'),
      googleId: profile.sub,
      email: profile.email,
      name: profile.name || 'Stratum Strategist',
      picture: profile.picture || '',
      createdAt: now,
      lastLoginAt: now
    };
    db.users.push(user);
  }

  writeDb(db);
  return user;
}

function createSession(userId) {
  const db = readDb();
  const token = 'sess_' + crypto.randomBytes(24).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  // Clean expired sessions
  db.sessions = db.sessions.filter(s => new Date(s.expiresAt) > now);

  db.sessions.push({
    token,
    userId,
    createdAt: now.toISOString(),
    expiresAt
  });

  writeDb(db);
  return token;
}

function getUserBySession(token) {
  if (!token) return null;
  const db = readDb();
  const now = new Date();
  const session = db.sessions.find(s => s.token === token && new Date(s.expiresAt) > now);
  if (!session) return null;

  const user = db.users.find(u => u.id === session.userId);
  return user || null;
}

function deleteSession(token) {
  if (!token) return;
  const db = readDb();
  db.sessions = db.sessions.filter(s => s.token !== token);
  writeDb(db);
}

// ============================================================================
// Chat History & Pinned Conversations Operations
// ============================================================================

function getUserChats(userId) {
  const db = readDb();
  // Filter chats belonging to this user
  const userChats = db.chats.filter(c => c.userId === userId);

  // Sort descending by updatedAt
  userChats.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  const pinned = userChats.filter(c => c.isPinned);
  const recents = userChats.filter(c => !c.isPinned);

  return { pinned, recents, all: userChats };
}

function getChatById(chatId, userId) {
  const db = readDb();
  return db.chats.find(c => c.id === chatId && c.userId === userId) || null;
}

function saveChat(chatData, userId) {
  const db = readDb();
  const now = new Date().toISOString();
  let chat = db.chats.find(c => c.id === chatData.id && c.userId === userId);

  if (chat) {
    chat.title = chatData.title || chat.title;
    if (chatData.isPinned !== undefined) chat.isPinned = !!chatData.isPinned;
    if (Array.isArray(chatData.messages)) chat.messages = chatData.messages;
    if (chatData.pillarData !== undefined) chat.pillarData = chatData.pillarData;
    chat.updatedAt = now;
  } else {
    chat = {
      id: chatData.id || 'chat_' + crypto.randomBytes(8).toString('hex'),
      userId,
      title: chatData.title || 'Venture Strategy Session',
      isPinned: !!chatData.isPinned,
      messages: chatData.messages || [],
      pillarData: chatData.pillarData || null,
      createdAt: now,
      updatedAt: now
    };
    db.chats.push(chat);
  }

  writeDb(db);
  return chat;
}

function togglePinChat(chatId, userId) {
  const db = readDb();
  const chat = db.chats.find(c => c.id === chatId && c.userId === userId);
  if (!chat) return null;

  chat.isPinned = !chat.isPinned;
  chat.updatedAt = new Date().toISOString();
  writeDb(db);
  return chat;
}

function deleteChat(chatId, userId) {
  const db = readDb();
  const initialLength = db.chats.length;
  db.chats = db.chats.filter(c => !(c.id === chatId && c.userId === userId));
  writeDb(db);
  return db.chats.length < initialLength;
}

module.exports = {
  findOrCreateUserByGoogle,
  createSession,
  getUserBySession,
  deleteSession,
  getUserChats,
  getChatById,
  saveChat,
  togglePinChat,
  deleteChat
};
