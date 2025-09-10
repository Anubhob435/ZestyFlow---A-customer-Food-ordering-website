import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to fix paths in HTML content
function fixPaths(content) {
  let fixedContent = content;
  
  // Fix CSS links - convert relative to absolute
  fixedContent = fixedContent.replace(/href="([^"]*\.css)"/g, (match, cssPath) => {
    if (!cssPath.startsWith('/') && !cssPath.startsWith('http')) {
      return `href="/${cssPath}"`;
    }
    return match;
  });
  
  // Fix image sources - convert relative to absolute
  fixedContent = fixedContent.replace(/src="(images\/[^"]*)"/g, (match, imgPath) => {
    return `src="/${imgPath}"`;
  });
  
  // Fix other relative links to pages, styles, etc.
  fixedContent = fixedContent.replace(/href="(pages\/[^"]*)"/g, (match, pagePath) => {
    return `href="/${pagePath}"`;
  });
  
  // Fix style directory links
  fixedContent = fixedContent.replace(/href="(style\/[^"]*)"/g, (match, stylePath) => {
    return `href="/${stylePath}"`;
  });
  
  // Fix HTML page links (but not external links)
  fixedContent = fixedContent.replace(/href="([^"]*\.html)"/g, (match, htmlPath) => {
    if (!htmlPath.startsWith('/') && !htmlPath.startsWith('http') && !htmlPath.includes('://')) {
      return `href="/${htmlPath}"`;
    }
    return match;
  });
  
  return fixedContent;
}

// Get all HTML files in the root directory
const rootDir = __dirname;
const files = fs.readdirSync(rootDir);
const htmlFiles = files.filter(file => file.endsWith('.html'));

console.log('Found HTML files:', htmlFiles);

// Process each HTML file
htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const fixedContent = fixPaths(content);
  
  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log(`✅ Fixed paths in: ${file}`);
  } else {
    console.log(`⏭️  No changes needed in: ${file}`);
  }
});

// Also check pages directory
const pagesDir = path.join(rootDir, 'pages');
if (fs.existsSync(pagesDir)) {
  function processDirectory(dir, relativePath = '') {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDirectory(fullPath, path.join(relativePath, file));
      } else if (file.endsWith('.html')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const fixedContent = fixPaths(content);
        
        if (content !== fixedContent) {
          fs.writeFileSync(fullPath, fixedContent, 'utf8');
          console.log(`✅ Fixed paths in: pages/${relativePath}/${file}`);
        } else {
          console.log(`⏭️  No changes needed in: pages/${relativePath}/${file}`);
        }
      }
    });
  }
  
  processDirectory(pagesDir);
}

console.log('🎉 Path fixing complete!');
