// 文章的处理函数模块
const path = require('path')
const db = require('../db/index')

// 发布新文章的处理函数
exports.addArticle = (req, res) => {
  // 手动判断是否上传了文章封面
  if (!req.file || req.file.fieldname !== 'cover_img')
    return res.cc('文章封面是必选参数！')
  const articleInfo = {
    // 标题、内容、状态、所属的分类Id
    ...req.body,
    // 文章封面在服务器端的存放路径
    cover_img: path.join('/uploads', req.file.filename),
    // 文章发布时间
    pub_date: new Date(),
    // 文章作者的Id
    author_id: req.user.id,
  }
  const sql = `insert into articles set ?`
  // 执行 SQL 语句
  db.query(sql, articleInfo, (err, results) => {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)

    // 执行 SQL 语句成功，但是影响行数不等于 1
    if (results.affectedRows !== 1) return res.cc('发布文章失败！')

    // 发布文章成功
    res.cc('发布文章成功', 0)
  })
}
//获取文章的列表数据的处理函数
exports.getArticleList = (req, res) => {
    //获取所有未被删除的文章
    const sql = 'select * from articles where is_delete =0 order by id asc'
    db.query(sql, (err, results) => {
        console.log(results);
        //sql执行失败
        if (err) { return res.cc(err) }
        //数据库中没有文章
        if (results.length === 0) { return res.cc('没有文章可获取') }
        //执行sql成功
        res.send({
            status: 0,
            message: '获取文章列表成功',
            data: results
        })
    })
}

//根据ID删除文章数据的处理函数
exports.deleteArticleId = (req, res) => {
    const sql = 'update articles set is_delete = 1 where id =?'
    db.query(sql, req.params.id, (err, results) => {
        if (err) { return res.cc(err) }
        if (results.affectedRows !== 1) { return res.cc('删除文章失败！') }
        //删除文章成功
        res.cc('删除成功', 0)
    })
}

//根据ID获取文章数据的处理函数
exports.getArticlesById = (req, res) => {
    const sql = 'select * from articles where id=?'
    db.query(sql, req.params.id, (err, results) => {
        if (err) { return res.cc(err) }
        if (results.length !== 1) { return res.cc('获取文章失败！') }
        res.send({
            status: 0,
            message: '获取文章成功！',
            data: results
        })
    })
}

//根据 Id 更新文章信息
exports.updateArticlesById = (req, res) => {

    //手动判断是否选择了文章封面
    if (!req.file || req.file.fieldname !== 'cover_img') { return res.cc('文章封面是必选参数') }
    // 定义查询 文章标题，所属分类id,文章封面 是否被占用的 SQL 语句
    //举例：查询Id不等于7，标题不等于... ，所属分类不等于... ，文章封面不等于...
    const sql = 'select * from articles where Id<>? and(title=?  or cover_img=? or cate_id=?)'

    db.query(sql, [req.body.Id, req.body.title,{ cover_img: path.join('/uploads', req.file.filename) },req.body.cate_id,], (err, results) => {
        //sql执行失败
        if (err) { return res.cc(err) }
        //文章封面,文章标题及其所属分类id都被占用
        if(results.length===3){return res.cc('文章封面,文章标题及其所属分类id都被占用')}
        //文章封面、文章标题、文章所属分类id其中二项被占用
        if(results.length===2){return res.cc('文章封面、文章标题、文章所属分类id其中二项被占用')}
        // 文章封面、文章标题、文章所属分类id其中一项被占用
        if(results.length===1){return res.cc('文章封面、文章标题、文章所属分类id其中一项被占用')}
        
        //实现更新文章
        const sql='update ev_articles set ? where Id=?'
        db.query(sql,[req.body,req.body.Id],(err,results)=>{
            if(err){return res.cc(err)}
            //更新文章数据成功
            res.cc('修改文章成功！',0)
        })
    })
}