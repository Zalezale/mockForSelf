
const koa = require('koa')
const server = require('koa-static')
const router = require('koa-router')()
const fs = require('fs')
const os = require('os')
const bodyParse = require('koa-bodyparser')
const publicPath = './source/'
const app = new koa()

/* eslint-disable */
//往public文件中配置当前的ip地址
fs.writeFile("./public.js", "const localIp = 'http://" + os.networkInterfaces().en0[1].address + ":3000/'//eslint-disable-line", function (err) {
    if (err) throw new Error('写入ip时出错')
})
//获取操作界面
router.get('/', async (ctx, next) => {
    await new Promise((resolve, reject) => {
        fs.readFile('./index.html', 'utf8', (err, data) => {
            if (err) throw err
            resolve(data)
        })
    }).then((data) => {
        ctx.body = data
    })

})
//不能将get设置为动态路由，否则会跨域错误
//获取资源
router.get('/source', async (ctx, next) => {
    await new Promise((resolve, reject) => {
        fs.readFile(publicPath + ctx.query.name + '.json', 'utf8', (err, data) => {
            if (err) throw err
            resolve(data)
        })
    }).then((data) => {
        ctx.body = data
    })
})
//获取资源
router.post('/:name', async (ctx,
     next) => {
    console.log(ctx.request.body)
    await new Promise((resolve, reject) => {
        fs.readFile(publicPath + ctx.params.name + '.json', 'utf8', (err, data) => {
            if (err) throw err
            resolve(data)
        })
    }).then((data) => {
        console.log(ctx.req)
        if (ctx.request.body.name == 'zale') {
            ctx.redirect('./err.html')
        } else {
            ctx.body = data
        }
    })

})
//上传文件（json）
router.post('/json/:name', async (ctx, next) => {
    await new Promise((resolve, reject) => {
        let chunks = []
        ctx.req.on('data', (chunk) => {
            chunks.push(chunk)
        })
        ctx.req.on('end', () => {
            let data = Buffer.concat(chunks)
            resolve(data.toString('utf8').split('\r\n')[4])
        })
    }).then((data) => {
        return new Promise((resolve, reject) => {
            var writerStream = fs.createWriteStream(publicPath + ctx.params.name + '.json');
            // 使用 utf8 编码写入数据
            writerStream.write(data, 'UTF8');
            // 标记文件末尾
            writerStream.end();
            // 处理流事件 --> data, end, and error
            writerStream.on('finish', function () {
                resolve()
            });
            writerStream.on('error', function (err) {
                reject(err)
            });
        })
    }).then(() => {
        ctx.status = 200
    }).catch(()=>{
        ctx.redirect('./err.html')
    })
})
//上传文件（图片）
router.post('/img/:name', async (ctx, next) => {
    await new Promise((resolve, reject) => {
        let chunks = []
        ctx.req.on('data', (chunk) => {
            chunks.push(chunk)
        })
        ctx.req.on('end', () => {
            let data = Buffer.concat(chunks)
            let arry = data.toString('binary').split('\r\n')
            //arry.shift() //手机上的upload上传时添加这个
            arry.shift()
            arry.shift()
            arry.shift()
            arry.shift()
            arry.pop()
            arry.pop()
            resolve(Buffer.from(arry.join('\r\n'), 'binary'))
        })
    }).then((data) => {
        return new Promise((resolve, reject) => {
            var writerStream = fs.createWriteStream(publicPath + ctx.params.name + '.png');
            // 使用 utf8 编码写入数据
            writerStream.write(data, 'binary');
            // 标记文件末尾
            writerStream.end();
            // 处理流事件 --> data, end, and error
            writerStream.on('finish', function () {
                resolve()
            });
            writerStream.on('error', function (err) {
                reject(err)
            });
        })
    }).then(() => {
            ctx.status = 200
    }).catch((err)=>{
        ctx.redirect('./err.html')
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
app.use(bodyParse())
app.use(router.routes())
app.use(router.allowedMethods())//主要是针对options方法进行处理
app.listen(3000)



