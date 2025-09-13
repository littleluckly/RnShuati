const fs = require('fs');
const path = require('path');

/**
 * 生成音频资源映射表的脚本
 * 作用：在 src/assets/question-audios 目录下创建 soundMap.js
 * 自动 require 所有 mp3 文件，key 和 value 都取文件名称（不含扩展名）
 */

// 音频资源目录路径
const audioDir = path.join(__dirname, '..', 'src', 'assets', 'question-audios');
// 输出文件路径
const outputFile = path.join(audioDir, 'soundMap.js');

function generateSoundMap() {
  console.log('🚀 开始生成音频资源映射表...');
  console.log(`📁 扫描目录: ${audioDir}`);
  
  try {
    // 检查目录是否存在
    if (!fs.existsSync(audioDir)) {
      console.error(`❌ 目录不存在: ${audioDir}`);
      console.log('💡 请确保音频资源目录存在');
      return;
    }
    
    // 读取目录中的所有文件
    const files = fs.readdirSync(audioDir);
    
    // 过滤出 mp3 文件
    const mp3Files = files.filter(file => 
      file.toLowerCase().endsWith('.mp3') && 
      !file.startsWith('.') // 排除隐藏文件
    );
    
    console.log(`📊 找到 ${mp3Files.length} 个 MP3 文件`);
    
    if (mp3Files.length === 0) {
      console.log('ℹ️  未找到 MP3 文件，跳过生成');
      return;
    }
    
    // 生成映射表内容
    let mapContent = `/**
 * 音频资源映射表 - 自动生成
 * 生成时间: ${new Date().toLocaleString('zh-CN')}
 * 文件数量: ${mp3Files.length}
 */

const soundMap = {
`;
    
    // 为每个 MP3 文件添加映射项
    mp3Files.forEach((file, index) => {
      const fileName = path.parse(file).name; // 去除扩展名
      
      mapContent += `  ${fileName}: require('./${file}'),
`;
      
      // 显示进度
      if ((index + 1) % 10 === 0 || index === mp3Files.length - 1) {
        console.log(`📝 处理进度: ${index + 1}/${mp3Files.length}`);
      }
    });
    
    mapContent += `};

// 导出映射表
export default soundMap;
`;
    
    // 写入文件
    fs.writeFileSync(outputFile, mapContent, 'utf8');
    
    console.log(`✅ 映射表生成成功: ${outputFile}`);
    console.log(`📋 共生成 ${mp3Files.length} 个音频资源映射`);
    
    // 显示前几个文件示例
    console.log('\n📄 示例映射:');
    mp3Files.slice(0, 5).forEach(file => {
      const fileName = path.parse(file).name;
      console.log(`   ${fileName}: require('./${file}')`);
    });
    
    if (mp3Files.length > 5) {
      console.log(`   ... 还有 ${mp3Files.length - 5} 个文件`);
    }
    
  } catch (error) {
    console.error('❌ 生成映射表时出错:', error.message);
  }
}

// 执行生成
if (require.main === module) {
  generateSoundMap();
}

module.exports = { generateSoundMap };