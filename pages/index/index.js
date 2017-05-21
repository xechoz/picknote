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
    userInfo: {}
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
    this.updateLatestNoteUi();
    this.updateListUi();
  },

  onReady: function () {
    console.log('onReady');
  },

  onShow() {
    if (db.cache.isNoteModified) {
      this.updateLatestNoteUi();
      this.updateListUi();
    }
  },

  onItemClick: function (event) {
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
  },

  onLongClick: function(event) {
    console.log(event);
    let note = event.currentTarget.dataset;

    let item = this.getNote(note.id);
    item.showRemove = true;
    this.setData({
      noteList: this.data.noteList
    });

    console.log(this.data.noteList);
  },

  onRemove: function(event) {
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
    for (let i=0, size=this.data.noteList.length; i<size; i++) {
      let note = this.data.noteList[i];
      console.log(note);
      if (note && note.id == id) {
        return note;
      }
    }
  },

  updateLatestNoteUi() {
    let that = this;
    db.getLatestNote()
      .then(note => {
        console.log(note);
        that.data.topItem = note;
        that.updateUi();
      }, error => {
        console.log(error);
      });
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
