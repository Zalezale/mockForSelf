
const koa = require('koa')
const cors = require('koa2-cors')
const server = require('koa-static')
const bodyParser = require('koa-bodyparser')
const router = require('koa-router')()
const fs = require('fs')
const publicPath = './source/'
const app = new koa()
/* eslint-disable */
router.get('/',async (ctx,next)=>{
    //ctx.query    
    let content = ''
    await new Promise((resolve,reject)=>{
        fs.readFile(publicPath+ctx.query.name+'.json','utf8',(err,data)=>{
              if(err)throw err
              resolve(data)
        })
  }).then((data)=>{
      content = data
  })
  ctx.body = content
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
app.use(server('./source'))//eslint-disable-line
app.use(bodyParser())
app.use(cors({
    origin: function(ctx) {
        if (ctx.url === '/test') {
            return false
        }
        return '*'
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: false,
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}))
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(3000)



