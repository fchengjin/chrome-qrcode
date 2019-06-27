// 使用webRTC获取用户当前ip
// 创建RTCPeerConnection接口
let localIP
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
let getUrl = function (url) {
  const localReg = /^http(s)?:\/\/(localhost|127\.0\.0\.1|0(\.0){3})(:\d+)?\//i
  let count = 0;
  if (localReg.test(url)) {
    // 属于本地地址
    var reg = /(localhost|127\.0\.0\.1|0(\.0){3})/
    // 创建一个不断获取localIP的定时器, 当localIP有值时，返回
    return new Promise(function (resolve, reject) {
      var t = setInterval(function () {
        count++
        if (localIP) {
          clearInterval(t)
          resolve(url.replace(reg, localIP))
        }
        // 如果获取不到localIP则直接返回原来的ip
        if (count > 19) {
          resolve(url)
        }
      }, 100)
    })
  } else {
    return Promise.resolve(url)
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



const getCurrentUrl = function () {
  return new Promise(function (resolve) {
    chrome.tabs.getSelected(async function (tab) {
      console.log('tabSelected')
      const tmp = await getUrl(tab.url)
      resolve(tmp)
    })
  })
}

document.addEventListener('DOMContentLoaded', async function (e) {
  console.log('domContentLoaded')
  url = await getCurrentUrl()
  const qrCodeContainer = document.querySelector('.qrcode')
  const appContainer = document.querySelector('.app')
  const urlContainer = document.querySelector('.url')
  const copyBtn = document.querySelector('.copy-btn')
  const toastContainer = document.querySelector('.toast')
  const toast = {
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
  urlContainer.addEventListener('keydown', async function (e) {
    if (e.keyCode === 13) {
      url = await getUrl(urlContainer.value);
      console.log('url', url)
      createQrcode(qrCodeContainer, url)
      urlContainer.blur()
      urlContainer.value = url
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
  urlContainer.value = url
  createQrcode(qrCodeContainer, url)
})