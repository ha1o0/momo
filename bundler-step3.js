const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;

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
                let depPath = node.arguments[0].value;
                const absoutePath = path.resolve(path.dirname(filePath), depPath);
                dependencies.push(absoutePath);
                node.arguments[0].value = absoutePath;
            }
        }
    });
    return {
        id: filePath,
        code: generator(ast).code,
        dependencies,
    };
}

function generateGraph(currentPath, graph) {
    if (!graph[currentPath]) {
        const moduleInfo = getDependencies(currentPath);
        graph[currentPath] = moduleInfo;
        moduleInfo.dependencies.forEach(item => {
            generateGraph(item, graph)
        });
    }
}

const entryPath = path.resolve(__dirname, 'src/main.js');
let graph = {}
generateGraph(entryPath, graph);

console.log('依赖列表：', Object.values(graph));