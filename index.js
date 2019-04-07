const puppeteer = require('puppeteer');
const fs = require('fs');

    (async () => {
        try {
            const browser = await puppeteer.launch(
                // {
                //     headless: false
                // }
            );
            console.log('Browser openned');
            const page = await browser.newPage();
            const url = 'https://truyenfull.vn/ke-trom-mo/';
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
                    request.abort();
                } else {
                    request.continue();
                }
            });
            await page.goto(url, {
                timeout: 0
            });
            console.log('Page loaded');

            const metadata = await page.evaluate(() => {
                let imgElements = document.querySelectorAll('#list-chapter > div.row > div > ul > li > a');
                imgElements = [...imgElements];
                let Links = imgElements.map(i => i.getAttribute('href'));
                let page = document.querySelector('#list-chapter > ul > li:nth-child(2) > a').getAttribute('href');
                let metadata = {
                    nextPage: page,
                    allLinks: Links
                }
                return metadata;
            });
            let url2 = metadata.nextPage;
            await page.goto(url2, {
                timeout: 0
            })
            const metadata2 = await page.evaluate(() => {
                let Elements = document.querySelectorAll('#list-chapter > div.row > div > ul > li > a');
                Elements = [...Elements];
                let Links = Elements.map(i => i.getAttribute('href'))
                return Links;
            });
            let full = [];
            metadata.allLinks.forEach(i => {
                full.push(i)
            })
            metadata2.forEach(i => {
                full.push(i)
            })

            let content = ''
            for (i = 0; i < full.length; i++) {
                await page.goto(full[i], {
                    timeout: 0
                })
                await page.waitFor(1000);
                temp = await page.evaluate(() => {
                    let e = document.querySelector('#wrap > div.container.chapter > div > div > div.chapter-c').textContent;
                    console.log(e)
                    return e;
                });
                content += temp
                console.log(i + +1 + " page loaded!")
            }
            //console.log(content)

            fs.writeFile("KeTromMo.txt", content, function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("File saved successfully!");
            });
            await browser.close();
        }
        catch (error) {
            console.log("Catch : " + error);
        }
    })();