import Button from "@/components/Button";
import Input from "@/components/Input";
import { useMutation, gql } from '@apollo/client';
import { useState } from 'react';
import { useRouter } from 'next/router';

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: ({ login }) => {
      localStorage.setItem('token', login);
      // Manually trigger a storage event to update the layout
      window.dispatchEvent(new Event('storage'));
      router.push('/');
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const handleLogin = () => {
    login({ variables: { username, password } });
  };

  return (<>
    <p className="mt-12 mb-6 text-center font-medium text-2xl">
      Login
    </p>

    <div className="flex flex-col gap-4 max-w-lg mx-auto">
      <Input
        type="text"
        label="Username"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <Input
        type="password"
        label="Password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </div>
  </>);
}
