// src/i18n/config.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    // Add to your resources in config.js
  en: {
    translation: {
      // Navigation & Common
      navigation: {
        home: 'Home',
        login: 'Log In',
        signup: 'Sign Up',
        contactUs: 'Contact Us',
        logout: 'Log Out',
        backToHome: 'Back to Home',
        viewDetails: 'View Details',
        viewFloorPlan: 'View Floor Plan'
      },

    dashboard: {
        welcome: 'Welcome, ',
        title: 'Designer Dashboard',
        createRequest: {
          title: 'Create Design Request (per room)',
          description: 'Start a new design project by submitting your requirements'
        },
        support: {
          title: 'Contact Support',
          description: 'Get help with your design projects or account'
        },
        subscription: {
          title: 'Subscription Status',
          active: 'Active subscription: {plan}',
          noActive: 'No active subscription',
          subscribe: 'Subscribe Now'
        },
        designRequests: {
          title: 'Your Design Requests',
          empty: 'No design requests found. Create your first one!',
          table: {
            projectId: 'Project ID',
            status: 'Status',
            rooms: 'Rooms',
            floorPlan: 'Floor Plan',
            submitted: 'Submitted',
            lastUpdated: 'Last Updated',
            actions: 'Actions'
          },
          status: {
            pending: 'Pending',
            inProgress: 'In Progress',
            completed: 'Completed'
          }
        },
        actions: {
          logout: 'log out',
          viewDetails: 'View project Details'
        }
    },

        createDesign: {
    steps: {
         roomTagging: {
    title: 'Tag Rooms on Floor Plan',
    description: 'Click on your floor plan to mark each room location',
    noFloorPlan: 'No floor plan found. Please go back and upload a floor plan.',
         },
      designType: {
        title: 'What type of design service do you need?',
        description: 'Choose between virtual staging or remodeling design',
        options: {
          virtualStaging: {
            title: 'Virtual Staging',
            description: 'Transform empty spaces with virtual furniture and decor for real estate listings'
          },
          remodeling: {
            title: 'Remodeling Design',
            description: 'Get professional design plans for remodeling your existing space'
          }
        }
      },
      floorPlan: {
        title: 'Do you have an existing floor plan?',
        description: 'Let us know if you have a floor plan we can reference',
        options: {
          yes: {
            title: 'Yes, I have a floor plan',
            description: 'I can provide an existing floor plan of my space'
          },
          no: {
            title: 'No, I need help creating one',
            description: 'Request assistance from our team to create a floor plan'
          }
        }
      },
      roomDetails: {
        title: 'Room Details',
        description: 'Provide specific details for each room',
        styleLabel: 'Style Preference',
        colorLabel: 'Color Scheme',
        requirements: 'Specific Requirements',
        dimensions: {
          title: 'Room Dimensions',
          length: 'Length (ft)',
          width: 'Width (ft)',
          height: 'Height (ft)',
          squareFootage: 'Square Footage'
        }
      },
      pricing: {
        title: 'Review Design Pricing',
        description: 'Review the estimated cost for your design project',
        breakdown: {
          title: 'Project Cost Breakdown',
          squareFootageRate: '{size} sq ft × ${rate}/sq ft',
          totalCost: 'Total Project Cost',
          totalArea: 'Total Area: {size} sq ft',
          deposit: {
            title: 'Required Deposit (60%)',
            description: 'Due to start your project'
          },
          remaining: {
            title: 'Remaining Balance (40%)',
            description: 'Due upon design completion'
          }
        },
        actions: {
          payDeposit: 'Pay Deposit and Start Project',
          saveLater: 'Save Project and Pay Later'
        },
        notes: {
          title: 'Important Notes:',
          items: [
            'Pricing is calculated based on room square footage',
            'Current rate: $1.00 per square foot',
            '60% deposit is required to begin the project',
            'Remaining 40% will be due upon design completion',
            'You can save your project now and pay the deposit later',
            'Design work will not begin until the deposit is paid'
          ]
        }
      }
    },
    roomForm: {
      title: 'Room Details',
      removeRoom: 'Remove Room',
      addRoom: 'Add Another Room',
      upload: {
        current: 'Current Room Photos',
        currentDesc: 'Upload photos showing how the room currently looks',
        inspiration: 'Inspiration Photos',
        inspirationDesc: 'Upload photos of designs you\'d like to incorporate'
      }
    },
    floorplan: {
        current: 'Upload your current floor plans',
        currentDesc: 'pdf or image'
    },
    navigation: {
      back: 'Back',
      next: 'Next',
      saving: 'Saving...',
      lastSaved: 'Last saved: {time}',
      progress: 'Step {current} of {total}'
    }
  },

      designerProjectDetails: {
  loading: 'Loading...',
  notFound: {
    title: 'Project not found'
  },
  navigation: {
    backToDashboard: '← Back to Dashboard'
  },
  header: {
    projectId: 'Project #{id}',
    status: 'Status: ',
    client: 'Client: ',
    created: 'Created: '
  },
  floorPlans: {
    title: 'Floor Plans',
    tabs: {
      original: 'Original Floor Plan',
      tagged: 'Tagged Floor Plan',
      designer: 'Designer Floor Plan'
    },
    upload: {
      title: 'Upload New Floor Plan',
      uploading: 'Uploading...'
    }
  },
  rooms: {
    dimensions: {
      title: 'Dimensions',
      squareFootage: 'Square Footage: {value} sq ft',
      dimensions: "Dimensions: {length}' × {width}'",
      height: "Height: {value}'"
    },
    designPreferences: {
      title: 'Design Preferences',
      style: 'Style: ',
      description: 'Description: '
    },
    photos: {
      currentRoom: {
        title: 'Current Room Photos'
      },
      inspiration: {
        title: 'Inspiration Photos'
      }
    }
  }
},

      // Common Messages
      common: {
        loading: 'Loading...'
      },

      // Error Messages
      errors: {
        fetchProjectsFailed: 'Failed to fetch projects',
        loadProjectsFailed: 'Failed to load assigned projects',
        assignFailed: 'Failed to assign designer'
      },

      // Hero Section
      hero: {
        title: 'Your personal design team',
        subtitle: "Let our professional designers bring your clients' visions to life",
        viewDesigns: 'View Designs Services',
        viewDesignsService: 'View Design Styles',
        viewDesignsStyle: 'View Design'
      },

      // Login Page
      login: {
        title: 'Login to Pencil Dogs',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        submitButton: 'Login',
        error: 'An error occurred during login. Please try again.',
        'Invalid login id or password.': 'Invalid login id or password.'
      },

      // Signup Page
      signup: {
        title: 'Create a Pencil Dogs Account',
        Realtor: 'Realtor',
        Brokerage: 'Brokerage',
        Supplier: 'Supplier',
        Designer: 'Designer',
        'General Contractor': 'General Contractor',
        Other: 'Other',
        next: 'Next',
        selectOcc: 'Select your occupation',
        enterContact: 'Enter your contact information:',
        phoneField: 'Phone Number',
        fNameField: 'First Name',
        lNameField: 'Last Name',
        emailField: 'Email',
        confEmailField: 'Confirm Email',
        pwField: 'Password',
        confPwField: 'Confirm Password',
        optionalField: 'Optional',

        emailNoMatch: "Emails don't match",
        pwNoMatch: "Passwords don't match",

        'This email is already registered.': 'This email is already registered.',

        fieldReq: 'This is a required field.',
        fieldInvalid: 'Please provide a valid ',

        formSubmit: 'Submit',

        thanks: 'Thank you for signing up.',
        goLogin: 'Login Here',
        goHome: 'Return Home',
      },

      // Designer Dashboard
      designerDashboard: {
        title: 'Designer Dashboard',
        stats: {
          totalProjects: 'Total Projects',
          activeProjects: 'Active Projects',
          completedProjects: 'Completed Projects'
        },
        projectTable: {
          title: 'Assigned Projects',
          headers: {
            projectName: 'Project Name',
            client: 'Client',
            status: 'Status',
            created: 'Created',
            lastModified: 'Last Modified',
            actions: 'Actions'
          },
          status: {
            completed: 'Completed',
            inProgress: 'In Progress'
          }
        }
      },


      // Project Details
      projectDetails: {
        loading: 'Loading...',
        notFound: {
          title: 'Project not found'
        },
        navigation: {
          backToDashboard: '← Back to Dashboard'
        },
        title: 'Project',
        status: 'Status: ',
        created: 'Created: ',
        floorPlans: {
          title: 'Floor Plans',
          tabs: {
            yourFloorPlan: 'Your Floor Plan',
            taggedFloorPlan: 'Tagged Floor Plan',
            designerFloorPlan: "Designer's Floor Plan"
          }
        },
        rooms: {
          dimensions: {
            title: 'Dimensions',
            squareFootage: 'Square Footage: {value} sq ft',
            dimensions: "Dimensions: {length}' × {width}'",
            height: "Height: {value}'"
          },
          designPreferences: {
            title: 'Design Preferences',
            style: 'Style: ',
            description: 'Description: '
          },
          photos: {
            currentRoom: 'Current Room Photos',
            inspiration: 'Inspiration Photos'
          }
        }
    },

      // Admin Dashboard
      adminDashboard: {
        title: 'Admin Dashboard',
        projectsOverview: {
          activeProjects: 'Active Projects',
          completedProjects: 'Completed Projects'
        },
        projectTables: {
          activeTitle: 'Active Projects',
          completedTitle: 'Completed Projects',
          headers: {
            projectName: 'Project Name',
            client: 'Client',
            designer: 'Designer',
            created: 'Created',
            actions: 'Actions'
          },
          actions: {
            assignDesigner: 'Assign Designer',
            viewDetails: 'View Details',
            viewFloorPlan: 'View Floor Plan'
          },
          modal: {
            title: 'Assign Designer to Project',
            selectDesigner: 'Select Designer',
            cancel: 'Cancel',
            assign: 'Assign'
          },
          unassigned: 'Unassigned',
          sort: {
            asc: '↑',
            desc: '↓',
            both: '↕️'
          }
        }
      }
    }
  },
  zh: {
    translation: {
      // Navigation & Common
      navigation: {
        home: 'translate me',
        login: '登录',
        signup: '注册',
        contactUs: '联系我们',
        logout: '退出登录',
        backToHome: '返回首页',
        viewDetails: '查看详情',
        viewFloorPlan: '查看平面图'
      },

    // Project Details
      projectDetails: {
        loading: '加载中...',
        notFound: {
          title: '未找到项目'
        },
        navigation: {
          backToDashboard: '← 返回控制台'
        },
        title: '项目 #{id}',
        status: '状态：',
        created: '创建时间：',
        floorPlans: {
          title: '平面图',
          tabs: {
            yourFloorPlan: '您的平面图',
            taggedFloorPlan: '标记平面图',
            designerFloorPlan: '设计师平面图'
          }
        },
        rooms: {
          dimensions: {
            title: '尺寸',
            squareFootage: '面积：{value} 平方英尺',
            dimensions: '尺寸：{length} × {width}',
            height: '高度：{value}'
          },
          designPreferences: {
            title: '设计偏好',
            style: '风格：',
            description: '描述：'
          },
          photos: {
            currentRoom: '当前房间照片',
            inspiration: '灵感照片'
          }
        }
    },

      // Common Messages
      common: {
        loading: '加载中...'
      },

      // Error Messages
      errors: {
        fetchProjectsFailed: '获取项目失败',
        loadProjectsFailed: '加载分配的项目失败',
        assignFailed: '分配设计师失败'
      },

      // Hero Section
      hero: {
        title: '您的专属设计团队',
        subtitle: '让我们的专业设计师为您的客户创想赋予生命',
        viewDesigns: '查看设计',
        viewDesignsStyle: 'View Design translate'
      },

      // Login Page
      login: {
        title: '登录您的账户',
        emailLabel: '邮箱',
        passwordLabel: '密码',
        submitButton: '登录',
        error: '登录时发生错误，请重试',
        'Invalid login id or password.': 'translate me'
      },

    createDesign: {
        // In config.js, add under createDesign section
    steps: {
    roomTagging: {
      title: '标记房间平面图',
      description: '点击平面图标记每个房间位置',
      noFloorPlan: '未找到平面图。请返回并上传平面图。'    
    },
      designType: {
        title: '您需要什么类型的设计服务？',
        description: '选择虚拟装修或改造设计',
        options: {
          virtualStaging: {
            title: '虚拟装修',
            description: '使用虚拟家具和装饰来改造空置空间，用于房地产展示'
          },
          remodeling: {
            title: '改造设计',
            description: '获取专业的空间改造设计方案'
          }
        }
      },
  roomTypes: {
    bedroom: '卧室',
    masterBedroom: '主卧室',
    bathroom: '浴室',
    kitchen: '厨房',
    livingRoom: '客厅',
    diningRoom: '餐厅',
    office: '办公室',
    laundry: '洗衣房'
  },
      floorPlan: {
        title: '您是否有现成的平面图？',
        description: '让我们知道您是否有可以参考的平面图',
        options: {
          yes: {
            title: '是的，我有平面图',
            description: '我可以提供现有空间的平面图'
          },
          no: {
            title: '没有，我需要帮助创建',
            description: '请求我们的团队协助创建平面图'
          }
        }
      },
      roomDetails: {
        title: '房间详情',
        description: '提供每个房间的具体细节',
        styleLabel: '风格偏好',
        colorLabel: '配色方案',
        requirements: '具体要求',
        dimensions: {
          title: '房间尺寸',
          length: '长度（英尺）',
          width: '宽度（英尺）',
          height: '高度（英尺）',
          squareFootage: '面积'
        }
      },
      pricing: {
        title: '查看设计价格',
        description: '查看您的设计项目的预估费用',
        breakdown: {
          title: '项目费用明细',
          squareFootageRate: '{size} 平方英尺 × ${rate}/平方英尺',
          totalCost: '项目总费用',
          totalArea: '总面积：{size} 平方英尺',
          deposit: {
            title: '所需订金 (60%)',
            description: '开始项目时支付'
          },
          remaining: {
            title: '剩余余额 (40%)',
            description: '设计完成时支付'
          }
        },
        actions: {
          payDeposit: '支付订金并开始项目',
          saveLater: '保存项目稍后支付'
        },
        notes: {
          title: '重要说明：',
          items: [
            '价格根据房间面积计算',
            '当前费率：每平方英尺 $1.00',
            '需支付 60% 订金才能开始项目',
            '剩余 40% 在设计完成后支付',
            '您可以现在保存项目并稍后支付订金',
            '设计工作将在收到订金后开始'
          ]
        }
      }
    },
    roomForm: {
      title: '房间详情',
      removeRoom: '移除房间',
      addRoom: '添加另一个房间',
      upload: {
        current: '当前房间照片',
        currentDesc: '上传显示房间当前状态的照片',
        inspiration: '灵感照片',
        inspirationDesc: '上传您想要借鉴的设计照片'
      }
    },
    navigation: {
      back: '返回',
      next: '下一步',
      saving: '保存中...',
      lastSaved: '上次保存：{time}',
      progress: '第 {current} 步，共 {total} 步'
    }
  },

      designerProjectDetails: {
        loading: '加载中...',
        notFound: {
            title: '未找到项目'
        },
        navigation: {
            backToDashboard: '← 返回控制台'
        },
        header: {
            projectId: '项目 #{id}',
            status: '状态：',
            client: '客户：',
            created: '创建时间：'
        },
        floorPlans: {
            title: '平面图',
            tabs: {
            original: '原始平面图',
            tagged: '标记平面图',
            designer: '设计师平面图'
            },
            upload: {
            title: '上传新平面图',
            uploading: '上传中...'
            }
        },
        rooms: {
            dimensions: {
            title: '尺寸',
            squareFootage: '面积：{value} 平方英尺',
            dimensions: '尺寸：{length} × {width}',
            height: '高度：{value}',
            },
            designPreferences: {
            title: '设计偏好',
            style: '风格：',
            description: '描述：'
            },
            photos: {
            currentRoom: {
                title: '当前房间照片'
            },
            inspiration: {
                title: '灵感照片'
            }
            }
        }
        },

      // Signup Page
      signup: {
        title: '中文 Create a Pencil Dogs Account',
        Realtor: '中文 Realtor',
        Brokerage: '中文 Brokerage',
        Supplier: '中文 Supplier',
        Designer: '中文 Designer',
        'General Contractor': '中文 General Contractor',
        Other: '中文 Other',
        next: '中文 Next',
        selectOcc: '中文 Select your occupation',
        enterContact: '中文 Enter your contact information:',
        phoneField: '中文 Phone Number',
        fNameField: '中文 First Name',
        lNameField: '中文 Last Name',
        emailField: '中文 Email',
        confEmailField: '中文 Confirm Email',
        pwField: '中文 Password',
        confPwField: '中文 Confirm Password',
        optionalField: '中文 Optional',

        emailNoMatch: "中文 Emails don't match",
        pwNoMatch: "中文 Passwords don't match",

        'This email is already registered.': '中文 This email is already registered.',

        fieldReq: '中文 This is a required field.',
        fieldInvalid: '中文 Please provide a valid ',

        formSubmit: '中文 Submit',

        thanks: '中文 Thank you for signing up.',
        goLogin: '中文 Login Here',
        goHome: '中文 Return Home',
      },

      // Dashboard Sections
      dashboard: {
        title: '设计师控制台',
        createRequest: {
          title: '创建设计需求',
          description: '提交您的需求开始新的设计项目'
        },
        support: {
          title: '联系支持',
          description: '获取设计项目或账户相关帮助'
        }
      },

    dashboard: {
        welcome: '欢迎，{username}',
        title: '设计师控制台',
        createRequest: {
          title: '创建设计需求（每个房间）',
          description: '提交您的需求开始新的设计项目'
        },
        support: {
          title: '联系支持',
          description: '获取设计项目或账户相关帮助'
        },
        subscription: {
          title: '订阅状态',
          active: '当前订阅：{plan}',
          noActive: '没有活跃的订阅',
          subscribe: '立即订购'
        },
        designRequests: {
          title: '您的设计需求',
          empty: '未找到设计需求。创建您的第一个需求！',
          table: {
            projectId: '项目编号',
            status: '状态',
            rooms: '房间',
            floorPlan: '平面图',
            submitted: '提交时间',
            lastUpdated: '最后更新',
            actions: '操作'
          },
          status: {
            pending: '待处理',
            inProgress: '进行中',
            completed: '已完成'
          }
        },
        actions: {
          logout: '退出登录',
          viewDetails: '查看详情'
        }
      },

      // Designer Dashboard
      designerDashboard: {
        title: '设计师控制台',
        stats: {
          totalProjects: '总项目数',
          activeProjects: '进行中的项目',
          completedProjects: '已完成的项目'
        },
        projectTable: {
          title: '分配的项目',
          headers: {
            projectName: '项目名称',
            client: '客户',
            status: '状态',
            created: '创建时间',
            lastModified: '最后修改',
            actions: '操作'
          },
          status: {
            completed: '已完成',
            inProgress: '进行中'
          }
        }
      },

      // Admin Dashboard
      adminDashboard: {
        title: '管理员控制台',
        projectsOverview: {
          activeProjects: '进行中的项目',
          completedProjects: '已完成的项目'
        },
        projectTables: {
          activeTitle: '进行中的项目',
          completedTitle: '已完成的项目',
          headers: {
            projectName: '项目名称',
            client: '客户',
            designer: '设计师',
            created: '创建时间',
            actions: '操作'
          },
          actions: {
            assignDesigner: '分配设计师',
            viewDetails: '查看详情',
            viewFloorPlan: '查看平面图'
          },
          modal: {
            title: '为项目分配设计师',
            selectDesigner: '选择设计师',
            cancel: '取消',
            assign: '分配'
          },
          unassigned: '未分配',
          sort: {
            asc: '↑',
            desc: '↓',
            both: '↕️'
          }
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;