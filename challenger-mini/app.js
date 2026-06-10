// app.js
App({
  globalData: {
    userInfo: null,
    nickname: '',
    avatarUrl: ''
  },

  onLaunch() {
    // 从本地缓存加载用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
    }
  }
})
