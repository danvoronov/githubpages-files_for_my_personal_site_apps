export async function fetchWikiContent() {
    const baseTitle = 'Обстріли Києва';
    const titles = [baseTitle, `${baseTitle} (2025)`];
    const apiUrl = `https://uk.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles.join('|'))}&prop=revisions&rvprop=content&format=json&formatversion=2&redirects&origin=*`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const pages = data?.query?.pages || [];
        if (pages.length === 0) {
            throw new Error('Дані не знайдено у відповіді API');
        }

        const seenContent = new Set();
        const results = [];

        pages.forEach(page => {
            if (page?.missing) return;
            const content = page?.revisions?.[0]?.content;
            if (!content) return;

            if (seenContent.has(content)) return;
            seenContent.add(content);

            results.push({
                title: page?.title || '',
                content
            });
        });

        if (results.length === 0) {
            throw new Error('Не знайдено жодної сторінки з вмістом');
        }

        return results;
    } catch (error) {
        console.error('Помилка завантаження даних з Wikipedia:', error);
        throw new Error('Не вдалося завантажити дані з Wikipedia. ' + error.message);
    }
}
