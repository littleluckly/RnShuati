import Icon from '@react-native-vector-icons/material-design-icons';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Modalize} from 'react-native-modalize';
import {Portal} from 'react-native-portalize';
import {subjectApiService} from '@/services';
import {useQuestionContext} from '@/contexts/QuestionContext';

interface QuestionFilterProps {
  subjectId: string;
}

const Filter = ({subjectId}: QuestionFilterProps) => {
  const {updateFilters} = useQuestionContext();
  const modalRef = useRef<Modalize>(null);
  // 筛选项
  const filters = [
    {name: '难度', value: 'difficulty'},
    {name: '标签', value: 'tags'},
  ];
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [tag, setTag] = useState<string[]>([]);
  const [difficultyItems, setDifficultyItems] = useState([
    {name: '全部', value: ''},
  ]);
  const [tagItems, setTagItems] = useState<{name: string; value: string}[]>([
    {name: '全部', value: ''},
  ]);

  const [active, setActive] = useState(''); // 当前展开的筛选项名
  const filterOptions = useMemo(() => {
    if (active === 'difficulty') {
      return difficultyItems;
    }
    if (active === 'tags') {
      return tagItems;
    }
    return [];
  }, [active, difficultyItems, tagItems]);

  // 获取难度选项数据
  useEffect(() => {
    const fetchDifficultyOptions = async () => {
      try {
        const response = await subjectApiService.getDifficultyOptions(
          subjectId,
        );
        if (response.success && response.data) {
          setDifficultyItems([{name: '全部', value: ''}, ...response.data]);
        }
      } catch (error) {
        console.error('获取难度选项数据失败:', error);
      }
    };

    // 获取标签数据
    const fetchTags = async () => {
      try {
        const response = await subjectApiService.getSubjectTags(subjectId);
        if (response.success && response.data) {
          setTagItems([{name: '全部', value: ''}, ...response.data]);
        }
      } catch (error) {
        console.error('获取标签数据失败:', error);
      }
    };

    if (subjectId) {
      fetchDifficultyOptions();
      fetchTags();
    }
  }, [subjectId]);

  const openFilter = () => modalRef.current?.open();
  const closeFilter = () => modalRef.current?.close();

  const onClickFilter = (value: string) => {
    setActive(value);
    // 重置状态为当前已选择的值
    if (value === 'difficulty') {
      setDifficulty(prev => (prev.length > 0 ? prev : ['']));
    } else if (value === 'tags') {
      setTag(prev => (prev.length > 0 ? prev : ['']));
    }
    openFilter();
  };
  return (
    <View
      style={[
        {
          zIndex: 1,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 1},
          shadowOpacity: 0.1,
          shadowRadius: 2,
          backgroundColor: '#fff',
        },
      ]}>
      {/* 横向滚动筛选条 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}>
        {filters.map(({name, value}) => {
          // 获取当前筛选项的显示文本
          let displayText = name;
          if (
            value === 'difficulty' &&
            difficulty.length > 0 &&
            !difficulty.includes('')
          ) {
            displayText = `${name}(${difficulty.length})`;
          } else if (value === 'tags' && tag.length > 0 && !tag.includes('')) {
            displayText = `${name}(${
              tag.includes('') ? tag.length : tag.length
            })`;
          }

          return (
            <TouchableOpacity
              key={value}
              style={[styles.chip, active === value && styles.chipActive]}
              onPress={() => onClickFilter(value)}>
              <Text
                style={[
                  styles.chipText,
                  active === value && styles.chipTextActive,
                ]}>
                {displayText}
              </Text>
              <Icon
                name="chevron-down"
                size={14}
                color={active === value ? '#fff' : '#666'}
                style={{marginLeft: 4}}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {/* 弹窗 */}
      <Portal>
        <Modalize
          ref={modalRef}
          adjustToContentHeight
          modalStyle={styles.modal}
          flatListProps={{
            data: filterOptions,
            keyExtractor: (item, index) => `${item.value}-${index}`,
            renderItem: ({item}) => {
              // 判断当前项是否被选中
              const isSelected =
                (active === 'difficulty' && difficulty.includes(item.value)) ||
                (active === 'tags' && tag.includes(item.value));

              return (
                <TouchableOpacity
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => {
                    if (active === 'difficulty') {
                      // 多选逻辑
                      setDifficulty(prev => {
                        if (item.value === '') {
                          // 选择"全部"时清空其他选择
                          return [''];
                        } else {
                          const newDifficulty = prev.includes(item.value)
                            ? prev.filter(v => v !== item.value && v !== '')
                            : [...prev.filter(v => v !== ''), item.value];

                          // 如果没有选择任何项，则默认选择"全部"
                          return newDifficulty.length > 0
                            ? newDifficulty
                            : [''];
                        }
                      });
                    } else {
                      // 标签多选逻辑
                      setTag(prev => {
                        if (item.value === '') {
                          // 选择"全部"时清空其他选择
                          return [''];
                        } else {
                          const newTags = prev.includes(item.value)
                            ? prev.filter(v => v !== item.value && v !== '')
                            : [...prev.filter(v => v !== ''), item.value];

                          // 如果没有选择任何项，则默认选择"全部"
                          return newTags.length > 0 ? newTags : [''];
                        }
                      });
                    }
                  }}>
                  <Text style={isSelected && styles.optionTextSelected}>
                    {item.name}
                  </Text>
                  {isSelected && (
                    <Icon
                      name="check"
                      size={18}
                      color="#007aff"
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              );
            },
            ItemSeparatorComponent: () => <View style={styles.divider} />,
          }}
          FooterComponent={
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  // 触发筛选条件变化，同时传递所有筛选条件
                  updateFilters({
                    difficulty:
                      difficulty.includes('') || difficulty.length === 0
                        ? undefined
                        : difficulty,
                    tags: tag.includes('') || tag.length === 0 ? undefined : tag,
                  });
                  closeFilter();
                }}>
                <Text style={styles.confirmButtonText}>确定</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </Portal>
    </View>
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
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  optionSelected: {
    backgroundColor: '#f0f8ff',
  },
  optionTextSelected: {
    color: '#007aff',
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 8,
  },
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
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  confirmButton: {
    backgroundColor: '#007aff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
