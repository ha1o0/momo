const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

function getDependencies(filePath) {
    console.log('正在分析文件：', filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const ast = parser.parse(content, {
        sourceType: 'module',
    });
    const dependencies = [];
    traverse(ast, {
        CallExpression(nodePath) {
            const node = nodePath.node;
            if (node.callee.name === 'require') {
                const depPath = node.arguments[0].value;
                dependencies.push(depPath);
            }
        }
    });

    return dependencies;
}

const entryPath = path.resolve(__dirname, 'src/main.js');
const dependencies = getDependencies(entryPath);

console.log('依赖列表：', dependencies);