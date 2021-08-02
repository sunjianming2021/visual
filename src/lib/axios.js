import axios from 'axios';

const server = axios.create({
  timeout: 9000,
});

server.interceptors.response.use((response) => {
  if (response.status === 200) {
    console.log(response.data);
    return response.data;
  }
  throw new Error('服务器错误');
});

export default server;
