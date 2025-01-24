import React from 'react';

import { Card, Flex, Heading, Avatar, IconButton, Box, Callout, Text } from '@radix-ui/themes';
import { ChevronDownIcon, InfoCircledIcon } from '@radix-ui/react-icons';

const AuthWindow = ({ children, onBackClick, headerText, showErrorBar, errorMessage }) => {
  const backButton = () => {
    return (
      <IconButton
        variant='outline'
        onClick={ onBackClick }
      >
        <ChevronDownIcon style={{ rotate: '90deg' }} />
      </IconButton>
    );
  };

  const errorBar = () => {
    return (
      showErrorBar ? 
        <Callout.Root 
          size='2'
          color='red'
          className='absolute bottom-5'
        >
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            <Text> { errorMessage } </Text>
          </Callout.Text>
        </Callout.Root>
      :
        <></>
    );
  }

  return (
    <div className='flex flex-col w-[100vw] h-[100vh] items-center'>

      <Card 
        className='w-[1000px] max-w-[1000px] h-[550px] max-h-[800px] bg-[var(--gray-2)] absolute top-[50%] translate-y-[-50%]'
        size='3'
      >
        <Flex
          justify='between'
          align='center'
          height='100%'
        >
          <Flex
            direction='column'
            align='center'
            gap='25px'
          >
            <Avatar 
              src='/logo.png'
              fallback='PD'
              size='5'
            />

            <Heading> { headerText } </Heading>

            { backButton() }

            { errorBar() }

          </Flex>

          <Box
            width='50%'
            height='100%'
          >
            { children }
          </Box>
        </Flex>
      </Card>
    </div>
  );
};

export default AuthWindow;