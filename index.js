const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

// Replace with your bot's API token
const token = '8190535527:AAF7Imz9RSEDqu_cR0dtwX96xoq_BgaZ-tY'; 
const bot = new TelegramBot(token, {polling: true});

// Function to extract video link from Terabox using Puppeteer
async function fetchTeraboxVideoLink(url) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Open the Terabox link
    await page.goto(url, { waitUntil: 'load', timeout: 0 });
    
    // Wait for the video link to be visible on the page (you may need to adjust the selector based on Terabox structure)
    await page.waitForSelector('button[data-url]'); // Adjust selector if necessary

    const videoUrl = await page.evaluate(() => {
      const button = document.querySelector('button[data-url]');
      return button ? button.getAttribute('data-url') : null;
    });

    await browser.close();

    return videoUrl;
  } catch (error) {
    console.log('Error fetching Terabox video:', error);
    return null;
  }
}

// Command to start the bot and send a welcome message
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = "Welcome! Send me a Terabox link, and I will fetch the video for you.";
  bot.sendMessage(chatId, welcomeMessage);
});

// Handle incoming messages with Terabox links
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Check if the message is a valid Terabox link
  const regex = /https:\/\/terasharelink\.com\/s\/([a-zA-Z0-9]+)/;
  const match = text.match(regex);

  if (match) {
    const url = match[0];
    const videoLink = await fetchTeraboxVideoLink(url);

    if (videoLink) {
      bot.sendMessage(chatId, `Here is the video link: ${videoLink}`);
    } else {
      bot.sendMessage(chatId, 'Sorry, I could not fetch the video link. Please try again later.');
    }
  } else {
    bot.sendMessage(chatId, 'Please send a valid Terabox link!');
  }
});
