// src/components/LanguageSwitcher.jsx
import React from 'react';
import { Select, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = ( { size, variant, highContrast } ) => {
  const { i18n } = useTranslation();

  return (
    <Select.Root defaultValue={ i18n.language } size={ size } onValueChange={ i18n.changeLanguage }>
      <Select.Trigger variant={ variant }/>
      <Select.Content highContrast={ highContrast } position='popper'>
        <Select.Item value='en'> <Text> English </Text> </Select.Item>
        <Select.Item value='zh'> <Text> 中文 </Text> </Select.Item>
      </Select.Content>
    </Select.Root>
  );
};

export default LanguageSwitcher;