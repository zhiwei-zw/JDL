// pages/challenge-detail/challenge-detail.js
Page({
  data: {
    challengeId: '',
    challenge: {},
    isJoined: false,
    hasCheckedIn: false,
    currentDay: 0,
    totalDays: 0,
    streakDays: 0,
    progressPercent: 0,
    members: [],
    checkedDays: []
  },

  onLoad(options) {
    this.setData({
      challengeId: options.id
    })
    this.loadChallengeDetail()
  },

  /**
   * 加载挑战详情
   */
  loadChallengeDetail() {
    const id = this.data.challengeId
    const allChallenges = wx.getStorageSync('challenges') || []
    const challenge = allChallenges.find(c => c._id === id)

    if (!challenge) {
      wx.showToast({ title: '挑战不存在', icon: 'none' })
      return
    }

    // 加载参与这个挑战的用户
    const allUserChallenges = wx.getStorageSync('user_challenges') || []
    const members = allUserChallenges.filter(uc => uc.challengeId === id && uc.status === 'active')

    // 获取当前用户ID
    const userId = wx.getStorageSync('userId') || 'default_user'

    // 判断是否已加入
    const myRecord = members.find(m => m.userId === userId)
    const isJoined = !!myRecord

    // 判断今天是否已打卡
    let hasCheckedIn = false
    let currentDay = 0
    let totalDays = 0
    let checkedDays = []

    if (isJoined && myRecord.lastCheckinTime) {
      const today = new Date()
      const checkinDate = new Date(myRecord.lastCheckinTime)
      hasCheckedIn = (today.getFullYear() === checkinDate.getFullYear() &&
                      today.getMonth() === checkinDate.getMonth() &&
                      today.getDate() === checkinDate.getDate())
      currentDay = myRecord.currentDay
      totalDays = myRecord.totalDays
      checkedDays = this._generateCheckedDays(currentDay, challenge.dailyLimit)
    }

    this.setData({
      challenge,
      members,
      isJoined,
      hasCheckedIn,
      currentDay,
      totalDays,
      streakDays: currentDay,
      progressPercent: challenge.dailyLimit > 0 ? (currentDay / challenge.dailyLimit) * 100 : 0,
      checkedDays
    })
  },

  /**
   * 加入挑战
   */
  joinChallenge() {
    wx.showLoading({ title: '加入中...' })

    const userId = wx.getStorageSync('userId') || 'default_user'
    const nickname = wx.getStorageSync('nickname') || '微信用户'
    const avatarUrl = wx.getStorageSync('avatarUrl') || ''

    // 更新挑战参与人数
    const allChallenges = wx.getStorageSync('challenges') || []
    const challengeIndex = allChallenges.findIndex(c => c._id === this.data.challengeId)
    if (challengeIndex !== -1) {
      allChallenges[challengeIndex].joinCount = (allChallenges[challengeIndex].joinCount || 0) + 1
      wx.setStorageSync('challenges', allChallenges)
    }

    // 创建用户挑战记录
    const allUserChallenges = wx.getStorageSync('user_challenges') || []
    allUserChallenges.push({
      _id: 'uc_' + Date.now(),
      userId: userId,
      challengeId: this.data.challengeId,
      nickname: nickname,
      avatarUrl: avatarUrl,
      currentDay: 0,
      totalDays: 0,
      isCreator: false,
      status: 'active',
      createTime: new Date().toISOString()
    })
    wx.setStorageSync('user_challenges', allUserChallenges)

    wx.hideLoading()
    this.setData({ isJoined: true })
    wx.showToast({ title: '加入成功！', icon: 'success' })
  },

  /**
   * 打卡
   */
  doCheckin() {
    wx.showLoading({ title: '打卡中...' })

    const userId = wx.getStorageSync('userId') || 'default_user'
    const nickname = wx.getStorageSync('nickname') || '微信用户'
    const avatarUrl = wx.getStorageSync('avatarUrl') || ''

    const allUserChallenges = wx.getStorageSync('user_challenges') || []
    const userChallIndex = allUserChallenges.findIndex(
      uc => uc.userId === userId && uc.challengeId === this.data.challengeId && uc.status === 'active'
    )

    if (userChallIndex === -1) {
      wx.hideLoading()
      wx.showToast({ title: '你还没有加入这个挑战', icon: 'none' })
      return
    }

    const record = allUserChallenges[userChallIndex]
    const newDay = record.currentDay + 1

    // 更新用户进度
    allUserChallenges[userChallIndex].currentDay = newDay
    allUserChallenges[userChallIndex].totalDays = newDay
    allUserChallenges[userChallIndex].lastCheckinTime = new Date().toISOString()
    wx.setStorageSync('user_challenges', allUserChallenges)

    // 保存打卡记录
    const allCheckins = wx.getStorageSync('checkins') || []
    allCheckins.push({
      _id: 'ck_' + Date.now(),
      challengeId: this.data.challengeId,
      userId: userId,
      nickname: nickname,
      avatarUrl: avatarUrl,
      days: newDay,
      createTime: new Date().toISOString()
    })
    wx.setStorageSync('checkins', allCheckins)

    this.setData({
      hasCheckedIn: true,
      currentDay: newDay,
      totalDays: newDay,
      streakDays: newDay,
      progressPercent: (newDay / this.data.challenge.dailyLimit) * 100,
      checkedDays: this._generateCheckedDays(newDay, this.data.challenge.dailyLimit)
    })

    wx.hideLoading()
    wx.showToast({ title: '打卡成功！Day ' + newDay, icon: 'success' })
  },

  /**
   * 生成打卡日历高亮
   */
  _generateCheckedDays(currentDay, total) {
    const days = []
    for (let i = 1; i <= currentDay && i <= total; i++) {
      days.push(i)
    }
    return days
  }
})
