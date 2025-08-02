const fs = require('fs');
const path = require('path');

const mainPath = path.resolve(__dirname, 'src/main.js');
const messagePath = path.resolve(__dirname, 'src/message.js');

let mainContent = fs.readFileSync(mainPath, 'utf-8');
const messageContent = fs.readFileSync(messagePath, 'utf-8');

// 在打包时，手动将 main.js 里的相对路径依赖改成绝对路径
// 这依然是“瞎”的，但能解决执行问题。下一步我们会用 AST 完美解决。
mainContent = mainContent.replace(
  "require('./message.js')",
  `require('${messagePath}')`
);

const bundleContent = `
const modules = {
  '${mainPath}': function(module, exports, require) {
    ${mainContent}
  },
  '${messagePath}': function(module, exports, require) {
    ${messageContent}
  }
};

function require(modulePath) {
  const moduleFn = modules[modulePath];
  const module = { exports: {} };
  moduleFn(module, module.exports, require);
  return module.exports;
}

require('${mainPath}');
`;

const distPath = path.resolve(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath);
}
fs.writeFileSync(path.resolve(distPath, 'bundle.js'), bundleContent);

console.log('打包成功！请重新运行 dist/bundle.js 查看效果。');
