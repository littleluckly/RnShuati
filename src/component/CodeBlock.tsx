import React from 'react';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
// 对于react-native-syntax-highlighter ^2.1.0版本，使用CommonJS格式导入样式
import {atomDark} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {View, StyleSheet, Platform} from 'react-native';

// 定义支持的编程语言类型
type SupportedLanguages =
  | 'javascript'
  | 'json'
  | 'typescript'
  | 'python'
  | string;

interface CodeBlockProps {
  language?: SupportedLanguages;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({language = '', value}) => {
  console.log('CodeBlock - language:', language, 'value:', value.slice(0, 50));

  // 语言映射 - 将简短的语言名称映射到react-native-syntax-highlighter支持的完整语言名称
  const languageMap: Record<string, SupportedLanguages> = {
    js: 'javascript',
    javascript: 'javascript',
    ts: 'typescript',
    py: 'python',
    json: 'json',
  };

  // 规范化语言名称
  const normalizedLanguage =
    languageMap[language.toLowerCase()] || language.toLowerCase();

  // 过滤不支持的语言
  const validLanguage = ['javascript', 'json', 'typescript', 'python'].includes(
    normalizedLanguage,
  )
    ? normalizedLanguage
    : 'text';

  console.log(
    'CodeBlock - normalizedLanguage:',
    normalizedLanguage,
    'validLanguage:',
    validLanguage,
  );

  return (
    <View style={styles.container}>
      <SyntaxHighlighter
        language={validLanguage}
        style={atomDark}
        fontSize={14}
        fontFamily={Platform.OS === 'ios' ? 'Menlo' : 'monospace'}
        renderInlineCode={true}
        customStyle={styles.code}>
        {value}
      </SyntaxHighlighter>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 12,
    backgroundColor: '#282c34',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  code: {
    padding: 16,
    lineHeight: 22,
  },
});

export default CodeBlock;
