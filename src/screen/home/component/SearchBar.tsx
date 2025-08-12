import * as React from 'react';
import {Searchbar} from 'react-native-paper';

const Search = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <Searchbar
      placeholder="输入题型，内容"
      onChangeText={setSearchQuery}
      value={searchQuery}
    />
  );
};

export default Search;
