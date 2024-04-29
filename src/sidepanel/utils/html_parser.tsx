import * as cheerio from 'cheerio';

export const htmlParser = (html: string, tags: string[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'i', 'b', 'section', 'pre code', 'u', 'li']) => {
    const $ = cheerio.load(html);
    const content = tags.map((tag) => {
        const elements = $(tag).toArray().map((element) => $(element).text());
        return elements.join(' ');
    }).join(' ');
    return content;
}