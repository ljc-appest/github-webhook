var http = require('http')
var request = require('request');
var createHandler = require('github-webhook-handler')
var handler = createHandler({ path: '/webhook', secret: 'gD16Ob3@ilwp' })

// 打印所有的event
// var events = require('github-webhook-handler/events')
// Object.keys(events).forEach(function (event) {
//   console.log(event, '=', events[event])
// })

http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(3000)

handler.on('error', function (err) {
  console.error('Error:', err.message)
})

handler.on('pull_request_review', function (event) {

    var url = event.payload.pull_request.html_url
    var action = event.payload.action
    var user = event.payload.sender.login
    var sender = event.payload.sender.login
    var desc = event.payload.review.body
    .split('\n')
    .map((val)=>{  
        return "> " + val; 
    })
    .join('\n')

    var path = require('url').parse(url).pathname   

    var review_url = event.payload.review.html_url
    content = `
A [review](${review_url}) ${action} by ${user} to [${path}](${url})\n
⠀\n
> ${desc}
`;

    var payload = {
        "msgtype": "markdown",
        "markdown": {
          "content": content
        }
    };

    request({
        url: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=e3a930c9-c4dd-44e6-981e-a1d1e9a434ca",
        method: "POST",
        json: true,
        body: payload
    }, function (error, response, body){
        console.log(error);
        console.log(response);
    });

})

handler.on('pull_request', function (event) {

    var url = event.payload.pull_request.html_url
    var action = event.payload.action
    var user = event.payload.sender.login
    var from = event.payload.pull_request.head.label
    var to = event.payload.pull_request.base.label
    var merged = event.payload.pull_request.merged
    var desc = event.payload.pull_request.body
    .split('\n')
    .map((val)=>{  
        return "> " + val; 
    })
    .join('\n')

    var path = require('url').parse(url).pathname    

    var status = ""

    switch (action) {
        case 'opened':
            status = action
            break;
        case 'closed':
            if (merged) {
                action = "merged"
            }
            status = merged ? `<font color="info">${action}</font>` : action
            break;
        default:
            return;
    }

    var content = ""

    if (action == "opened") {
        content = `
[${path}](${url}) ${status} by ${user}\n
⠀\n
\`${to}\` <- \`${from}\`\n
⠀\n
> ${desc}
`;
    } else {
        content = `
[${path}](${url}) ${action} by ${user}\n
`;
    }

    var payload = {
        "msgtype": "markdown",
        "markdown": {
          "content": content
        }
    };

    request({
        url: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=e3a930c9-c4dd-44e6-981e-a1d1e9a434ca",
        method: "POST",
        json: true,
        body: payload
    }, function (error, response, body){
        console.log(error);
        console.log(response);
    });

})

