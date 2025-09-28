console.log('多语言国际化脚本开始执行');

// 语言包定义
const translations = {
    'zh-CN': {
        'content.____100_usdt': '立即入金100 USDT，开启168小时挑战期，解锁任务系统和收益机会。',
        'content._____100': '立即激活 100 USDT',
        'content.___10_______________': '查看前10名收益排行榜，了解潜在收益机会。',
        'content.activate_account_title': '激活账号',
        'content.earnings_preview': '收益预览',
        'content.______100': '立即激活 100 USDT',
        'content.__currentmastertask__': '所有大神任务已完成',
        'content.168____': '168小时挑战',
        'content.__completedtasks____': '已完成任务：0/3',
        'content.__quizcorrect___': '答题进度：0/20',
        'content.__teammembers__': '团队成员：0人',
        'content._': '收益：',
        'content.__totalearnings__': '0.00',
        'content.__totalearnings____': '0.00 USDT',
        'content.____168___________': '168小时挑战期已结束，您可以再次激活账号继续挑战。',
        'content._______completedtasks__3': '已完成任务：0/3',
        'content._______teammembers__': '团队成员：0人',
        'content.__currenttask_desc__': '完成任务描述',
        'messages.withdraw': '提现',
        'messages.ranking': '排行榜',
        'content.____type____': '类型：任务',
        'content.__bug__': '修复bug',
        'messages.hour': '小时',
        'messages.minute': '分钟',
        'messages.second': '秒',
        'messages.email_invalid': '请输入有效的邮箱地址',
        'messages.password_empty': '密码不能为空',
        'messages.login_or_test_prompt': '请输入邮箱和密码，或直接点击登录使用测试模式',
        'messages.email_format_incorrect': '邮箱格式不正确',
        'messages.login_failed': '登录失败',
        'messages.network_error': '网络连接失败，请检查网络或使用测试模式',
        'messages.register_email_required': '请输入邮箱地址',
        'messages.register_set_password': '请设置密码',
        'messages.invite_required': '邀请码为必填项，请联系推荐人获取',
        'messages.register_failed': '注册失败',
        'messages.email_already_registered': '该邮箱已注册，请直接登录',
        'messages.register_success_email_sent': '注册成功！验证邮件已发送到您的邮箱，请查收并点击验证链接完成注册。',
        'messages.login_success': '登录成功！',
        'messages.offline_login_success': '登录成功（离线模式）！',
        'messages.offline_register_success_redirect': '注册成功（离线模式）！即将跳转首页',
        'content.invite_code_label': '邀请码',
        'messages.email_invalid': '请输入有效的邮箱地址',
        'messages.password_empty': '密码不能为空',
        'messages.login_or_test_prompt': '请输入邮箱和密码，或直接点击登录使用测试模式',
        'messages.email_format_incorrect': '邮箱格式不正确',
        'messages.login_failed': '登录失败',
        'messages.network_error': '网络连接失败，请检查网络或使用测试模式',
        'messages.register_email_required': '请输入邮箱地址',
        'messages.register_set_password': '请设置密码',
        'messages.invite_required': '邀请码为必填项，请联系推荐人获取',
        'messages.register_failed': '注册失败',
        'messages.email_already_registered': '该邮箱已注册，请直接登录',
        'messages.register_success_email_sent': '注册成功！验证邮件已发送到您的邮箱，请查收并点击验证链接完成注册。',
        'messages.login_success': '登录成功！',
        'messages.offline_login_success': '登录成功（离线模式）！',
        'messages.offline_register_success_redirect': '注册成功（离线模式）！即将跳转首页',
        'content.invite_code_label': '邀请码',
        'placeholders.__________________': '请输入您的邀请码',
        'alts.message': '消息',
        'content.______________ta': '点击查看详细任务列表',
        'content.___7_____': '裂金7日挑战',
        'content.___7_____subtitle': '开启你的财富增长之旅',
        'content.email_security_note': '邮箱将用于账户安全验证',
        'content.password_suggestion': '建议使用字母、数字和符号组合',
        'content.login': '登录',
        'content.register': '注册',
        'content.password': '密码',
        'content.email_label': '邮箱地址',
        'content.start_challenge': '开始挑战',
        'content.forgot_password': '忘记密码？',
        'messages.______6___': '密码至少6位',
        'content.___________________': '我们是团队结构游戏，不支持玩家独立注册',
        'content.________________': '注册即表示同意用户协议和隐私政策',
        'content.__________': '点击重新发送验证邮件',
        'placeholders._______': '请输入邮箱',
        'placeholders._____': '请输入密码',
        'placeholders.________6_': '请输入密码（至少6位）',
        'placeholders.______': '请输入邀请码',
        'alts.__7_': '裂金7日',
        'messages.cancel': '取消',
        'content.___edit': '编辑',
        'content.____preview': '预览',
        'content.____deletion': '删除',
        'placeholders.____________': '搜索题目关键词',
        'placeholders.__________': '请输入题目内容',
        'placeholders.option_a': '选项A',
        'placeholders.option_b': '选项B',
        'placeholders.option_c': '选项C',
        'placeholders.option_d': '选项D',
        'placeholders._____________': '答错时的提示信息',
        'content.1____a': '1. 用户A',
        'content._____200': '收益：200',
        'content.2____b': '2. 用户B',
        'content._____150': '收益：150',
        'content.3____c': '3. 用户C',
        'content._____120': '收益：120',
        'messages.grab': '抢红包',
        'messages.all_newbie_tasks_done': '所有新手任务已完成',
        'messages.no_need_newbie_tasks': '无需再执行新手任务。',
        'messages.wallet_title': '我的钱包',
        'messages.current_balance_prefix': '当前余额：',
        'content.___grab': '抢红包',
        'content.progress': '进度',
        'content.__record_username___': '用户记录',
        'content._______________6___': '请输入新密码（至少6位）',
        'placeholders._________6_': '请输入新密码（至少6位）',
        'placeholders.________': '请确认密码',
        'content.________________________': '退出登录将清除所有本地数据，请确认是否继续？',
        'content._______________': '距离大神任务一还需2人',
        'content.____________________________': '请输入您注册时使用的邮箱地址，我们将向您发送密码重置链接。',
        'content.____100': '请转入 100 USDT (TRC20)',
        'content.bug___': '请简要描述遇到的问题',
        'placeholders._______________': '请详细描述您遇到的问题，包括操作步骤和错误现象',
        'placeholders.___usdt_____trc20': '请输入USDT地址（TRC20）',
        'placeholders.__20_usdt': '最低20 USDT',
        'placeholders.___usdt____': '请输入USDT地址',
        // 按钮文本翻译
        'buttons.back': '返回',
        'buttons.confirm': '确定',
        'buttons.cancel': '取消',
        'buttons.copy_address': '复制地址',
        'buttons.copy_link': '复制链接',
        'buttons.copy_code': '复制码',
        'buttons.bind_address': '绑定地址',
        'buttons.withdraw': '提现',
        'buttons.details': '明细',
        'buttons.submit_answer': '提交答案',
        'buttons.complete_transfer': '我已完成转账',
        'buttons.generate_link': '生成/刷新链接',
        'buttons.confirm_withdraw': '确认提现',
        'buttons.confirm_address': '确认地址',
        'buttons.modify_address': '修改地址',
        'buttons.skip_binding': '暂不绑定',
        'buttons.set_default': '设为默认',
        'buttons.all_amount': '全部',
        'buttons.awesome': '太棒了',
        'buttons.login': '登录',
        'buttons.register': '注册',
        'buttons.start_login': '立即登录',
        'buttons.start_register': '立即注册',
        'buttons.activate_100': '立即激活 100 USDT',
        'buttons.view_ranking': '查看排行榜',
        'buttons.mark_complete': '标记完成',
        'buttons.reset_data': '重置数据',
        'buttons.theme_demo': '主题演示',
        'buttons.complete_quiz': '完成全部答题',
        'buttons.send_announcement': '发送随机公告',
        'buttons.set_time': '设置时间',
        'buttons.reset_time': '重置',
        'buttons.submit_report': '📝 提交报告',
        // 底部导航按钮
        'buttons.redpacket': '抢红包',
        'buttons.team': '团队',
        'buttons.wallet': '钱包',
        'buttons.ranking': '排行',
               'nav.reactivate': '再次激活',
        'buttons.test_settings': '🧪 测试设置按钮',
        'buttons.reload_page': '🔄 重新加载页面',
        'messages.security_tip_info': '我们使用加密技术保护您的信息',
        'messages.test_mode_tip': '测试模式：点击即可快速体验',
        'content.__level_count__': '等级：1',
        'content._______member_earnings': '成员收益：0.00',
        'content.____________': '团队管理',
        'content._________': '邀请链接',
        'content.__websocket': '连接WebSocket',
        'content.__ping': '发送Ping',
        'placeholders.__jwt_token': '请输入JWT Token',
        'content.1________': '1. 完成注册',
        'content.2__bug________': '2. 修复bug并获得奖励',
        'content.__bug____': '修复bug奖励',
        'content.3__________': '3. 邀请好友加入',
        'content.4_________': '4. 完成每日任务',
        'content.5_________': '5. 参与社区活动',
        'content.__7______': '裂金7日挑战',
        'content.__5________': '5天收益挑战',
        'content.state': '状态',
        'content.amount': '金额',
        'content.___': '手续费',
        'content.__id': '交易ID',
        'content.time': '时间',
        'content._______': '未找到交易记录。',
        'content._____________': '恭喜您！您的邮箱已成功验证，现在可以正常使用所有功能了。',
        'content.____________________': '验证链接无效或已过期，请重新发送验证邮件。',
        'content.________': '重新发送验证邮件',
        'content._______________________': '没有收到邮件？请检查垃圾邮件文件夹，或者等待几分钟后重试。',
        'content.__': '明细',
        'content.confirm': '确认',
        'content.websocket____': 'WebSocket连接状态',
        'content.__7___': '裂金7日 · 提现',
        'content.amount__usdt_': '提现金额（USDT）',
        'content.all': '全部',
        'content.usdt____': 'USDT地址',
        'content._____': '固定手续费',
        'content._______5__': '比例手续费（5%）',
        'content.___________': '请仔细核对您的收款地址：',
        'content.______': '确认提现',
        'content.______________': '点击下方按钮测试设置功能',
        'content.__________________': '🔄 重新加载页面',
        // 语言切换相关
        'language.switch': '语言',
        'language.chinese': '中文',
        'language.english': 'English',
        'content.state1_label': '状态1',
        'content.state1_subtitle': '新手未入金',
        'content.state2_label': '状态2',
        'content.state2_subtitle': '倒计时进行中',
        'content.state3_label': '状态3',
        'content.state3_subtitle': '倒计时结束未复购',
        'content.current_task_title': '当前任务',
        'content.available_tasks_title': '可接的任务',
        'content.pending': '待完成',
        'content.quiz_task_title': '答题任务',
        'content.reduce_withdraw_fee': '降低提现手续费',
        'content.progress': '进度',
        'content.master_tasks_title': '大神任务',
        'content.countdown_label': '挑战倒计时',
        'content.invite_link_title': '邀请链接',
        'content.my_invite_code_label': '我的专属邀请码',
        'content.quiz_progress': '答题进度',
        'content.team_size_label': '团队规模',
        'content.total_earnings_label': '总收益',
        'content.yield_rate_label': '收益率:',
        'content.daily_avg_label': '日均:',
        'messages.quiz_unlock_needed_task1': '需完成新手任务1解锁',
        'messages.quiz_need_correct_prefix': '需答对',
        'messages.quiz_need_correct_suffix': '题通过',
        'messages.fee_reduced_to_1': '非固定手续费永久降低至1%',
        'messages.need_more_master1_prefix': '距离大神任务一还需',
        'messages.person': '人',
        'messages.master1_reached': '已达成大神任务一条件',
        'messages.invite_more_to_team': '邀请更多好友加入团队',
        'content.my_achievements': '我的战绩',
        'content.newbie_tasks_label': '新手任务',
        'messages.need_complete_prefix': '还需完成',
        'messages.tasks_suffix': '个任务',
        'messages.all_done': '全部完成！',
         // 红包页面
         'content.redpacket_pool_label': '当前红包池总额',
         'content.redpacket_daily_times': '每日红包时间',
         'content.redpacket_last_ranking': '上一期红包排行榜',
         'messages.waiting_redpacket': '等待红包开始',
         'messages.need_activate_account': '需要激活账号',
         'messages.redpacket_need_activation_desc1': '只有激活账号的用户才能参与抢红包活动',
         'messages.redpacket_need_activation_desc2': '立即激活，开启您的财富之旅！',
         'messages.activate_to_join': '激活账号参与',
         'messages.redpacket_running': '红包进行中',
         'messages.already_grabbed': '已抢过本轮',
         'messages.grab_now': '立即抢红包',
         'messages.ended': '已结束',
         'messages.not_started': '未开始',
          // 团队页面
          'content.team_title': '我的团队',
                'content.performance_card_title': '战绩卡',
                'content.team_overview_desc': '查看七层团队结构和人数。',
                'content.period_earnings_label': '本期收益',
          'content.team_total_members': '团队总人数',
          'content.team_direct_members': '直推人数',
          'content.team_earnings': '团队收益',
           'content.my_invite_link_title': '我的邀请链接',
             'content.generating': '生成中...',
             'content.team_levels_title': '团队层级',
             'messages.no_team_members': '暂无团队成员',
             // 钱包页面
              'content.wallet_title': '我的钱包',
              'content.current_balance_label': '当前余额',
              'content.wallet_address_label': '钱包地址',
              'content.transaction_records_label': '交易记录',
              'messages.wallet_unbound': '未绑定钱包地址',
              'messages.bind_wallet_address_title': '绑定钱包地址',
              'messages.no_transactions': '暂无交易记录',
              'content.activation_fee_label': '激活缴费',
              'content.task_reward_label': '任务奖励',
              'content.red_income_label': '红包收入',
              // 提现页面
              'messages.withdrawable_balance': '可提现余额',
              'messages.withdraw_amount_title': '提现金额',
              'messages.recipient_address_title': '收款地址',
              'messages.fee_details_title': '费用明细',
              'messages.withdraw_amount_label': '提现金额',
              'messages.actual_deduct_label': '实际扣除',
              'messages.withdraw_min_limit_error': '提现金额不能少于20 USDT',
              'messages.insufficient_balance_error': '余额不足，需要',
              'messages.invalid_wallet_address': '请输入有效的钱包地址',
              'messages.quiz_not_started': '未开始答题',
              'messages.quiz_answered_prefix': '已答对',
              'messages.quiz_questions_suffix': '题',
              'messages.quiz_min_reached': '，已达最低',
              'messages.percentage_fee_label': '比例手续费',
              'messages.quiz_reduce_fee_button': '答题降费',
               'content.quiz_tasks_title': '答题任务',
               'messages.team_members': '团队人数',
               'messages.redpacket_income': '红包收入',
               'messages.master_level': '大神等级',
            'content.task1_title': '直接推荐1人',
        'content.task1_desc': '邀请1位好友注册并激活账号',
        'content.task2_title': 'assisted下级推荐1人',
        'content.task2_desc': '指导你的下级成功邀请1位新用户',
        'content.task3_title': '教下级如何教他的下级推荐1人',
        'content.task3_desc': '培训下级的推广技巧，帮助三级推广'
    },
    'en-US': {
        'content.____100_usdt': 'Deposit 100 USDT immediately to start the 168-hour challenge period and unlock the task system and earning opportunities.',
        'content._____100': 'Activate 100 USDT Now',
        'content.___10_______________': 'View the top 10 earnings leaderboard to understand potential earning opportunities.',
        'content.activate_account_title': 'Activate Account',
        'content.earnings_preview': 'Earnings Preview',
        'content.______100': 'Activate 100 USDT Now',
        'content.__currentmastertask__': 'All master tasks completed',
        'content.168____': '168-Hour Challenge',
        'content.__completedtasks____': 'Completed Tasks: 0/3',
        'content.__quizcorrect___': 'Quiz Progress: 0/20',
        'content.__teammembers__': 'Team Members: 0',
        'content._': 'Earnings:',
        'content.__totalearnings__': '0.00',
        'content.__totalearnings____': '0.00 USDT',
        'content.____168___________': 'The 168-hour challenge period has ended. You can reactivate your account to continue the challenge.',
        'content._______completedtasks__3': 'Completed Tasks: 0/3',
        'content._______teammembers__': 'Team Members: 0',
        'content.__currenttask_desc__': 'Complete task description',
        'messages.withdraw': 'Withdraw',
        'messages.ranking': 'Ranking',
        'content.____type____': 'Type: Task',
        'content.__bug__': 'Fix Bug',
        'messages.hour': 'Hour',
        'messages.minute': 'Minute',
        'messages.second': 'Second',
        'messages.email_invalid': 'Please enter a valid email address',
        'messages.password_empty': 'Password cannot be empty',
        'messages.login_or_test_prompt': 'Please enter email and password, or click Login to use test mode',
        'messages.email_format_incorrect': 'Email format is incorrect',
        'messages.login_failed': 'Login failed',
        'messages.network_error': 'Network connection failed, please check your network or use test mode',
        'messages.register_email_required': 'Please enter email address',
        'messages.register_set_password': 'Please set a password',
        'messages.invite_required': 'Invitation code is required, please contact your referrer',
        'messages.register_failed': 'Registration failed',
        'messages.email_already_registered': 'This email is already registered, please login directly',
        'messages.register_success_email_sent': 'Registration successful! A verification email has been sent to your inbox. Please check and click the link to complete registration.',
        'messages.login_success': 'Login successful!',
        'messages.offline_login_success': 'Login successful (offline mode)!',
        'messages.offline_register_success_redirect': 'Registration successful (offline mode)! Redirecting to home...',
        'content.invite_code_label': 'Invitation Code',
        'placeholders.__________________': 'Please enter your invitation code',
        'alts.message': 'Message',
        'content.______________ta': 'Click to view detailed task list',
        'content.___7_____': 'Gold Rush 7-Day Challenge',
        'content.___7_____subtitle': 'Start your wealth growth journey',
        'content.email_security_note': 'Email will be used for account security verification',
        'content.password_suggestion': 'Use a mix of letters, numbers, and symbols',
        'content.login': 'Login',
        'content.register': 'Register',
        'content.password': 'Password',
        'content.email_label': 'Email Address',
        'content.start_challenge': 'Start Challenge',
        'content.forgot_password': 'Forgot Password?',
        'messages.______6___': 'Password must be at least 6 characters',
        'content.___________________': 'We are a team structure game and do not support independent player registration',
        'content.________________': 'Registration indicates agreement to the user agreement and privacy policy',
        'content.__________': 'Click to resend verification email',
        'placeholders._______': 'Enter email',
        'placeholders._____': 'Enter password',
        'placeholders.________6_': 'Enter password (at least 6 characters)',
        'placeholders.______': 'Enter invitation code',
        'alts.__7_': 'Gold Rush 7-Day',
        'messages.cancel': 'Cancel',
        'content.___edit': 'Edit',
        'content.____preview': 'Preview',
        'content.____deletion': 'Delete',
        'placeholders.____________': 'Search question keywords',
        'placeholders.__________': 'Please enter question content',
        'placeholders.option_a': 'Option A',
        'placeholders.option_b': 'Option B',
        'placeholders.option_c': 'Option C',
        'placeholders.option_d': 'Option D',
        'placeholders._____________': 'Hint message for wrong answers',
        'content.1____a': '1. User A',
        'content._____200': 'Earnings: 200',
        'content.2____b': '2. User B',
        'content._____150': 'Earnings: 150',
        'content.3____c': '3. User C',
        'content._____120': 'Earnings: 120',
        'messages.grab': 'Grab',
        'messages.all_newbie_tasks_done': 'All newbie tasks are completed',
        'messages.no_need_newbie_tasks': 'No need to perform newbie tasks.',
        'messages.wallet_title': 'My Wallet',
        'messages.current_balance_prefix': 'Current Balance: ',
        'content.___grab': 'Grab Red Packet',
        'content.progress': 'Progress',
        'content.__record_username___': 'User Record',
        'content._______________6___': 'Enter new password (at least 6 characters)',
        'placeholders._________6_': 'Enter new password (at least 6 characters)',
        'placeholders.________': 'Confirm password',
        'content.________________________': 'Logging out will clear all local data. Are you sure you want to continue?',
        'content._______________': '2 more people needed for Master Task 1',
        'content.____________________________': 'Please enter the email address you used for registration, and we will send you a password reset link.',
        'content.____100': 'Transfer 100 USDT (TRC20)',
        'content.bug___': 'Please briefly describe the problem',
        'placeholders._______________': 'Please describe the problem in detail, including operation steps and error phenomena',
        'placeholders.___usdt_____trc20': 'Enter USDT address (TRC20)',
        'placeholders.__20_usdt': 'Minimum 20 USDT',
        'placeholders.___usdt____': 'Enter USDT address',
        // Button text translations
        'buttons.back': 'Back',
        'buttons.confirm': 'Confirm',
        'buttons.cancel': 'Cancel',
        'buttons.copy_address': 'Copy Address',
        'buttons.copy_link': 'Copy Link',
        'buttons.copy_code': 'Copy Code',
        'buttons.bind_address': 'Bind Address',
        'buttons.withdraw': 'Withdraw',
        'buttons.details': 'Details',
        'buttons.submit_answer': 'Submit Answer',
        'buttons.complete_transfer': 'Transfer Completed',
        'buttons.generate_link': 'Generate/Refresh Link',
        'buttons.confirm_withdraw': 'Confirm Withdrawal',
        'buttons.confirm_address': 'Confirm Address',
        'buttons.modify_address': 'Modify Address',
        'buttons.skip_binding': 'Skip Binding',
        'buttons.set_default': 'Set as Default',
        'buttons.all_amount': 'All',
        'buttons.awesome': 'Awesome',
        'buttons.login': 'Login',
        'buttons.register': 'Register',
        'buttons.start_login': 'Login Now',
        'buttons.start_register': 'Register Now',
        'buttons.activate_100': 'Activate 100 USDT Now',
        'buttons.view_ranking': 'View Ranking',
        'buttons.mark_complete': 'Mark Complete',
        'buttons.reset_data': 'Reset Data',
        'buttons.theme_demo': 'Theme Demo',
        'buttons.complete_quiz': 'Complete All Quiz',
        'buttons.send_announcement': 'Send Random Announcement',
        'buttons.set_time': 'Set Time',
        'buttons.reset_time': 'Reset',
        'buttons.submit_report': '📝 Submit Report',
        // Bottom nav buttons
        'buttons.redpacket': 'Grab',
        'buttons.team': 'Team',
        'buttons.wallet': 'Wallet',
        'buttons.ranking': 'Ranking',
                'nav.reactivate': 'Reactivate',
        'buttons.test_settings': '🧪 Test Settings Button',
        'buttons.reload_page': '🔄 Reload Page',
                 'messages.security_tip_info': 'We use encryption to protect your information',
                 'messages.test_mode_tip': 'Test mode: click to experience quickly',
        'content.__level_count__': 'Level: 1',
        'content._______member_earnings': 'Member Earnings: 0.00',
        'content.____________': 'Team Management',
        'content._________': 'Invitation Link',
        'content.__websocket': 'Connect WebSocket',
        'content.__ping': 'Send Ping',
        'placeholders.__jwt_token': 'Enter JWT Token',
        'content.1________': '1. Complete Registration',
        'content.2__bug________': '2. Fix bugs and get rewards',
        'content.__bug____': 'Bug Fix Reward',
        'content.3__________': '3. Invite friends to join',
        'content.4_________': '4. Complete daily tasks',
        'content.5_________': '5. Participate in community activities',
        'content.__7______': 'Gold Rush 7-Day Challenge',
        'content.__5________': '5-Day Earnings Challenge',
        'content.state': 'Status',
        'content.amount': 'Amount',
        'content.___': 'Fee',
        'content.__id': 'Transaction ID',
        'content.time': 'Time',
        'content._______': 'No transaction records found.',
        'content._____________': 'Congratulations! Your email has been successfully verified and you can now use all features normally.',
        'content.____________________': 'The verification link is invalid or has expired. Please resend the verification email.',
        'content.________': 'Resend Verification Email',
        'content._______________________': 'Didn\'t receive the email? Please check your spam folder or wait a few minutes and try again.',
        'content.__': 'Details',
        'content.confirm': 'Confirm',
        'content.websocket____': 'WebSocket Connection Status',
        'content.__7___': 'Gold Rush 7-Day · Withdraw',
        'content.amount__usdt_': 'Withdrawal Amount (USDT)',
        'content.all': 'All',
        'content.usdt____': 'USDT Address',
        'content._____': 'Fixed Fee',
        'content._______5__': 'Percentage Fee (5%)',
        'content.___________': 'Please carefully verify your receiving address:',
        'content.______': 'Confirm Withdrawal',
        'content.______________': 'Click the button below to test settings',
        'content.__________________': '🔄 Reload Page',
        // Language switching related
        'language.switch': 'Language',
        'language.chinese': '中文',
        'language.english': 'English',
        'content.state1_label': 'State 1',
        'content.state1_subtitle': 'Newbie not funded',
        'content.state2_label': 'State 2',
        'content.state2_subtitle': '168-hour countdown running',
        'content.state3_label': 'State 3',
        'content.state3_subtitle': 'Countdown ended, not repurchased',
        'content.current_task_title': 'Current Task',
        'content.available_tasks_title': 'Available Tasks',
        'content.pending': 'Pending',
        'content.quiz_task_title': 'Quiz Task',
        'content.reduce_withdraw_fee': 'Reduce withdrawal fee',
        'content.progress': 'Progress',
        'content.master_tasks_title': 'Master Tasks',
        'content.countdown_label': 'Challenge Countdown',
        'content.invite_link_title': 'Invite Link',
        'content.my_invite_code_label': 'My Exclusive Invite Code',
        'content.quiz_progress': 'Quiz Progress',
        'content.team_size_label': 'Team Size',
        'content.total_earnings_label': 'Total Earnings',
        'content.yield_rate_label': 'Yield:',
        'content.daily_avg_label': 'Daily Avg:',
        'messages.quiz_unlock_needed_task1': 'Need to complete Newbie Task 1 to unlock',
        'messages.quiz_need_correct_prefix': 'Need to answer correctly',
        'messages.quiz_need_correct_suffix': 'questions to pass',
        'messages.fee_reduced_to_1': 'Fixed fee reduced permanently to 1%',
        'messages.need_more_master1_prefix': 'Need',
        'messages.person': 'person(s)',
        'messages.master1_reached': 'Master Task 1 condition reached',
        'messages.invite_more_to_team': 'Invite more friends to join the team',
        'content.my_achievements': 'My Achievements',
        'content.newbie_tasks_label': 'Newbie Tasks',
        'messages.need_complete_prefix': 'Need to complete',
        'messages.tasks_suffix': 'task(s)',
        'messages.all_done': 'All done!',
         // Redpacket page
         'content.redpacket_pool_label': 'Current Pool Total',
         'content.redpacket_daily_times': 'Daily Red Packet Times',
         'content.redpacket_last_ranking': 'Last Round Ranking',
         'messages.waiting_redpacket': 'Waiting for red packet',
         'messages.need_activate_account': 'Activation required',
         'messages.redpacket_need_activation_desc1': 'Only activated accounts can participate in red packet events',
         'messages.redpacket_need_activation_desc2': 'Activate now to start your wealth journey!',
         'messages.activate_to_join': 'Activate to participate',
         'messages.redpacket_running': 'Red packet ongoing',
         'messages.already_grabbed': 'Already grabbed this round',
         'messages.grab_now': 'Grab Now',
         'messages.ended': 'Ended',
         'messages.not_started': 'Not started',
          // Team page
          'content.team_title': 'My Team',
                  'content.performance_card_title': 'Performance Card',
                  'content.team_overview_desc': 'View seven-layer team structure and member counts.',
                  'content.period_earnings_label': 'Period Earnings',
          'content.team_total_members': 'Total Team Members',
          'content.team_direct_members': 'Direct Referrals',
          'content.team_earnings': 'Team Earnings',
           'content.my_invite_link_title': 'My Invite Link',
             'content.generating': 'Generating...',
             'content.team_levels_title': 'Team Levels',
             'messages.no_team_members': 'No team members yet',
             // Wallet page
             'content.wallet_title': 'My Wallet',
             'content.current_balance_label': 'Current Balance',
             'content.wallet_address_label': 'Wallet Address',
             'content.transaction_records_label': 'Transaction Records',
             'messages.wallet_unbound': 'Wallet address not bound',
             'messages.bind_wallet_address_title': 'Bind Wallet Address',
             'messages.no_transactions': 'No transactions',
             'content.activation_fee_label': 'Activation Fee',
             'content.task_reward_label': 'Task Reward',
             'content.red_income_label': 'Red Packet Income',
              // Withdraw page
              'messages.withdrawable_balance': 'Withdrawable Balance',
              'messages.withdraw_amount_title': 'Withdrawal Amount',
              'messages.recipient_address_title': 'Recipient Address',
              'messages.fee_details_title': 'Fee Details',
              'messages.withdraw_amount_label': 'Withdrawal Amount',
              'messages.actual_deduct_label': 'Total Deducted',
              'messages.withdraw_min_limit_error': 'Withdrawal amount cannot be less than 20 USDT',
              'messages.insufficient_balance_error': 'Insufficient balance, need',
              'messages.invalid_wallet_address': 'Please enter a valid wallet address',
              'messages.quiz_not_started': 'Not started',
              'messages.quiz_answered_prefix': 'Answered ',
              'messages.quiz_questions_suffix': ' questions',
              'messages.quiz_min_reached': ', minimum reached',
              'messages.percentage_fee_label': 'Percentage Fee',
              'messages.quiz_reduce_fee_button': 'Reduce Fee by Quiz',
              'content.quiz_tasks_title': 'Quiz Tasks',
              'messages.team_members': 'Team Members',
              'messages.redpacket_income': 'Red Packet Income',
              'messages.master_level': 'Master Level',
            'content.task1_title': 'Directly refer 1 person',
        'content.task1_desc': 'Invite one friend to register and activate the account',
        'content.task2_title': 'Help your downline refer 1 person',
        'content.task2_desc': 'Guide your downline to successfully invite a new user',
        'content.task3_title': 'Teach downline how to teach their downline to refer 1 person',
        'content.task3_desc': 'Train promotion skills for multi-level referrals'
    }
};

// 获取当前语言
function getCurrentLanguage() {
    return localStorage.getItem('preferred-language') || 'zh-CN';
}

// 设置语言
function setLanguage(lang) {
    console.log('设置语言为:', lang);
    // 统一两个存储键，避免页面内部使用不同键导致不一致
    localStorage.setItem('preferred-language', lang);
    localStorage.setItem('language', lang);
    
    // 更新切换器按钮状态
    updateSwitcherButtons();
    
    // 广播语言变更事件，供页面逻辑（如状态渲染）监听（可选）
    document.dispatchEvent(new CustomEvent('language-changed', { detail: { lang } }));
    
    // 基于缓存进行一次替换（无闪烁）
    replaceTemplates();
    
    // 若页面使用动态注入内容，安排一次延迟替换
    if (typeof scheduleReplace === 'function') {
      scheduleReplace();
    }
}

// 获取翻译文本
function getTranslation(key, lang = null) {
    const currentLang = lang || getCurrentLanguage();
    return translations[currentLang] && translations[currentLang][key] || key;
}

// 通用：需要处理的属性列表
const TEMPLATE_ATTRS = ['placeholder', 'title', 'alt', 'value'];

// 文本节点缓存（WeakMap 不影响 GC）
const TEXT_NODE = 3;
const __i18nTextCache = new WeakMap();

// 通用：基于翻译表替换 {{key}} 模板
function replaceTokens(src, translations) {
    if (!src || typeof src !== 'string') return src;
    return src.replace(/\{\{([^}]+)\}\}/g, (m, key) => (translations[key] ?? m));
}

// 首次运行时缓存原始模板：文本节点与属性
function cacheTemplates() {
    // 缓存文本节点原始内容
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
        const txt = node.textContent;
        if (txt && txt.includes('{{')) {
            __i18nTextCache.set(node, txt);
        }
    }
    // 缓存属性中的原始模板值
    const all = document.querySelectorAll('*');
    all.forEach(el => {
        TEMPLATE_ATTRS.forEach(attr => {
            const val = el.getAttribute(attr);
            if (val && val.includes('{{')) {
                el.dataset[`i18n_${attr}`] = val;
            }
        });
    });
}

// 替换模板（支持缓存与动态回退），避免刷新且不破坏事件绑定
function replaceTemplates() {
    const currentLang = getCurrentLanguage();
    const dict = translations[currentLang] || translations['zh-CN'];
    console.log('当前语言:', currentLang, '开始替换模板...');

    // 文本节点：优先使用缓存，若无缓存则直接基于现有文本回退替换
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
        const cached = __i18nTextCache.get(node);
        const sourceText = cached ?? node.textContent;
        if (sourceText && sourceText.includes('{{')) {
            const out = replaceTokens(sourceText, dict);
            if (out !== node.textContent) {
                node.textContent = out;
            }
        }
    }

    // 属性：优先使用缓存原值，若无缓存则直接基于现有属性值回退替换
    const all = document.querySelectorAll('*');
    all.forEach(el => {
        TEMPLATE_ATTRS.forEach(attr => {
            const dataKey = `i18n_${attr}`;
            const srcAttr = el.dataset[dataKey] ?? el.getAttribute(attr);
            if (srcAttr && srcAttr.includes('{{')) {
                const outAttr = replaceTokens(srcAttr, dict);
                if (outAttr !== el.getAttribute(attr)) {
                    el.setAttribute(attr, outAttr);
                    if (attr === 'placeholder' && el.tagName === 'INPUT') {
                        el.placeholder = outAttr;
                    }
                }
            }
        });
    });

    console.log('模板替换完成');
}

// 监听后续DOM变化（如动态注入卡片内容），自动调度替换
let __i18nReplaceTimer = null;
function scheduleReplace() {
    if (__i18nReplaceTimer) clearTimeout(__i18nReplaceTimer);
    __i18nReplaceTimer = setTimeout(() => {
        replaceTemplates();
    }, 80);
}

// 创建语言切换器
function createLanguageSwitcher() {
                // 若全局语言按钮已存在，则不再创建内部切换器
                if (document.querySelector('.global-lang-switch')) return;
                // 检查是否已存在语言切换器
                if (document.getElementById('language-switcher')) {
        return;
    }
    
    const switcher = document.createElement('div');
    switcher.id = 'language-switcher';
    switcher.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 8px;
        padding: 8px;
        display: flex;
        gap: 8px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    const currentLang = getCurrentLanguage();
    
    // 中文按钮
    const zhBtn = document.createElement('button');
    zhBtn.textContent = '中文';
    zhBtn.id = 'zh-btn';
    zhBtn.style.cssText = `
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        background: ${currentLang === 'zh-CN' ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
        color: white;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
    `;
    zhBtn.onclick = () => {
        console.log('切换到中文');
        setLanguage('zh-CN');
        updateSwitcherButtons();
    };
    
    // 英文按钮
    const enBtn = document.createElement('button');
    enBtn.textContent = 'EN';
    enBtn.id = 'en-btn';
    enBtn.style.cssText = `
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        background: ${currentLang === 'en-US' ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
        color: white;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
    `;
    enBtn.onclick = () => {
        console.log('切换到英文');
        setLanguage('en-US');
        updateSwitcherButtons();
    };
    
    switcher.appendChild(zhBtn);
    switcher.appendChild(enBtn);
    document.body.appendChild(switcher);
}

// 更新按钮状态（移到外部作为独立函数）
function updateSwitcherButtons() {
    const currentLang = getCurrentLanguage();
    const zhBtn = document.getElementById('zh-btn');
    const enBtn = document.getElementById('en-btn');
    
    if (zhBtn && enBtn) {
        zhBtn.style.background = currentLang === 'zh-CN' ? 'rgba(255, 255, 255, 0.2)' : 'transparent';
        enBtn.style.background = currentLang === 'en-US' ? 'rgba(255, 255, 255, 0.2)' : 'transparent';
        console.log('按钮状态已更新，当前语言:', currentLang);
    }
}

// 初始化
function init() {
    console.log('多语言国际化系统初始化...');
    
    // 清理任何遗留的内部语言切换器，统一只保留右上角全局按钮
    const legacySwitcher = document.getElementById('language-switcher');
    if (legacySwitcher) legacySwitcher.remove();

    // 语言切换器已统一为右上角全局按钮，不再创建内部切换器
            // createLanguageSwitcher();

    // 缓存模板源（只做一次）
    cacheTemplates();
    
    // 首次替换
    replaceTemplates();
    
    // 设置标题文本
    const titleEl = document.querySelector('title');
    if (titleEl) {
      const dict = translations[getCurrentLanguage()] || translations['zh-CN'];
      const src = 'Gold7 · H5';
      titleEl.textContent = replaceTokens(src, dict);
    }
    
    // 监听后续DOM变更（插入状态卡片等），自动替换
    const mo = new MutationObserver(scheduleReplace);
    mo.observe(document.body, { childList: true, subtree: true });

    // 防御型处理：若后续脚本或异步逻辑再次插入内部切换器，则立即移除
    const langMo = new MutationObserver(() => {
        const lateLegacy = document.getElementById('language-switcher');
        if (lateLegacy) lateLegacy.remove();
    });
    langMo.observe(document.body, { childList: true, subtree: true });
}

// DOM加载完成后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 页面加载完成后再次执行，确保动态内容也被替换
window.addEventListener('load', function() {
    setTimeout(replaceTemplates, 100);
});

// 暴露全局函数
window.setLanguage = setLanguage;
window.getCurrentLanguage = getCurrentLanguage;
window.getTranslation = getTranslation;
window.replaceTemplates = replaceTemplates;