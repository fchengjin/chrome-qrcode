# chrome生成当前网址二维码插件
一键生成当前网址二维码，并自动将localhost,127.0.0.1,0.0.0.0转化为本机局域网ip，方便在真机上调试
> 前提是没有禁止WebRTC,默认是开启的.
# 特点，使用webRTC获取浏览器ip
参考[怎样用 JavaScript 程序获取客户的 IP 地址？ - Illgo的回答 - 知乎](https://www.zhihu.com/question/20675353/answer/335325619)
# 使用方法
- 下载`qrcode.crx`
- 打开chrome扩展程序窗口（地址栏输入: `chrome://extensions`）
- 将下载好的`qrcode.crx`拖进上面的窗口
- 接下来就愉快的使用吧
# 注意
- 如果电脑开了代理，则获取到的二维码有可能不正确
- 建议使用最新版chrome浏览器