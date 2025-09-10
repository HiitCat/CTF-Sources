
import { useRouter } from 'next/router';
import { useQuery, gql } from '@apollo/client';
import { useEffect } from 'react';

const POST_QUERY = gql`
  query Post($id: ID!) {
    post(id: $id) {
      id
      title
      content
      createdAt
      views
      author {
        id
        username
      }
      comments {
        id
        content
        createdAt
        author {
          id
          username
        }
      }
      commentCount
    }
  }
`;

export default function PostPage({ setPost }) {
  const router = useRouter();
  const { id } = router.query;

  const { data, loading, error } = useQuery(POST_QUERY, {
    variables: { id },
    skip: !id,
  });

  useEffect(() => {
    if (data) {
      setPost(data.post);
    }
    // Clear post data on unmount
    return () => {
      setPost(null);
    }
  }, [data, setPost]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const { post } = data || {};

  return (
    <div className="w-full h-full outline-none p-4 font-mono text-sm">
        {post ? (
            <div className="whitespace-pre-wrap">{post.content}</div>
        ) : (
            <p>Post not found.</p>
        )}
    </div>
  );
}
