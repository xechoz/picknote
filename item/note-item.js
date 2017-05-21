let noteItem = {
  onItemClick: function (data) {
    console.log(data);
    getApp().globalData.currentNote = data;
    wx.navigateTo({
      url: `/pages/editor/editor?id=${data.id}&isEdit=0`,
    })
  }
};

module.exports = noteItem;