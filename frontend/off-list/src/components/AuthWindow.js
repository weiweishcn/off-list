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
    <div className='flex flex-col w-[100vw] h-[100vh] items-center justify-center'>
      <Card 
        className='w-full h-full bg-[var(--gray-2)] md:w-[1000px] md:h-[550px]'
        size='3'
      >
        <Flex
          className='flex-col gap-[50px] items-center h-full md:flex-row md:gap-[20px] md:p-5'
        >
          <Flex
            direction='column'
            align='left'
            gap='25px'
            className='w-full'
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
            className='w-full'
          >
            { children }
          </Box>
        </Flex>
      </Card>
    </div>
  );
};

export default AuthWindow;