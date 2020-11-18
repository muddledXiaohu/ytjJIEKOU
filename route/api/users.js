
const koa = require( 'koa')


const bodyParser= require('koa-bodyparser')

// 实例化
const app = new koa()

const router = require('koa-router')()


const DB = require('../db')

// 引入token生成
const jwt = require('jsonwebtoken')

app.use(bodyParser());      // 将模块作为koa的中间件引入

// 创建用户
router.post("/users/establish", async (ctx) => {
    let body = ctx.request.body
    
    const dataId = await DB.find('users', {})
    const lastId = dataId[dataId.length - 1]
    const ids = lastId.id + 1

    const params = {
        username:body.username,
        password:body.password,
        id:ids
    }
    const data = await DB.insert('users', params)
    ctx.body = JSON.stringify(data); // 响应请求，发送处理后的信息给客户端
})



// 用户登录
router.post('/login', async ctx => {
    const data = ctx.request.body
    await DB.find('users', {username: data.username}).then((datas) => {
        for (const key in datas) {
            var password = datas[key].password
        }
        if (datas.length === 0) {
            ctx.body = {
                'code': 0,
                'data': {},
                'mesg': '没有该用户，请注册',
                status: 400
            }    
        } else if (password !== data.password) {
            ctx.body = {
                'code': 0,
                'data': {},
                'mesg': '密码错误',
                status: 400
            }

        } else {
            const secret = 'secret'
            function getToken(payload = {}) {
                return jwt.sign(payload, secret, { expiresIn: '4h' })
            }
            let token = getToken({uid: "12306", username: "EsunR"}) // 将关键信息记录与 Token 内
            console.log(token)
            ctx.body = {
                'code': 1,
                'data': {
                    token
                },
                'mesg': '登录成功',
                status: 200
            }
        }
    })
  })


// 表单分页
  router.post("/aduser",async (ctx) => {
    //koa-bodyparser解析前端参数
    let reqParam= ctx.request.body;//
    let querya = String(reqParam.params.query);//检索内容
    let page = Number(reqParam.params.pagenum);//当前第几页
    let size = Number(reqParam.params.pagesize);//每页显示的记录条数

    const everyOne =  await DB.find('users') //表总记录数
    //显示符合前端分页请求的列表查询
    // let options = { "limit": size,"skip": (page-1)*size};
    await DB.count('users', {username: new RegExp(querya)}, size, (page-1)*size).then((datas) => {
        //返回给前端
        ctx.body = JSON.stringify({totalpage:everyOne.length,pagenum:page,pagesize:size, users: datas})
    })
    //是否还有更多
    // let hasMore=totle-(page-1)*size>size?true:false;
  });


//------------------------------------------------------------------------
// 查看题目
router.post("/subject", async (ctx) => {
    //koa-bodyparser解析前端参数
    let reqParam= ctx.request.body;//
    let querys = String(reqParam.params.query);//检索内容
    let page = Number(reqParam.params.pagenum);//当前第几页
    let size = Number(reqParam.params.pagesize);//每页显示的记录条数

    const everyOne =  await DB.find('subject') //表总记录数
    //显示符合前端分页请求的列表查询
    // let options = { "limit": size,"skip": (page-1)*size};
    console.log(querys);
    await DB.count('subject', {ask: new RegExp(querys)}, size, (page-1)*size).then((datas) => {
        //返回给前端
        ctx.body = JSON.stringify({totalpage:everyOne.length,pagenum:page,pagesize:size, users: datas})
    })
    //是否还有更多
    // let hasMore=totle-(page-1)*size>size?true:false;
})

// id查询
router.get("/subject/:id", async (ctx) => {
    let ids = ctx.params
    let id = parseInt(ids.id)
    await DB.find('subject', {id: id}).then((data) => {
        ctx.body = JSON.stringify(data); // 响应请求，发送处理后的信息给客户端
    })
})


// 修改题目
router.post("/subject/modify/:id", async (ctx) => {
    // 查询id
    let ids = ctx.params
    let id = parseInt(ids.id)
    var ChangedData = []
    await DB.find('subject', {id: id}).then((data) => {
        ChangedData = data
    })
    let A = ''
    let B = ''
    let C = ''
    let answer = ''
    for (const key in ChangedData) {
       A = ChangedData[key].A
       B = ChangedData[key].B
       C = ChangedData[key].C
       answer = ChangedData[key].answer
    }
    const original = {
        A: A,
        B: B,
        C: C,
        answer: answer
    }

    // 修改内容
    let body = ctx.request.body
    const datas = await DB.update('subject', original, body)
    console.log(datas.result);
    ctx.body = JSON.stringify(datas); // 响应请求，发送处理后的信息给客户端

})


// 创建题目
router.post("/subject/establish", async (ctx) => {
    let body = ctx.request.body
    
    const dataId = await DB.find('subject', {})
    const lastId = dataId[dataId.length - 1]
    const ids = lastId.id + 1

    const params = {
            username: 'fire',
            id: ids,
            classification: '单选题',
            ask: body.ask,
            A: body.A,
            B: body.B,
            C: body.C,
            answer: body.answer
    }
    const data = await DB.insert('subject', params)
    ctx.body = JSON.stringify(data); // 响应请求，发送处理后的信息给客户端
})

// 删除题目
router.delete("/subject/:id", async (ctx) => {
    let ids = ctx.params
    let id = parseInt(ids.id)
    const data = await DB.remove('subject', {id: id})
    console.log(data);
    ctx.body = JSON.stringify(data); // 响应请求，发送处理后的信息给客户端
})

// 查询全部考题信息
router.get("/subjectFire", async (ctx) => {
    const data = await DB.find('subject', {})
    ctx.body = JSON.stringify(data); // 响应请求，发送处理后的信息给客户端
})

// -----------------------------------------------------------------------------------

module.exports = router