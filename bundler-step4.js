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

function generateModuleString(graphValue) {
    const { id, code } = graphValue;
    const escapedId = id.replace(/\\/g, '\\\\');
    return `'${escapedId}': function(module, exports, require) { ${code} },`;
}

function bundle(entryPath, distPath) {
    let graph = {};
    generateGraph(entryPath, graph);
    let moduleString = ''
    const graphValues = Object.values(graph);
    console.log('依赖列表：', graphValues);
    graphValues.forEach(value => {
        moduleString += generateModuleString(value);
    })
    // 移除最后一个字符（逗号）
    moduleString = moduleString.slice(0, -1);
    const escapedEntryPath = entryPath.replace(/\\/g, '\\\\');
    let bundleContent = '';
    bundleContent = `
    (function() {
        const modules = {
            ${moduleString}
        };

        function require(modulePath) {
            const moduleFn = modules[modulePath];
            const module = { exports: {} };
            moduleFn(module, module.exports, require);
            return module.exports;
        }

        require('${escapedEntryPath}');
    })();
    `;

    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath);
    }
    fs.writeFileSync(path.resolve(distPath, 'bundle.js'), bundleContent);
}

const entryPath = path.resolve(__dirname, 'src/index.js');
const distPath = path.resolve(__dirname, 'dist');
bundle(entryPath, distPath);
