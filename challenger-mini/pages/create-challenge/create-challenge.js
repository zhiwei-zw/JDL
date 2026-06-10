// pages/create-challenge/create-challenge.js
Page({
  data: {
    iconOptions: ['🏃', '📚', '💪', '💧', '🎯', '🌙', '✍️', '🎨', '🧘', '📝', '💰', '🚭'],
    dayOptions: [7, 14, 21, 30, 60, 90],
    selectedIcon: '🎯',
    selectedDayIndex: 2,
    title: '',
    desc: '',
    isPublic: true
  },

  onInputTitle(e) {
    this.setData({ title: e.detail.value })
  },

  onInputDesc(e) {
    this.setData({ desc: e.detail.value })
  },

  selectIcon(e) {
    this.setData({ selectedIcon: e.currentTarget.dataset.icon })
  },

  onDayChange(e) {
    this.setData({ selectedDayIndex: e.detail.value })
  },

  togglePublic() {
    this.setData({ isPublic: !this.data.isPublic })
  },

  onSubmit(e) {
    if (!this.data.title.trim()) {
      wx.showToast({ title: '请输入挑战名称', icon: 'none' })
      return
    }

    const dailyLimit = this.data.dayOptions[this.data.selectedDayIndex]

    wx.showLoading({ title: '创建中...' })

    const data = {
      _id: 'ch_' + Date.now(),
      title: this.data.title.trim(),
      desc: this.data.desc.trim(),
      icon: this.data.selectedIcon,
      dailyLimit: dailyLimit,
      creatorId: wx.getStorageSync('userId') || 'default_user',
      joinCount: 0,
      maxMembers: 999,
      isPublic: this.data.isPublic,
      status: 'active',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }

    // 保存到本地存储
    const allChallenges = wx.getStorageSync('challenges') || []
    allChallenges.push(data)
    wx.setStorageSync('challenges', allChallenges)

    wx.hideLoading()
    wx.showToast({ title: '创建成功！', icon: 'success' })
    wx.navigateTo({
      url: '/pages/profile/profile'
    })
  }
})
