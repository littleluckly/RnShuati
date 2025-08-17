import React, {useState, useRef, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import {Portal} from 'react-native-portalize';
import {Modalize} from 'react-native-modalize';
import {Host} from 'react-native-portalize';
import GlobalStyles from '@/styles/globalStyles';
import Icon from '@react-native-vector-icons/material-design-icons';
import {useSharedValue} from 'react-native-reanimated';
import {QuizListItem} from './QuizListItem2';

const DATA = Array.from({length: 30}, (_, i) => ({
  id: `${i}`,
  content: `商品 ${i + 1}`,
}));

const Filter = () => {
  const modalRef = useRef<Modalize>(null);
  const [category, setCategory] = useState('全部');
  // 筛选项示例：品类、价格、品牌、更多
  const filters = ['品类', '价格', '品牌', '更多'];
  const [active, setActive] = useState(''); // 当前展开的筛选项名

  const openFilter = () => modalRef.current?.open();
  const closeFilter = () => modalRef.current?.close();

  const onClickFilter = (name: string) => {
    setActive(name);
    openFilter();
  };

  const activeId = useSharedValue('');
  const updateActiveId = (id: string) => {
    console.log('out update', id);
    activeId.value = id;
  };

  // 用 ref 数组保存每条 item 的实例
  const itemRefs = useRef<(QuizListItemRef | null)[]>([]);
  return (
    <Host>
      <View style={{flex: 1}}>
        {/* 横向滚动筛选条 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterBar}
          contentContainerStyle={styles.filterBarContent}>
          {filters.map(name => (
            <TouchableOpacity
              key={name}
              style={[styles.chip, active === name && styles.chipActive]}
              onPress={() => onClickFilter(name)}>
              <Text
                style={[
                  styles.chipText,
                  active === name && styles.chipTextActive,
                ]}>
                {name}
              </Text>
              <Icon
                name="chevron-down"
                size={14}
                color="#666"
                style={{marginLeft: 4}}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* 列表 */}
        <FlatList
          data={DATA}
          keyExtractor={item => item.id}
          renderItem={({item, index}) => (
            <QuizListItem
              ref={r => (itemRefs.current[index] = r)}
              id={item.id}
              title={item.content}
              activeId={activeId}
            />
          )}
        />

        {/* 弹窗 */}
        <Portal>
          <Modalize
            ref={modalRef}
            adjustToContentHeight
            modalStyle={styles.modal}
            flatListProps={{
              data: ['全部', '商品 1', '商品 2', '商品 3'],
              keyExtractor: item => item,
              renderItem: ({item}) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    setCategory(item);
                    closeFilter();
                  }}>
                  <Text>{item}</Text>
                </TouchableOpacity>
              ),
              ItemSeparatorComponent: () => <View style={styles.divider} />,
            }}
          />
        </Portal>
      </View>
    </Host>
  );
};

export default Filter;

const styles = StyleSheet.create({
  header: {
    // padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
    // flex: 1,
  },
  filterBtn: {borderRadius: 4},
  filterText: {
    fontSize: 16,
    color: 'red',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  modal: {borderTopLeftRadius: 12, borderTopRightRadius: 12},
  option: {padding: 16},
  divider: {height: StyleSheet.hairlineWidth, backgroundColor: '#eee'},

  filterBar: {
    // 原来：height: 48
    // 现在：去掉固定高度，用 padding 撑开
    paddingVertical: 8, // 上下各 12，相当于 12+fontSize+12
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  filterBarContent: {
    flexShrink: 0,
    alignItems: 'center',
    paddingHorizontal: 8,
    // paddingVertical: 8,
  },
  chip: {
    flexDirection: 'row', // 横向排布
    alignItems: 'center', // 垂直居中
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  chipActive: {
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
  chipTextActive: {
    color: '#fff',
  },
  row: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 12,
    marginTop: 12,
    elevation: 4,
  },
});
