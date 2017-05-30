//index.js
let db = require('../../model/db.js');

//获取应用实例
var app = getApp()
Page({
  data: {
    topItem: {
      content: '最新的笔记会显示在顶部, \n文字会自动保存'
    },
    noteList: [
    ],
    userInfo: {},
    pressStartAt: 0,
    pressEndAt: 0,
    isPopup: false
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    var that = this;
    this.updateListUi();
  },

  onReady: function () {
  },

  onShow() {
    if (db.cache.isNoteModified) {
      this.updateListUi();
    }
  },

  onItemClick: function (event) {
    if (this.data.isPopup == false) {
      if (this.data.pressEndAt - this.data.pressStartAt < 200) {
        let note = event.currentTarget.dataset;

        if (note.showRemove) {
          note.showRemove = false;
          let item = this.getNote(note.id);
          item.showRemove = false;
          this.setData({
            noteList: this.data.noteList
          });
        } else {
          getApp().globalData.currentNote = note;
          wx.navigateTo({
            url: `/pages/editor/editor?id=${note.id}&isEdit=0`,
          })
        }
      }
    } else {
      this.hidePopup();
    }
  },

  onLongPress: function (event) {
    let note = event.currentTarget.dataset;

    let item = this.getNote(note.id);
    item.showRemove = true;
    this.setData({
      noteList: this.data.noteList
    });
  },

  onPress(event) {
    this.data.pressStartAt = event.timeStamp;
  },

  onPressEnd(event) {
    this.data.pressEndAt = event.timeStamp;
  },

  onContainerTouch(event) {
    this.data.noteList.forEach(item => {
      item.showRemove = false;
    });

    this.setData({
      noteList: this.data.noteList
    });

    this.hidePopup();
  },

  onMore(event) {
    if (this.data.isPopup == true) {
      this.hidePopup();
    } else {
      this.data.isPopup = true;
      let note = event.currentTarget.dataset;
      let item = this.getNote(note.id);
      this.currentId = note.id;
      item.showMore = true;

      this.setData({
        noteList: this.data.noteList,
        showMore: true
      });
    }
  },

  onRemove: function (event) {
    this.currentId = 0;
    let id = event.currentTarget.dataset.id;
    let note = this.getNote(id);
    note.isRemoved = true;
    this.setData({
      noteList: this.data.noteList
    });

    let that = this;
    if (note) {
      db.removeNote(id)
        .then(result => {
          let temp;
          that.data.noteList = that.data.noteList.filter(item => {
            return item.id != id;
          });

          that.setData({
            noteList: that.data.noteList
          });
        })
        .catch(error => {
          wx.showToast({
            title: '' + error,
          })
        });
    }
  },

  onAddNote(event) {
    if (this.data.isPopup == false) {
      wx.navigateTo({
        url: `/pages/editor/editor?isEdit=1`,
      })
    } else {
      this.hidePopup();
    }
  },

  getNote(id) {
    for (let i = 0, size = this.data.noteList.length; i < size; i++) {
      let note = this.data.noteList[i];
      if (note && note.id == id) {
        return note;
      }
    }
  },

  updateListUi() {
    console.debug(this.data);
    let data = this.data;

    db.getAllNote()
      .then(notes => {
        if (!notes || notes.length == 0) {
          this.checkNoteListEmpty();
        } else {

        let temp = new Date();
        const INTERVAL = (8 * 60 * 60 * 1000);
        notes.forEach(item => {
          temp.setTime(item.createdAt + INTERVAL);
          item.formatDate = temp.getUTCFullYear() + "." + (1+ temp.getMonth()) + "." +
                            temp.getUTCDate();
        });
        data.noteList = notes;
        this.updateUi();
        }
      }, error => {
        this.checkNoteListEmpty();
      })
      .catch(error => {
        this.checkNoteListEmpty();
      });
  },

  updateUi() {
    this.setData(this.data);
  },

  checkNoteListEmpty() {
    if (this.data.noteList.length == 0) {
      this.data.noteList.push({
        id: 'id_' + 0,
        content: '最新的笔记会显示在顶部, \n\n文字会自动保存',
        status: 0
      });

      this.setData({
        noteList: this.data.noteList
      })
    }
  },

  hidePopup(event) {
    this.data.isPopup = false;

    if (this.currentId && this.currentId != 0) {
      let note = this.getNote(this.currentId);

      note.showMore = false;
      this.setData({
        noteList: this.data.noteList,
        showMore: false
      });

      this.currentId = 0;
    }
  },

  onShareAppMessage() {
    let path = this.currentId > 0 ? `/pages/editor/editor?id=${this.currentId}&isEdit=0` :
      '/pages/index/index';
    return {
      title: '我的笔记书',
      path,
      success() {

      },
      fail() {

      },
      complete() {

      }
    };
  }
})
