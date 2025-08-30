# API 服务文档

## 概述

API 服务为测验应用程序提供了一套全面的方法来与后端服务器交互。它处理所有 HTTP 请求、错误处理和响应解析。

## 安装

API 服务已包含在项目中。无需额外安装。

## 使用方法

### 导入服务

```typescript
import {apiService} from '../src/services/ApiService';
```

### 可用方法

#### 科目管理

1. **获取所有科目**

   ```typescript
   const response = await apiService.getSubjects();
   ```

2. **获取所有科目的详细信息**

   ```typescript
   const response = await apiService.getAllSubjects();
   ```

3. **根据 ID 获取科目**

   ```typescript
   const response = await apiService.getSubjectById('subjectId');
   ```

4. **获取科目的所有标签**

   ```typescript
   const response = await apiService.getSubjectTags('subjectId');
   ```

5. **为科目添加用户自定义标签**

   ```typescript
   const response = await apiService.addUserTag(
     'subjectId',
     'tagName',
     'tagType',
   );
   ```

6. **更新用户自定义标签**

   ```typescript
   const response = await apiService.updateUserTag(
     'subjectId',
     'oldTagName',
     'newTagName',
     'tagType',
   );
   ```

7. **删除用户自定义标签**
   ```typescript
   const response = await apiService.deleteUserTag('subjectId', 'tagName');
   ```

#### 题目管理

1. **获取随机题目**

   ```typescript
   const response = await apiService.getRandomQuestion(
     'subjectId',
     'difficulty',
   );
   ```

2. **获取随机题目列表**

   ```typescript
   const config = {
     subjectId: 'subjectId',
     total: 10,
     difficultyConfig: {
       easy: 0.4,
       medium: 0.4,
       hard: 0.2,
     },
   };
   const response = await apiService.getRandomQuestionList(config);
   ```

3. **获取过滤后的题目列表**
   ```typescript
   const config = {
     subjectId: 'subjectId',
     difficulty: ['easy', 'medium'],
     tags: ['tag1', 'tag2'],
     page: 1,
     limit: 20,
   };
   const response = await apiService.getFilteredQuestionList(config);
   ```

#### 用户行为管理

1. **记录用户行为**

   ```typescript
   const response = await apiService.recordUserAction(
     'userId',
     'questionId',
     'favorited',
   );
   ```

2. **获取用户统计数据**
   ```typescript
   const response = await apiService.getUserStats('userId');
   ```

### 响应格式

所有 API 方法都返回一个 Promise，该 Promise 解析为具有以下结构的 `ApiResponse` 对象：

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}
```

### 错误处理

API 服务包含内置的错误处理。网络错误和 HTTP 错误会被捕获并作为失败响应返回，并附带适当的错误消息。

```typescript
try {
  const response = await apiService.getSubjects();
  if (response.success) {
    // 处理成功响应
    console.log(response.data);
  } else {
    // 处理 API 错误
    console.error(response.message);
  }
} catch (error) {
  // 处理意外错误
  console.error('意外错误:', error);
}
```

### 使用示例

请参见 `src/screen/profile/ApiDemoScreen.tsx`，其中包含了如何在 React Native 组件中使用 API 服务的完整示例。

## 测试

API 服务在 `src/services/__tests__/ApiService.test.ts` 中包含了单元测试。运行测试：

```bash
npm test
```

## 自定义配置

要更改 API 的基础 URL，请修改 `src/services/ApiService.ts` 中的 `API_BASE_URL` 常量：

```typescript
const API_BASE_URL = 'http://your-api-server.com';
```
