import globalStyles from '@/styles/globalStyles';
import {View, Text} from 'react-native';
import {Button, Icon, TouchableRipple} from 'react-native-paper';
import {StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import {useState} from 'react';

function FilterItem({
  name,
  icon,
  backgroundColor = 'white',
  onPress,
}: {
  name: string;
  icon: string;
  backgroundColor?: string;
  onPress: () => void;
}) {
  return (
    <TouchableRipple
      style={[styles.filterItemWrap, {backgroundColor}]}
      onPress={onPress}
      rippleColor="rgba(0, 0, 0, .32)"
      borderless={true}>
      <>
        {/* <View style={[styles.filterItemWrap, {backgroundColor}]}> */}
        <View style={[globalStyles.centerItem, styles.filterItem]}>
          <Icon source={icon} size={24} color={backgroundColor} />
        </View>
        <Text style={{color: 'white', fontSize: 20}}>{name}</Text>
        {/* </View> */}
      </>
    </TouchableRipple>
  );
}

export default function FilterComponent() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    name: string;
    icon: string;
  } | null>(null);

  const openModal = (item: {name: string; icon: string}) => {
    setSelectedItem(item);
    setIsVisible(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsVisible(false);
  };

  return (
    <View style={[styles.container]}>
      <FilterItem
        name="题型"
        icon="format-list-bulleted-type"
        backgroundColor="rgb(65, 191, 241)"
        onPress={() =>
          openModal({name: '题型', icon: 'format-list-bulleted-type'})
        }
      />
      <FilterItem
        name="难度"
        icon="lightning-bolt-outline"
        backgroundColor="rgb(253, 172, 64)"
        onPress={() =>
          openModal({name: '难度', icon: 'lightning-bolt-outline'})
        }
      />
      <Modal
        isVisible={isVisible}
        onBackdropPress={closeModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={500}
        animationOutTiming={500}
        backdropOpacity={0.7}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
            <Button mode="contained" onPress={closeModal}>
              关闭
            </Button>
          </View>
        </View>
      </Modal>
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
    overflow: 'hidden',
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

  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '100%',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
});
