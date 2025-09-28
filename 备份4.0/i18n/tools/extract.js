/**
 * 文本提取工具
 * 自动扫描HTML和JS文件中的中文文本，生成国际化配置
 */
const fs = require('fs');
const path = require('path');

class TextExtractor {
    constructor() {
        this.extractedTexts = new Map();
        this.keyCounter = 0;
        this.config = {
            // 要扫描的文件类型
            fileExtensions: ['.html', '.js'],
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
            ],
            // 中文文本正则表达式
            chineseRegex: /[\u4e00-\u9fa5]+[^\u0000-\u007F]*[\u4e00-\u9fa5]*/g,
            // 要提取的HTML属性
            htmlAttributes: ['title', 'placeholder', 'alt', 'aria-label'],
            // 输出配置
            output: {
                textsFile: 'i18n/texts.js',
                reportFile: 'i18n/extraction-report.json'
            }
        };
    }

    /**
     * 开始提取文本
     */
    async extract(rootDir = '.') {
        console.log('开始提取中文文本...');
        
        try {
            // 扫描所有文件
            await this.scanDirectory(rootDir);
            
            // 生成配置文件
            await this.generateTextsFile();
            
            // 生成报告
            await this.generateReport();
            
            console.log(`提取完成！共找到 ${this.extractedTexts.size} 个文本项`);
            console.log(`配置文件已生成：${this.config.output.textsFile}`);
            console.log(`详细报告：${this.config.output.reportFile}`);
            
        } catch (error) {
            console.error('提取过程中出现错误：', error);
            throw error;
        }
    }

    /**
     * 扫描目录
     */
    async scanDirectory(dirPath) {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                // 跳过忽略的目录
                if (this.shouldIgnoreDir(item)) {
                    continue;
                }
                await this.scanDirectory(fullPath);
            } else if (stat.isFile()) {
                const ext = path.extname(item);
                if (this.config.fileExtensions.includes(ext)) {
                    await this.scanFile(fullPath);
                }
            }
        }
    }

    /**
     * 检查是否应该忽略目录
     */
    shouldIgnoreDir(dirName) {
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
     * 扫描单个文件
     */
    async scanFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const ext = path.extname(filePath);
        
        console.log(`扫描文件：${filePath}`);
        
        if (ext === '.html') {
            this.extractFromHTML(content, filePath);
        } else if (ext === '.js') {
            this.extractFromJS(content, filePath);
        }
    }

    /**
     * 从HTML文件提取文本
     */
    extractFromHTML(content, filePath) {
        // 提取HTML标签内的文本
        const textMatches = content.match(/>([^<]*[\u4e00-\u9fa5][^<]*)</g);
        if (textMatches) {
            textMatches.forEach(match => {
                const text = match.slice(1, -1).trim();
                if (text && this.isChineseText(text)) {
                    this.addText(text, filePath, 'html-content');
                }
            });
        }

        // 提取属性中的文本
        this.config.htmlAttributes.forEach(attr => {
            const attrRegex = new RegExp(`${attr}=["']([^"']*[\u4e00-\u9fa5][^"']*)["']`, 'g');
            let match;
            while ((match = attrRegex.exec(content)) !== null) {
                const text = match[1].trim();
                if (text && this.isChineseText(text)) {
                    this.addText(text, filePath, `html-${attr}`);
                }
            }
        });
    }

    /**
     * 从JS文件提取文本
     */
    extractFromJS(content, filePath) {
        // 提取字符串字面量中的中文
        const stringMatches = content.match(/['"`]([^'"`]*[\u4e00-\u9fa5][^'"`]*)['"`]/g);
        if (stringMatches) {
            stringMatches.forEach(match => {
                const text = match.slice(1, -1).trim();
                if (text && this.isChineseText(text) && !this.isCodeRelated(text)) {
                    this.addText(text, filePath, 'js-string');
                }
            });
        }

        // 提取模板字符串中的中文
        const templateMatches = content.match(/`([^`]*[\u4e00-\u9fa5][^`]*)`/g);
        if (templateMatches) {
            templateMatches.forEach(match => {
                const text = match.slice(1, -1).trim();
                if (text && this.isChineseText(text) && !this.isCodeRelated(text)) {
                    this.addText(text, filePath, 'js-template');
                }
            });
        }
    }

    /**
     * 判断是否为中文文本
     */
    isChineseText(text) {
        return /[\u4e00-\u9fa5]/.test(text) && text.length > 0;
    }

    /**
     * 判断是否为代码相关文本（需要排除）
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
            /^\s*\/\*/
        ];
        
        return codePatterns.some(pattern => pattern.test(text));
    }

    /**
     * 添加文本到集合
     */
    addText(text, filePath, type) {
        // 清理文本
        const cleanText = text.replace(/\s+/g, ' ').trim();
        
        if (!cleanText || cleanText.length < 1) {
            return;
        }

        // 生成语义化的键名
        const key = this.generateKey(cleanText, type);
        
        if (!this.extractedTexts.has(cleanText)) {
            this.extractedTexts.set(cleanText, {
                key: key,
                text: cleanText,
                type: type,
                files: [filePath],
                count: 1
            });
        } else {
            const existing = this.extractedTexts.get(cleanText);
            if (!existing.files.includes(filePath)) {
                existing.files.push(filePath);
            }
            existing.count++;
        }
    }

    /**
     * 生成语义化的键名
     */
    generateKey(text, type) {
        // 根据文本内容和类型生成有意义的键名
        let key = '';
        
        // 根据类型确定前缀
        const typePrefix = {
            'html-content': 'content',
            'html-title': 'titles',
            'html-placeholder': 'placeholders',
            'html-alt': 'alts',
            'html-aria-label': 'labels',
            'js-string': 'messages',
            'js-template': 'templates'
        };
        
        const prefix = typePrefix[type] || 'texts';
        
        // 提取关键词
        const keywords = this.extractKeywords(text);
        const keywordPart = keywords.slice(0, 2).join('_');
        
        // 生成键名
        if (keywordPart) {
            key = `${prefix}.${keywordPart}`;
        } else {
            key = `${prefix}.item_${++this.keyCounter}`;
        }
        
        return key;
    }

    /**
     * 提取关键词
     */
    extractKeywords(text) {
        // 移除标点符号，提取有意义的词汇
        const cleaned = text.replace(/[，。！？；：""''（）【】《》、]/g, ' ');
        const words = cleaned.split(/\s+/).filter(word => word.length > 0);
        
        // 转换为拼音或英文（简化版，实际项目中可以使用专门的拼音库）
        const keywords = words.map(word => this.toPinyin(word)).filter(Boolean);
        
        return keywords;
    }

    /**
     * 简化的拼音转换（实际项目中建议使用专业库）
     */
    toPinyin(word) {
        const pinyinMap = {
            '确认': 'confirm',
            '取消': 'cancel',
            '提交': 'submit',
            '保存': 'save',
            '删除': 'delete',
            '编辑': 'edit',
            '添加': 'add',
            '搜索': 'search',
            '登录': 'login',
            '注册': 'register',
            '设置': 'settings',
            '帮助': 'help',
            '关于': 'about',
            '首页': 'home',
            '用户': 'user',
            '密码': 'password',
            '邮箱': 'email',
            '手机': 'phone',
            '地址': 'address',
            '姓名': 'name',
            '年龄': 'age',
            '性别': 'gender',
            '生日': 'birthday',
            '公司': 'company',
            '职位': 'position',
            '部门': 'department',
            '项目': 'project',
            '任务': 'task',
            '消息': 'message',
            '通知': 'notification',
            '警告': 'warning',
            '错误': 'error',
            '成功': 'success',
            '失败': 'failure',
            '加载': 'loading',
            '完成': 'complete',
            '进行中': 'progress',
            '待处理': 'pending',
            '已处理': 'processed',
            '金币': 'coin',
            '钱包': 'wallet',
            '余额': 'balance',
            '充值': 'recharge',
            '提现': 'withdraw',
            '转账': 'transfer',
            '交易': 'transaction',
            '记录': 'record',
            '历史': 'history',
            '统计': 'statistics',
            '报表': 'report',
            '分析': 'analysis',
            '团队': 'team',
            '成员': 'member',
            '邀请': 'invite',
            '链接': 'link',
            '分享': 'share',
            '排行榜': 'ranking',
            '积分': 'points',
            '等级': 'level',
            '经验': 'experience',
            '奖励': 'reward',
            '红包': 'redpacket',
            '抢红包': 'grab',
            '发红包': 'send',
            '活动': 'activity',
            '游戏': 'game',
            '规则': 'rules',
            '说明': 'description',
            '介绍': 'introduction',
            '详情': 'details',
            '更多': 'more',
            '全部': 'all',
            '部分': 'partial',
            '选择': 'select',
            '选项': 'option',
            '配置': 'config',
            '参数': 'parameter',
            '值': 'value',
            '类型': 'type',
            '状态': 'status',
            '结果': 'result',
            '数据': 'data',
            '信息': 'info',
            '内容': 'content',
            '标题': 'title',
            '描述': 'description',
            '备注': 'note',
            '评论': 'comment',
            '回复': 'reply',
            '点赞': 'like',
            '收藏': 'favorite',
            '关注': 'follow',
            '粉丝': 'fans',
            '朋友': 'friend',
            '联系人': 'contact',
            '群组': 'group',
            '频道': 'channel',
            '话题': 'topic',
            '标签': 'tag',
            '分类': 'category',
            '筛选': 'filter',
            '排序': 'sort',
            '刷新': 'refresh',
            '重置': 'reset',
            '清空': 'clear',
            '导入': 'import',
            '导出': 'export',
            '上传': 'upload',
            '下载': 'download',
            '预览': 'preview',
            '打印': 'print',
            '复制': 'copy',
            '粘贴': 'paste',
            '剪切': 'cut',
            '撤销': 'undo',
            '重做': 'redo',
            '前进': 'forward',
            '后退': 'back',
            '上一页': 'prev',
            '下一页': 'next',
            '第一页': 'first',
            '最后一页': 'last',
            '跳转': 'goto',
            '页码': 'page',
            '总数': 'total',
            '数量': 'count',
            '单位': 'unit',
            '价格': 'price',
            '金额': 'amount',
            '费用': 'fee',
            '折扣': 'discount',
            '优惠': 'promotion',
            '券': 'coupon',
            '卡': 'card',
            '会员': 'member',
            '等级': 'level',
            '权限': 'permission',
            '角色': 'role',
            '管理员': 'admin',
            '普通用户': 'user',
            '访客': 'guest',
            '在线': 'online',
            '离线': 'offline',
            '忙碌': 'busy',
            '空闲': 'idle',
            '可用': 'available',
            '不可用': 'unavailable',
            '启用': 'enabled',
            '禁用': 'disabled',
            '激活': 'active',
            '未激活': 'inactive',
            '正常': 'normal',
            '异常': 'abnormal',
            '健康': 'healthy',
            '故障': 'fault',
            '维护': 'maintenance',
            '升级': 'upgrade',
            '更新': 'update',
            '版本': 'version',
            '发布': 'release',
            '测试': 'test',
            '开发': 'development',
            '生产': 'production',
            '环境': 'environment',
            '配置': 'config',
            '部署': 'deploy',
            '监控': 'monitor',
            '日志': 'log',
            '调试': 'debug',
            '性能': 'performance',
            '安全': 'security',
            '备份': 'backup',
            '恢复': 'restore',
            '同步': 'sync',
            '异步': 'async',
            '实时': 'realtime',
            '延迟': 'delay',
            '超时': 'timeout',
            '重试': 'retry',
            '限制': 'limit',
            '配额': 'quota',
            '阈值': 'threshold',
            '警报': 'alert',
            '通知': 'notify',
            '提醒': 'remind',
            '计划': 'schedule',
            '任务': 'task',
            '作业': 'job',
            '流程': 'process',
            '步骤': 'step',
            '阶段': 'stage',
            '状态': 'state',
            '事件': 'event',
            '触发': 'trigger',
            '响应': 'response',
            '请求': 'request',
            '接口': 'api',
            '服务': 'service',
            '客户端': 'client',
            '服务器': 'server',
            '数据库': 'database',
            '缓存': 'cache',
            '队列': 'queue',
            '消息': 'message',
            '事务': 'transaction',
            '会话': 'session',
            '连接': 'connection',
            '网络': 'network',
            '协议': 'protocol',
            '端口': 'port',
            '地址': 'address',
            '域名': 'domain',
            '路径': 'path',
            '参数': 'param',
            '查询': 'query',
            '结果': 'result',
            '响应': 'response',
            '状态码': 'status_code',
            '头部': 'header',
            '主体': 'body',
            '内容': 'content',
            '类型': 'type',
            '格式': 'format',
            '编码': 'encoding',
            '解码': 'decoding',
            '加密': 'encrypt',
            '解密': 'decrypt',
            '签名': 'signature',
            '验证': 'verify',
            '认证': 'auth',
            '授权': 'authorize',
            '令牌': 'token',
            '密钥': 'key',
            '证书': 'certificate',
            '许可': 'license',
            '协议': 'agreement',
            '条款': 'terms',
            '政策': 'policy',
            '隐私': 'privacy',
            '安全': 'security',
            '风险': 'risk',
            '威胁': 'threat',
            '漏洞': 'vulnerability',
            '攻击': 'attack',
            '防护': 'protection',
            '防火墙': 'firewall',
            '过滤': 'filter',
            '检测': 'detect',
            '扫描': 'scan',
            '分析': 'analyze',
            '报告': 'report',
            '统计': 'statistics',
            '指标': 'metrics',
            '图表': 'chart',
            '图形': 'graph',
            '表格': 'table',
            '列表': 'list',
            '树形': 'tree',
            '网格': 'grid',
            '布局': 'layout',
            '样式': 'style',
            '主题': 'theme',
            '皮肤': 'skin',
            '模板': 'template',
            '组件': 'component',
            '控件': 'control',
            '元素': 'element',
            '属性': 'attribute',
            '方法': 'method',
            '函数': 'function',
            '变量': 'variable',
            '常量': 'constant',
            '枚举': 'enum',
            '接口': 'interface',
            '类': 'class',
            '对象': 'object',
            '实例': 'instance',
            '继承': 'inherit',
            '实现': 'implement',
            '重写': 'override',
            '重载': 'overload',
            '多态': 'polymorphism',
            '封装': 'encapsulation',
            '抽象': 'abstraction',
            '模块': 'module',
            '包': 'package',
            '库': 'library',
            '框架': 'framework',
            '工具': 'tool',
            '插件': 'plugin',
            '扩展': 'extension',
            '中间件': 'middleware',
            '适配器': 'adapter',
            '装饰器': 'decorator',
            '观察者': 'observer',
            '监听器': 'listener',
            '处理器': 'handler',
            '管理器': 'manager',
            '控制器': 'controller',
            '视图': 'view',
            '模型': 'model',
            '路由': 'route',
            '中间件': 'middleware',
            '过滤器': 'filter',
            '拦截器': 'interceptor',
            '验证器': 'validator',
            '转换器': 'converter',
            '解析器': 'parser',
            '生成器': 'generator',
            '构建器': 'builder',
            '工厂': 'factory',
            '单例': 'singleton',
            '代理': 'proxy',
            '门面': 'facade',
            '策略': 'strategy',
            '命令': 'command',
            '状态': 'state',
            '备忘录': 'memento',
            '迭代器': 'iterator',
            '访问者': 'visitor',
            '模板方法': 'template_method',
            '责任链': 'chain_of_responsibility',
            '桥接': 'bridge',
            '组合': 'composite',
            '享元': 'flyweight',
            '原型': 'prototype',
            '建造者': 'builder',
            '抽象工厂': 'abstract_factory',
            '依赖注入': 'dependency_injection',
            '控制反转': 'inversion_of_control',
            '面向切面': 'aspect_oriented',
            '事件驱动': 'event_driven',
            '消息驱动': 'message_driven',
            '数据驱动': 'data_driven',
            '测试驱动': 'test_driven',
            '行为驱动': 'behavior_driven',
            '领域驱动': 'domain_driven',
            '微服务': 'microservice',
            '单体应用': 'monolith',
            '分布式': 'distributed',
            '集群': 'cluster',
            '负载均衡': 'load_balance',
            '高可用': 'high_availability',
            '容错': 'fault_tolerance',
            '弹性': 'resilience',
            '扩展性': 'scalability',
            '性能': 'performance',
            '吞吐量': 'throughput',
            '延迟': 'latency',
            '并发': 'concurrency',
            '并行': 'parallel',
            '同步': 'synchronous',
            '异步': 'asynchronous',
            '阻塞': 'blocking',
            '非阻塞': 'non_blocking',
            '线程': 'thread',
            '进程': 'process',
            '协程': 'coroutine',
            '任务': 'task',
            '调度': 'schedule',
            '队列': 'queue',
            '栈': 'stack',
            '堆': 'heap',
            '链表': 'linked_list',
            '数组': 'array',
            '哈希表': 'hash_table',
            '树': 'tree',
            '图': 'graph',
            '算法': 'algorithm',
            '数据结构': 'data_structure',
            '复杂度': 'complexity',
            '时间复杂度': 'time_complexity',
            '空间复杂度': 'space_complexity',
            '优化': 'optimization',
            '重构': 'refactor',
            '代码审查': 'code_review',
            '单元测试': 'unit_test',
            '集成测试': 'integration_test',
            '系统测试': 'system_test',
            '性能测试': 'performance_test',
            '压力测试': 'stress_test',
            '负载测试': 'load_test',
            '安全测试': 'security_test',
            '用户体验测试': 'ux_test',
            '可用性测试': 'usability_test',
            '兼容性测试': 'compatibility_test',
            '回归测试': 'regression_test',
            '冒烟测试': 'smoke_test',
            '验收测试': 'acceptance_test',
            '自动化测试': 'automated_test',
            '手动测试': 'manual_test',
            '黑盒测试': 'black_box_test',
            '白盒测试': 'white_box_test',
            '灰盒测试': 'gray_box_test',
            '边界测试': 'boundary_test',
            '等价类测试': 'equivalence_class_test',
            '决策表测试': 'decision_table_test',
            '状态转换测试': 'state_transition_test',
            '用例': 'use_case',
            '场景': 'scenario',
            '步骤': 'step',
            '预期结果': 'expected_result',
            '实际结果': 'actual_result',
            '缺陷': 'defect',
            '错误': 'bug',
            '问题': 'issue',
            '需求': 'requirement',
            '规格': 'specification',
            '设计': 'design',
            '架构': 'architecture',
            '模式': 'pattern',
            '原则': 'principle',
            '最佳实践': 'best_practice',
            '代码规范': 'coding_standard',
            '命名规范': 'naming_convention',
            '注释': 'comment',
            '文档': 'documentation',
            '手册': 'manual',
            '指南': 'guide',
            '教程': 'tutorial',
            '示例': 'example',
            '演示': 'demo',
            '原型': 'prototype',
            '概念验证': 'proof_of_concept',
            '最小可行产品': 'mvp',
            '产品': 'product',
            '功能': 'feature',
            '特性': 'characteristic',
            '属性': 'property',
            '行为': 'behavior',
            '能力': 'capability',
            '限制': 'limitation',
            '约束': 'constraint',
            '依赖': 'dependency',
            '关系': 'relationship',
            '关联': 'association',
            '聚合': 'aggregation',
            '组合': 'composition',
            '继承': 'inheritance',
            '实现': 'realization',
            '使用': 'usage',
            '包含': 'include',
            '扩展': 'extend',
            '泛化': 'generalization',
            '特化': 'specialization',
            '抽象': 'abstraction',
            '具体': 'concrete',
            '接口': 'interface',
            '实现': 'implementation',
            '声明': 'declaration',
            '定义': 'definition',
            '初始化': 'initialization',
            '实例化': 'instantiation',
            '构造': 'construction',
            '销毁': 'destruction',
            '创建': 'creation',
            '删除': 'deletion',
            '修改': 'modification',
            '更新': 'update',
            '查询': 'query',
            '搜索': 'search',
            '过滤': 'filter',
            '排序': 'sort',
            '分组': 'group',
            '聚合': 'aggregate',
            '统计': 'statistics',
            '计算': 'calculation',
            '处理': 'processing',
            '转换': 'transformation',
            '映射': 'mapping',
            '绑定': 'binding',
            '解绑': 'unbinding',
            '连接': 'connection',
            '断开': 'disconnection',
            '建立': 'establishment',
            '关闭': 'closure',
            '开启': 'opening',
            '启动': 'startup',
            '停止': 'shutdown',
            '暂停': 'pause',
            '恢复': 'resume',
            '重启': 'restart',
            '重置': 'reset',
            '清除': 'clear',
            '刷新': 'refresh',
            '同步': 'synchronization',
            '异步': 'asynchronization',
            '并发': 'concurrency',
            '并行': 'parallelism',
            '串行': 'serialization',
            '顺序': 'sequence',
            '随机': 'random',
            '排列': 'permutation',
            '组合': 'combination',
            '选择': 'selection',
            '决策': 'decision',
            '判断': 'judgment',
            '比较': 'comparison',
            '匹配': 'matching',
            '查找': 'finding',
            '定位': 'location',
            '导航': 'navigation',
            '路径': 'path',
            '方向': 'direction',
            '位置': 'position',
            '坐标': 'coordinate',
            '尺寸': 'dimension',
            '大小': 'size',
            '长度': 'length',
            '宽度': 'width',
            '高度': 'height',
            '深度': 'depth',
            '厚度': 'thickness',
            '重量': 'weight',
            '密度': 'density',
            '体积': 'volume',
            '面积': 'area',
            '周长': 'perimeter',
            '半径': 'radius',
            '直径': 'diameter',
            '角度': 'angle',
            '弧度': 'radian',
            '速度': 'speed',
            '加速度': 'acceleration',
            '时间': 'time',
            '日期': 'date',
            '年': 'year',
            '月': 'month',
            '日': 'day',
            '小时': 'hour',
            '分钟': 'minute',
            '秒': 'second',
            '毫秒': 'millisecond',
            '微秒': 'microsecond',
            '纳秒': 'nanosecond',
            '频率': 'frequency',
            '周期': 'period',
            '间隔': 'interval',
            '持续时间': 'duration',
            '超时': 'timeout',
            '延迟': 'delay',
            '等待': 'wait',
            '睡眠': 'sleep',
            '唤醒': 'wake',
            '激活': 'activate',
            '停用': 'deactivate',
            '启用': 'enable',
            '禁用': 'disable',
            '打开': 'open',
            '关闭': 'close',
            '显示': 'show',
            '隐藏': 'hide',
            '可见': 'visible',
            '不可见': 'invisible',
            '透明': 'transparent',
            '不透明': 'opaque',
            '颜色': 'color',
            '红色': 'red',
            '绿色': 'green',
            '蓝色': 'blue',
            '黄色': 'yellow',
            '橙色': 'orange',
            '紫色': 'purple',
            '粉色': 'pink',
            '棕色': 'brown',
            '黑色': 'black',
            '白色': 'white',
            '灰色': 'gray',
            '银色': 'silver',
            '金色': 'gold',
            '亮度': 'brightness',
            '对比度': 'contrast',
            '饱和度': 'saturation',
            '色调': 'hue',
            '阴影': 'shadow',
            '高光': 'highlight',
            '渐变': 'gradient',
            '纹理': 'texture',
            '图案': 'pattern',
            '背景': 'background',
            '前景': 'foreground',
            '边框': 'border',
            '边距': 'margin',
            '内边距': 'padding',
            '间距': 'spacing',
            '对齐': 'alignment',
            '居中': 'center',
            '左对齐': 'left_align',
            '右对齐': 'right_align',
            '顶部对齐': 'top_align',
            '底部对齐': 'bottom_align',
            '垂直居中': 'vertical_center',
            '水平居中': 'horizontal_center',
            '分布': 'distribution',
            '均匀分布': 'even_distribution',
            '网格': 'grid',
            '列': 'column',
            '行': 'row',
            '单元格': 'cell',
            '表头': 'header',
            '表尾': 'footer',
            '侧边栏': 'sidebar',
            '导航栏': 'navbar',
            '菜单': 'menu',
            '子菜单': 'submenu',
            '下拉菜单': 'dropdown',
            '弹出菜单': 'popup',
            '上下文菜单': 'context_menu',
            '工具栏': 'toolbar',
            '状态栏': 'statusbar',
            '进度条': 'progressbar',
            '滚动条': 'scrollbar',
            '标签页': 'tab',
            '面板': 'panel',
            '窗口': 'window',
            '对话框': 'dialog',
            '模态框': 'modal',
            '提示框': 'tooltip',
            '警告框': 'alert',
            '确认框': 'confirm',
            '输入框': 'input',
            '文本框': 'textbox',
            '文本域': 'textarea',
            '密码框': 'password',
            '搜索框': 'searchbox',
            '下拉框': 'select',
            '复选框': 'checkbox',
            '单选框': 'radio',
            '开关': 'switch',
            '滑块': 'slider',
            '旋钮': 'knob',
            '按钮': 'button',
            '链接': 'link',
            '图片': 'image',
            '图标': 'icon',
            '视频': 'video',
            '音频': 'audio',
            '文件': 'file',
            '文档': 'document',
            '表格': 'table',
            '列表': 'list',
            '树': 'tree',
            '图表': 'chart',
            '地图': 'map',
            '日历': 'calendar',
            '时钟': 'clock',
            '计时器': 'timer',
            '计数器': 'counter',
            '指示器': 'indicator',
            '标记': 'marker',
            '标签': 'label',
            '徽章': 'badge',
            '标记': 'tag',
            '分隔符': 'separator',
            '分割线': 'divider',
            '占位符': 'placeholder',
            '加载器': 'loader',
            '旋转器': 'spinner',
            '骨架屏': 'skeleton',
            '空状态': 'empty_state',
            '错误页面': 'error_page',
            '404页面': 'not_found_page',
            '500页面': 'server_error_page',
            '维护页面': 'maintenance_page',
            '登录页面': 'login_page',
            '注册页面': 'register_page',
            '个人资料': 'profile',
            '设置页面': 'settings_page',
            '帮助页面': 'help_page',
            '关于页面': 'about_page',
            '联系页面': 'contact_page',
            '隐私政策': 'privacy_policy',
            '服务条款': 'terms_of_service',
            '使用协议': 'user_agreement',
            '免责声明': 'disclaimer',
            '版权声明': 'copyright',
            '许可证': 'license',
            '开源': 'open_source',
            '闭源': 'closed_source',
            '免费': 'free',
            '付费': 'paid',
            '试用': 'trial',
            '演示': 'demo',
            '测试版': 'beta',
            '预览版': 'preview',
            '稳定版': 'stable',
            '发布版': 'release',
            '开发版': 'development',
            '内测版': 'alpha',
            '公测版': 'beta',
            '正式版': 'official',
            '企业版': 'enterprise',
            '专业版': 'professional',
            '标准版': 'standard',
            '基础版': 'basic',
            '高级版': 'advanced',
            '旗舰版': 'flagship',
            '限量版': 'limited_edition',
            '特别版': 'special_edition',
            '纪念版': 'commemorative_edition',
            '收藏版': 'collector_edition',
            '豪华版': 'deluxe_edition',
            '完整版': 'complete_edition',
            '精简版': 'lite_edition',
            '便携版': 'portable_edition',
            '在线版': 'online_edition',
            '离线版': 'offline_edition',
            '桌面版': 'desktop_edition',
            '移动版': 'mobile_edition',
            '网页版': 'web_edition',
            '应用版': 'app_edition',
            '插件版': 'plugin_edition',
            '扩展版': 'extension_edition',
            '模块版': 'module_edition',
            '组件版': 'component_edition',
            '库版': 'library_edition',
            '框架版': 'framework_edition',
            '平台版': 'platform_edition',
            '系统版': 'system_edition',
            '服务版': 'service_edition',
            '云版': 'cloud_edition',
            '本地版': 'local_edition',
            '混合版': 'hybrid_edition',
            '集成版': 'integrated_edition',
            '独立版': 'standalone_edition',
            '嵌入版': 'embedded_edition',
            '定制版': 'customized_edition',
            '通用版': 'universal_edition',
            '专用版': 'dedicated_edition',
            '行业版': 'industry_edition',
            '教育版': 'education_edition',
            '学生版': 'student_edition',
            '教师版': 'teacher_edition',
            '家庭版': 'home_edition',
            '个人版': 'personal_edition',
            '商业版': 'business_edition',
            '企业版': 'enterprise_edition',
            '政府版': 'government_edition',
            '非营利版': 'nonprofit_edition',
            '开源版': 'opensource_edition',
            '社区版': 'community_edition',
            '开发者版': 'developer_edition',
            '设计师版': 'designer_edition',
            '艺术家版': 'artist_edition',
            '音乐家版': 'musician_edition',
            '摄影师版': 'photographer_edition',
            '视频制作版': 'video_editor_edition',
            '游戏版': 'gaming_edition',
            '娱乐版': 'entertainment_edition',
            '办公版': 'office_edition',
            '生产力版': 'productivity_edition',
            '创意版': 'creative_edition',
            '专业版': 'professional_edition',
            '技术版': 'technical_edition',
            '科学版': 'scientific_edition',
            '工程版': 'engineering_edition',
            '医疗版': 'medical_edition',
            '金融版': 'financial_edition',
            '零售版': 'retail_edition',
            '制造版': 'manufacturing_edition',
            '物流版': 'logistics_edition',
            '运输版': 'transportation_edition',
            '旅游版': 'travel_edition',
            '酒店版': 'hotel_edition',
            '餐饮版': 'restaurant_edition',
            '健身版': 'fitness_edition',
            '健康版': 'health_edition',
            '美容版': 'beauty_edition',
            '时尚版': 'fashion_edition',
            '体育版': 'sports_edition',
            '新闻版': 'news_edition',
            '媒体版': 'media_edition',
            '社交版': 'social_edition',
            '通讯版': 'communication_edition',
            '协作版': 'collaboration_edition',
            '项目管理版': 'project_management_edition',
            '客户关系版': 'crm_edition',
            '企业资源版': 'erp_edition',
            '供应链版': 'supply_chain_edition',
            '人力资源版': 'hr_edition',
            '财务版': 'finance_edition',
            '会计版': 'accounting_edition',
            '税务版': 'tax_edition',
            '法律版': 'legal_edition',
            '合规版': 'compliance_edition',
            '审计版': 'audit_edition',
            '风险管理版': 'risk_management_edition',
            '安全版': 'security_edition',
            '监控版': 'monitoring_edition',
            '分析版': 'analytics_edition',
            '商业智能版': 'business_intelligence_edition',
            '数据科学版': 'data_science_edition',
            '机器学习版': 'machine_learning_edition',
            '人工智能版': 'artificial_intelligence_edition',
            '区块链版': 'blockchain_edition',
            '物联网版': 'iot_edition',
            '虚拟现实版': 'vr_edition',
            '增强现实版': 'ar_edition',
            '混合现实版': 'mr_edition',
            '3D版': '3d_edition',
            '2D版': '2d_edition',
            '高清版': 'hd_edition',
            '4K版': '4k_edition',
            '8K版': '8k_edition',
            '超高清版': 'uhd_edition',
            '标清版': 'sd_edition',
            '低清版': 'ld_edition',
            '压缩版': 'compressed_edition',
            '无损版': 'lossless_edition',
            '有损版': 'lossy_edition',
            '原版': 'original_edition',
            '修复版': 'restored_edition',
            '重制版': 'remastered_edition',
            '增强版': 'enhanced_edition',
            '扩展版': 'expanded_edition',
            '完全版': 'complete_edition',
            '终极版': 'ultimate_edition',
            '至尊版': 'supreme_edition',
            '皇家版': 'royal_edition',
            '帝王版': 'imperial_edition',
            '传奇版': 'legendary_edition',
            '史诗版': 'epic_edition',
            '神话版': 'mythical_edition',
            '传说版': 'legendary_edition',
            '经典版': 'classic_edition',
            '复古版': 'retro_edition',
            '怀旧版': 'nostalgic_edition',
            '纪念版': 'memorial_edition',
            '周年版': 'anniversary_edition',
            '庆典版': 'celebration_edition',
            '节日版': 'festival_edition',
            '季节版': 'seasonal_edition',
            '春季版': 'spring_edition',
            '夏季版': 'summer_edition',
            '秋季版': 'autumn_edition',
            '冬季版': 'winter_edition',
            '新年版': 'new_year_edition',
            '圣诞版': 'christmas_edition',
            '情人节版': 'valentine_edition',
            '万圣节版': 'halloween_edition',
            '感恩节版': 'thanksgiving_edition',
            '国庆版': 'national_day_edition',
            '儿童节版': 'children_day_edition',
            '母亲节版': 'mother_day_edition',
            '父亲节版': 'father_day_edition',
            '教师节版': 'teacher_day_edition',
            '劳动节版': 'labor_day_edition',
            '青年节版': 'youth_day_edition',
            '妇女节版': 'women_day_edition',
            '植树节版': 'arbor_day_edition',
            '环保版': 'eco_edition',
            '绿色版': 'green_edition',
            '可持续版': 'sustainable_edition',
            '环境友好版': 'eco_friendly_edition',
            '低碳版': 'low_carbon_edition',
            '节能版': 'energy_saving_edition',
            '高效版': 'efficient_edition',
            '快速版': 'fast_edition',
            '慢速版': 'slow_edition',
            '稳定版': 'stable_edition',
            '测试版': 'test_edition',
            '实验版': 'experimental_edition',
            '原型版': 'prototype_edition',
            '概念版': 'concept_edition',
            '演示版': 'demo_edition',
            '样品版': 'sample_edition',
            '试用版': 'trial_edition',
            '评估版': 'evaluation_edition',
            '预览版': 'preview_edition',
            '早期版': 'early_edition',
            '晚期版': 'late_edition',
            '最新版': 'latest_edition',
            '最旧版': 'oldest_edition',
            '当前版': 'current_edition',
            '历史版': 'historical_edition',
            '未来版': 'future_edition',
            '下一版': 'next_edition',
            '上一版': 'previous_edition',
            '第一版': 'first_edition',
            '最后版': 'last_edition',
            '中间版': 'middle_edition',
            '过渡版': 'transition_edition',
            '桥接版': 'bridge_edition',
            '连接版': 'connection_edition',
            '整合版': 'integration_edition',
            '合并版': 'merge_edition',
            '分离版': 'separate_edition',
            '独立版': 'independent_edition',
            '依赖版': 'dependent_edition',
            '关联版': 'related_edition',
            '相关版': 'relevant_edition',
            '无关版': 'irrelevant_edition',
            '通用版': 'general_edition',
            '特殊版': 'special_edition',
            '普通版': 'ordinary_edition',
            '常规版': 'regular_edition',
            '标准版': 'standard_edition',
            '非标版': 'non_standard_edition',
            '定制版': 'custom_edition',
            '个性化版': 'personalized_edition',
            '通用版': 'universal_edition',
            '全球版': 'global_edition',
            '国际版': 'international_edition',
            '本地版': 'local_edition',
            '区域版': 'regional_edition',
            '国家版': 'national_edition',
            '省份版': 'provincial_edition',
            '城市版': 'city_edition',
            '农村版': 'rural_edition',
            '城镇版': 'town_edition',
            '社区版': 'community_edition',
            '家庭版': 'family_edition',
            '个人版': 'personal_edition',
            '团队版': 'team_edition',
            '组织版': 'organization_edition',
            '机构版': 'institution_edition',
            '公司版': 'company_edition',
            '企业版': 'enterprise_edition',
            '集团版': 'group_edition',
            '联盟版': 'alliance_edition',
            '协会版': 'association_edition',
            '联合会版': 'federation_edition',
            '工会版': 'union_edition',
            '俱乐部版': 'club_edition',
            '社团版': 'society_edition',
            '基金会版': 'foundation_edition',
            '慈善版': 'charity_edition',
            '公益版': 'public_welfare_edition',
            '志愿者版': 'volunteer_edition',
            '义工版': 'volunteer_work_edition',
            '服务版': 'service_edition',
            '支持版': 'support_edition',
            '帮助版': 'help_edition',
            '援助版': 'assistance_edition',
            '救援版': 'rescue_edition',
            '紧急版': 'emergency_edition',
            '危机版': 'crisis_edition',
            '灾难版': 'disaster_edition',
            '恢复版': 'recovery_edition',
            '重建版': 'reconstruction_edition',
            '修复版': 'repair_edition',
            '维护版': 'maintenance_edition',
            '保养版': 'care_edition',
            '清洁版': 'cleaning_edition',
            '整理版': 'organization_edition',
            '优化版': 'optimization_edition',
            '改进版': 'improvement_edition',
            '升级版': 'upgrade_edition',
            '更新版': 'update_edition',
            '修订版': 'revision_edition',
            '校正版': 'correction_edition',
            '纠错版': 'error_correction_edition',
            '调试版': 'debug_edition',
            '测试版': 'test_edition',
            '验证版': 'verification_edition',
            '确认版': 'confirmation_edition',
            '批准版': 'approval_edition',
            '认证版': 'certification_edition',
            '授权版': 'authorization_edition',
            '许可版': 'license_edition',
            '注册版': 'registered_edition',
            '官方版': 'official_edition',
            '非官方版': 'unofficial_edition',
            '第三方版': 'third_party_edition',
            '独立版': 'independent_edition',
            '合作版': 'cooperation_edition',
            '联合版': 'joint_edition',
            '共同版': 'common_edition',
            '共享版': 'shared_edition',
            '开放版': 'open_edition',
            '封闭版': 'closed_edition',
            '私有版': 'private_edition',
            '公共版': 'public_edition',
            '内部版': 'internal_edition',
            '外部版': 'external_edition',
            '内测版': 'internal_test_edition',
            '公测版': 'public_test_edition',
            '封测版': 'closed_test_edition',
            '开测版': 'open_test_edition',
            '限测版': 'limited_test_edition',
            '邀请版': 'invitation_edition',
            '申请版': 'application_edition',
            '注册版': 'registration_edition',
            '会员版': 'member_edition',
            '非会员版': 'non_member_edition',
            '访客版': 'guest_edition',
            '游客版': 'visitor_edition',
            '用户版': 'user_edition',
            '管理员版': 'admin_edition',
            '超级管理员版': 'super_admin_edition',
            '根用户版': 'root_edition',
            '系统版': 'system_edition',
            '应用版': 'application_edition',
            '程序版': 'program_edition',
            '软件版': 'software_edition',
            '硬件版': 'hardware_edition',
            '固件版': 'firmware_edition',
            '驱动版': 'driver_edition',
            '插件版': 'plugin_edition',
            '扩展版': 'extension_edition',
            '模块版': 'module_edition',
            '组件版': 'component_edition',
            '库版': 'library_edition',
            '框架版': 'framework_edition',
            '平台版': 'platform_edition',
            '引擎版': 'engine_edition',
            '核心版': 'core_edition',
            '基础版': 'base_edition',
            '高级版': 'advanced_edition',
            '专业版': 'professional_edition',
            '企业版': 'enterprise_edition',
            '旗舰版': 'flagship_edition',
            '顶级版': 'top_edition',
            '至尊版': 'supreme_edition',
            '豪华版': 'luxury_edition',
            '精品版': 'premium_edition',
            '优质版': 'quality_edition',
            '标准版': 'standard_edition',
            '普通版': 'normal_edition',
            '基本版': 'basic_edition',
            '简化版': 'simplified_edition',
            '精简版': 'streamlined_edition',
            '轻量版': 'lightweight_edition',
            '重量版': 'heavyweight_edition',
            '完整版': 'full_edition',
            '部分版': 'partial_edition',
            '全功能版': 'full_featured_edition',
            '限功能版': 'limited_featured_edition',
            '多功能版': 'multi_functional_edition',
            '单功能版': 'single_functional_edition',
            '综合版': 'comprehensive_edition',
            '专门版': 'specialized_edition',
            '通用版': 'general_purpose_edition',
            '特定版': 'specific_edition',
            '定向版': 'targeted_edition',
            '针对版': 'aimed_edition',
            '面向版': 'oriented_edition',
            '适用版': 'applicable_edition',
            '兼容版': 'compatible_edition',
            '不兼容版': 'incompatible_edition',
            '支持版': 'supported_edition',
            '不支持版': 'unsupported_edition',
            '推荐版': 'recommended_edition',
            '不推荐版': 'not_recommended_edition',
            '建议版': 'suggested_edition',
            '可选版': 'optional_edition',
            '必需版': 'required_edition',
            '强制版': 'mandatory_edition',
            '自愿版': 'voluntary_edition',
            '自动版': 'automatic_edition',
            '手动版': 'manual_edition',
            '智能版': 'intelligent_edition',
            '传统版': 'traditional_edition',
            '现代版': 'modern_edition',
            '古典版': 'classical_edition',
            '时尚版': 'fashionable_edition',
            '流行版': 'popular_edition',
            '热门版': 'hot_edition',
            '冷门版': 'unpopular_edition',
            '主流版': 'mainstream_edition',
            '非主流版': 'non_mainstream_edition',
            '常见版': 'common_edition',
            '罕见版': 'rare_edition',
            '稀有版': 'scarce_edition',
            '珍贵版': 'precious_edition',
            '宝贵版': 'valuable_edition',
            '廉价版': 'cheap_edition',
            '昂贵版': 'expensive_edition',
            '免费版': 'free_edition',
            '付费版': 'paid_edition',
            '收费版': 'charged_edition',
            '订阅版': 'subscription_edition',
            '一次性版': 'one_time_edition',
            '永久版': 'permanent_edition',
            '临时版': 'temporary_edition',
            '短期版': 'short_term_edition',
            '长期版': 'long_term_edition',
            '即时版': 'instant_edition',
            '延迟版': 'delayed_edition',
            '实时版': 'real_time_edition',
            '离线版': 'offline_edition',
            '在线版': 'online_edition',
            '云版': 'cloud_edition',
            '本地版': 'local_edition',
            '远程版': 'remote_edition',
            '分布式版': 'distributed_edition',
            '集中式版': 'centralized_edition',
            '去中心化版': 'decentralized_edition',
            '联邦版': 'federated_edition',
            '混合版': 'hybrid_edition',
            '纯净版': 'pure_edition',
            '混合版': 'mixed_edition',
            '单一版': 'single_edition',
            '多元版': 'multiple_edition',
            '统一版': 'unified_edition',
            '分离版': 'separated_edition',
            '整合版': 'integrated_edition',
            '模块化版': 'modular_edition',
            '单体版': 'monolithic_edition',
            '微服务版': 'microservice_edition',
            '服务化版': 'service_oriented_edition',
            '组件化版': 'component_based_edition',
            '插件化版': 'plugin_based_edition',
            '扩展化版': 'extensible_edition',
            '可配置版': 'configurable_edition',
            '可定制版': 'customizable_edition',
            '可扩展版': 'scalable_edition',
            '可维护版': 'maintainable_edition',
            '可测试版': 'testable_edition',
            '可调试版': 'debuggable_edition'
        };
        
        return pinyinMap[word] || word.toLowerCase().replace(/[^\w]/g, '_');
    }

    /**
     * 生成texts.js配置文件
     */
    async generateTextsFile() {
        const textsConfig = {
            content: {},
            titles: {},
            placeholders: {},
            alts: {},
            labels: {},
            messages: {},
            templates: {}
        };

        // 按类型分组文本
        for (const [text, info] of this.extractedTexts) {
            const category = info.key.split('.')[0];
            const key = info.key.split('.')[1];
            
            if (!textsConfig[category]) {
                textsConfig[category] = {};
            }
            
            textsConfig[category][key] = text;
        }

        // 生成文件内容
        const fileContent = `/**
 * 国际化文本配置
 * 自动生成于 ${new Date().toISOString()}
 */
const TEXTS = ${JSON.stringify(textsConfig, null, 4)};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TEXTS;
} else if (typeof window !== 'undefined') {
    window.TEXTS = TEXTS;
}`;

        // 确保目录存在
        const dir = path.dirname(this.config.output.textsFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // 写入文件
        fs.writeFileSync(this.config.output.textsFile, fileContent, 'utf-8');
    }

    /**
     * 生成提取报告
     */
    async generateReport() {
        const report = {
            summary: {
                totalTexts: this.extractedTexts.size,
                extractionTime: new Date().toISOString(),
                categories: {}
            },
            details: []
        };

        // 统计各类别数量
        for (const [text, info] of this.extractedTexts) {
            const category = info.type;
            if (!report.summary.categories[category]) {
                report.summary.categories[category] = 0;
            }
            report.summary.categories[category]++;

            report.details.push({
                key: info.key,
                text: text,
                type: info.type,
                files: info.files,
                count: info.count
            });
        }

        // 按使用频率排序
        report.details.sort((a, b) => b.count - a.count);

        // 确保目录存在
        const dir = path.dirname(this.config.output.reportFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // 写入报告
        fs.writeFileSync(
            this.config.output.reportFile, 
            JSON.stringify(report, null, 2), 
            'utf-8'
        );
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const extractor = new TextExtractor();
    extractor.extract(process.argv[2] || '.')
        .then(() => {
            console.log('文本提取完成！');
            process.exit(0);
        })
        .catch(error => {
            console.error('提取失败：', error);
            process.exit(1);
        });
}

module.exports = TextExtractor;