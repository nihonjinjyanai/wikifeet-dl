const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const fs = require('fs')
const https = require('https')
const request = require('request')
// function search searches wikifeet or wikifeetx depending on the second parameter
// for the model given as the first parameter and downloads the images through downloadImages function
const check = process.argv[2]
if (check.length > 0){
    search(check, process.argv[3])
}
async function search(modelName = "", nude=false) {
    let url = "https://www.wikifeet.com/"
    if(nude){
        url = "https://www.wikifeetx.com/"
    }
    if (modelName != "") {
        const urlCompatibleModelName = modelName.replace(/ /g, "_")
        console.log(urlCompatibleModelName)
        const browser = await puppeteer.launch({
            headless: true
        })


        const page = await browser.newPage()


        await page.goto(url + urlCompatibleModelName, { waitUntil: 'networkidle2' })


        let content = await page.content()

        let $ = cheerio.load(content)

        let modelImageNumbers = []



        while (true) {
            try {
                await page.waitForSelector('#thepics table > tbody > tr > td:nth-child(3) > button', { timeout: 5000 })
                modelImageNumbers = modelImageNumbers.concat(await getModelImageNumbers($))
                await page.$eval('#thepics table > tbody > tr > td:nth-child(3) > button', button => button.click(), { waitUntil: 'networkidle2' })
                content = await page.content()

                $ = cheerio.load(content)

            } catch {
                modelImageNumbers = modelImageNumbers.concat(await getModelImageNumbers($))
                break
            }
        }
        downloadImages(modelName, modelImageNumbers)
        await browser.close()
        console.log(modelImageNumbers.length)
        console.log(`Look in ${__dirname} and see the images download the script will quit when done`)
    }
    return []
}

const getModelImageNumbers = async ($) => {
    modelNumbers = []
    $('.pic .pid').each((index, element) => {
        modelNumbers.push($(element).text())
    })
    return modelNumbers
}


const downloadImages = async (modelName, modelPictureNumberArray) => {
    const urlCompatibleModelName = modelName.replace(/ /g, "-")
    modelPictureNumberArray.forEach(modelPic => {
        modelPic = modelPic.replace(/\s/g, '')

        let out = fs.createWriteStream(`${__dirname}/${modelPic}.jpg`)
        console.log(`${__dirname}${modelPic}.jpg`)
        let req = request({
            method: 'GET',
            uri: `https://pics.wikifeet.com/${urlCompatibleModelName}-feet-${modelPic}.jpg`
        })
        
        req.pipe(out)

    })
}


