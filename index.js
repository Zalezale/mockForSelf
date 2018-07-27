
const koa = require('koa')
//const cors = require('koa2-cors')
const server = require('koa-static')
const bodyParser = require('koa-bodyparser')
const router = require('koa-router')()
const fs = require('fs')
const publicPath = './source/'
const app = new koa()
/* eslint-disable */
router.get('/', async (ctx, next) => {
    //ctx.query    
    await new Promise((resolve, reject) => {
        fs.readFile(publicPath + ctx.query.name + '.json', 'utf8', (err, data) => {
            if (err) throw err
            resolve(data)
        })
    }).then((data) => {
        ctx.body = data
    })

})
router.get('/', async (ctx, next) => {
    //ctx.query    
    await new Promise((resolve, reject) => {
        fs.readFile(publicPath + ctx.query.name + '.json', 'utf8', (err, data) => {
            if (err) throw err
            resolve(data)
        })
    }).then((data) => {
        ctx.body = data
    })

})
//不能将get设置为动态路由，否则会跨域错误
// router.get('/:name',async (ctx,next)=>{
//     //ctx.request.body
//     let content = ''
//     await new Promise((resolve,reject)=>{
//           fs.readFile(publicPath+ctx.params.name+'.json','utf8',(err,data)=>{
//                 if(err)throw err
//                 resolve(data)
//           })
//     }).then((data)=>{
//         content = data
//     })
//     ctx.body = content
// })
router.post('/:name', async (ctx, next) => {
    //ctx.request.body
    await new Promise((resolve, reject) => {
        fs.readFile(publicPath + ctx.params.name + '.json', 'utf8', (err, data) => {
            if (err) throw err
            resolve(data)
        })
    }).then((data) => {
        ctx.body = data
    })

})
router.post('/img/:name', async (ctx, next) => {
    await new Promise((resolve, reject) => {
        fs.writeFile(publicPath + ctx.params.name + '.png', ctx.request.body, (err, data) => {
            if (err) throw err
            resolve(data)
        })
    }).then((data) => {
        if(ctx.request.body.usr!=='zale'){
            ctx.redirect('../err.html')
        }else{
            ctx.status = 204
        }
    })

})
/**
 * 1.检查资源的有效性。 
 * 2.检查超链接的有效性。 
 * 3.检查网页是否被串改。 
 * 4.多用于自动搜索机器人获取网页的标志信息，获取rss种子信息，或者传递安全认证信息等    
 */
router.head('/:name', async (ctx, next) => {
    await new Promise((resolve, reject) => {
        fs.access(publicPath + ctx.params.name + '.png', fs.constants.F_OK, (err) => {
            if (err) {
                reject()
            } else {
                resolve()
            }
        })
    }).then((data) => {
        ctx.status = 200
    }).catch((err) => {
        ctx.status = 404
    })
})
/**
 * 幂等
 * 创建成功201  更新成功200
 * 响应体无
 */
router.put('/:name', async (ctx, next) => {
    await new Promise((resolve, reject) => {
        fs.writeFile(publicPath + ctx.params.name + '.txt', JSON.stringify(ctx.request.body), (err) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    }).then(() => {
        ctx.set('Location', `${publicPath + ctx.params.name + '.txt'}`)
        ctx.status = 201
    })
})
/* eslint-enable */
app.use(server('./source'))//eslint-disable-line
app.use(bodyParser())
// app.use(cors({
//     origin: function(ctx) {
//         if (ctx.url === '/test') {
//             return false
//         }
//         return '*'
//     },
//     exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
//     maxAge: 5,
//     credentials: false,
//     allowMethods: ['GET', 'POST', 'DELETE'],
//     allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
// }))
app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.set('Access-Control-Max-Age', 172800)
    ctx.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS,PUT,HEAD')//options触发时校验服务器端支持的方法
    ctx.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept')//服务器端支持的头部信息字段
    ctx.set('Access-Control-Expose-Headers', 'WWW-Authenticate,Server-Authorization')
    await next()
})
app.use(router.routes())
app.use(router.allowedMethods())//主要是针对options方法进行处理
app.listen(3000)



