/**
 * 国际化迁移脚本
 * 将现有硬编码文本替换为模板语法
 */
const fs = require('fs');
const path = require('path');
const TextExtractor = require('./extract.js');

class I18nMigrator {
    constructor() {
        this.extractor = new TextExtractor();
        this.textsConfig = null;
        this.config = {
            // 要忽略的目录
            ignoreDirs: ['node_modules', '.git', 'i18n'],
            // 要忽略的目录模式（支持通配符）
            ignoreDirPatterns: [
                /^备份/,           // 所有以"备份"开头的目录
                /备份$/,           // 所有以"备份"结尾的目录
                /备份\d+/,         // 备份1.0, 备份2.1 等
                /备份.*版/,        // 备份精简版等
                /backup/i,         // backup目录（不区分大小写）
                /bak$/i           // .bak结尾的目录
            ]
        };
        this.migrationReport = {
            processedFiles: [],
            replacements: [],
            errors: [],
            summary: {
                totalFiles: 0,
                totalReplacements: 0,
                totalErrors: 0
            }
        };
    }

    /**
     * 开始迁移
     */
    async migrate(rootDir = '.') {
        console.log('开始国际化迁移...');
        
        try {
            // 1. 提取文本并生成配置
            console.log('1. 提取现有文本...');
            await this.extractor.extract(rootDir);
            
            // 2. 加载生成的文本配置
            console.log('2. 加载文本配置...');
            await this.loadTextsConfig();
            
            // 3. 迁移HTML文件
            console.log('3. 迁移HTML文件...');
            await this.migrateDirectory(rootDir, '.html');
            
            // 4. 迁移JS文件
            console.log('4. 迁移JS文件...');
            await this.migrateDirectory(rootDir, '.js');
            
            // 5. 生成迁移报告
            console.log('5. 生成迁移报告...');
            await this.generateMigrationReport();
            
            console.log('迁移完成！');
            console.log(`处理文件: ${this.migrationReport.summary.totalFiles}`);
            console.log(`替换次数: ${this.migrationReport.summary.totalReplacements}`);
            console.log(`错误次数: ${this.migrationReport.summary.totalErrors}`);
            
        } catch (error) {
            console.error('迁移过程中出现错误：', error);
            throw error;
        }
    }

    /**
     * 加载文本配置
     */
    async loadTextsConfig() {
        const textsPath = path.join(__dirname, '../texts.js');
        if (!fs.existsSync(textsPath)) {
            throw new Error('文本配置文件不存在，请先运行提取工具');
        }
        
        // 直接require文本配置，避免JSON解析问题
        try {
            this.textsConfig = require('../texts.js');
        } catch (error) {
            console.error('加载文本配置失败:', error);
            throw new Error('无法加载文本配置文件');
        }
        
        // 创建文本到键的映射
        this.textToKeyMap = new Map();
        for (const [category, texts] of Object.entries(this.textsConfig)) {
            if (typeof texts === 'object' && texts !== null) {
                for (const [key, text] of Object.entries(texts)) {
                    if (typeof text === 'string') {
                        this.textToKeyMap.set(text, `${category}.${key}`);
                    }
                }
            }
        }
    }

    /**
     * 检查是否应该忽略目录
     */
    shouldIgnoreDirectory(dirName) {
        // 检查固定忽略列表
        if (this.config.ignoreDirs.includes(dirName)) {
            return true;
        }
        
        // 检查模式匹配
        return this.config.ignoreDirPatterns.some(pattern => {
            if (pattern instanceof RegExp) {
                return pattern.test(dirName);
            }
            return dirName.includes(pattern);
        });
    }

    /**
     * 迁移目录中的文件
     */
    async migrateDirectory(dirPath, extension) {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                // 跳过忽略的目录
                if (this.shouldIgnoreDirectory(item)) {
                    continue;
                }
                await this.migrateDirectory(fullPath, extension);
            } else if (stat.isFile() && path.extname(item) === extension) {
                await this.migrateFile(fullPath);
            }
        }
    }

    /**
     * 迁移单个文件
     */
    async migrateFile(filePath) {
        console.log(`迁移文件：${filePath}`);
        
        try {
            let content = fs.readFileSync(filePath, 'utf-8');
            const originalContent = content;
            let replacementCount = 0;
            
            const ext = path.extname(filePath);
            
            if (ext === '.html') {
                const result = this.migrateHTML(content, filePath);
                content = result.content;
                replacementCount = result.replacements;
            } else if (ext === '.js') {
                const result = this.migrateJS(content, filePath);
                content = result.content;
                replacementCount = result.replacements;
            }
            
            // 如果有替换，写入文件
            if (replacementCount > 0) {
                // 创建备份
                await this.createBackup(filePath, originalContent);
                
                // 写入新内容
                fs.writeFileSync(filePath, content, 'utf-8');
                
                this.migrationReport.processedFiles.push({
                    file: filePath,
                    replacements: replacementCount
                });
                
                this.migrationReport.summary.totalReplacements += replacementCount;
            }
            
            this.migrationReport.summary.totalFiles++;
            
        } catch (error) {
            console.error(`迁移文件 ${filePath} 时出错：`, error);
            this.migrationReport.errors.push({
                file: filePath,
                error: error.message
            });
            this.migrationReport.summary.totalErrors++;
        }
    }

    /**
     * 迁移HTML内容
     */
    migrateHTML(content, filePath) {
        let replacements = 0;
        
        // 替换HTML标签内的文本
        content = content.replace(/>([^<]*[\u4e00-\u9fa5][^<]*)</g, (match, text) => {
            const cleanText = text.trim();
            if (cleanText && this.textToKeyMap.has(cleanText)) {
                const key = this.textToKeyMap.get(cleanText);
                replacements++;
                this.migrationReport.replacements.push({
                    file: filePath,
                    type: 'html-content',
                    original: cleanText,
                    replacement: `{{${key}}}`
                });
                return match.replace(text, `{{${key}}}`);
            }
            return match;
        });

        // 替换属性中的文本
        const attributes = ['title', 'placeholder', 'alt', 'aria-label'];
        attributes.forEach(attr => {
            const attrRegex = new RegExp(`(${attr}=["'])([^"']*[\u4e00-\u9fa5][^"']*)(['"])`, 'g');
            content = content.replace(attrRegex, (match, prefix, text, suffix) => {
                const cleanText = text.trim();
                if (cleanText && this.textToKeyMap.has(cleanText)) {
                    const key = this.textToKeyMap.get(cleanText);
                    replacements++;
                    this.migrationReport.replacements.push({
                        file: filePath,
                        type: `html-${attr}`,
                        original: cleanText,
                        replacement: `{{${key}}}`
                    });
                    return `${prefix}{{${key}}}${suffix}`;
                }
                return match;
            });
        });

        return { content, replacements };
    }

    /**
     * 迁移JS内容
     */
    migrateJS(content, filePath) {
        let replacements = 0;
        
        // 替换字符串字面量中的中文
        content = content.replace(/(['"`])([^'"`]*[\u4e00-\u9fa5][^'"`]*)\1/g, (match, quote, text) => {
            const cleanText = text.trim();
            if (cleanText && this.textToKeyMap.has(cleanText) && !this.isCodeRelated(cleanText)) {
                const key = this.textToKeyMap.get(cleanText);
                replacements++;
                this.migrationReport.replacements.push({
                    file: filePath,
                    type: 'js-string',
                    original: cleanText,
                    replacement: `$t('${key}')`
                });
                return `$t('${key}')`;
            }
            return match;
        });

        // 替换模板字符串中的中文（简化处理）
        content = content.replace(/`([^`]*[\u4e00-\u9fa5][^`]*)`/g, (match, text) => {
            // 对于模板字符串，我们需要更谨慎的处理
            // 这里只处理简单的情况
            const cleanText = text.trim();
            if (cleanText && this.textToKeyMap.has(cleanText) && !this.isCodeRelated(cleanText) && !text.includes('${')) {
                const key = this.textToKeyMap.get(cleanText);
                replacements++;
                this.migrationReport.replacements.push({
                    file: filePath,
                    type: 'js-template',
                    original: cleanText,
                    replacement: `$t('${key}')`
                });
                return `$t('${key}')`;
            }
            return match;
        });

        return { content, replacements };
    }

    /**
     * 判断是否为代码相关文本
     */
    isCodeRelated(text) {
        const codePatterns = [
            /console\./,
            /function\s/,
            /var\s|let\s|const\s/,
            /return\s/,
            /if\s*\(/,
            /for\s*\(/,
            /while\s*\(/,
            /\$\{/,
            /\.\w+\(/,
            /^\s*\/\//,
            /^\s*\/\*/,
            /\w+\s*[:=]\s*function/,
            /\w+\s*\(/,
            /\w+\.\w+/
        ];
        
        return codePatterns.some(pattern => pattern.test(text));
    }

    /**
     * 创建备份文件
     */
    async createBackup(filePath, content) {
        const backupDir = path.join(path.dirname(filePath), '备份');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const fileName = path.basename(filePath);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `${fileName}.${timestamp}.bak`);
        
        fs.writeFileSync(backupPath, content, 'utf-8');
        console.log(`创建备份：${backupPath}`);
    }

    /**
     * 生成迁移报告
     */
    async generateMigrationReport() {
        const reportPath = 'i18n/migration-report.json';
        
        // 确保目录存在
        const dir = path.dirname(reportPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // 添加时间戳
        this.migrationReport.migrationTime = new Date().toISOString();
        
        // 写入报告
        fs.writeFileSync(
            reportPath,
            JSON.stringify(this.migrationReport, null, 2),
            'utf-8'
        );
        
        console.log(`迁移报告已生成：${reportPath}`);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const migrator = new I18nMigrator();
    migrator.migrate(process.argv[2] || '.')
        .then(() => {
            console.log('迁移完成！');
            process.exit(0);
        })
        .catch(error => {
            console.error('迁移失败：', error);
            process.exit(1);
        });
}

module.exports = I18nMigrator;