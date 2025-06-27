export async function fetchWikiContent() {
    const apiUrl = 'https://uk.wikipedia.org/w/api.php?action=query&titles=%D0%9E%D0%B1%D1%81%D1%82%D1%80%D1%96%D0%BB%D0%B8_%D0%9A%D0%B8%D1%94%D0%B2%D0%B0&prop=revisions&rvprop=content&format=json&formatversion=2&redirects&origin=*';
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (!data.query || !data.query.pages || data.query.pages.length === 0) {
            throw new Error('Дані не знайдено у відповіді API');
        }

        const content = data.query.pages[0].revisions[0].content;
        if (!content) {
            throw new Error('Вміст сторінки порожній');
        }
        
        return content;
    } catch (error) {
        console.error('Помилка завантаження даних з Wikipedia:', error);
        throw new Error('Не вдалося завантажити дані з Wikipedia. ' + error.message);
    }
} 