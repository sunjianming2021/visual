export default class SocketService {
  // 和服务连接的socket对象
  ws = null

  // 标示是否连接成功
  connected = false

  // 记录重试的次数
  sendRetryCount = 0

  // 重新连接尝试的次数
  connectRetryCount = 0

  // 存储回调函数
  callBackMapping = {}

  // 单例模式
  static instance = null

  static get Instance() {
    if (!this.instance) {
      this.instance = new SocketService();
    }
    return this.instance;
  }

  // 定义连接服务器办法
  connection() {
    if (!window.WebSocket) {
      console.log('您的浏览器不支持webSocket');
    }
    let socketUrl = `ws:${window.location.host}/socket`;
    // eslint-disable-next-line
    console.log(socketUrl)
    socketUrl = socketUrl.replace('https', 'ws').replace('http', 'ws');
    this.ws = new WebSocket(socketUrl);
    // 连接成功事件
    this.ws.addEventListener('open', this.handleOpen.bind(this));
    // 连接失败
    this.ws.addEventListener('close', this.handleClose.bind(this));
    // 接受服务器信息
    this.ws.addEventListener('message', this.handleMessage.bind(this));
  }

  handleOpen() {
    console.log('连接成功');
    this.connected = true;
    this.connectRetryCount = 0;
  }

  handleClose() {
    console.log('连接服务器失败');
    this.connected = false;
    this.connectRetryCount += 1;
    setTimeout(() => {
      this.connection();
    }, this.connectRetryCount * 500);
  }

  handleMessage(msg) {
    const recvData = JSON.parse(msg.data);
    const { socketType, action } = recvData;
    // 判断回调函数是否存在
    if (this.callBackMapping[socketType]) {
      let realData = null;
      switch (action) {
        case 'getData':
          realData = JSON.parse(recvData.data);
          this.callBackMapping[socketType].call(this, realData);
          break;
        case 'fullScreen':
          this.callBackMapping[socketType].call(this, recvData);
          break;
        default:
          this.callBackMapping[socketType].call(this, recvData);
          break;
      }
    }
  }

  /**
   * 发送数据的方法
   * @param {*} data
   */
  send(data) {
    // 判断有没有成功
    if (this.connected) {
      this.ws.send(JSON.stringify(data));
    } else {
      this.sendRetryCount += 1;
      setTimeout(() => {
        this.send(data);
      }, this.sendRetryCount * 500);
    }
  }

  /**
   * 回到函数注册
   * @param {*} socketType 回调函数名称
   * @param {*} callBack 回调函数
   */
  registerCallBack = (socketType, callBack) => {
    this.callBackMapping[socketType] = callBack;
  }

  /**
   * 注销回调函数
   * @param {*} socketType 回调函数名称
   */
  unRegisterCallBack =(socketType) => {
    this.callBackMapping[socketType] = null;
  }
}
