const theme = {
  chalk: {
    // 背景颜色
    backgroundColor: '#161522',
    // 标题文字颜色
    titleColor: '#fff',
    // 切换主题图片路径
    themeSrc: 'qiehuan_dark.png',
    // 页面顶部边框图片
    headerBorderSrc: 'header_border_dark.png',
    // 下拉框颜色
    downBackgroundColor: '#222733',

  },
  vintage: {
    // 背景颜色
    backgroundColor: '#eee',
    // 标题文字颜色
    titleColor: '#000',
    // 切换主题图片路径
    themeSrc: 'qiehuan_light.png',
    // 页面顶部边框图片
    headerBorderSrc: 'header_border_light.png',
    // 下拉框颜色
    downBackgroundColor: '#fff',
  },
};

export function getThemeValue(themeName) {
  return theme[themeName];
}
