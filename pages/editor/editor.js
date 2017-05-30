const db = require('../../model/db.js');

Page({
  data: {
    id: '',
    content: '',
    placeHolder: '',
    isEditMode: true
  },

  onLoad: function (options) {
    let id = options.id;
    let isEdit = options.isEdit == 1;

    let note = {};

    if (id) {
      note = getApp().globalData.currentNote || {};
    }

    this.data.id = id || 'id_' + Date.now();
    this.data.content = note.content || '';
    this.data.isEditMode = isEdit;
    this.data.placeHolder = this.data.content.length == 0 ? '文字会自动保存' : this.data.content;

    this.oldContent = this.data.content;
    this.currentContent = this.data.content;
    this.setData(this.data);    
  },

  onShow() {
    // this.setData(this.data);    
  },

  onHide: function () {
    if (this.isNoteModify()) {
      this.saveNote();
    }
  },

  onUnload: function () {
    if (this.isNoteModify()) {
      this.saveNote();
    }
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
    this.currentContent = event.detail.value;
  },

  onEditNote(event) {
    this.data.isEditMode = true;
    this.setData(this.data);
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