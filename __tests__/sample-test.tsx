import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

describe('Sample Test', () => {
  it('renders a simple component', () => {
    const { getByText } = render(<Text>Hello, Expo Router!</Text>);
    expect(getByText('Hello, Expo Router!')).toBeTruthy();
  });
});