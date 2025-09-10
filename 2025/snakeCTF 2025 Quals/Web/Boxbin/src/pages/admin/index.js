import { useQuery, gql, useMutation } from '@apollo/client';
import Link from 'next/link';
import Button from '@/components/Button';

const ME_QUERY = gql`
    query Me {
        me {
            id
            groupId
            isAdmin
        }
    }
`;

const ADMIN_DATA_QUERY = gql`
    query AdminData {
        users {
            id
            username
            groupId
        }
        posts {
            id
            title
        }
        hiddenPosts {
            id
            title
        }
    }
`;

const DELETE_USER_MUTATION = gql`
    mutation DeleteUser($id: ID!) {
        deleteUser(id: $id)
    }
`;

const DELETE_POST_MUTATION = gql`
    mutation DeletePost($id: ID!) {
        deletePost(id: $id)
    }
`;

const UPDATE_USER_GROUP_MUTATION = gql`
    mutation UpdateUserGroup($userId: ID!, $groupId: Int!) {
        updateUserGroup(userId: $userId, groupId: $groupId) {
            id
            groupId
        }
    }
`;

export default function AdminDashboard() {
    const { data: meData, loading: meLoading } = useQuery(ME_QUERY);
    const { data, loading, error, refetch } = useQuery(ADMIN_DATA_QUERY);

    const [deleteUser] = useMutation(DELETE_USER_MUTATION, { onCompleted: () => refetch() });
    const [deletePost] = useMutation(DELETE_POST_MUTATION, { onCompleted: () => refetch() });
    const [updateUserGroup] = useMutation(UPDATE_USER_GROUP_MUTATION);

    if (meLoading || loading) return <p>Loading...</p>;
    
    // This check was flawed. It now correctly mirrors the backend logic.
    const isTrulyAdmin = meData?.me?.isAdmin;

    if (!isTrulyAdmin) {
        return <p className="mt-12 text-center">Access Denied.</p>;
    }

    if (error) return <p>Error loading data: {error.message}</p>;

    const handleGroupChange = (userId, newGroupId) => {
        updateUserGroup({ variables: { userId, groupId: parseInt(newGroupId, 10) } });
    };

    return (
        <div className="max-w-7xl mx-auto mt-8">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="p-2 border-b border-white/10">Username</th>
                                <th className="p-2 border-b border-white/10">Group</th>
                                <th className="p-2 border-b border-white/10">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.users.map(user => (
                                <tr key={user.id}>
                                    <td className="p-2 border-b border-white/10">{user.username}</td>
                                    <td className="p-2 border-b border-white/10">
                                        <select 
                                            value={user.groupId} 
                                            onChange={(e) => handleGroupChange(user.id, e.target.value)}
                                            className="bg-white/10 p-1 rounded"
                                        >
                                            <option value={0}>Admin</option>
                                            <option value={1}>Mod</option>
                                            <option value={3}>Box lover 9000</option>
                                            <option value={4}>Box cutter</option>
                                            <option value={5}>VIB</option>
                                            <option value={6}>User</option>
                                        </select>
                                    </td>
                                    <td className="p-2 border-b border-white/10">
                                        <Button onClick={() => confirm('Are you sure?') && deleteUser({ variables: { id: user.id } })}>
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-4">Manage Posts</h2>
                     <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="p-2 border-b border-white/10">Title</th>
                                <th className="p-2 border-b border-white/10">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.posts.map(post => (
                                <tr key={post.id}>
                                    <td className="p-2 border-b border-white/10">
                                        <Link href={`/upload/${post.id}`} className="text-indigo-400 hover:underline">
                                            {post.title}
                                        </Link>
                                    </td>
                                    <td className="p-2 border-b border-white/10">
                                        <Button onClick={() => confirm('Are you sure?') && deletePost({ variables: { id: post.id } })}>
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h2 className="text-2xl font-bold mb-4 mt-8">Hidden Posts</h2>
                     <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="p-2 border-b border-white/10">Title</th>
                                <th className="p-2 border-b border-white/10">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.hiddenPosts.map(post => (
                                <tr key={post.id}>
                                    <td className="p-2 border-b border-white/10">
                                        <Link href={`/upload/${post.id}`} className="text-indigo-400 hover:underline">
                                            {post.title}
                                        </Link>
                                    </td>
                                    <td className="p-2 border-b border-white/10">
                                        <Button onClick={() => confirm('Are you sure?') && deletePost({ variables: { id: post.id } })}>
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
