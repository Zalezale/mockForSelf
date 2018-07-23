
const koa = require('koa')
//const cors = require('koa2-cors')
//const server = require('koa-static')
const bodyParser = require('koa-bodyparser')
const router = require('koa-router')()
const fs = require('fs')
const publicPath = './source/'
const app = new koa()
/* eslint-disable */
router.get('/',async (ctx,next)=>{
    //ctx.query    
    let content = ''
    console.log(ctx.query.name)
    await new Promise((resolve,reject)=>{
        fs.readFile(publicPath+ctx.query.name+'.json','utf8',(err,data)=>{
              if(err)throw err
              resolve(data)
        })
  }).then((data)=>{
      console.log(data)
      content = data
  })
    ctx.body = content
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
router.post('/:name',async (ctx,next)=>{
    //ctx.request.body
    let content = ''
    await new Promise((resolve,reject)=>{
          fs.readFile(publicPath+ctx.params.name+'.json','utf8',(err,data)=>{
                if(err)throw err
                resolve(data)
          })
    }).then((data)=>{
        content = data
    })
    ctx.body = content
})
/* eslint-enable */
//app.use(server('./source'))//eslint-disable-line
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
app.use(async (ctx,next)=>{
    ctx.set('Access-Control-Allow-Origin','*')
    ctx.set('Access-Control-Max-Age',172800)
    ctx.set('Access-Control-Allow-Methods','GET,POST,DELETE,OPTIONS')//options触发时校验服务器端支持的方法
    ctx.set('Access-Control-Allow-Headers','Content-Type,Authorization,Accept')//服务器端支持的头部信息字段
    ctx.set('Access-Control-Expose-Headers','WWW-Authenticate,Server-Authorization')
    await next()
})
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(3000)



