const { User, Class, List } = require('../models')

const adminController = {
  getTimeLists: (req, res, next) => {
    return Promise.all([
      List.findAll({ raw: true }),
      req.params.id ? List.findByPk(req.params.id, { raw: true }) : null 
      // 若req.params.id 存在, 則尋找data, 否則回傳 null 
      // req.params.id 是否存在, 取決於路由是否有 id, 也就是是否點擊在 edit按鈕上
    ])    
      .then(([lists, list]) => {
        return res.render('admin/time-list', { lists, list })
      })
  },
  postTimeList: (req, res, next) => {
    const { oclock } = req.body
    if (!oclock) throw new Error('Creating nothing is forbidden.')
    return List.findOne({ where: { oclock } })
      .then(list => {
        if(list) throw new Error('It has already been in list')
        return List.create({ oclock })
      })
      .then(() => {
        req.flash('success_msg', '新增成功！')
        return res.redirect('/admin')
      })
      .catch(err => next(err))
  },
  putTimeList: (req, res, next) => {
    const { id } = req.params
    const { oclock } = req.body

    if (!oclock) throw new Error('Updating nothing is forbidden.')    
    return List.findByPk(id)
      .then(list => {
        if(list.oclock === oclock) throw new Error('You updated nothing : (')
        return list.update({ oclock })
      })
      .then(() => {
        req.flash('success_msg', '更新成功！')
        return res.redirect('/admin')
      })
      .catch(err => next(err))
  },
  deleteTimeList: (req, res, next) => {
    const { id } = req.params
    return List.findByPk(id)
      .then(list => {
        if(!list) throw new Error('There is no such list : (')
        return list.destroy()
      })    
      .then(() => {
        req.flash('success_msg', '刪除成功！')
        return res.redirect('/admin')
      })
      .catch(err => next(err))      
  }
}

module.exports = adminController