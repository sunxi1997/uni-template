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

<style lang="scss">

  /*scss变量 + 通用样式库 */
  @import "style/variables.scss";
  @import "~sx-common-css/index.wx.scss";

  /*uni-app样式问题修复*/
  @import "style/uni-reset";


  /*color-ui*/
  @import "colorui/index";

  /*样式表*/
  @import "style/index";
</style>
