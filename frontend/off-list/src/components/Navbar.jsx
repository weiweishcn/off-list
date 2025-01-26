// src/components/Navbar.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { Button, IconButton, Text, Dialog, Separator, Inset } from '@radix-ui/themes';
import { Cross1Icon, HamburgerMenuIcon } from '@radix-ui/react-icons';

const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const buildNavLinks = (inDialog) => {
    const styleProps = {
      size: '3',
      variant: 'ghost',
      highContrast: true,
    };

    const buildButton = (nav, text, key) => {
      const button = (
        <Button
          onClick={ () => navigate(nav) }
          key={ key }
          { ...styleProps }
        >
          <Text> { t(text) } </Text>
        </Button>
      );

      return inDialog ? 
        <Dialog.Close>
          { button }
        </Dialog.Close>
      :
        button
      ;
    };

    const buttonList = [
      ['/', 'Home'],
      ['/login', 'navigation.login'],
      ['/signup', 'navigation.signup'],
      ['/contactus', 'navigation.contactUs']
    ];
    const buttons = buttonList.map(([nav, text], i) => buildButton(nav, text, `navButton${i}`));

    return (
      <>
        { buttons }

        { inDialog ? <Inset side='x'> <Separator orientation='horizontal' size='4'/> </Inset> : <></> }

        <div className='flex justify-center'>
          <LanguageSwitcher
            { ...styleProps }
          />
        </div>
      </>
    );
  };

  const drawerButton = () => {
    return (
      <div
        className='md:hidden flex'
      >
        <IconButton
          size='4'
          variant='ghost'
        >
          <HamburgerMenuIcon />
        </IconButton>
      </div>
    );
  };

  return (
    <nav className="relative z-10 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to='/'>
          <img 
            src="/logo.png"
            alt="Pencil Dogs Logo" 
            className="h-10 w-auto md:h-12"
          />
        </Link>

        <div className='hidden md:flex gap-10'>
          { buildNavLinks(false) }
        </div>

        <Dialog.Root>
          <Dialog.Trigger>
            { drawerButton() }
          </Dialog.Trigger>

          <Dialog.Content>
            <Dialog.Title> 
              <Dialog.Close>
                <div className='flex'>
                  <IconButton
                    size='4'
                    variant='ghost'
                  >
                    <Cross1Icon />
                  </IconButton>
                </div>
              </Dialog.Close>
            </Dialog.Title>
        
            <div className='flex flex-col items-stretch gap-7'>
              <Dialog.Close>
                { buildNavLinks(true) }
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      </div> 
    </nav>
  );
};

export default Navbar;