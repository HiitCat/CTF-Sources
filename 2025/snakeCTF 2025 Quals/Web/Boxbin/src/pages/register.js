import Button from "@/components/Button";
import Input from "@/components/Input";
import { useMutation, gql } from '@apollo/client';
import { useState } from 'react';
import { useRouter } from 'next/router';

const SIGNUP_MUTATION = gql`
  mutation Signup($username: String!, $password: String!) {
    signup(username: $username, password: $password)
  }
`;

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const router = useRouter();

  const [signup, { loading }] = useMutation(SIGNUP_MUTATION, {
    onCompleted: ({ signup }) => {
      localStorage.setItem('token', signup);
      // Manually trigger a storage event to update the layout
      window.dispatchEvent(new Event('storage'));
      router.push('/');
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const handleSignup = () => {
    if (password !== verifyPassword) {
      alert("Passwords don't match");
      return;
    }
    signup({ variables: { username, password } });
  };

  return (<>
    <p className="mt-12 mb-6 text-center font-medium text-2xl">
      Register
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
        type="text"
        label="Email (Optional)"
        placeholder="Username"
      />

      <Input
        type="password"
        label="Password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Input
        type="password"
        label="Verify Password"
        placeholder="Verify Password"
        value={verifyPassword}
        onChange={(e) => setVerifyPassword(e.target.value)}
      />

      <Button onClick={handleSignup} disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </Button>
    </div>
  </>);
}
