// pages/index/index.js
Page({
  data: {
    challenges: [],
    loading: false,
    searchKeyword: '',
    activeCategory: ''
  },

  onLoad() {
    // 首次加载时注入示例数据
    this._seedDemoDataIfEmpty()
    this.loadChallenges()
  },

  onShow() {
    this.loadChallenges()
  },

  /**
   * 如果挑战为空，注入示例数据
   */
  _seedDemoDataIfEmpty() {
    const challenges = wx.getStorageSync('challenges') || []
    if (challenges.length > 0) return

    const demoChallenges = [
      {
        _id: 'demo_1',
        title: '早起打卡30天',
        desc: '每天7点前起床，养成早起的习惯',
        icon: '🏃',
        dailyLimit: 30,
        creatorId: 'demo',
        joinCount: 128,
        isPublic: true,
        status: 'active',
        createTime: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        _id: 'demo_2',
        title: '每天阅读30分钟',
        desc: '每天专注阅读至少30分钟',
        icon: '📚',
        dailyLimit: 21,
        creatorId: 'demo',
        joinCount: 96,
        isPublic: true,
        status: 'active',
        createTime: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        _id: 'demo_3',
        title: '每周运动5天',
        desc: '每周至少运动5天，每次30分钟以上',
        icon: '💪',
        dailyLimit: 30,
        creatorId: 'demo',
        joinCount: 215,
        isPublic: true,
        status: 'active',
        createTime: new Date(Date.now() - 86400000 * 10).toISOString()
      },
      {
        _id: 'demo_4',
        title: '每天喝8杯水',
        desc: '每天至少8杯水，保持健康饮水习惯',
        icon: '💧',
        dailyLimit: 14,
        creatorId: 'demo',
        joinCount: 73,
        isPublic: true,
        status: 'active',
        createTime: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        _id: 'demo_5',
        title: '每天冥想10分钟',
        desc: '每天静坐冥想，放松身心',
        icon: '🧘',
        dailyLimit: 7,
        creatorId: 'demo',
        joinCount: 54,
        isPublic: true,
        status: 'active',
        createTime: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ]

    wx.setStorageSync('challenges', demoChallenges)
  },

  /**
   * 从本地存储加载挑战列表
   */
  loadChallenges() {
    const allChallenges = wx.getStorageSync('challenges') || []
    let challenges = allChallenges.filter(c => c.status === 'active')

    // 搜索过滤
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase()
      challenges = challenges.filter(c => c.title.toLowerCase().includes(keyword))
    }

    // 分类过滤
    if (this.data.activeCategory) {
      const iconPrefixMap = {
        self: '📚',
        health: '💪',
        study: '🎓',
        work: '💼',
        creative: '🎨'
      }
      const prefix = iconPrefixMap[this.data.activeCategory]
      if (prefix) {
        challenges = challenges.filter(c => c.icon === prefix)
      }
    }

    // 按创建时间倒序
    challenges.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))

    this.setData({ challenges, loading: false })
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  clearSearch() {
    this.setData({ searchKeyword: '' })
    this.loadChallenges()
  },

  onSwitchCategory(e) {
    this.setData({
      activeCategory: e.currentTarget.dataset.category
    })
    this.loadChallenges()
  },

  goToDetail(e) {
    const challenge = e.currentTarget.dataset.challenge
    wx.navigateTo({
      url: `/pages/challenge-detail/challenge-detail?id=${challenge._id}`
    })
  },

  goToCreate() {
    wx.navigateTo({
      url: '/pages/create-challenge/create-challenge'
    })
  }
})
