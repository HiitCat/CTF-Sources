
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs, resolvers } from '../../lib/schema';
import jwt from 'jsonwebtoken';
import { getDb } from '../../lib/database';

const { JWT_SECRET } = process.env;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

export default startServerAndCreateNextHandler(server, {
    context: async (req) => {
        const token = req.headers.authorization || '';
        if (token) {
            try {
                const { userId } = jwt.verify(token, JWT_SECRET);
                const db = await getDb();
                const user = await db.get('SELECT * FROM users WHERE id = ?', userId);
                return { user };
            } catch (e) {
                // Invalid token, ignore
            }
        }
        return { user: null };
    },
});
