const dayjs = require('dayjs')

const currentYear = () => dayjs().year()
// 原本上面這一行沒有
// 但其實就只是要把函數放在外面寫、還是要放到module.exports而已

module.exports = {
  currentYear,
  // 下面這行是課程原本放到裡面的 我把他拿到外面 仍然可以work
  // currentYear: () => dayjs().year()
  includes: function(arr, val, options) {
    return arr.indexOf(val) !== -1 ? options.fn(this) : options.inverse(this)
  },
  ifCond: function(a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  }
  // orCond: function(a, b, options) {
  //   return a || b ? options.fn(this) : options.inverse(this)
  // }
}