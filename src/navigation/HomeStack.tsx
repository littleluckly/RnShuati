// navigation/HomeStack.tsx
import React, {useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '@/screen/home/HomeScreen';
import DetailScreen from '@/screen/home/DetailScreen';
import {routeNameMap} from './constant';
import WelcomeScreen from '@/screen/home/WelcomeScreen';
import {Button, TextInput} from 'react-native';
import SearchableHeader from './SearchableHeader';

const Stack = createNativeStackNavigator();

const SearchBar = ({onSearch}) => {
  const [query, setQuery] = useState('');

  return (
    <TextInput
      value={query}
      onChangeText={setQuery}
      placeholder="搜索..."
      onSubmitEditing={() => onSearch(query)}
    />
  );
};
export default function HomeStack() {
  const [isSearchFocused, setSearchFocused] = useState(false);
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}>
      <Stack.Screen
        name={routeNameMap.welcomeScreen}
        component={WelcomeScreen}
        options={{
          header: () => <SearchableHeader />,
          // headerRight: () =>
          //   isSearchFocused ? (
          //     <SearchBar
          //       onSearch={query => console.log('Searching for', query)}
          //     />
          //   ) : (
          //     <Button title="搜索" onPress={() => setSearchFocused(true)} />
          //   ),
        }}
      />
      <Stack.Screen name={routeNameMap.homeScreen} component={HomeScreen} />
      <Stack.Screen name={routeNameMap.detailScreen} component={DetailScreen} />
    </Stack.Navigator>
  );
}
