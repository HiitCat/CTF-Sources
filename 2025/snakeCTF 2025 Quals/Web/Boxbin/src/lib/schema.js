import { gql } from 'graphql-tag';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from './database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { merge } from './utils';

const { JWT_SECRET } = process.env;

export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    bio: String
    posts: [Post!]
    upgrades: [Upgrade!]
    groupId: Int
    isAdmin: Boolean
    settings: String
    createdAt: String
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    createdAt: String
    views: Int
    comments: [Comment!]
    commentCount: Int
    hidden: Boolean
  }

  type Comment {
    id: ID!
    content: String!
    author: User!
    createdAt: String
  }

  type Upgrade {
    id: ID!
    name: String!
    description: String!
  }

  type Query {
    users: [User!]
    user(id: ID!): User
    posts(orderBy: String): [Post!]
    post(id: ID!): Post
    upgrades: [Upgrade!]
    me: User
    hiddenPosts: [Post!]
    userSettings: String
  }

  type Mutation {
    signup(username: String!, password: String!): String # Returns a token
    login(username: String!, password: String!): String # Returns a token
    createPost(title: String!, content: String!, hidden: Boolean): Post
    purchaseUpgrade(upgradeId: ID!): User
    createComment(postId: ID!, content: String!): Comment
    updateBio(bio: String!): User
    adminUserUpgrade(upgradeId: ID!): User # Vulnerability
    updateSettings(settings: String!): String
    deleteUser(id: ID!): Boolean
    deletePost(id: ID!): Boolean
    updateUserGroup(userId: ID!, groupId: Int!): User
  }
`;

function isAuthorized(context) {
  if (context.user && context.user.settings) {
    try {
      const userSettings = JSON.parse(context.user.settings);
      if (userSettings.isAdmin === true) return true;
    } catch (e) {
    }
  }
  return (context.user && context.user.groupId <= 1);
}

export const resolvers = {
  Query: {
    users: async () => {
      const db = await getDb();
      return db.all('SELECT * FROM users ORDER BY groupId ASC, username ASC');
    },
    user: async (_, { id }) => {
      const db = await getDb();
      return db.get('SELECT * FROM users WHERE id = ?', id);
    },
    posts: async (_, { orderBy }) => {
      const db = await getDb();
      let query = 'SELECT * FROM posts WHERE hidden = FALSE';
      if (orderBy === 'createdAt_DESC') {
        query += ' ORDER BY createdAt DESC';
      } else {
        query += ' ORDER BY id DESC';
      }
      return db.all(query);
    },
    post: async (_, { id }, context) => {
      const db = await getDb();
      const post = await db.get('SELECT * FROM posts WHERE id = ?', id);

      if (!post) {
        return null;
      }

      if (post.hidden) {
        const viewer = context.user;
        const isOwner = viewer && viewer.id === post.userId;
        let isAdmin = viewer && viewer.groupId <= 1;
        
        if (viewer && viewer.settings) {
          try {
            const userSettings = JSON.parse(viewer.settings);
            if (userSettings.isAdmin === true) isAdmin = true;
          } catch (e) {
          }
        }

        if (!isOwner && !isAdmin) {
          throw new Error("Post not found or you don't have permission to view it.");
        }
      }

      await db.run('UPDATE posts SET views = views + 1 WHERE id = ?', id);
      return post;
    },
    upgrades: async () => {
      const db = await getDb();
      return db.all('SELECT * FROM upgrades');
    },
    me: async (_, __, context) => {
      return context.user;
    },
    hiddenPosts: async (_, __, context) => {
      if (!isAuthorized(context)) {
        throw new Error("Forbidden");
      }
      const db = await getDb();
      return db.all('SELECT * FROM posts WHERE hidden = TRUE ORDER BY id DESC');
    },
    userSettings: async (_, __, context) => {
      if (!context.user) {
        throw new Error('You must be logged in');
      }
      return context.user.settings || '{}';
    }
  },
  Mutation: {
    signup: async (_, { username, password }) => {
      const db = await getDb();
      const existingUser = await db.get('SELECT * FROM users WHERE username = ?', username);
      if (existingUser) {
        throw new Error('Username already exists');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.run('INSERT INTO users (username, password) VALUES (?, ?)', username, hashedPassword);
      const token = jwt.sign({ userId: result.lastID }, JWT_SECRET);
      return token;
    },
    login: async (_, { username, password }) => {
      const db = await getDb();
      const user = await db.get('SELECT * FROM users WHERE username = ?', username);
      if (!user) {
        throw new Error('User not found');
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error('Invalid password');
      }
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      return token;
    },
    createPost: async (_, { title, content, hidden }, context) => {
      const db = await getDb();
      if (!context.user) {
        throw new Error('You must be logged in to create a post');
      }
      const newId = uuidv4();
      await db.run('INSERT INTO posts (id, title, content, userId, hidden) VALUES (?, ?, ?, ?, ?)', newId, title, content, context.user.id, hidden || false);
      return db.get('SELECT * FROM posts WHERE id = ?', newId);
    },
    purchaseUpgrade: async (_, { upgradeId }, context) => {
      const db = await getDb();
      if (!context.user) {
        throw new Error('You must be logged in to purchase an upgrade');
      }

      const alreadyOwned = await db.get('SELECT * FROM user_upgrades WHERE userId = ? AND upgradeId = ?', context.user.id, upgradeId);
      if (alreadyOwned) {
        throw new Error('You already own this upgrade');
      }

      await db.run('INSERT INTO user_upgrades (userId, upgradeId) VALUES (?, ?)', context.user.id, upgradeId);

      return db.get('SELECT * FROM users WHERE id = ?', context.user.id);
    },
    createComment: async (_, { postId, content }, context) => {
      const db = await getDb();
      if (!context.user) {
        throw new Error('You must be logged in to comment');
      }
      const result = await db.run('INSERT INTO comments (postId, content, userId) VALUES (?, ?, ?)', postId, content, context.user.id);
      return db.get('SELECT * FROM comments WHERE id = ?', result.lastID);
    },
    updateBio: async (_, { bio }, context) => {
      const db = await getDb();
      if (!context.user) {
        throw new Error('You must be logged in to update your bio');
      }
      await db.run('UPDATE users SET bio = ? WHERE id = ?', bio, context.user.id);
      return db.get('SELECT * FROM users WHERE id = ?', context.user.id);
    },
    adminUserUpgrade: async (_, { upgradeId }, context) => {
      const db = await getDb();
      if (!context.user) {
        throw new Error('You must be logged in');
      }
      const upgrade = await db.get('SELECT * FROM upgrades WHERE id = ?', upgradeId);
      if (!upgrade) {
        throw new Error('Upgrade not found');
      }
      const alreadyOwned = await db.get('SELECT * FROM user_upgrades WHERE userId = ? AND upgradeId = ?', context.user.id, upgradeId);
      if (alreadyOwned) {
        throw new Error('You already own this upgrade');
      }

      await db.run('INSERT INTO user_upgrades (userId, upgradeId) VALUES (?, ?)', context.user.id, upgradeId);

      let newGroupId = 6; // Default user group
      switch (upgrade.name) {
        case 'VIB':
          newGroupId = 5;
          break;
        case 'Box cutter':
          newGroupId = 4;
          break;
        case 'Box lover 9000':
          newGroupId = 3;
          break;
      }
      await db.run('UPDATE users SET groupId = ? WHERE id = ?', newGroupId, context.user.id);

      const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', context.user.id);
      return updatedUser;
    },
    updateSettings: async (_, { settings }, context) => {
      const db = await getDb();
      if (!context.user) {
        throw new Error('You must be logged in');
      }
      try {
        await db.run('UPDATE users SET settings = ? WHERE id = ?', settings, context.user.id);
        
        return "Settings updated";
      } catch (e) {
        console.error(e);
        throw new Error("Invalid settings format");
      }
    },
    deleteUser: async (_, { id }, context) => {
      if (!isAuthorized(context)) throw new Error("Forbidden");
      const db = await getDb();
      await db.run('DELETE FROM users WHERE id = ?', id);
      return true;
    },
    deletePost: async (_, { id }, context) => {
      if (!isAuthorized(context)) throw new Error("Forbidden");
      const db = await getDb();
      await db.run('DELETE FROM comments WHERE postId = ?', id);
      await db.run('DELETE FROM posts WHERE id = ?', id);
      return true;
    },
    updateUserGroup: async (_, { userId, groupId }, context) => {
      if (!isAuthorized(context)) throw new Error("Forbidden");
      const db = await getDb();
      await db.run('UPDATE users SET groupId = ? WHERE id = ?', groupId, userId);
      return db.get('SELECT * FROM users WHERE id = ?', userId);
    }
  },
  User: {
    posts: async (profileUser, _, context) => {
      const db = await getDb();
      const viewer = context.user;

      const isOwner = viewer && viewer.id === profileUser.id;
      let isAdmin = viewer && viewer.groupId <= 1;
      
      if (viewer && viewer.settings) {
        try {
          const userSettings = JSON.parse(viewer.settings);
          if (userSettings.isAdmin === true) isAdmin = true;
        } catch (e) {
        }
      }

      const canViewHidden = isOwner || isAdmin;

      if (canViewHidden) {
        return db.all('SELECT * FROM posts WHERE userId = ? ORDER BY id DESC', profileUser.id);
      } else {
        return db.all('SELECT * FROM posts WHERE userId = ? AND hidden = FALSE ORDER BY id DESC', profileUser.id);
      }
    },
    upgrades: async (user) => {
      const db = await getDb();
      return db.all('SELECT u.* FROM upgrades u JOIN user_upgrades uu ON u.id = uu.upgradeId WHERE uu.userId = ?', user.id);
    },
    isAdmin: (user) => {
      if (user.settings) {
        try {
          const userSettings = JSON.parse(user.settings);
          if (userSettings.isAdmin === true) return true;
        } catch (e) {
        }
      }
      return user.groupId === 0;
    }
  },
  Post: {
    author: async (post) => {
      const db = await getDb();
      return db.get('SELECT * FROM users WHERE id = ?', post.userId);
    },
    comments: async (post) => {
      const db = await getDb();
      return db.all('SELECT * FROM comments WHERE postId = ? ORDER BY createdAt DESC', post.id);
    },
    commentCount: async (post) => {
      const db = await getDb();
      const result = await db.get('SELECT COUNT(*) as count FROM comments WHERE postId = ?', post.id);
      return result.count;
    }
  },
  Comment: {
    author: async (comment) => {
      const db = await getDb();
      return db.get('SELECT * FROM users WHERE id = ?', comment.userId);
    }
  }
};