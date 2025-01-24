import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import * as Form from '@radix-ui/react-form';
import { Button, RadioCards, TextField, Card, Flex, Text, Strong, ScrollArea } from '@radix-ui/themes';

import AuthWindow from './AuthWindow';
import { useMutation } from '@tanstack/react-query';

const userRoles = ['Realtor', 'Designer', 'Brokerage', 'General Contractor', 'Supplier', 'Other'];
const NO_USER_ROLE = '';

const Signup = () => {
  const { t } = useTranslation();
  const [currentRole, setCurrentRole] = useState(NO_USER_ROLE);
  const [pageIndex, setPageIndex] = useState(0);

  const navigate = useNavigate();

  const signUpMutation = useMutation({
    mutationFn: async (signUpData) => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signUpData)
      });

      if(!response.ok) {
        const json = await response.json();
        console.log(json);
        throw new Error(json.error);
      }

      return response.json();
    },
    onSuccess: () => { setPageIndex(2); }
  });

  const onRoleChange = (value) => {
    setCurrentRole(value);
  };

  const prepareFormData = (formData) => {
    let data = Object.fromEntries(formData);
    data.type = currentRole;
    delete data.emailConf;
    delete data.pwConf;
    
    return data;
  }

  const submitForm = (e) => {
    e.preventDefault();

    const data = prepareFormData(new FormData(e.currentTarget));
    signUpMutation.mutate(data);
  }

  // Elements clicked on when choosing designer/contractor/realtor/etc.
  const roleUiElements = userRoles.map((roleName) => {
    return (
      <RadioCards.Item
        className='SignupToggleItem'
        value={roleName}
        aria-label={roleName}
      >
        <Text> {roleName} </Text>
      </RadioCards.Item>
    );
  });

  const advanceButton = (inForm) => {
    return (
      <div className='ml-1'>
        {
          inForm ?
          <Form.Submit asChild>
            <Button loading={ signUpMutation.isPending }> <Text> Submit </Text> </Button>
          </Form.Submit>
          :
          <Button
            onClick={ () => setPageIndex(pageIndex + 1) }
            disabled={ currentRole === NO_USER_ROLE }
          >
            <Text> Next </Text>
          </Button>
        }
      </div>
    );
  };

  const roleSelector = (roles) => {
    return (
      <Flex
        direction='column'
        gap='20px'
        justify='center'
        height='100%'
      >
        <Strong> Select your occupation </Strong>

        <RadioCards.Root
          defaultValue={currentRole}
          onValueChange={onRoleChange}
          aria-lable='Role selection'
        >
          { roles }
        </RadioCards.Root>

        { advanceButton(false) }
      </Flex>
    );
  }

  /*
    type is a standard <input> type: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types

    text is a plaintext name or label

    fieldName is the corresponding data state field name

    extraMatches is an array of objs as such:
    [
      { message: String, match: (value, FormData) => bool }, { ... }, ...
    ]
  */
  const buildFormField = (type, text, fieldName, extraMatches, required=true) => {
    const lowerText = text.toLowerCase();
    const INVALID_COLOR = 'text-red-400';
    let extraMessages = [];

    if(extraMatches) {
      extraMessages = extraMatches.map((el) => 
        <Form.Message match={ el.match } className={ INVALID_COLOR }>
          { el.message }
        </Form.Message>
      );
    }

    const missingMessage = required ? 
      <Form.Message match="valueMissing" className={ INVALID_COLOR }>
        <Text> This is a required field. </Text>
      </Form.Message>
    :
    <></>;

    return (
      <Form.Field name={fieldName} className='flex flex-col items-start p-1'>
        <Form.Control type={type} className='Input' required={ required } asChild>
          <TextField.Root size='3' placeholder={ text } className='w-[99%]' />
        </Form.Control>

        <Form.Message match="typeMismatch" className={ INVALID_COLOR }>
					<Text> Please provide a valid {lowerText}. </Text>
				</Form.Message>

        { missingMessage }
        { extraMessages }
      </Form.Field>
    );
  };


  const contactForm = (
    <Flex 
      direction='column'
      height='100%'
      justify='center'
    >
      <Strong className='mb-4'> Enter your contact information: </Strong>

      <Card>
        <ScrollArea
          height='100%'
          // type='always'
          scrollbars='vertical'
        >
          <Form.Root onSubmit={ submitForm } className='flex flex-col gap-2 h-[100%]'>
            { buildFormField('tel', 'Phone Number', 'tel') }
            { buildFormField('text', 'First Name', 'firstName') }
            { buildFormField('text', 'Last Name (Optional)', 'lastName', [], false) }
            { buildFormField('email', 'Email', 'email') }
            { buildFormField('email', 'Confirm Email', 'emailConf', [{
              message: "Emails don't match", 
              match: (value, formData) => value !== Object.fromEntries(formData).email
            }]) }
            { buildFormField('password', 'Password', 'pw') }
            { buildFormField('password', 'Confirm Password', 'pwConf', [{
              message: "Passwords don't match", 
              match: (value, formData) => value !== Object.fromEntries(formData).pw
            }]) }
            { advanceButton(true) }
          </Form.Root>
        </ScrollArea>
      </Card>
    </Flex>
  );


  const signupCompletePage = (
    <Flex
      direction='column'
      gap='4'
      justify='center'
      align='center'
      height='100%'
    >
      <Strong> Thank you for signing up. </Strong>

      <Flex
        gap='4'
      >
        <Button onClick={ () => navigate('/login') }> <Text> Login Here </Text> </Button>
        <Button onClick={ () => navigate('/') }> <Text> Return Home </Text> </Button>
      </Flex>
    </Flex>
  );

  let pages = [
    roleSelector(roleUiElements), contactForm, signupCompletePage
  ]

  return (
    <AuthWindow
      headerText='Create a Pencil Dogs Account'
      onBackClick={ () => {
        if([0, 2].includes(pageIndex))
          navigate('/');
        else
          setPageIndex(pageIndex - 1);
      } }
      showErrorBar={ signUpMutation.isError && pageIndex === 1 }
      errorMessage={ signUpMutation.error?.message }
    >
      {pages[pageIndex]}
    </AuthWindow>
  );
};

export default Signup;