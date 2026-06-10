// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    userId: '',
    nickname: '',
    avatarUrl: '',
    createdCount: 0,
    joinedCount: 0,
    totalCheckins: 0,
    createdChallenges: [],
    joinedChallenges: [],
    // 登录相关
    needLogin: false,
    phoneNumber: '',
    isPhoneValid: false
  },

  onShow() {
    const userId = wx.getStorageSync('userId')
    const nickname = wx.getStorageSync('nickname') || ''
    const avatarUrl = wx.getStorageSync('avatarUrl') || ''

    this.setData({
      userId,
      nickname,
      avatarUrl,
      needLogin: !userId
    })

    this.loadMyData()
  },

  /**
   * 显示登录弹窗
   */
  showLogin() {
    this.setData({ needLogin: true })
  },

  /**
   * 关闭登录弹窗
   */
  closeLogin() {
    this.setData({ needLogin: false })
  },

  /**
   * 手机号输入
   */
  onPhoneInput(e) {
    const phone = e.detail.value
    const isPhoneValid = /^1[3-9]\d{9}$/.test(phone)
    this.setData({
      phoneNumber: phone,
      isPhoneValid: isPhoneValid
    })
  },

  /**
   * 手机号登录（先通过 wx.login 获取 code，再调用云函数）
   */
  loginWithPhone() {
    if (!this.data.isPhoneValid) return

    wx.showLoading({ title: '登录中...' })

    // 1. 先获取 wx.login code
    wx.login({
      success: (loginRes) => {
        const code = loginRes.code
        // 2. 调用云函数验证手机号
        // 注意：需要先在云开发控制台部署 login 云函数
        if (wx.cloud) {
          wx.cloud.callFunction({
            name: 'login',
            data: {
              type: 'getPhoneNumber',
              code: code
            },
            success: (cloudRes) => {
              const phone = cloudRes.result.phone
              if (phone) {
                this._onLoginSuccess(phone)
              } else {
                // 云函数不可用，降级为本地手机号登录
                this._onLoginSuccess(this.data.phoneNumber)
              }
            },
            fail: () => {
              // 云函数不可用，降级为本地登录
              this._onLoginSuccess(this.data.phoneNumber)
            }
          })
        } else {
          // 未初始化云开发，直接本地登录
          this._onLoginSuccess(this.data.phoneNumber)
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '登录失败，请重试', icon: 'none' })
      }
    })
  },

  /**
   * 登录成功回调
   */
  _onLoginSuccess(phone) {
    const userId = 'user_' + phone.slice(-6) + '_' + Date.now()

    wx.setStorageSync('userId', userId)
    wx.setStorageSync('phoneNumber', phone)
    wx.setStorageSync('nickname', '用户' + phone.slice(-4))
    wx.setStorageSync('avatarUrl', '')

    this.setData({
      userId,
      nickname: '用户' + phone.slice(-4),
      avatarUrl: '',
      needLogin: false,
      phoneNumber: '',
      isPhoneValid: false
    })

    wx.hideLoading()
    wx.showToast({ title: '登录成功', icon: 'success' })
  },

  /**
   * 加载我的数据
   */
  loadMyData() {
    const userId = this.data.userId || 'default_user'

    // 加载创建的挑战
    const allChallenges = wx.getStorageSync('challenges') || []
    const createdChallenges = allChallenges
      .filter(c => c.creatorId === userId)
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      .slice(0, 10)

    // 加载参与的挑战
    const allUserChallenges = wx.getStorageSync('user_challenges') || []
    const joinedRecords = allUserChallenges
      .filter(uc => uc.userId === userId && uc.status === 'active')
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))

    // 构建带挑战详情的列表
    const joinedChallenges = joinedRecords.map(uc => {
      const challenge = allChallenges.find(c => c._id === uc.challengeId) || {}
      return { ...uc, challenge }
    })

    // 打卡总数
    const allCheckins = wx.getStorageSync('checkins') || []
    const totalCheckins = allCheckins.filter(c => c.userId === userId).length

    this.setData({
      createdChallenges,
      createdCount: createdChallenges.length,
      joinedChallenges,
      joinedCount: joinedRecords.length,
      totalCheckins
    })
  },

  goToDetail(e) {
    const challenge = e.currentTarget.dataset.challenge
    wx.navigateTo({
      url: `/pages/challenge-detail/challenge-detail?id=${challenge._id}`
    })
  }
})
