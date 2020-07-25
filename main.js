const puppeteer = require('puppeteer');
const con = require('./connectDB.js');

(async () => {
    try {
        const browser = await puppeteer.launch(
            // {
            //     headless: false
            // }
        );
        const page = await browser.newPage();
        // fulltime
        // const url = 'https://vieclam24h.vn/tim-kiem-viec-lam-nhanh/?gate=sv&hdn_tu_khoa=&hdn_nganh_nghe_cap1=&hdn_dia_diem=&trinh_do=&hdn_cap_bac=&hdn_hinh_thuc=1&key=ttv_nangcao';
        // partime
        const url = 'https://vieclam24h.vn/tim-kiem-viec-lam-nhanh/?hdn_tu_khoa=&hdn_nganh_nghe_cap1=46&hdn_dia_diem=2&key=ttv_nangcao'
        await page.goto(url, {
            timeout: 0
        });

        await page.waitFor(3000)

        const allLinks = await page.evaluate(() => {
            let jobs = document.querySelectorAll('div.list-items > div:nth-child(1) > div:nth-child(2) > span > a.text_grey2');
            jobs = [...jobs]
            let links = jobs.map(i => i.getAttribute('href'));
            return links;
        });

        for (let i = 0; i < allLinks.length; i++) {
            let url = allLinks[i].includes('http') ? allLinks[i] : 'https://vieclam24h.vn' + allLinks[i]
            await page.goto(url)
            await page.waitFor(3000)
            const data = await page.evaluate(() => {
                let data = []
                let title = document.querySelector('#block_body_main > div.box_chi_tiet_cong_viec.bg_white.mt16.box_shadow > div:nth-child(1) > div > h1')
                let company = document.querySelector('#block_body_main > div.box_chi_tiet_cong_viec.bg_white.mt16.box_shadow > div:nth-child(1) > div > p > a')
                let dateExpired = document.querySelector('#block_body_main > div.box_chi_tiet_cong_viec.bg_white.mt16.box_shadow > div:nth-child(2) > div.pull-left.w480.ml_14.mt_6.mb_6 > span > span > span > span')
                let content = document.querySelector('#ttd_detail > div:nth-child(1) > div.pl_24.pr_24 > div:nth-child(1) > p')
                let tag = document.querySelectorAll('#block_body_main > div.box_chi_tiet_cong_viec.bg_white.mt16.box_shadow > div.row.job_detail.text_grey2.fw500.mt_6.mb_4 > div:nth-child(1) > div > h2 > a');
                let cat = []
                let salary = document.querySelector('#block_body_main > div.box_chi_tiet_cong_viec.bg_white.mt16.box_shadow > div.row.job_detail.text_grey2.fw500.mt_6.mb_4 > div:nth-child(1) > p:nth-child(1) > span > span')
                let address = document.querySelector('#ttd_detail > div.job_description.bg_white.pl_24.pr_24.mt_16.pb_18.box_shadow > div:nth-child(3) > p')
                let contactName = document.querySelector('#ttd_detail > div.job_description.bg_white.pl_24.pr_24.mt_16.pb_18.box_shadow > div:nth-child(2) > p')
                tag.forEach(i => cat.push(i.textContent))
                data.push({
                    title: title !== null ? title.textContent : "",
                    company: company !== null ? company.textContent : "",
                    dateExpired: dateExpired !== null ? dateExpired.textContent : "",
                    content: content !== null ? content.textContent : "",
                    salary: salary !== null ? salary.textContent : "",
                    address: address !== null ? address.textContent : "",
                    contactName: contactName !== null ? contactName.textContent : "",
                    tag: cat
                })
                return data
            })
            let sql = "INSERT INTO jobs (company, title, content, timeRequired, dateExpired, salary, address, contactName) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ";
            con.query(sql, [data[0].company, data[0].title, data[0].content, 'partime', data[0].dateExpired, data[0].salary, data[0].address, data[0].contactName], function (err) {
                if (err) throw err;
                console.log("inserted data to DB!");
            })
        }
        await browser.close();
    }
    catch (error) {
        console.log("Catch : " + error);
    }
})();