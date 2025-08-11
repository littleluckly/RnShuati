// src/screens/ProfileScreen/index.tsx
import AnimatedBox from '@/component/AnimatedBox';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {Checkbox, Divider, IconButton, MD3Colors} from 'react-native-paper';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [checked, setChecked] = React.useState(false);
  return (
    <View style={styles.center}>
      <Text style={styles.title}>👤 home</Text>
      <AnimatedBox />
      <Divider />
      <Button title="to Detail" onPress={() => navigation.navigate('Detail')}>
        to detail
      </Button>
      <Checkbox
        status={checked ? 'checked' : 'unchecked'}
        onPress={() => {
          setChecked(!checked);
        }}
      />
      <IconButton
        icon="camera"
        iconColor={MD3Colors.error50}
        size={40}
        onPress={() => console.log('Pressed')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  title: {fontSize: 24},
});
