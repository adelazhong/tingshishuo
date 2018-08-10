var util = require('../../utils/util.js')
var playTimeInterval
var recordTimeInterval

Page({
  
  data: {
    inputValue: '',
    showView: false,
    recording: false,
    playing: false,
    hasRecord: false,
    recordTime: 0,
    playTime: 0,
    formatedRecordTime: '00:00:00',
    formatedPlayTime: '00:00:00'  
  },
  bindKeyInput: function (e) {
    this.data.inputValue = e.detail.value
  },
  search: function(e){
    
    var that = this
    var flag = false
    var inputValue = this.data.inputValue
    if (inputValue =='') {
      flag = true;
      that.setData({
        introduction:''
      })
      that.setData({
        showView: false
      }) 
    }
    this.setData({
      inputValue: inputValue
    })
    if (!flag) {
    wx.request({
      url:'https://raw.githubusercontent.com/chinese-poetry/chinese-poetry-zhCN/master/poetry/authors.song.json',
      //url: 'https://lrdukcry.qcloud.la/poetry/authors.song.json',

      success: function (res) {
        var song = res.data;
        //console.log(this.song)// 服务器回包信息
        for (var i = 0; i < song.length; i++) {
          if (inputValue == song[i].name) {
            that.setData({
              introduction: song[i].desc
            })
            flag = true
            break
          }
        }
      }
    })
    }
    if (flag == false){
    wx.request({

      url: 'https://raw.githubusercontent.com/chinese-poetry/chinese-poetry-zhCN/master/poetry/authors.tang.json',
      //'https://lrdukcry.qcloud.la/poetry/authors.tang.json',
      success: function (res) {
        var tang = res.data;
        //console.log(this.song)// 服务器回包信息
        for (var i = 0; i < tang.length; i++) {
          if (inputValue == tang[i].name) {
            that.setData({
              introduction: tang[i].desc
            })
            flag = true
            break
          }
        }
      }
    })
    }

    if (flag == false){
    for (var ii = 0; ii <= 57000; ii += 1000) {
      wx.request({
        url: 'https://raw.githubusercontent.com/chinese-poetry/chinese-poetry-zhCN/master/poetry/poet.tang.'+ii+'.json',
        //'https://lrdukcry.qcloud.la/poetry/poet.tang.' + ii + '.json',
        success: function (res) {
          var tang = res.data;
          for (var i = 0; i < tang.length; i++) {
            if (inputValue == tang[i].title) {
              console.log(ii)
              var paragraphs_full = '';
              for (var j = 0; j < tang[i].paragraphs.length;j++) 
                paragraphs_full += tang[i].paragraphs[j]+'\n';
              var strains_full = '';
              for (var j = 0; j < tang[i].strains.length; j++)
                strains_full += tang[i].strains[j] + '\n';
              that.setData({
                introduction: tang[i].title + '\n' + tang[i].author + '\n' + paragraphs_full +'\n'+'声调\n'+strains_full
              })
              flag = true
              that.setData({
                showView: true
              }) 
              break
            }
          }
        }
      })
      if (flag) break
    }
    }
      
    if (flag == false) {
      for (var ii = 0; ii <= 99000; ii += 1000) {
        
        wx.request({
          url: 'https://raw.githubusercontent.com/chinese-poetry/chinese-poetry-zhCN/master/poetry/poet.song.' + ii + '.json',
          //'https://lrdukcry.qcloud.la/poetry/poet.song.' + ii + '.json',
          success: function (res) {
            var song = res.data;
            for (var i = 0; i < song.length; i++) {
              if (inputValue == song[i].title) {
                flag = true
                var paragraphs_full = '';
                for (var j = 0; j < song[i].paragraphs.length; j++)
                  paragraphs_full += song[i].paragraphs[j] + '\n';
                var strains_full = '';
                for (var j = 0; j < song[i].strains.length; j++)
                  strains_full += song[i].strains[j] + '\n';
                that.setData({
                  introduction: song[i].title + '\n' + song[i].author + '\n' + paragraphs_full + '\n' + '声调\n' + strains_full
                })
                flag = true
                that.setData({
                  showView: true
                }) 
                break
              }
            }
          }
        })  
        if (flag) break    
    }
    }
  },
 
  kindToggle: function (e) {
    var id = e.currentTarget.id, list = this.data.list;
    for (var i = 0, len = list.length; i < len; ++i) {
      if (list[i].id == id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }
    this.setData({
      list: list
    });
  },
  gettang:function(event) {
    wx.navigateTo({
      url: '../ts/ts'//实际路径要写全
    })
  },
  onHide: function () {
    if (this.data.playing) {
      this.stopVoice()
    } else if (this.data.recording) {
      this.stopRecordUnexpectedly()
    }
  },
  startRecord: function () {
    this.setData({ recording: true })

    var that = this
    recordTimeInterval = setInterval(function () {
      var recordTime = that.data.recordTime += 1
      that.setData({
        formatedRecordTime: util.formatTime(that.data.recordTime),
        recordTime: recordTime
      })
    }, 1000)
    wx.startRecord({
      success: function (res) {
        that.setData({
          hasRecord: true,
          tempFilePath: res.tempFilePath,
          formatedPlayTime: util.formatTime(that.data.playTime)
        })
      },
      complete: function () {
        that.setData({ recording: false })
        clearInterval(recordTimeInterval)
      }
    })
  },
  stopRecord: function () {
    wx.stopRecord()
  },
  stopRecordUnexpectedly: function () {
    var that = this
    wx.stopRecord({
      success: function () {
        console.log('stop record success')
        clearInterval(recordTimeInterval)
        that.setData({
          recording: false,
          hasRecord: false,
          recordTime: 0,
          formatedRecordTime: util.formatTime(0)
        })
      }
    })
  },
  playVoice: function () {
    var that = this
    playTimeInterval = setInterval(function () {
      var playTime = that.data.playTime + 1
      console.log('update playTime', playTime)
      that.setData({
        playing: true,
        formatedPlayTime: util.formatTime(playTime),
        playTime: playTime
      })
    }, 1000)
    wx.playVoice({
      filePath: this.data.tempFilePath,
      success: function () {
        clearInterval(playTimeInterval)
        var playTime = 0
        console.log('play voice finished')
        that.setData({
          playing: false,
          formatedPlayTime: util.formatTime(playTime),
          playTime: playTime
        })
      }
    })
  },
  pauseVoice: function () {
    clearInterval(playTimeInterval)
    wx.pauseVoice()
    this.setData({
      playing: false
    })
  },
  stopVoice: function () {
    clearInterval(playTimeInterval)
    this.setData({
      playing: false,
      formatedPlayTime: util.formatTime(0),
      playTime: 0
    })
    wx.stopVoice()
  },
  clear: function () {
    clearInterval(playTimeInterval)
    wx.stopVoice()
    this.setData({
      playing: false,
      hasRecord: false,
      tempFilePath: '',
      formatedRecordTime: util.formatTime(0),
      recordTime: 0,
      playTime: 0
    })
  }
})

