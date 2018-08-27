const koa = require('koa')
const server = require('koa-static')
const router = require('koa-router')()
const fs = require('fs')
const os = require('os')
const koaBody = require('koa-body')
const publicPath = './source/'
const app = new koa()
/* eslint-disable */
//往public文件中配置当前的ip地址
fs.writeFile("./public.js", "const localIp = 'http://" + os.networkInterfaces().en0[1].address + ":3000/'//eslint-disable-line", function (err) {
    if (err) throw new Error('写入ip时出错')
})

//基于组件获取响应数据
router.post('/:webserviceName/:apiName', async (ctx) => {
    let api = ctx.params.apiName
    await new Promise((resolve, reject) => {
        fs.readFile(`${publicPath + api}.json`, 'utf8',function (err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    }).then((data)=>{
        ctx.body= data
    }).catch((err)=>{
        ctx.status = 500
        ctx.body = err
    })
})
//基于组件来上传响应数据
router.post('/', async (ctx) => {
    let file = ctx.request.files.file
    function createFile(fileData) {
        const reader = fs.createReadStream(fileData.path); // 创建可读流
        const ext = fileData.name.split('.').pop(); // 获取上传文件扩展名
        const upStream = fs.createWriteStream(`source/${file.name}`); // 创建可写流
        reader.pipe(upStream)
    }
    await createFile(file)
    ctx.body = '文件上传成功'
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
        fs.writeFile(publicPath + ctx.params.name + '.json', JSON.stringify(ctx.request.body), (err) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    }).then(() => {
        ctx.set('Location', `${publicPath + ctx.params.name + '.json'}`)
        ctx.status = 201
    })
})
/* eslint-enable */
app.use(server('./source'))//eslint-disable-line
app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.set('Access-Control-Max-Age', 172800)
    ctx.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS,PUT,HEAD')//options触发时校验服务器端支持的方法
    ctx.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept')//服务器端支持的头部信息字段
    ctx.set('Access-Control-Expose-Headers', 'WWW-Authenticate,Server-Authorization')
    await next()
})
app.use(koaBody({
    multipart: true,
    formidable: {
        maxFileSize: 200 * 1024 * 1024 // 设置上传文件大小最大限制，默认2M
    }
}))
app.use(router.routes())
app.use(router.allowedMethods())//主要是针对options方法进行处理
app.listen(3000)




