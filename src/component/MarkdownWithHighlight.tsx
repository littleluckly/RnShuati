import React, {useMemo} from 'react';
import Markdown from 'react-native-markdown-display';
import CodeBlock from './CodeBlock';
import {StyleSheet, ViewStyle, TextStyle} from 'react-native';

interface MarkdownWithHighlightProps {
  content: string;
  style?: ViewStyle;
}

interface MarkdownStyles {
  text?: TextStyle;
  code_inline?: TextStyle;
  heading1?: TextStyle;
  heading2?: TextStyle;
  heading3?: TextStyle;
  paragraph?: TextStyle;
  [key: string]: ViewStyle | TextStyle | undefined;
}

const MarkdownWithHighlight: React.FC<MarkdownWithHighlightProps> = ({
  content,
  style,
}) => {
  // 定义 Markdown 样式
  const markdownStyles = {
    text: {
      fontSize: 16,
      lineHeight: 24,
      color: '#333',
    },
    code_inline: {
      backgroundColor: '#f5f5f5',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 3,
      fontFamily: 'monospace',
      fontSize: 14,
      color: '#e96900',
    },
    heading1: {
      fontSize: 22,
      fontWeight: 'bold',
      marginVertical: 12,
      color: '#2c3e50',
    },
    heading2: {
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 10,
      color: '#2c3e50',
    },
    heading3: {
      fontSize: 18,
      fontWeight: 'bold',
      marginVertical: 8,
      color: '#2c3e50',
    },
    paragraph: {
      marginBottom: 12,
      lineHeight: 24,
    },
    // 可以为 fenced_code 块定义基础样式（可选）
    fenced_code: {
      // 这里可以添加一些基础样式，但通常会被自定义渲染器覆盖
      // backgroundColor: '#f9f9f9',
      // padding: 10,
      marginVertical: 20,
    },
    // 代码容器的样式 (如果需要)
    code_block: {
      // fontFamily: 'monospace',
      // fontSize: 14,
      marginVertical: 20,
    },
  };

  // --- 修改后的 renderers ---
  // 使用返回 { element: ... } 对象的方式
  // todo 没有触发！！！
  const renderers = {
    fenced_code: (node: any) => {
      const language = node?.language || '';
      const content = node?.content || '';
      console.log('✅ Rendering fenced code block', {
        language,
        content: content.slice(0, 100) + (content.length > 100 ? '...' : ''), // Log more content
      });

      // ✅ 返回一个包含 element 属性的对象
      return <CodeBlock language={language} value={content} />;
    },
    // 如果你也有缩进代码块需要自定义，可以处理 code_block
    // code_block: (node) => { ... }
  };
  // --- 结束修改 ---

  // 使用传入的 content prop
  const mdContent =
    content ||
    `
# 默认标题

这是一个默认的段落内容。

\`\`\`javascript
function greet(name) {
  console.log("Hello, " + name + "!");
  return "Greeting sent";
}

const message = greet("World");
console.log(message);
\`\`\`

这是一个 \`行内代码\` 示例。

\`\`\`python
def hello():
    print("Hello from Python!")

hello()
\`\`\`
`;
  return (
    <Markdown
      style={markdownStyles} // 注意：style 是对象，不是数组
      stylesheet={style} // 外部样式用 `stylesheet` 属性合并（这是关键！）
      renderers={renderers}
      allowFontScaling={false}>
      {mdContent}
    </Markdown>
  );
};

export default MarkdownWithHighlight;
