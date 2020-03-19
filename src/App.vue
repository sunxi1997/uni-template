<script>
  export default {
    onLaunch: function () {
      console.log('App Launch');
    },
    onShow: function () {
      console.log('App Show');
    },
    onHide: function () {
      console.log('App Hide');
    }
  }
</script>

<style>

  /*每个页面公共css */
  page {
    min-height: 100%;
  }

  /* #ifdef MP-BAIDU */
  page {
    width: 100%;
    height: 100%;
    display: block;
  }

  swan-template {
    width: 100%;
    min-height: 100%;
    display: flex;
  }

  /* 原生组件模式下需要注意组件外部样式 */
  custom-component {
    width: 100%;
    min-height: 100%;
    display: flex;
  }

  /* #endif */

  /* #ifdef MP-ALIPAY */
  page {
    min-height: 100vh;
  }

  /* #endif */

</style>


<style lang="scss">
  /*scss变量 + 通用样式库 */
  @import "style/variables.scss";
  @import "~sx-common-css/index.wx.scss";

  /*通用样式*/
  @import "style/index";

  uni-page-body, page {
    font-size: $fontBase;
    background: $color-background;
  }
