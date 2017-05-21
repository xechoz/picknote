// pages/editor/editor.js
const db = require('../../model/db.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    content: '',
    isEditMode: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let id = options.id;
    let isEdit = options.isEdit == 1;
    
    console.log('id ' + id);
    let note = {};

    if (id) {
      note = getApp().globalData.currentNote || {};
    }

    this.data.id = id || 'id_' + Date.now();
    this.data.content = note.content || '';
    this.data.isEditMode = isEdit;
    this.setData(this.data);
    this.oldContent = this.data.content;
    this.currentContent = this.data.content;
    console.log(this.data);
},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (this.isNoteModify()) {
      this.saveNote();
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (this.isNoteModify()) {
      this.saveNote();
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  saveNote() {
    db.saveNote({
      id: this.data.id,
      content: this.currentContent,
      status: 0
    })
    .then(() => {
      wx.showToast({
        title: '笔记已保存',
        icon: 'success',
        duration: 1000
      })
    })
    .catch(error => {
      wx.showToast({
        title: '笔记保存出错',
        duration: 1000
      })
    });
  },

  isNoteModify() {
    return this.currentContent && (this.currentContent.length > 0) && this.oldContent != this.currentContent;
  },

  onModify(event) {
    console.log(event);
    console.log('current ' + this.currentContent);
    this.currentContent = event.detail.value;
  },

  onEditNote(event) {
    this.data.isEditMode = true;
    this.setData(this.data);
    console.log(this.data);
  },

  clickCount: 0, 
  checkDoubleClick(event) {
    console.log(event);
    this.clickCount++;
    console.log('count ' + this.clickCount);

    if (this.clickCount >= 2 && !this.data.isEditMode) {
      this.onEditNote();
    }

    let that = this;
    setTimeout(() => {
      that.clickCount = 0;
    }, 300);
  }
})