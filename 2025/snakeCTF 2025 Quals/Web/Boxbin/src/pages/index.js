import Button from "@/components/Button";
import Input from "@/components/Input";
import Logo from "@/components/Logo";
import Link from "next/link";
import { useQuery, gql } from '@apollo/client';
import { useState, useMemo } from "react";

const POSTS_QUERY = gql`
  query Posts($orderBy: String) {
    posts(orderBy: $orderBy) {
      id
      title
      content
      createdAt
      views
      commentCount
      author {
          username
          id
      }
    }
  }
`;

export default function Home() {
  const { data, loading, error } = useQuery(POSTS_QUERY, {
    variables: { orderBy: "createdAt_DESC" }
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const filteredPosts = useMemo(() => {
    if (!submittedSearch || !data) return [];
    return data.posts.filter(post =>
      post.title.toLowerCase().includes(submittedSearch.toLowerCase()) ||
      post.content.toLowerCase().includes(submittedSearch.toLowerCase())
    );
  }, [submittedSearch, data]);

  const handleSearch = () => {
    setSubmittedSearch(searchQuery);
  };

  // const renderPostList = (posts) => (
  //   <ul className="space-y-2">
  //     {posts.map(post => (
  //       <li key={post.id} className="border-b border-white/10 pb-2">
  //         <Link href={`/upload/${post.id}`} className="text-indigo-400 hover:underline text-lg">
  //           {post.title}
  //         </Link>
  //         <div className="text-xs text-white/60 mt-1">
  //           <span>Created by {post.author.username}</span>
  //           <span className="mx-2">|</span>
  //           <span>Added at {new Date(post.createdAt).toLocaleDateString()}</span>
  //           <span className="mx-2">|</span>
  //           <span>{post.views} Views</span>
  //           <span className="mx-2">|</span>
  //           <span>{post.commentCount} Comments</span>
  //         </div>
  //       </li>
  //     ))}
  //   </ul>
  // );

  const renderPostList = (posts) => (
    posts.map((post, i) => (
      <tr key={post.id} className={(i % 2 === 0 ? "bg-white/10" : "bg-white/2") +  " border-b border-white/10"}>
        <td className="p-2">
          <Link href={`/upload/${post.id}`} className="hover:underline">
            {post.title}
          </Link>
        </td>
        <td className="p-2 text-center">{post.commentCount}</td>
        <td className="p-2 text-center">{post.views}</td>
        <td className="p-2 text-center">
          <Link href={`/users/${post.author.id}`} className="hover:underline text-blue-400">
            {post.author.username}
          </Link>
        </td>
        <td className="p-2 text-center">{new Date(post.createdAt).toLocaleDateString()}</td>
      </tr>
    ))
  );

  return (<>
    <Logo className="size-64 fill-[#ccc] mx-auto" />

    <div className="flex flex-col justify-center items-center">
      <Link
        target="_blank"
        rel="noopener noreferrer"
        href="https://youtu.be/c4PqZp8nowQ"
        className="text-indigo-700 text-lg font-semibold"
      >
        BOXBIN SONG LINK
      </Link>

      <p className="text-center text-red-700 font-semibold mt-1">
        Mirrors: just spin up another instance lmao
      </p>
    </div>

    <p className="text-center text-bold text-sm mt-2 text-white/60">
      Search for a paste
    </p>

    <div className="flex justify-center gap-x-1 max-w-xs mx-auto mt-1">
      <Input
        type="text"
        placeholder="Search for..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />

      <Button onClick={handleSearch}>
        Search
      </Button>
    </div>

    <div className="max-w-4xl mx-auto mt-8">
      {loading && <p>Loading posts...</p>}
      {error && <p>Error loading posts: {error.message}</p>}

      {/* Display search results if a search has been made */}
      {submittedSearch && (
        <>
          <h2 className="text-xl font-bold mb-4">Search Results</h2>
          {filteredPosts.length > 0 ? renderPostList(filteredPosts) : <p>No results found.</p>}
        </>
      )}

      {/* Display latest pastes if no search has been made and data is available */}
      {!submittedSearch && data && data.posts && (
        <table className="w-full text-sm">
          <thead className="bg-white/10 border-b border-white/10">
            <tr>
              <th className="text-left py-1.5 px-2">Title</th>
              <th>Comments</th>
              <th>Views</th>
              <th>Created by</th>
              <th>Added</th>
            </tr>
          </thead>
          <tbody>
            {renderPostList(data.posts.slice(0, 10))}
          </tbody>
        </table>
      )}
    </div>
  </>);
}
