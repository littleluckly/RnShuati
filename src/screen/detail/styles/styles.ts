import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 0, // 减少顶部边距，因为SafeAreaView已经处理了状态栏
    paddingBottom: 0, // 减少底部边距，因为SafeAreaView已经处理了底部区域
  },
  // 题目标题样式 - 更加突出
  questionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    lineHeight: 32,
    textAlign: 'center',
  },
  // 分块标题样式
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1da1f2',
    marginTop: 20,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navTop: {
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: '#fff', // 与内容区背景一致
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navBackButton: {
    paddingHorizontal: 8,
  },
  navSpacer: {
    width: 40, // 与返回按钮宽度相等，确保标题真正居中
  },
  navTitle: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  navBottom: {
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 100,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 12,
    marginTop: 4,
  },
  notFoundText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  // 播放按钮样式
  playButtonContainer: {
    position: 'absolute',
    bottom: 70, // 调整位置，使其位于底部导航栏的上方
    right: 20,
    zIndex: 101,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1da1f2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // 目录抽屉样式
  directoryContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '80%',
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 200,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  directoryHeader: {
    height: 60,
    backgroundColor: '#1da1f2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  directoryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  directoryCloseButton: {
    padding: 8,
  },
  directoryList: {
    flex: 1,
  },
  directoryItem: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  directoryItemActive: {
    backgroundColor: 'rgba(29, 161, 242, 0.1)',
  },
  directoryItemText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  directoryItemTextActive: {
    color: '#1da1f2',
    fontWeight: '500',
  },
  directoryItemCheck: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  directoryLoadingFooter: {
    padding: 16,
    alignItems: 'center',
  },
  directoryLoadingText: {
    color: '#666',
    fontSize: 14,
  },
  // 遮罩层
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 150,
  },
});