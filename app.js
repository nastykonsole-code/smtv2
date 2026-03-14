const API_KEY = "AIzaSyBEQ3myFwJGEIaRE1fJPWv2VlGwYsYA9Zk";

const channelInput = document.getElementById("channelInput");
const trackChannel = document.getElementById("trackChannel");
const result = document.getElementById("result");


trackChannel.addEventListener('click', async function() {
    const channelHandle = channelInput.value.trim();
    // --- Fetch channel info ---
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=${channelHandle}&key=${API_KEY}`;
    const channelResponse = await fetch(url);
    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
        console.log("Channel not found");
        return;
    }

    const channelInfo = channelData.items[0];
    const stats = channelInfo.statistics;
    const snippet = channelInfo.snippet;
    const channelLogoUrl = snippet.thumbnails.high.url;

    // --- Create containers ---
    result.classList.add('result');
    const leftSide = document.createElement('div');
    leftSide.classList.add('left-side');
    const rightSide = document.createElement('div');
    rightSide.classList.add('right-side');
    result.appendChild(leftSide);
    result.appendChild(rightSide);
    
    // Left: channel logo
    const logo = document.createElement('img');
    logo.classList.add('channel-logo');
    logo.src = channelLogoUrl;
    leftSide.appendChild(logo);
    
    // Right: top and bottom containers
    const topContRS = document.createElement('div');
    topContRS.classList.add('top-cont-rs');
    const bottomContRS = document.createElement('div');
    bottomContRS.classList.add('bottom-cont-rs');
    rightSide.appendChild(topContRS);
    rightSide.appendChild(bottomContRS);
    
    // Channel handle
    const channelHdH1 = document.createElement('h1');
    channelHdH1.textContent = '@' + channelHandle;
    topContRS.appendChild(channelHdH1);
    
    // Description
    const descP = document.createElement('div');
    descP.textContent = snippet.description;
    descP.classList.add('descP');
    topContRS.appendChild(descP);
    
    // Subscribers
    const subscriber = document.createElement('div');
    subscriber.classList.add('small-cont-div');
    
    const subsh2 = document.createElement('h2');
    subsh2.textContent = "Subscriber Count: " + stats.subscriberCount;
    
    const subsh2v = document.createElement('h3');
    subsh2v.textContent = `Average Subscribers per video: ${Math.round(stats.subscriberCount / stats.videoCount)}`;
    
    subscriber.appendChild(subsh2);
    subscriber.appendChild(subsh2v);
    bottomContRS.appendChild(subscriber);
    
    // Views
    const view = document.createElement('div');
    view.classList.add('small-cont-div');
    
    const viewh2 = document.createElement('h2');
    viewh2.textContent = "View Count: " + stats.viewCount;
    
    const viewh2v = document.createElement('h3');
    viewh2v.textContent = `Average views per video: ${Math.round(stats.viewCount / stats.videoCount)}`;
    
    view.appendChild(viewh2);
    view.appendChild(viewh2v);
    bottomContRS.appendChild(view);
    
    // Videos
    const createdAt = new Date(channelInfo.snippet.publishedAt);
    const now = new Date();
    const totalMonths = (now.getFullYear() - createdAt.getFullYear()) * 12 + (now.getMonth() - createdAt.getMonth());
    
    const video = document.createElement('div');
    video.classList.add('small-cont-div');
    
    const videoh2 = document.createElement('h2');
    videoh2.textContent = "Video Count: " + stats.videoCount;
    
    const videoh2v = document.createElement('h3');
    videoh2v.textContent = `Average uploads per month: ${(stats.videoCount / totalMonths).toFixed(2)}`;
    
    video.appendChild(videoh2);
    video.appendChild(videoh2v);
    bottomContRS.appendChild(video);
    
    // --- Fetch uploads playlist ID ---
    const channelDetailsUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelInfo.id}&key=${API_KEY}`;
    const channelDetailsResponse = await fetch(channelDetailsUrl);
    const channelDetailsData = await channelDetailsResponse.json();
    
    if (!channelDetailsData.items || channelDetailsData.items.length === 0) {
        console.log("error fetching contentDetails");
        return;
    }
    
    const contentDetails = channelDetailsData.items[0].contentDetails;
    const uploadsPlaylistId = contentDetails.relatedPlaylists.uploads;
    
    // --- Fetch latest videos from uploads playlist ---
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=10&key=${API_KEY}`;
    const playlistResponse = await fetch(playlistUrl);
    const playlistData = await playlistResponse.json();
    
    if (!playlistData.items || playlistData.items.length === 0) {
        console.log("No videos found for this channel");
        return;
    }
    
    // Get video IDs and fetch full details
    const videoIds = playlistData.items.map(v => v.snippet.resourceId.videoId).join(",");
    const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${videoIds}&key=${API_KEY}`;
    const videoDUResult = await fetch(videoDetailsUrl);
    const videoDUData = await videoDUResult.json();
    
    // Sort by publish date descending
    const sortedVideos = videoDUData.items.sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));
    
    // Pick latest full-length video (>=100s)
    let latestVideo = null;
    for (let i = 0; i < sortedVideos.length; i++) {
        const video = sortedVideos[i];
        const duration = video.contentDetails.duration;
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const seconds = (+match[1] || 0) * 3600 + (+match[2] || 0) * 60 + (+match[3] || 0);
    
        if (seconds >= 100) {
            latestVideo = video;
            break;
        }
    }
    
    if (!latestVideo) {
        console.log("No full-length video found");
        return;
    }
    
    const latestVideoId = latestVideo.id;
    const videoTitle = latestVideo.snippet.title;
    const thumbnail = latestVideo.snippet.thumbnails.high.url;
    const latestVideoUrl = `https://www.youtube.com/watch?v=${latestVideoId}`;
    
    // --- Display latest video ---
    const latestVideoSection = document.createElement('div');
    latestVideoSection.classList.add('small-cont-divyt');
    bottomContRS.appendChild(latestVideoSection);
    
    const lVSlink = document.createElement('a');
    lVSlink.href = latestVideoUrl;
    lVSlink.target = "_blank";
    
    const lVSThumbnail = document.createElement('img');
    lVSThumbnail.src = thumbnail;
    lVSThumbnail.classList.add('thumbnail');
    
    lVSlink.appendChild(lVSThumbnail);
    latestVideoSection.appendChild(lVSlink);
    
    const videoInfo = document.createElement('div');
    videoInfo.classList.add('video-info');
    latestVideoSection.appendChild(videoInfo);
    
    const lVSTitle = document.createElement('h3');
    lVSTitle.textContent = videoTitle;
    videoInfo.appendChild(lVSTitle);
    
    const lVSLikes = document.createElement('h4');
    lVSLikes.textContent = "Likes: " + latestVideo.statistics.likeCount;
    videoInfo.appendChild(lVSLikes);
    
    const lVSViews = document.createElement('h4');
    lVSViews.textContent = "Views: " + latestVideo.statistics.viewCount;
    videoInfo.appendChild(lVSViews);
    
    console.log("Latest video chosen:", videoTitle);
});