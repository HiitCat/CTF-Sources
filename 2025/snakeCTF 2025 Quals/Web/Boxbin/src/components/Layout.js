import clsx from "clsx";
import { Inter } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/router";
import Input from "./Input";
import Button from "./Button";
import { useMutation, gql, useQuery } from '@apollo/client';
import { useState, useEffect } from "react";
import jwt from 'jsonwebtoken';


const CREATE_POST_MUTATION = gql`
  mutation CreatePost($title: String!, $content: String!, $hidden: Boolean) {
    createPost(title: $title, content: $content, hidden: $hidden) {
      id
    }
  }
`;

const CREATE_COMMENT_MUTATION = gql`
    mutation CreateComment($postId: ID!, $content: String!) {
        createComment(postId: $postId, content: $content) {
            id
        }
    }
`;

const ME_QUERY = gql`
    query Me {
        me {
            id
            isAdmin
        }
    }
`;

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

export default function Layout({ children, content, post }) {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [hidden, setHidden] = useState(false);
    const [userId, setUserId] = useState(null);
    const [comment, setComment] = useState("");
    const { data: meData } = useQuery(ME_QUERY);

    const [createPost, { loading: postLoading }] = useMutation(CREATE_POST_MUTATION, {
        onCompleted: ({ createPost }) => {
          router.push(`/upload/${createPost.id}`);
        },
        onError: (error) => {
          alert(error.message);
        }
    });

    const [createComment, { loading: commentLoading }] = useMutation(CREATE_COMMENT_MUTATION, {
        onCompleted: () => {
            setComment("");
            // This is a simple way to refresh the data, a better way would be to update the cache
            router.replace(router.asPath);
        },
        onError: (error) => {
            alert(error.message)
        }
    });

    const handleCreatePost = () => {
        createPost({ variables: { title, content, hidden } });
    };

    const handleCreateComment = () => {
        createComment({ variables: { postId: post.id, content: comment }})
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwt.decode(token);
            setUserId(decoded.userId);
        } else {
            setUserId(null);
        }

        const handleStorageChange = () => {
            const token = localStorage.getItem('token');
            if (token) {
                const decoded = jwt.decode(token);
                setUserId(decoded.userId);
            } else {
                setUserId(null);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('storage'));
        router.push('/login');
    }

    const HeaderLinks = [
        {
            name: "Home",
            href: "/",
        },
        {
            name: "Add paste",
            href: "/upload",
        },
        {
            name: "Users",
            href: "/users",
        },
        {
            name: "Upgrades",
            href: "/upgrades",
        },
        {
            name: "Hall of Boxes",
            href: "/hob",
        },
        {
            name: "Support",
            href: "/support",
        }
    ];

    const HeaderLink = ({ name, href, className }) => {
        return (
            <Link
                href={href}
                className={clsx(
                    "text-sm/tight font-light hover:text-white",
                    router.pathname === href ? "text-white" : "text-white/60",
                    className
                )}
            >
                {name}
            </Link>
        );
    }

    if (router.pathname.startsWith("/upload")) {
        return (<>
            <div
                className={clsx(
                    inter.className,
                    "flex w-screen h-screen"
                )}
            >
                <div className="w-[85%] grid">
                    {children}
                </div>

                <div className="flex-1 bg-white/5 overflow-y-auto">
                    <pre className="text-center text-sm/tight">{`
  ____            _     _       
 | __ )  _____  _| |__ (_)_ __  
 |  _ \\ / _ \\ \\/ / '_ \\| | '_ \\ 
 | |_) | (_) >  <| |_) | | | | |
 |____/ \\___/_/\\_\\_.__/|_|_| |_|
`}</pre>

                    {
                        router.pathname === "/upload" ? (
                            <div className="flex flex-col items-center gap-y-2 mt-4 mx-4 text-center">
                                <Input
                                    type="text"
                                    label="Title"
                                    placeholder="Paste title (no special chars)"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <div className="flex items-center gap-x-2">
                                    <input type="checkbox" id="hidden" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
                                    <label htmlFor="hidden" className="text-sm text-white/60">Hidden</label>
                                </div>

                                <Button className="w-full" onClick={handleCreatePost} disabled={postLoading}>
                                    {postLoading ? 'Creating...' : 'Create'}
                                </Button>
                            </div>
                        ) : (<>
                            <div className="flex flex-col items-center gap-y-1 mt-4 mx-4 text-center">
                                <p className="text-sm flex w-full"><span className="font-semibold">Title</span>: <span className="text-white/60 ml-auto">{post?.title || '...'}</span></p>
                                <p className="text-sm flex w-full"><span className="font-semibold">Created</span>: <span className="text-white/60 ml-auto">{post ? new Date(post.createdAt).toLocaleDateString() : '...'}</span></p>
                                <p className="text-sm flex w-full"><span className="font-semibold">Author</span>: <span className="text-white/60 ml-auto">{post?.author?.username || '...'}</span></p>
                                <p className="text-sm flex w-full"><span className="font-semibold">Views</span>: <span className="text-white/60 ml-auto">{post?.views ?? '...'}</span></p>
                                <p className="text-sm flex w-full"><span className="font-semibold">Comments</span>: <span className="text-white/60 ml-auto">{post?.commentCount ?? '...'}</span></p>
                            </div>

                            <hr className="my-3 border-white/50 mx-4" />

                            <div className="flex flex-col items-center gap-y-1 mt-4 mx-4 text-center">
                                <Button className="w-full" onClick={() => router.push('/upload')}>
                                    New
                                </Button>
                                <Button className="w-full" onClick={() => {
                                    const rawWindow = window.open("", "_blank");
                                    rawWindow.document.write(`<pre>${post?.content || ''}</pre>`);
                                    rawWindow.document.close();
                                }}>
                                    Raw
                                </Button>
                            </div>

                            <hr className="my-3 border-white/50 mx-4" />

                            <div className="px-4">
                                <Input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />

                                <Button className="w-full mt-2" onClick={handleCreateComment} disabled={commentLoading}>
                                    Submit comment
                                </Button>
                            </div>


                            <hr className="my-3 border-white/50 mx-4" />
                            {
                                post?.comments.map((comment, i) => (
                                    <div key={i} className="px-4">
                                        <p className="flex text-white/60 text-xs gap-x-2 items-center py-1">
                                            <span className="text-white">{comment.author.username}</span>{" - "} {new Date(comment.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm py-1">
                                            {comment.content}
                                        </p>
                                        <hr className="border-white/50 my-4" />
                                    </div>
                                ))
                            }
                        </>)
                    }
                </div>
            </div>
        </>);
    }

    return (<>
        <div
            className={clsx(
                inter.className,
                "border-b border-white/15",
            )}
        >
            <div className="max-w-7xl w-full mx-auto py-2.5 flex gap-x-8 items-center">
                <p className="text-lg font-semibold mr-8">
                    Boxbin
                </p>

                {
                    HeaderLinks.map((link) => (
                        <HeaderLink
                            key={link.href}
                            name={link.name}
                            href={link.href}
                        />
                    ))
                }

                {userId ? (
                    <>
                        {meData?.me?.isAdmin && <HeaderLink href="/admin" name="Admin" />}
                        <Link href={`/users/${userId}`} className="ml-auto text-sm/tight font-light hover:text-white text-white/60">Profile</Link>
                        <button onClick={handleLogout} className="text-sm/tight font-light hover:text-white text-white/60">Logout</button>
                    </>
                ) : (
                    <>
                        <HeaderLink className="ml-auto" href="/login" name="Login" />
                        <HeaderLink href="/register" name="Register" />
                    </>
                )}
            </div>
        </div>

        <div
            className={clsx(
                inter.className,
                "max-w-7xl w-full mx-auto mb-12",
            )}
        >
            {children}
        </div>
    </>);
}