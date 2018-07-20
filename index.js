
const koa = require('koa')
const server = require('koa-static')
const bodyParser = require('koa-bodyparser')
const router = require('koa-router')()
const fs = require('fs')
const publicPath = './source/'
const app = new koa()
app.use(server(__dirname+'/source/',{extensions:['.json']}))//eslint-disable-line
app.use(bodyParser())
app.use(router.routes())
/* eslint-disable */
router.get('/:name',async (ctx,next)=>{
    let content = ''
    await new Promise((resolve,reject)=>{
        fs.readFile(publicPath+ctx.params.name+'.json','utf8',(err,data)=>{
            if(err)throw err
            resolve(data);
        })
    }).then(function(data){
        content = data
    })
    ctx.body=content
})
router.post('/api/:name',(ctx,next)=>{
    
})
router.put('/api/:name',(ctx,next)=>{
    
})
router.del('/api/:name',(ctx,next)=>{
    
})
/* eslint-enable */
app.use(router.allowedMethods())
app.listen(3000)



