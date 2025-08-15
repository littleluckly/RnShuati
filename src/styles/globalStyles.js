import {StyleSheet} from 'react-native';

const GlobalStyles = StyleSheet.create({
  bg: {backgroundColor: '#f8f8f8'},
  shadow: {
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
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
