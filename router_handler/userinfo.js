// 导入数据库操作模块
const db = require('../db/index')
// 导入处理密码的模块
const bcrypt = require('bcryptjs')

// 获取用户基本信息的处理函数
exports.getUserInfo = (req, res) => {
  // 查询用户的基本信息
  const sql = `select id, username, nickname, email, avatar from users limit ?, ?`
  const page_num = req.query.page_num //当前的num
  const page_size = req.query.page_size //当前页的数量

  console.log(page_num, page_size)
  if (page_num === undefined || page_size === undefined) {
    const page_num = 1
    const page_size = 6
    const params = [
      (parseInt(page_num) - 1) * parseInt(page_size),
      parseInt(page_size),
    ]
    // 执行 SQL 语句，并传递参数
    db.query(sql, params, (err, results) => {
      // 1. 执行 SQL 语句失败
      if (err) return res.cc(err)
      // 查询总数
      const sql = `select count(*) as total from users`
      db.query(sql, (err, totalnum) => {
        if (err) return res.cc(err)
        const total = totalnum[0]['total'] // 获取总数
        // 将用户信息响应给客户端
        res.send({
          status: 0,
          message: '获取用户基本信息成功！',
          data: {
            page_num: page_num,
            page_size: page_size,
            total: total,
            arr: results,
          },
        })
      })
    })
  } else {
    const params = [
      (parseInt(page_num) - 1) * parseInt(page_size),
      parseInt(page_size),
    ]
    // 执行 SQL 语句，并传递参数
    db.query(sql, params, (err, results) => {
      // 1. 执行 SQL 语句失败
      if (err) return res.cc(err)
      // 查询总数
      const sql = `select count(*) as total from users`
      db.query(sql, (err, totalnum) => {
        if (err) return res.cc(err)
        const total = totalnum[0]['total'] // 获取总数
        // 将用户信息响应给客户端
        res.send({
          status: 0,
          message: '获取用户基本信息成功！',
          data: {
            page_num: page_num,
            page_size: page_size,
            total: total,
            arr: results,
          },
        })
      })
    })
  }
}

// 根据删除用户
exports.deleteUser = (req, res) => {
  // 获取要删除的用户id
  const id = req.body.id
  // 删除用户
  const sql = `delete from users where id = ?`
  db.query(sql, [id], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('删除用户失败！用户不存在！')
    res.send({
      status: 0,
      message: '删除用户成功！',
    })
  })
}
// 更新用户基本信息的处理函数
exports.updateUserInfo = (req, res) => {
  // 定义待执行的 SQL 语句
  const sql = `update users set ? where id=?`
  // 调用 db.query() 执行 SQL 语句并传递参数
  db.query(sql, [req.body, req.body.id], (err, results) => {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    // 执行 SQL 语句成功，但是影响行数不等于 1
    if (results.affectedRows !== 1) return res.cc('更新用户的基本信息失败！')
    // 成功
    res.cc('更新用户信息成功！', 0)
  })
}
// 新增用户
exports.addUser = (req, res) => {
  const userinfo = req.body
  // 定义 SQL 语句，查询用户名是否被占用
  const sqlStr = 'select * from users where username=?'
  db.query(sqlStr, userinfo.username, (err, results) => {
    // 执行 SQL 语句失败
    if (err) {
      // return res.send({ status: 1, message: err.message })
      return res.cc(err)
    }
    // 判断用户名是否被占用
    if (results.length > 0) {
      // return res.send({ status: 1, message: '用户名被占用，请更换其他用户名！' })
      return res.cc('用户名被占用，请更换其他用户名！')
    }
    // 调用 bcrypt.hashSync() 对密码进行加密
    userinfo.password = bcrypt.hashSync(userinfo.password, 10)
    // 定义插入新用户的 SQL 语句
    const sql = 'insert into users set ?'
    // 调用 db.query() 执行 SQL 语句
    db.query(
      sql,
      { username: userinfo.username, password: userinfo.password },
      (err, results) => {
        // 判断 SQL 语句是否执行成功
        if (err) return res.cc(err)
        // 判断影响行数是否为 1
        if (results.affectedRows !== 1)
          return res.cc('新增用户失败，请稍后再试！')
        // 注册用户成功
        // res.send({ status: 0, message: '注册成功！' })
        res.cc('新增用户成功！', 0)
      },
    )
  })
}

// 重置密码的处理函数
exports.updatePassword = (req, res) => {
  // 定义根据 id 查询用户数据的 SQL 语句
  const sql = `select * from users where id=?`

  // 执行 SQL 语句查询用户是否存在
  db.query(sql, req.user.id, (err, results) => {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)

    // 检查指定 id 的用户是否存在
    if (results.length !== 1) return res.cc('用户不存在！')

    // 在头部区域导入 bcryptjs 后，
    // 即可使用 bcrypt.compareSync(提交的密码，数据库中的密码) 方法验证密码是否正确
    // compareSync() 函数的返回值为布尔值，true 表示密码正确，false 表示密码错误
    const bcrypt = require('bcryptjs')

    // 判断提交的旧密码是否正确
    const compareResult = bcrypt.compareSync(
      req.body.oldPwd,
      results[0].password,
    )
    if (!compareResult) return res.cc('原密码错误！')
    // 定义更新用户密码的 SQL 语句
    const sql = `update users set password=? where id=?`

    // 对新密码进行 bcrypt 加密处理
    const newPwd = bcrypt.hashSync(req.body.newPwd, 10)

    // 执行 SQL 语句，根据 id 更新用户的密码
    db.query(sql, [newPwd, req.user.id], (err, results) => {
      // SQL 语句执行失败
      if (err) return res.cc(err)

      // SQL 语句执行成功，但是影响行数不等于 1
      if (results.affectedRows !== 1) return res.cc('更新密码失败！')

      // 更新密码成功
      res.cc('更新密码成功！', 0)
    })
  })
}

// 更新用户头像的处理函数
exports.updateAvatar = (req, res) => {
  const sql = 'update users set user_pic=? where id=?'
  db.query(sql, [req.body.avatar, req.user.id], (err, results) => {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)

    // 执行 SQL 语句成功，但是影响行数不等于 1
    if (results.affectedRows !== 1) return res.cc('更新头像失败！')

    // 更新用户头像成功
    return res.cc('更新头像成功！', 0)
  })
}
