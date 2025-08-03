import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to convert TSX to JSX
function convertTsxToJsx(content) {
  // Remove TypeScript interfaces
  content = content.replace(/interface\s+\w+\s*{[^}]*}/gs, '');
  
  // Remove type annotations from function parameters
  content = content.replace(/(\w+):\s*([A-Za-z<>\[\]{}|&]+)(\s*[,)])/g, '$1$3');
  
  // Remove type annotations from variable declarations
  content = content.replace(/(\w+):\s*([A-Za-z<>\[\]{}|&]+)(\s*[=;])/g, '$1$3');
  
  // Remove ReactNode import if it's the only import
  content = content.replace(/import\s*{\s*ReactNode\s*}\s*from\s*['"]react['"];\s*\n?/g, '');
  
  // Remove as const assertions
  content = content.replace(/\s+as\s+const/g, '');
  
  // Remove non-null assertions
  content = content.replace(/!+/g, '');
  
  // Remove generic type parameters
  content = content.replace(/<[^>]*>/g, (match) => {
    // Keep JSX tags but remove TypeScript generics
    if (match.includes('ReactNode') || match.includes('Props') || match.includes('State')) {
      return '';
    }
    return match;
  });
  
  return content;
}

// Function to process a directory recursively
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.endsWith('.tsx')) {
      console.log(`Converting ${fullPath}...`);
      
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const convertedContent = convertTsxToJsx(content);
        
        // Create JSX file
        const jsxPath = fullPath.replace('.tsx', '.jsx');
        fs.writeFileSync(jsxPath, convertedContent);
        
        console.log(`Created ${jsxPath}`);
      } catch (error) {
        console.error(`Error converting ${fullPath}:`, error.message);
      }
    }
  }
}

// Start conversion from src directory
console.log('Converting TSX files to JSX...');
processDirectory('./src');
console.log('Conversion complete!'); 