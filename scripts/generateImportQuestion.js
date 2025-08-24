#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Paths
const questionMetaDir = path.join(__dirname, '../src/data/question-meta');
const outputFile = path.join(__dirname, '../src/data/importQuestion.ts');

function generateImportQuestionFile() {
  try {
    // Read all files in the question-meta directory
    const files = fs.readdirSync(questionMetaDir);

    // Filter only .json files and extract the identifier
    const metaFiles = files
      .filter(file => file.endsWith('_meta.json'))
      .map(file => {
        const identifier = file.replace('_meta.json', '');
        return {
          identifier,
          fileName: file,
          importName: `meta_${identifier}`,
        };
      })
      .sort((a, b) => a.identifier.localeCompare(b.identifier)); // Sort alphabetically

    if (metaFiles.length === 0) {
      console.log('No meta.json files found in the directory.');
      return;
    }

    // Generate import statements
    const imports = metaFiles
      .map(
        ({importName, fileName}) =>
          `import ${importName} from './question-meta/${fileName}'`,
      )
      .join('\n');

    // Generate export array
    const exportArray = metaFiles.map(({importName}) => importName).join(', ');

    // Generate the complete file content
    const fileContent = `${imports}

export default [${exportArray}]
`;

    // Write the file
    fs.writeFileSync(outputFile, fileContent, 'utf8');

    console.log('✅ Generated importQuestion.ts successfully!');
    console.log(`📁 Found ${metaFiles.length} meta files:`);
    metaFiles.forEach(({identifier, fileName}) => {
      console.log(`   - ${fileName} → meta_${identifier}`);
    });
    console.log(`📄 Output written to: ${outputFile}`);
  } catch (error) {
    console.error('❌ Error generating importQuestion.ts:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateImportQuestionFile();
}

module.exports = {generateImportQuestionFile};
