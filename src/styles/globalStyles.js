import {StyleSheet} from 'react-native';

const GlobalStyles = StyleSheet.create({
  bg: {backgroundColor: '#f8f8f8'},
  container: {
    padding: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  border: {
    borderWidth: 2,
    borderColor: 'red',
    borderStyle: 'solid',
  },
});

export default GlobalStyles;
