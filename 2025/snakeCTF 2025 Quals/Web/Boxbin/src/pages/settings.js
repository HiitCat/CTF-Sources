import { useState, useEffect } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import Button from '@/components/Button';

const ME_QUERY = gql`
    query Me {
        me {
            id
            bio
            upgrades {
                id
            }
            settings
        }
    }
`;

const UPDATE_BIO_MUTATION = gql`
    mutation UpdateBio($bio: String!) {
        updateBio(bio: $bio) {
            id
            bio
        }
    }
`;

const UPDATE_SETTINGS_MUTATION = gql`
    mutation UpdateSettings($settings: String!) {
        updateSettings(settings: $settings)
    }
`;

export default function Settings() {
    const [postsPerPage, setPostsPerPage] = useState(10);
    const [bio, setBio] = useState("");
    const [message, setMessage] = useState('');

    const { data: meData, loading: meLoading } = useQuery(ME_QUERY, {
        fetchPolicy: 'network-only', // This will bypass the cache
        onCompleted: (data) => {
            if (data?.me) {
                setBio(data.me.bio || "");
                if (data.me.settings) {
                    try {
                        const parsedSettings = JSON.parse(data.me.settings);
                        setPostsPerPage(parsedSettings.postsPerPage || 10);
                    } catch (e) {
                        // Ignore invalid JSON
                    }
                }
            }
        }
    });

    const [updateBio, { loading: bioLoading }] = useMutation(UPDATE_BIO_MUTATION, {
        onCompleted: () => {
            setMessage("Bio updated successfully!");
        },
        onError: (error) => {
            setMessage(error.message);
        }
    });

    const [updateSettings, { loading: settingsLoading }] = useMutation(UPDATE_SETTINGS_MUTATION, {
        onCompleted: (data) => {
            setMessage("Settings updated successfully!");
        },
        onError: (error) => {
            setMessage(error.message);
        }
    });

    const handleSave = () => {
        setMessage('');
        
        // Update Bio
        updateBio({ variables: { bio } });

        // Update Settings
        const settingsPayload = JSON.stringify({
            postsPerPage,
        });
        updateSettings({ variables: { settings: settingsPayload } });
    };

    if (meLoading) return <p>Loading...</p>;

    // Check if user has any upgrades
    if (!meData?.me?.upgrades || meData.me.upgrades.length === 0) {
        return <p className="mt-12 text-center">You must purchase an upgrade to access this page.</p>;
    }

    return (
        <div className="max-w-2xl mx-auto mt-12">
            <p className="mb-6 text-center font-medium text-2xl">
                User Settings
            </p>
            <div className="flex flex-col gap-6">
                {/* Bio Setting */}
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-white/60 mb-2">
                        Bio
                    </label>
                    <textarea
                        id="bio"
                        className="w-full h-32 bg-white/5 p-2 rounded"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />
                </div>

                {/* Posts Per Page Setting */}
                <div>
                    <label htmlFor="posts-per-page" className="block text-sm font-medium text-white/60 mb-2">
                        Posts Per Page
                    </label>
                    <input
                        type="number"
                        id="posts-per-page"
                        className="w-full bg-white/5 p-2 rounded"
                        value={postsPerPage}
                        onChange={(e) => setPostsPerPage(parseInt(e.target.value, 10))}
                    />
                </div>

                <Button onClick={handleSave} disabled={bioLoading || settingsLoading}>
                    {bioLoading || settingsLoading ? 'Saving...' : 'Save All Settings'}
                </Button>
                {message && <p className="text-center mt-4">{message}</p>}
            </div>
        </div>
    );
}
