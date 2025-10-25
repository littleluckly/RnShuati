import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import RNFS from 'react-native-fs';

// 下载文件项接口
interface DownloadItem {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  downloadTime: Date;
}

const MyDownloadsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 获取下载目录下的文件列表
  const fetchDownloadedFiles = async () => {
    try {
      setLoading(true);
      // 从统一的audios目录获取文件
      const audiosDir = `${RNFS.DocumentDirectoryPath}/audios`;
      console.log('正在读取目录:', audiosDir);
      
      // 检查目录是否存在
      const dirExists = await RNFS.exists(audiosDir);
      
      if (dirExists) {
        // 确保是目录
        const dirInfo = await RNFS.stat(audiosDir);
        if (dirInfo.isDirectory()) {
          const files = await RNFS.readDir(audiosDir);
          // 过滤出音频文件（.mp3格式）
          const audioFiles = files.filter(file => file.name.endsWith('.mp3'));
          
          const filePromises = audioFiles.map(async (file) => {
              try {
                // 获取文件详细信息
                const fileStat = await RNFS.stat(file.path);
                return {
                  id: file.path, // 使用文件路径作为唯一ID
                  fileName: file.name,
                  filePath: file.path,
                  fileSize: fileStat.size || 0,
                  downloadTime: new Date(fileStat.mtime || Date.now()),
                } as DownloadItem;
              } catch (error) {
                console.error(`获取文件${file.name}信息失败:`, error);
                return null;
              }
            });
            
            const fileResults = await Promise.all(filePromises);
            // 过滤掉null值，并正确类型转换
            const fileItems: DownloadItem[] = fileResults.filter((item): item is DownloadItem => item !== null);
          
          // 按下载时间倒序排序
          fileItems.sort((a, b) => b.downloadTime.getTime() - a.downloadTime.getTime());
          setDownloadItems(fileItems);
        } else {
          console.log('audios不是一个有效的目录');
          setDownloadItems([]);
        }
      } else {
        console.log('audios目录不存在');
        setDownloadItems([]);
        // 尝试创建audios目录
        try {
          await RNFS.mkdir(audiosDir);
          console.log('创建audios目录成功');
        } catch (mkdirError) {
          console.error('创建audios目录失败:', mkdirError);
        }
      }
    } catch (error) {
      console.error('获取下载文件列表失败:', error);
      Alert.alert('错误', '获取下载文件列表失败');
      setDownloadItems([]);
    } finally {
      setLoading(false);
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 格式化日期
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 删除单个文件
  const deleteSingleFile = async (item: DownloadItem) => {
    Alert.alert(
      '确认删除',
      `确定要删除文件 "${item.fileName}" 吗？`,
      [
        {text: '取消', style: 'cancel'},
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              // 执行实际的文件删除操作
              console.log('正在删除文件:', item.filePath);
              await RNFS.unlink(item.filePath);
              console.log('文件删除成功:', item.fileName);
              
              // 更新UI，从列表中移除删除的文件
              setDownloadItems(prev => prev.filter(file => file.id !== item.id));
              
              // 如果在选择模式下，也需要更新选中项
              if (isSelectionMode) {
                setSelectedItems(prev => prev.filter(id => id !== item.id));
              }
              
              Alert.alert('成功', '文件已删除');
            } catch (error) {
              console.error('删除文件失败:', error);
              Alert.alert('错误', '删除文件失败');
            }
          },
        },
      ]
    );
  };

  // 批量删除文件
  const deleteSelectedFiles = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('提示', '请先选择要删除的文件');
      return;
    }

    Alert.alert(
      '确认删除',
      `确定要删除选中的 ${selectedItems.length} 个文件吗？`,
      [
        {text: '取消', style: 'cancel'},
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              // 执行实际的批量文件删除操作
              console.log('开始批量删除文件:', selectedItems.length);
              
              // 获取要删除的文件
              const filesToDelete = downloadItems.filter(item => selectedItems.includes(item.id));
              
              // 逐个删除文件，记录删除结果
              let deleteCount = 0;
              for (const file of filesToDelete) {
                try {
                  await RNFS.unlink(file.filePath);
                  console.log('成功删除文件:', file.fileName);
                  deleteCount++;
                } catch (fileError) {
                  console.error(`删除文件${file.fileName}失败:`, fileError);
                  // 继续删除其他文件，不中断整个过程
                }
              }
              
              // 更新UI，从列表中移除已删除的文件
              setDownloadItems(prev => 
                prev.filter(file => !selectedItems.includes(file.id))
              );
              
              // 重置选择状态
              setSelectedItems([]);
              setIsSelectionMode(false);
              
              // 显示删除结果
              if (deleteCount > 0) {
                Alert.alert('成功', `已成功删除 ${deleteCount} 个文件`);
              } else {
                Alert.alert('提示', '所有文件删除失败');
              }
            } catch (error) {
              console.error('批量删除文件失败:', error);
              Alert.alert('错误', '批量删除操作过程中发生错误');
            }
          },
        },
      ]
    );
  };

  // 切换选择模式
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedItems([]);
  };

  // 切换单个文件的选择状态
  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedItems.length === downloadItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(downloadItems.map(item => item.id));
    }
  };

  // 渲染文件项
  const renderFileItem = ({item}: {item: DownloadItem}) => {
    const isSelected = selectedItems.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.fileItem}
        onPress={() => {
          if (isSelectionMode) {
            toggleItemSelection(item.id);
          } else {
            // 这里可以添加文件播放或查看功能
            Alert.alert('提示', `点击了文件: ${item.fileName}`);
          }
        }}
        onLongPress={() => {
          if (!isSelectionMode) {
            setIsSelectionMode(true);
            setSelectedItems([item.id]);
          }
        }}
      >
        {isSelectionMode && (
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => toggleItemSelection(item.id)}
          >
            <Ionicons
              name={isSelected ? 'checkbox' : 'square-outline'}
              size={24}
              color={isSelected ? '#2ecc71' : '#666'}
            />
          </TouchableOpacity>
        )}
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {item.fileName}
          </Text>
          <View style={styles.fileMeta}>
            <Text style={styles.fileSize}>{formatFileSize(item.fileSize)}</Text>
            <Text style={styles.fileTime}>{formatDate(item.downloadTime)}</Text>
          </View>
        </View>
        {!isSelectionMode && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteSingleFile(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  // 渲染空状态
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#2ecc71" />
          <Text style={styles.emptyText}>加载中...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="download-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>暂无下载文件</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.emptyButtonText}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // 渲染头部操作栏
  const renderHeader = () => {
    if (isSelectionMode) {
      return (
        <View style={styles.selectionHeader}>
          <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllButton}>
            <Ionicons
              name={selectedItems.length === downloadItems.length ? 'checkbox' : 'square-outline'}
              size={24}
              color={selectedItems.length === downloadItems.length ? '#2ecc71' : '#666'}
            />
            <Text style={styles.selectAllText}>全选</Text>
          </TouchableOpacity>
          <Text style={styles.selectedCount}>
            已选择 {selectedItems.length} 项
          </Text>
          <TouchableOpacity
            style={styles.batchDeleteButton}
            onPress={deleteSelectedFiles}
            disabled={selectedItems.length === 0}
          >
            <Text
              style={[
                styles.batchDeleteText,
                selectedItems.length === 0 && styles.batchDeleteDisabled,
              ]}
            >
              删除
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  useEffect(() => {
    fetchDownloadedFiles();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <FlatList
        data={downloadItems}
        renderItem={renderFileItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
      {downloadItems.length > 0 && !isSelectionMode && (
        <TouchableOpacity
          style={styles.selectionModeButton}
          onPress={toggleSelectionMode}
        >
          <Ionicons name="select" size={20} color="#fff" />
          <Text style={styles.selectionModeText}>批量管理</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  checkbox: {
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  fileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
  },
  fileTime: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#2ecc71',
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  selectedCount: {
    fontSize: 14,
    color: '#666',
  },
  batchDeleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#e74c3c',
  },
  batchDeleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  batchDeleteDisabled: {
    opacity: 0.5,
  },
  selectionModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ecc71',
    marginHorizontal: 12,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectionModeText: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MyDownloadsScreen;