const express = require("express");
const fetch = require("node-fetch");
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());
const PORT = 3001;

// Enable CORS for all origins
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

var loginSuccess = false;
var page;
var reqResContainer = {
    req : {query : {url : ""}},
    res : {
            json : function (json) {
                console.log(json);
            }
    },
    targetURL: null,
    ssoURL : null
}

async function loadPage(url) {
    const browser = await puppeteer.launch({
        headless: false, // must be visible for login
        defaultViewport: null
    });
    page = await browser.newPage();

    page.on('response', async (response) => {
        const url = response.url();
        if  (reqResContainer.req.query.ssoUrl && url.startsWith(reqResContainer.req.query.ssoUrl) && response.status() === 200) {
            loginSuccess = true;
            console.log('Logged in, now waiting for API call...');
        }
        if (url.startsWith(reqResContainer.req.query.url) && response.status() === 200) {
            if(!reqResContainer.req.query.ssoUrl){ // no separate SSO URL, so we are done after this call
                loginSuccess = true;
                console.log('Logged in');
            }
            console.log('API call detected: ' + url);
            try {
                const contentType = response.headers()['content-type'] || '';
                console.log( contentType + ' response detected');
                if(contentType.includes("application/json")){
                    data = await response.json();
                    reqResContainer.res.json(data);
                } else if(contentType.includes("png")) {
                    data  = await response.buffer();
                    reqResContainer.res.type(contentType).send(data);
                } else  {
                    data  = await response.text();
                    reqResContainer.res.type(contentType).send(data);
                }
            } catch (err) {
                console.error('Failed to parse API response', err);
            }
        }
    });

    console.log('Navigating to URL...:' + url);
    await page.goto(url, {
        waitUntil: 'domcontentloaded'
    });

    console.log('Waiting for redirect back...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
}

app.get('/sso-proxy', async (req, res) => {
    try {
        const ssoURL =  req.query.ssoUrl;
        const targetURL = req.query.url;
        reqResContainer.req = req;
        reqResContainer.res = res;
        console.log(`Get - ${req.query.url} ${ssoURL}`);

        if(loginSuccess) {
            console.log('Already logged in, accessing URL directly...');
            await page.goto(targetURL, {
                waitUntil: 'domcontentloaded'
            });
        } else {
            await loadPage(ssoURL ? ssoURL : targetURL);
            if(ssoURL) {
                //load target URL after login
                await page.goto(targetURL, {
                    waitUntil: 'domcontentloaded'
                });
            }
        }
    } catch (error) {
        console.error('Error loading page via proxy:', error);
        res.status(500).json({ error: error, action: "Please restart proxy"});
    }
});

app.listen(PORT, () => {
    console.log(`SSO Proxy server running at http://localhost:${PORT}`);
});