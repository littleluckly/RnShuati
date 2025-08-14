import globalStyles from '@/styles/globalStyles';
import {View, Text} from 'react-native';
import {Icon} from 'react-native-paper';
import {StyleSheet} from 'react-native';

function FilterItem({name, icon}: {name: string; icon: string}) {
  return (
    <View style={styles.filterItemWrap}>
      <View style={[globalStyles.centerItem, styles.filterItem]}>
        <Icon source={{uri: icon}} size={24} />
      </View>
      <Text style={{color: 'white', fontSize: 20}}>{name}</Text>
    </View>
  );
}

export default function FilterComponent() {
  return (
    <View style={[styles.container, globalStyles.border]}>
      <FilterItem name="题型" icon="format-list-bulleted-type" />
      <FilterItem name="题型2" icon="format-list-bulleted-type" />
      <FilterItem name="题型3" icon="format-list-bulleted-type" />
      <FilterItem name="题型4" icon="format-list-bulleted-type" />
      {/* Add more FilterItems as needed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Ensures even spacing between items
    // gap: 20,
    // padding: 12, // Optional: add some padding around the container
  },
  filterItemWrap: {
    width: '49%', // Each item takes up 48% of the container width to allow for spacing
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgb(65, 191, 241)',
    elevation: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12, // Add padding inside the filter item
    marginBottom: 12,
  },
  filterItem: {
    backgroundColor: 'white',
    borderRadius: 24,
    height: 36,
    width: 36,
    marginRight: 12,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
