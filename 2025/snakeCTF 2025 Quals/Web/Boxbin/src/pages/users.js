import Button from "@/components/Button";
import Input from "@/components/Input";
import { useQuery, gql } from '@apollo/client';
import { useState, useMemo } from "react";
import Link from "next/link";

const USERS_QUERY = gql`
  query Users {
    users {
      id
      username
      createdAt
      groupId
    }
  }
`;

const groupNames = {
  0: "Admins",
  1: "Mods",
  3: "Box lover 9000",
  4: "Box cutter",
  5: "VIB",
  6: "Users"
};

export default function Users() {
  const { data, loading, error } = useQuery(USERS_QUERY);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const usersToDisplay = useMemo(() => {
    if (!data) return [];
    if (!submittedSearch) {
      return data.users;
    }
    return data.users.filter(user =>
      user.username.toLowerCase().includes(submittedSearch.toLowerCase())
    );
  }, [submittedSearch, data]);

  const groupedUsers = useMemo(() => {
    if (!usersToDisplay) return {};
    return usersToDisplay.reduce((acc, user) => {
      const groupName = groupNames[user.groupId] || "Users";
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(user);
      return acc;
    }, {});
  }, [usersToDisplay]);

  const handleSearch = () => {
    setSubmittedSearch(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery("");
    setSubmittedSearch("");
  }

  return (<>
    <p className="mt-12 mb-6 text-center font-medium text-2xl">
      Users
    </p>

    <div className="flex justify-center gap-x-1 max-w-sm mx-auto mt-1">
      <Input
        type="text"
        placeholder="Username..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />

      <Button onClick={handleSearch}>
        Search
      </Button>
      {submittedSearch && (
        <Button onClick={handleClear}>
          Clear
        </Button>
      )}
    </div>

    <div className="max-w-4xl mx-auto mt-8">
      {loading && <p>Loading users...</p>}
      {error && <p>Error loading users: {error.message}</p>}

      {Object.entries(groupedUsers).map(([groupName, users]) => (<>
        <h2 className="text-xl font-bold mb-2">{groupName}</h2>
        <table className="mb-6 w-full text-sm">
          <thead className="bg-white/10 border-b border-white/10">
            <tr>
              <th className="text-left py-1.5 px-2">ID</th>
              <th className="text-left py-1.5 px-2">Username</th>
              <th className="text-left py-1.5 px-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
                users.map((user, i) => (
                  <tr key={user.id} className={(i % 2 === 0 ? "bg-white/10" : "bg-white/2") + " border-b border-white/10"}>
                    <td className="py-1.5 px-2 w-[10%]">
                      <Link href={`/users/${user.id}`} className="hover:underline">
                        {user.id}
                      </Link>
                    </td>
                    <td className="py-1.5 px-2 w-[75%]">
                      <Link href={`/users/${user.id}`} className="hover:underline text-blue-400">
                        {user.username}
                      </Link>
                    </td>
                    <td className="py-1.5 px-2">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
            ) : (
              !loading && <p>No users found in this group.</p>
            )}
          </tbody>
        </table>
      </>))}
    </div>
  </>);
}
