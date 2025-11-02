import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {routeNameMap} from '@/navigation/constant';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();

  // 导航到播放设置页面
  const navigateToPlaybackSettings = () => {
    // @ts-ignore
    navigation.navigate(routeNameMap.playbackSettingsScreen);
  };

  // 导航到科目选择页面
  const navigateToSubjectSelection = () => {
    // 使用根导航器进行跨Tab导航
    const parentNavigation = navigation.getParent();
    if (parentNavigation) {
      // @ts-ignore
      parentNavigation.navigate(routeNameMap.homeTab, {
        screen: routeNameMap.subjectSelectionScreen,
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>学习设置</Text>

        {/* 播放设置选项 */}
        <TouchableOpacity
          style={styles.setItem}
          onPress={navigateToPlaybackSettings}>
          <Ionicons
            name="volume-high-outline"
            size={24}
            color="#3498db"
            style={{marginRight: 16}}
          />
          <View style={styles.setItemContent}>
            <Text style={styles.setItemTitle}>播放设置</Text>
            <Text style={styles.setItemDescription}>调整音频播放相关设置</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* 切换科目选项 */}
        <TouchableOpacity
          style={styles.setItem}
          onPress={navigateToSubjectSelection}>
          <Ionicons
            name="library-outline"
            size={24}
            color="#9b59b6"
            style={{marginRight: 16}}
          />
          <View style={styles.setItemContent}>
            <Text style={styles.setItemTitle}>切换科目</Text>
            <Text style={styles.setItemDescription}>选择不同的学习科目</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>其他设置</Text>

        {/* 预留其他设置选项的位置 */}
        <TouchableOpacity
          style={styles.setItem}
          onPress={() => Alert.alert('提示', '此功能正在开发中')}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color="#e67e22"
            style={{marginRight: 16}}
          />
          <View style={styles.setItemContent}>
            <Text style={styles.setItemTitle}>通知设置</Text>
            <Text style={styles.setItemDescription}>管理应用通知偏好</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.setItem}
          onPress={() => Alert.alert('提示', '此功能正在开发中')}>
          <Ionicons
            name="moon-outline"
            size={24}
            color="#34495e"
            style={{marginRight: 16}}
          />
          <View style={styles.setItemContent}>
            <Text style={styles.setItemTitle}>深色模式</Text>
            <Text style={styles.setItemDescription}>切换应用主题外观</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  setItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  setItemContent: {
    flex: 1,
  },
  setItemTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  setItemDescription: {
    fontSize: 14,
    color: '#666',
  },
});
