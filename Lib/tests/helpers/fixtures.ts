/** HTML minimal pour vérifier que les regex d'extraction n'ont pas changé. */

export const VIDMOLY_HTML = `
<script>
  var player = { file: 'https://cdn.example.com/hls/master.m3u8?token=abc' };
</script>
`;

export const SIBNET_HTML = `
<script>
  player.src: '/v/deadbeef1234/720.mp4'
</script>
`;

export const SENDVID_HTML_M3U8 = `
<video>
  <source src="https://videos.sendvid.com/abc/playlist.m3u8" type="application/x-mpegURL">
</video>
`;

export const SENDVID_HTML_MP4 = `
<script>jwplayer().setup({ file: 'https://videos.sendvid.com/abc/video.mp4' });</script>
`;

export const ANIME_SAMA_EPISODES_JS = `
var eps1 = ['https://vidmoly.to/embed-abc.html', 'https://vidmoly.to/embed-def.html'];
var eps2 = ['https://sibnet.ru/shell.php?videoid=123'];
`;

export const M3U8_MASTER = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
low/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
hd/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
full/index.m3u8
`;

export const M3U8_MEDIA = `#EXTM3U
#EXT-X-TARGETDURATION:10
#EXTINF:10.0,
segment0.ts
`;
