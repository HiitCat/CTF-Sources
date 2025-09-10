
import { useRouter } from 'next/router';
import { useQuery, gql } from '@apollo/client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import jwt from 'jsonwebtoken';

const USER_QUERY = gql`
  query User($id: ID!) {
    user(id: $id) {
      id
      username
      bio
      posts {
        id
        title
      }
    }
  }
`;

export default function UserPage() {
  const router = useRouter();
  const { id } = router.query;
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const { data, loading, error } = useQuery(USER_QUERY, {
    variables: { id },
    skip: !id,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        const decoded = jwt.decode(token);
        // Compare as strings to avoid type mismatch
        setIsOwnProfile(String(decoded.userId) === String(id));
    }
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const { user } = data || {};

  return (
    <div className="mt-12 max-w-4xl mx-auto">
      {user ? (
        <>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">{user.username}</h1>
            {isOwnProfile && (
                <Link href="/settings" className="text-sm text-indigo-400 hover:underline">
                    Settings
                </Link>
            )}
          </div>
          
          <p className="text-lg text-white/60 mt-2">
              {user.bio || "No bio yet."}
          </p>

          <hr className="my-6 border-white/10" />

          <div>
            <h2 className="text-2xl font-bold">Posts</h2>
            <ul className="list-disc list-inside mt-2">
              {user.posts.map(post => (
                <li key={post.id}>
                  <Link href={`/upload/${post.id}`} className="text-indigo-400 hover:underline">
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p>User not found.</p>
      )}
    </div>
  );
}
