import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthWindow from './AuthWindow';
import * as Form from '@radix-ui/react-form';
import { TextField, Text, Button, Box } from '@radix-ui/themes';

import { useMutation } from '@tanstack/react-query';


const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      if(!response.ok) {
        const json = await response.json();
        throw new Error(json.error);
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', variables.email);
      localStorage.setItem('userType', data.userType);
  

      console.log(data.userType);
      switch (data.userType) {
        case 'Designer':
          navigate('/designer-dashboard');
          break;
        case 'Admin':
          navigate('/admin-dashboard');
          break;
        default:
          navigate('/dashboard');
          break;
      }
    }
  });

  const submitForm = (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.currentTarget));
    loginMutation.mutate(data);
  }

  const buildFormField = (type, text, fieldName) => {
    const INVALID_COLOR = 'text-red-400';
      
    return (
      <Form.Field name={fieldName} className='flex flex-col items-start'>
        <Form.Control type={type} required asChild>
          <TextField.Root size='3' placeholder={ text } className='w-full' />
        </Form.Control>

        <Form.Message match="valueMissing" className={ INVALID_COLOR }>
          <Text> This is a required field. </Text>
        </Form.Message>
      </Form.Field>
    );
  }

  const loginSection = () => {
    return (
      <Form.Root onSubmit={ submitForm } className='flex flex-col gap-2 h-[100%] justify-center'>
        { buildFormField('text', t('login.emailLabel'), 'email') }
        { buildFormField('password', t('login.passwordLabel'), 'pw') }

        <div>
          <Form.Submit asChild>
            <Button loading={ loginMutation.isPending }> <Text> { t('login.submitButton') } </Text> </Button>
          </Form.Submit>
        </div>
      </Form.Root>
    );
  }

  return (
    <AuthWindow
      headerText={t('login.title')}
      onBackClick={ () => navigate('/') }
      showErrorBar={ loginMutation.isError }
      errorMessage={ t(`login.${loginMutation.error?.message}`) }
    >
      <Box
        height='100%'
      >
        { loginSection() }
      </Box>
    </AuthWindow>
  );
};

export default LoginPage;