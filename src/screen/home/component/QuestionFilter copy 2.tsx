import globalStyles from '@/styles/globalStyles';
import {View, Text} from 'react-native';
import {Icon} from 'react-native-paper';
import {StyleSheet} from 'react-native';

function FilterItem({
  name,
  icon,
  backgroundColor = 'white',
}: {
  name: string;
  icon: string;
  backgroundColor?: string;
}) {
  return (
    <View style={[styles.filterItemWrap, {backgroundColor}]}>
      <View style={[globalStyles.centerItem, styles.filterItem]}>
        <Icon source={icon} size={24} color={backgroundColor} />
      </View>
      <Text style={{color: 'white', fontSize: 20}}>{name}</Text>
    </View>
  );
}

export default function FilterComponent() {
  return (
    <View style={[styles.container]}>
      <FilterItem
        name="题型"
        icon="format-list-bulleted-type"
        backgroundColor="rgb(65, 191, 241)"
      />
      <FilterItem
        name="难度"
        icon="format-list-bulleted-type"
        backgroundColor="rgb(253, 172, 64)"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
