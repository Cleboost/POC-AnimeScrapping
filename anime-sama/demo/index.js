/**
 * Integrated Demo: Anime-Sama to M3U8
 * Usage: node demo/index.js "Anime Name" [season_number] [episode_number]
 */

// --- Import/Implement POC Logic ---

async function searchAnime(query) {
    const response = await fetch("https://anime-sama.to/template-php/defaut/fetch.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `query=${encodeURIComponent(query)}`
    });
    const html = await response.text();
    const results = [];
    const regex = /<a href="([^"]+)" class="asn-search-result">[\s\S]*?src="([^"]+)"[\s\S]*?title">([^<]+)<\/h3>[\s\S]*?subtitle">([^<]*)<\/p>/g;
    let m;
    while ((m = regex.exec(html)) !== null) {
        results.push({
            url: m[1],
            title: m[3].replace(/&#039;/g, "'").replace(/&quot;/g, '"').trim()
        });
    }
    return results;
}

async function extractAnimeDetails(url) {
    const response = await fetch(url);
    const html = await response.text();
    const anime = [];
    const animeRegex = /panneauAnime\("([^"]+)",\s*"([^"]+)"\)/g;
    let m = animeRegex.exec(html);
    while (m !== null) {
        if (m[1] !== "nom" && m[2] !== "url") {
            anime.push({ name: m[1], url: m[2] });
        }
        m = animeRegex.exec(html);
    }
    return anime;
}

async function getAvailableLanguages(url) {
    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const parentUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/')) + '/';
    const POSSIBLE_LANGS = ['vostfr', 'vf', 'vf1', 'vf2'];
    const probes = POSSIBLE_LANGS.map(async (lang) => {
        const testUrl = `${parentUrl}${lang}/`;
        try {
            const response = await fetch(testUrl, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
            if (response.ok) return { lang: lang.toUpperCase(), url: testUrl };
        } catch (e) {}
        return null;
    });
    const results = await Promise.all(probes);
    return results.filter(res => res !== null);
}

async function getEpisodes(baseUrl) {
    const url = baseUrl.endsWith('episodes.js') ? baseUrl : (baseUrl.endsWith('/') ? baseUrl + 'episodes.js' : baseUrl + '/episodes.js');
    const response = await fetch(url);
    const code = await response.text();
    const providers = [];
    const arrayRegex = /var\s+eps(\d+)\s*=\s*\[([\s\S]*?)\];/g;
    let m = arrayRegex.exec(code);
    while (m !== null) {
        const id = m[1];
        const content = m[2];
        const links = content.split(',').map(link => link.trim().replace(/'/g, "")).filter(link => link.startsWith('http'));
        if (links.length > 0) {
            let hostname = new URL(links[0]).hostname.replace('www.', '');
            const processedLinks = hostname === 'vidmoly.to' ? links.map(link => link.replace('vidmoly.to', 'vidmoly.biz')) : links;
            if (hostname === 'vidmoly.to') hostname = 'vidmoly.biz';
            providers.push({ id: parseInt(id), provider: hostname, episodes: processedLinks });
        }
        m = arrayRegex.exec(code);
    }
    return providers;
}

async function extractVidmolyStream(url) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://anime-sama.to/'
        }
    });
    const html = await response.text();
    const streamMatch = html.match(/file:\s*'([^']+\.m3u8[^']*)'/);
    return streamMatch ? streamMatch[1] : null;
}

// --- Main CLI Logic ---

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log('Usage: node demo/index.js "Anime Name" [season_number] [episode_number]');
        process.exit(1);
    }

    const animeName = args[0];
    const targetSeason = parseInt(args[1]) || 1;
    const targetEpisode = parseInt(args[2]) || 1;

    console.log(`[1/5] Searching for: "${animeName}"...`);
    const searchResults = await searchAnime(animeName);
    if (searchResults.length === 0) {
        console.error('No anime found.');
        return;
    }
    const animeUrl = searchResults[0].url;
    console.log(`Found: ${searchResults[0].title} (${animeUrl})`);

    console.log(`[2/5] Extracting seasons...`);
    const seasons = await extractAnimeDetails(animeUrl);
    // Find matching season (simple heuristic: look for "Saison X" or "Saison 0X")
    const season = seasons.find(s => s.name.toLowerCase().includes(`saison ${targetSeason}`) || s.name.toLowerCase().includes(`saison 0${targetSeason}`));
    if (!season) {
        console.error(`Season ${targetSeason} not found among:`, seasons.map(s => s.name).join(', '));
        return;
    }
    console.log(`Selected: ${season.name}`);

    // Build the season base URL (need to resolve relative URLs if necessary)
    // Most panneauAnime URLs are relative to the anime page
    const seasonUrl = season.url.startsWith('http') ? season.url : (animeUrl.endsWith('/') ? animeUrl + season.url : animeUrl + '/' + season.url);

    console.log(`[3/5] Checking available languages for season...`);
    // Note: extract.js panneauAnime often points directly to a lang (e.g. "saison1/vostfr")
    // If it already includes a lang, we use it, otherwise we probe.
    let langUrl = seasonUrl;
    if (!langUrl.includes('vostfr') && !langUrl.includes('vf')) {
        const langs = await getAvailableLanguages(seasonUrl);
        if (langs.length === 0) {
            console.error('No languages found for this season.');
            return;
        }
        // Prefer VOSTFR, then VF
        const preferred = langs.find(l => l.lang === 'VOSTFR') || langs.find(l => l.lang === 'VF') || langs[0];
        langUrl = preferred.url;
    }
    console.log(`Using language URL: ${langUrl}`);

    console.log(`[4/5] Fetching episode list...`);
    const providers = await getEpisodes(langUrl);
    const vidmoly = providers.find(p => p.provider === 'vidmoly.biz');
    if (!vidmoly) {
        console.error('Vidmoly provider not found.');
        return;
    }

    if (targetEpisode > vidmoly.episodes.length || targetEpisode < 1) {
        console.error(`Episode ${targetEpisode} not found (Max: ${vidmoly.episodes.length})`);
        return;
    }
    const episodeUrl = vidmoly.episodes[targetEpisode - 1];
    console.log(`Selected Episode ${targetEpisode}: ${episodeUrl}`);

    console.log(`[5/5] Extracting M3U8 stream...`);
    const streamUrl = await extractVidmolyStream(episodeUrl);
    if (!streamUrl) {
        console.error('Could not extract stream URL.');
        return;
    }

    console.log('\n--- SUCCESS ---');
    console.log(`Anime: ${searchResults[0].title}`);
    console.log(`Season: ${targetSeason}`);
    console.log(`Episode: ${targetEpisode}`);
    console.log(`Stream URL: ${streamUrl}`);
}

main().catch(err => console.error('An error occurred:', err));
