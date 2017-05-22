//index.js
let noteItem = require('../../item/note-item.js');
let db = require('../../model/db.js');

//获取应用实例
var app = getApp()
Page({
  data: {
    topItem: {
      content: '最新的笔记会显示在顶部，长按删除'
    },
    noteList: [
    ],
    userInfo: {},
    pressStartAt: 0,
    pressEndAt: 0
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this;
    this.updateListUi();
  },

  onReady: function () {
    console.log('onReady');
  },

  onShow() {
    if (db.cache.isNoteModified) {
      this.updateListUi();
    }
  },

  onItemClick: function (event) {
    console.log(this.data);
    console.log('this.data.pressEndAt - this.data.pressStartAt=' + (this.data.pressEndAt - this.data.pressStartAt));
    if (this.data.pressEndAt - this.data.pressStartAt < 200) {
      console.log(event);
      let note = event.currentTarget.dataset;

      if (note.showRemove) {
        note.showRemove = false;
        let item = this.getNote(note.id);
        item.showRemove = false;
        this.setData({
          noteList: this.data.noteList
        });
      } else {
        noteItem.onItemClick(note);
      }
    }
  },

  onLongPress: function (event) {
    console.log(event);
    let note = event.currentTarget.dataset;

    let item = this.getNote(note.id);
    item.showRemove = true;
    this.setData({
      noteList: this.data.noteList
    });

    console.log(this.data.noteList);
  },

  onPress(event) {
    this.data.pressStartAt = event.timeStamp;
  },

  onPressEnd(event) {
    this.data.pressEndAt = event.timeStamp;
  },

  onContainerTouch(event) {
    console.log(event);
    this.data.noteList.forEach(item => {
      item.showRemove = false;
    });

    this.setData({
      noteList: this.data.noteList
    })
  },

  onRemove: function (event) {
    let id = event.currentTarget.dataset.id;
    console.log('onRemove ' + id);
    let note = this.getNote(id);
    console.log(note);

    if (note) {
      db.removeNote(id)
        .then(result => {
          this.data.noteList = this.data.noteList.filter(item => {
            return item.id != id;
          });

          this.setData({
            noteList: this.data.noteList
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
    console.log(event);
    wx.navigateTo({
      url: `/pages/editor/editor?isEdit=1`,
    })
  },

  getNote(id) {
    console.log(id);
    for (let i = 0, size = this.data.noteList.length; i < size; i++) {
      let note = this.data.noteList[i];
      console.log(note);
      if (note && note.id == id) {
        return note;
      }
    }
  },

  updateListUi() {
    let data = this.data;

    db.getAllNote()
      .then(notes => {
        data.noteList = notes;
        console.log(`noteList ${JSON.stringify(data.noteList)}`);
        this.updateUi();
      })
      .catch(error => {
        console.error(error);
        wx.showToast({
          title: '' + error
        })
      });
  },

  updateUi() {
    console.log('updateUi');
    console.log(this.data);
    this.setData(this.data);
  }
})
