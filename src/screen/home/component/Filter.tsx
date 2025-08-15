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

const DATA = Array.from({length: 30}, (_, i) => `商品 ${i + 1}`);

const Filter = () => {
  const modalRef = useRef<Modalize>(null);
  const [category, setCategory] = useState('全部');
  // 筛选项示例：品类、价格、品牌、更多
  const filters = ['品类', '价格', '品牌', '更多'];
  const [active, setActive] = useState(''); // 当前展开的筛选项名

  const filtered = useMemo(
    () => (category === '全部' ? DATA : DATA.filter(d => d.includes(category))),
    [category],
  );

  const openFilter = () => modalRef.current?.open();
  const closeFilter = () => modalRef.current?.close();

  const onClickFilter = (name: string) => {
    setActive(name);
    openFilter();
  };
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
        {/* 顶部筛选条 */}
        {/* <View style={[styles.header, {backgroundColor: 'gray'}]}>
          <TouchableOpacity onPress={openFilter} style={styles.filterBtn}>
            <Text style={[styles.filterText, GlobalStyles.border]}>
              阿萨德{category} ↓
            </Text>
          </TouchableOpacity>
        </View> */}

        {/* 列表 */}
        <FlatList
          data={filtered}
          keyExtractor={item => item}
          renderItem={({item}) => (
            <View style={styles.row}>
              <Text>{item}</Text>
            </View>
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
  },
});
