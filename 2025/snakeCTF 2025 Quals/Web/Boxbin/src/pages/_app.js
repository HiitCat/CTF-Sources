import "@/styles/globals.css";
import Layout from "@/components/Layout";
import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useEffect, useState } from 'react';

function MyApp({ Component, pageProps }) {
    const [client, setClient] = useState(null);
    const [content, setContent] = useState("");
    const [post, setPost] = useState(null);

    useEffect(() => {
        const httpLink = createHttpLink({
            uri: '/api/graphql',
        });

        const authLink = setContext((_, { headers }) => {
            const token = localStorage.getItem('token');
            return {
                headers: {
                    ...headers,
                    authorization: token ? `${token}` : "",
                }
            }
        });

        setClient(new ApolloClient({
            link: authLink.concat(httpLink),
            cache: new InMemoryCache()
        }));
    }, [pageProps]);


    if (!client) {
        return null;
    }

  return (
    <ApolloProvider client={client}>
        <Layout content={content} post={post}>
            <Component {...pageProps} content={content} setContent={setContent} setPost={setPost} />
        </Layout>
    </ApolloProvider>
  );
}

export default MyApp;