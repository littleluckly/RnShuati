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

  // 检查筛选条件是否有效
  const hasValidFilter = (filterType: string) => {
    switch (filterType) {
      case 'difficulty':
        return difficulty.length > 0 && !difficulty.includes('');
      case 'tags':
        return tag.length > 0 && !tag.includes('');
      default:
        return false;
    }
  };

  // 获取筛选器显示文本
  const getFilterDisplayText = (filterType: string, filterName: string) => {
    const isValid = hasValidFilter(filterType);

    switch (filterType) {
      case 'difficulty':
        return isValid ? `${filterName}(${difficulty.length})` : filterName;
      case 'tags':
        return isValid ? `${filterName}(${tag.length})` : filterName;
      default:
        return filterName;
    }
  };

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

  // 渲染难度选项（保持单列）
  const renderDifficultyOptions = () => (
    <View style={styles.optionsContainer}>
      {difficultyItems.map(item => {
        const isSelected = difficulty.includes(item.value);
        return (
          <TouchableOpacity
            key={item.value}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => {
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
                  return newDifficulty.length > 0 ? newDifficulty : [''];
                }
              });
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
      })}
    </View>
  );

  // 渲染标签选项（改为徽标样式，支持滚动）
  const renderTagOptions = () => (
    <ScrollView
      showsVerticalScrollIndicator={true}
      style={styles.tagsScrollContainer}
      contentContainerStyle={styles.tagsContainer}>
      <View style={styles.tagsHeaderContainer}>
        {/* 全选标签保持单列显示 */}
        {tagItems.find(item => item.value === '') && (
          <TouchableOpacity
            style={[styles.option, tag.includes('') && styles.optionSelected]}
            onPress={() => {
              setTag(tag.includes('') ? [] : ['']);
            }}>
            <Text style={tag.includes('') && styles.optionTextSelected}>
              {tagItems.find(item => item.value === '')?.name}
            </Text>
            {tag.includes('') && (
              <Icon
                name="check"
                size={18}
                color="#007aff"
                style={styles.checkIcon}
              />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* 标签列表改为徽标样式，一行多个 */}
      <View style={styles.tagChipsContainer}>
        {tagItems
          .filter(item => item.value !== '')
          .map(item => {
            const isSelected = tag.includes(item.value);
            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                onPress={() => {
                  setTag(prev => {
                    if (prev.includes(item.value)) {
                      // 移除已选择的标签
                      const newTags = prev.filter(v => v !== item.value);
                      // 如果没有选择任何项，则默认不选择任何标签（不自动选全部）
                      return newTags;
                    } else {
                      // 添加新选择的标签，同时移除"全部"选项
                      return [...prev.filter(v => v !== ''), item.value];
                    }
                  });
                }}>
                <Text
                  style={[
                    styles.tagChipText,
                    isSelected && styles.tagChipTextSelected,
                  ]}>
                  {item.name}
                </Text>
                {isSelected && (
                  <Icon
                    name="check"
                    size={12}
                    color="#fff"
                    style={styles.tagChipCheckIcon}
                  />
                )}
              </TouchableOpacity>
            );
          })}
      </View>
    </ScrollView>
  );

  // 渲染弹窗内容
  const renderModalContent = () => {
    if (active === 'difficulty') {
      return renderDifficultyOptions();
    } else if (active === 'tags') {
      return renderTagOptions();
    }
    return null;
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
          const isActive = hasValidFilter(value);
          const displayText = getFilterDisplayText(value, name);

          return (
            <TouchableOpacity
              key={value}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onClickFilter(value)}>
              <Text
                style={[styles.chipText, isActive && styles.chipTextActive]}>
                {displayText}
              </Text>
              <Icon
                name="chevron-down"
                size={14}
                color={isActive ? '#fff' : '#666'}
                style={{marginLeft: 4}}
              />
            </TouchableOpacity>
          );
        })}

        {/* 重置按钮 */}
        <TouchableOpacity
          style={[styles.chip, styles.resetButton]}
          onPress={() => {
            // 重置所有筛选条件
            setDifficulty(['']);
            setTag(['']);
            // 清除筛选条件
            updateFilters({
              difficulty: undefined,
              tags: undefined,
            });
          }}>
          <Icon
            name="refresh"
            size={14}
            color="#666"
            style={{marginRight: 4}}
          />
          <Text style={styles.chipText}>重置</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 弹窗 */}
      <Portal>
        <Modalize
          ref={modalRef}
          adjustToContentHeight
          modalStyle={styles.modal}
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
                    tags:
                      tag.includes('') || tag.length === 0 ? undefined : tag,
                  });
                  closeFilter();
                }}>
                <Text style={styles.confirmButtonText}>确定</Text>
              </TouchableOpacity>
            </View>
          }>
          {renderModalContent()}
        </Modalize>
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
  // 新增样式
  optionsContainer: {
    padding: 8,
  },
  tagsScrollContainer: {
    maxHeight: 400, // 设置最大高度以启用滚动
  },
  tagsContainer: {
    padding: 8,
  },
  tagsHeaderContainer: {
    marginBottom: 16,
  },
  tagChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  tagChipSelected: {
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  tagChipText: {
    fontSize: 13,
    color: '#333',
  },
  tagChipTextSelected: {
    color: '#fff',
  },
  tagChipCheckIcon: {
    marginLeft: 4,
  },
  // 重置按钮样式
  resetButton: {
    borderColor: '#ff3b30',
    backgroundColor: '#fff',
  },
});
