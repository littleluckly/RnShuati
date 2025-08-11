import {View, Button, StyleSheet} from 'react-native';
import {Divider} from 'react-native-paper';
import Animated, {useSharedValue, withSpring} from 'react-native-reanimated';

export default function AnimatedBox() {
  const width = useSharedValue<number>(100);

  const handlePress = () => {
    width.value = withSpring(width.value - 20);
  };
  const handleAddPress = () => {
    width.value = withSpring(width.value + 20);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{...styles.box, width}} />
      <Button onPress={handlePress} title="Click me" />
      <Divider style={{margin: 20}} />
      <Button onPress={handleAddPress} title="Click me +" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  box: {
    height: 100,
    backgroundColor: '#b58df1',
    borderRadius: 20,
    marginVertical: 64,
  },
});
