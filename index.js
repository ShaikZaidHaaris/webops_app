const puppeteer = require('puppeteer');
const fs = require('fs');


async function collectBlogRoutes(page) {
 // Function to scroll the page
 async function scrollPage() {
    await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
    });
    await page.waitForSelector('.post-feed > .post-card'); // Wait for page to load new content (adjust as needed)
}


let titles = new Set();

// Loop to scroll and extract titles
let count = 0;
while (count<500) {
    const hrefs1 = await page.evaluate(
        () => Array.from(
          document.querySelectorAll('div > div > article > a[href]'),
          a => a.getAttribute('href')
          
        )
      );

      for (const key in hrefs1) {
        const value = hrefs1[key];
           titles.add(value);         
      }

      
    count++;

    // Scroll to load more content
    await scrollPage();

}

let titles2 = Array.from(titles);


  return(titles2);



  
}



async function extractBlogText(browser, route) {
    const page = await browser.newPage();
    const url = `https://blog.ankitsanghvi.in${route}`; // Replace example.com with the actual domain
    await page.goto(url);
  
    // Extract blog text
    const blogText = await page.evaluate(() => {
      // Replace this with the actual selector for the blog text content
      const textElement = document.querySelector('div > article > section.post-full-content > div');
      return textElement ? textElement.textContent.trim() : '';
    });
    const blogTitle = await page.evaluate(() => {
      // Replace this with the actual selector for the blog text content
      const textElement = document.querySelector('div > article > header > h1');
      return textElement ? textElement.textContent.trim() : '';
    });
    const blogSummary = await page.evaluate(() => {
      // Replace this with the actual selector for the blog text content
      const textElement = document.querySelector('div > article > header > p');
      return textElement ? textElement.textContent.trim() : '';
    });
    
  
    await page.close();
    return { route, text: blogText , title: blogTitle , summary:blogSummary };
  }








(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false,
        userDataDir: "./tmp"
    });
    const page = await browser.newPage();
    await page.goto('https://blog.ankitsanghvi.in');

    const blogRoutes = await collectBlogRoutes(page);



    const text = (await extractBlogText(browser , '/client-push-api-with-grpc')).text;


    const blogTexts = [];
    const blogTitle = [];
    const blogSummary = [];
    for (const route of blogRoutes) {
      const blogInfo = await (await extractBlogText(browser, route));
      blogTexts.push(blogInfo.text);
      blogTitle.push(blogInfo.title);
      blogSummary.push(blogInfo.summary);
    }


    // Combine arrays into a single array of arrays
const combinedData = blogTitle.map((title, index) => [title, blogSummary[index], blogTexts[index]]);

// Convert array to CSV format
const csv = combinedData.map(row => row.join(',')).join('\n');

// Write CSV to file
fs.writeFile('blogs.csv', csv, err => {
  if (err) {
    console.error('Error writing CSV file:', err);
    return;
  }
  console.log('CSV file saved successfully');
});

    console.log(blogTexts);


    // Close the browser
    await browser.close();
})();
