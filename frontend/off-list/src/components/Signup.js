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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signUpData)
      });

      if(!response.ok) {
        const json = await response.json();
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
        key={`roleElement${roleName}`}
      >
        <Text> { t(`signup.${roleName}`) } </Text>
      </RadioCards.Item>
    );
  });

  const advanceButton = (inForm) => {
    return (
      <div className='ml-1'>
        {
          inForm ?
          <Form.Submit asChild>
            <Button loading={ signUpMutation.isPending }> <Text> { t('signup.formSubmit') } </Text> </Button>
          </Form.Submit>
          :
          <Button
            onClick={ () => setPageIndex(pageIndex + 1) }
            disabled={ currentRole === NO_USER_ROLE }
          >
            <Text> { t('signup.next') } </Text>
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
        key='signupRoleSelector'
      >
        <Strong> { t('signup.selectOcc') } </Strong>

        <RadioCards.Root
          defaultValue={currentRole}
          onValueChange={onRoleChange}
          aria-label='Role selection'
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
      extraMessages = extraMatches.map((el, i) => 
        <Form.Message match={ el.match } className={ INVALID_COLOR } key={`signupValidator${fieldName}:${i}`} >
          { el.message }
        </Form.Message>
      );
    }

    const missingMessage = required ? 
      <Form.Message match="valueMissing" className={ INVALID_COLOR }>
        <Text> { t('signup.fieldReq') } </Text>
      </Form.Message>
    :
    <></>;

    return (
      <Form.Field name={fieldName} className='flex flex-col items-start p-1'>
        <Form.Control type={type} className='Input' required={ required } asChild>
          <TextField.Root size='3' placeholder={ text } className='w-[99%]' />
        </Form.Control>

        <Form.Message match="typeMismatch" className={ INVALID_COLOR }>
					<Text> { t('signup.fieldInvalid') } {lowerText}. </Text>
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
      key='signupContactForm'
    >
      <Strong className='mb-4'> { t('signup.enterContact') } </Strong>

      <Card>
        <ScrollArea
          height='100%'
          scrollbars='vertical'
        >
          <Form.Root onSubmit={ submitForm } className='flex flex-col gap-2 h-[100%]'>
            { buildFormField('tel', t('signup.phoneField'), 'tel') }
            { buildFormField('text', t('signup.fNameField'), 'firstName') }
            { buildFormField('text', `${t('signup.lNameField')} (${t('signup.optionalField')})`, 'lastName', [], false) }
            { buildFormField('email', t('signup.emailField'), 'email') }
            { buildFormField('email', t('signup.confEmailField'), 'emailConf', [{
              message: t('signup.emailNoMatch'), 
              match: (value, formData) => value !== Object.fromEntries(formData).email
            }]) }
            { buildFormField('password', t('signup.pwField'), 'pw') }
            { buildFormField('password', t('signup.confPwField'), 'pwConf', [{
              message: t('signup.pwNoMatch'), 
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
      key='signupComplete'
    >
      <Strong> { t('signup.thanks') } </Strong>

      <Flex
        gap='4'
      >
        <Button onClick={ () => navigate('/login') }> <Text> { t('signup.goLogin') } </Text> </Button>
        <Button onClick={ () => navigate('/') }> <Text> { t('signup.goHome') } </Text> </Button>
      </Flex>
    </Flex>
  );

  let pages = [ roleSelector(roleUiElements), contactForm, signupCompletePage ];

  return (
    <AuthWindow
      headerText={ t('signup.title') }
      onBackClick={ () => {
        if([0, 2].includes(pageIndex))
          navigate('/');
        else
          setPageIndex(pageIndex - 1);
      } }
      showErrorBar={ signUpMutation.isError && pageIndex === 1 }
      errorMessage={ t(`signup.${signUpMutation.error?.message}`) }
    >
      {pages[pageIndex]}
    </AuthWindow>
  );
};

export default Signup;