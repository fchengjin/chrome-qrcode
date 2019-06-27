// 使用webRTC获取用户当前ip
// 创建RTCPeerConnection接口
var localIP
let conn = new RTCPeerConnection({
  iceServers: []
})
let noop = function () {}
conn.onicecandidate = function (ice) {
  if (ice.candidate) {
    // 使用正则获取ip
    const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
    localIP = ipRegex.exec(ice.candidate.candidate)[1]
    console.log(ice.candidate)
    conn.onicecandidate = noop
  }
}
// 随便创建一个叫狗的通道(channel)
conn.createDataChannel('dog')
// 创建一个SDP协议请求
conn.createOffer(conn.setLocalDescription.bind(conn), noop)

// 获取准确url
var getUrl = function (url) {
  var localReg = /^http(s)?:\/\/(localhost|127\.0\.0\.1|0(\.0){3})(:\d+)?\//i
  if (localReg.test(url)) {
    // 属于本地地址
    var reg = /(localhost|127\.0\.0\.1|0(\.0){3})/
    // 创建一个不断获取localIP的定时器, 当localIP有值时，返回
    return new Promise(function (resolve, reject) {
      var t = setInterval(function () {
        if (localIP) {
          clearInterval(t)
          resolve(url.replace(reg, localIP))
        }
      }, 100)
    })
  } else {
    return new Promise(function (resolve, reject) {
      resolve(url)
    })
  }
}
// 创建二维码
var createQrcode = function (ele, url) {
  ele.innerHTML = ''
  qrCode = new QRCode(ele, {
    text: url,
    width: 200,
    height: 200,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  })
}

var init = function () {
  var url
  var qrCodeContainer, urlContainer, copyBtn
  chrome.tabs.getSelected(function (tab) {
    getUrl(tab.url).then(function (val) {
      url = val
    })
  })
  document.addEventListener('DOMContentLoaded', function (e) {
    qrCodeContainer = document.querySelector('.qrcode')
    appContainer = document.querySelector('.app')
    urlContainer = document.querySelector('.url')
    copyBtn = document.querySelector('.copy-btn')
    toastContainer = document.querySelector('.toast')
    var toast = {
      show(text) {
        toastContainer.innerText = text || '复制成功'
        appContainer.classList.add('show-toast')
        setTimeout(this.hide, 2000)
      },
      hide() {
        appContainer.classList.remove('show-toast')
      }
    }
    
    // 回车重绘二维码
    urlContainer.addEventListener('keydown', function(e) {
      if(e.keyCode === 13) {
        url = urlContainer.value;
        createQrcode(qrCodeContainer, url)
        urlContainer.blur()
      }
    })
    copyBtn.addEventListener('click', function () {
      urlContainer.select()
      var bool = document.execCommand('copy', true)
      if (bool) {
        toast.show('复制成功')
      } else {
        toast.show('复制失败')
      }
      urlContainer.blur()
    })
  })
  var timer = setInterval(function () {
    if (url && qrCodeContainer && urlContainer) {
      urlContainer.value = url
      createQrcode(qrCodeContainer, url)
      clearInterval(timer)
    }
  }, 100)
}

init()