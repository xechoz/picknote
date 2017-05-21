let db = {
  KEY: {
    LATEST_NOTE: 'LATES_NOTE',
    NOTE_ID_LIST: 'NOTE_ID_LIST'
  },

  cache: {
    isNoteModified: false,
    noteIds: [],
    notes: []
  },

  getAllNote() {
    return new Promise((resolve, reject) => {
      if (db.cache.notes && db.cache.notes.length > 0) {
        resolve(db.cache.notes);
      } else {
        db.getNoteIds()
          .then(ids => {
            console.debug('ids ' + JSON.stringify(ids));
            db.getNotes(ids)
              .then(notes => {
                db.cache.notes = notes;
                resolve(notes);
              });
          });
      }
    })
  },

  getLatestNote() {
    return new Promise((resolve, reject) => {
      wx.getStorage({
        key: this.KEY.LATEST_NOTE,
        success: db.unwrap(resolve),
        fail: reject
      })
    });
  },

  saveNote(note) {
    this.cache.isNoteModified = true;
    this.cache.noteIds.unshift(note.id);

    this.cache.notes = this.cache.notes.filter(item => {
      return item.id != note.id;
    });

    this.cache.notes.unshift(note);
    console.log(`notes push ${JSON.stringify(db.cache)}`);
    note.createdAt = Date.now();

    return new Promise((resolve, reject) => {
      wx.setStorage({
        key: note.id,
        data: note,
        success: resolve,
        fail: reject
      });

      wx.setStorage({
        key: db.KEY.LATEST_NOTE,
        data: note,
      });

      wx.setStorage({
        key: db.KEY.NOTE_ID_LIST,
        data: db.cache.noteIds,
      })
    });
  },

  getNoteIds() {
    return new Promise((resolve, reject) => {
      if (db.cache.noteIds && db.cache.noteIds.length > 0) {
        console.debug('getNoteIds from cache ' + JSON.stringify(db.cache.noteIds));
        resolve(db.cache.noteIds);
      } else {
        wx.getStorage({
          key: 'NOTE_ID_LIST',
          success: result => {
            let ids = result.data;
            db.cache.noteIds = ids;
            console.debug(`getNoteIds from db, data: ${JSON.stringify(result)}  ids: ${JSON.stringify(ids)}`);
            resolve(ids);
          },
          fail: reject
        });
      }
    })
  },

  getNotes(ids) {
    return new Promise((resolve, reject) => {
      let notes = [];
      ids.forEach(id => {
        try {
        let item = wx.getStorageSync(id);
        notes.push(item);
        } catch(error) {
          console.error(error);
        }
      });

      notes.sort((left, right) => {
        let temp = left.createdAt - right.createdAt;

        if (temp > 0) {
          return -1;
        } else if (temp < 0) {
          return 1;
        } else {
          return 0;
        }
      });

      resolve(notes);
    })
  },

  getOneNote(id) {
    return new Promise((resolve, reject) => {
      wx.getStorage({
        key: id,
        success: resolve,
        fail: reject
      })
    })
  },

  removeNote(id) {
    return new Promise((resolve, reject) => {
      wx.removeStorage({
        key: id,
        success: resolve,
        fail: reject
      });

      
     db.cache.notes = db.cache.notes.filter(item => {
        return item.id != id;
     });

     db.removeNoteId(id);
    })
  },

  removeNoteId(id) {
    if (id) {
      db.cache.noteIds = db.cache.noteIds.filter(item => {
        return item != id;
      });

      wx.setStorage({
        key: db.KEY.NOTE_ID_LIST,
        data: db.cache.noteIds,
      });
    }
  },

  unwrap(resolve) {
    return function(result) {
        resolve(result.data);
    }
  }
};


module.exports = db;