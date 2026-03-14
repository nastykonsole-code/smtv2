// JavaScript
const API_KEY = "AIzaSyBEQ3myFwJGEIaRE1fJPWv2VlGwYsYA9Zk";

const channelInput = document.getElementById("channelInput");
const trackChannel = document.getElementById("trackChannel");
const result = document.getElementById("result");

trackChannel.addEventListener("click", async function () {
  result.innerHTML = ""; // Clear previous results
  const channelHandle = channelInput.value.trim();
  if (!channelHandle) return;

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

  // --- Top Section ---
  const topSide = document.createElement("div");
  topSide.classList.add("topSide");
  result.appendChild(topSide);

  const leftTopSide = document.createElement("div");
  leftTopSide.classList.add("leftTopSide");
  const rightTopSide = document.createElement("div");
  rightTopSide.classList.add("rightTopSide");
  topSide.appendChild(leftTopSide);
  topSide.appendChild(rightTopSide);

  const logo = document.createElement("img");
  logo.classList.add("logoChannel");
  logo.src = channelLogoUrl;
  leftTopSide.appendChild(logo);

  const channelHdH1 = document.createElement("h1");
  channelHdH1.textContent = "@" + channelHandle;
  rightTopSide.appendChild(channelHdH1);

  const descP = document.createElement("p");
  descP.textContent = snippet.description;
  rightTopSide.appendChild(descP);

  // --- Middle Section ---
  const middleSection = document.createElement("div");
  middleSection.classList.add("middleSection");
  result.appendChild(middleSection);

  function createStat(titleText, valueText) {
    const container = document.createElement("div");
    container.classList.add("stats");

    const title = document.createElement("h2");
    title.textContent = titleText;

    const value = document.createElement("h2");
    value.textContent = valueText;

    container.appendChild(title);
    container.appendChild(value);

    return container;
  }

  middleSection.appendChild(createStat("Subscribers", stats.subscriberCount));
  middleSection.appendChild(createStat("Views", stats.viewCount));
  middleSection.appendChild(createStat("Videos", stats.videoCount));

  const publishedDate = new Date(channelInfo.snippet.publishedAt);
  middleSection.appendChild(
    createStat(
      "Created At",
      publishedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    )
  );
// --- Bottom Section ---
const bottomSection = document.createElement("div");
bottomSection.classList.add("bottomSection");
result.appendChild(bottomSection);

// Fetch uploads playlist
const channelDetailsUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelInfo.id}&key=${API_KEY}`;
const channelDetailsResponse = await fetch(channelDetailsUrl);
const channelDetailsData = await channelDetailsResponse.json();
const playlistID = channelDetailsData.items[0].contentDetails.relatedPlaylists.uploads;

const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistID}&maxResults=10&key=${API_KEY}`;
const playlistResponse = await fetch(playlistUrl);
const playlistData = await playlistResponse.json();

const videosPlaylist = playlistData.items;

for (let i = 0; i < videosPlaylist.length; i++) {
    const videoId = videosPlaylist[i].snippet.resourceId.videoId;

    const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`;
    const videoDetailsResponse = await fetch(videoDetailsUrl);
    const videoData = await videoDetailsResponse.json();
    const videoObject = videoData.items[0];

    // Create the card as a link (entire card clickable)
    const videoLink = document.createElement("a");
    videoLink.href = `https://www.youtube.com/watch?v=${videoObject.id}`;
    videoLink.target = "_blank";
    videoLink.classList.add("divSecVidList"); // CSS card style applied
    bottomSection.appendChild(videoLink);

    // Video title
    const videoTitleEl = document.createElement("p");
    videoTitleEl.textContent = videoObject.snippet.title;
    videoLink.appendChild(videoTitleEl);

    // Views
    const videoViewsEl = document.createElement("p");
    videoViewsEl.textContent = `Views: ${videoObject.statistics.viewCount}`;
    videoLink.appendChild(videoViewsEl);

    // Likes
    const videoLikesEl = document.createElement("p");
    const likeIcon = document.createElement("i");
    likeIcon.classList.add("fa-regular", "fa-thumbs-up");
    videoLikesEl.appendChild(likeIcon);
    videoLikesEl.appendChild(document.createTextNode(` ${videoObject.statistics.likeCount}`));
    videoLink.appendChild(videoLikesEl);

    // Comments
    const videoCommentEl = document.createElement("p");
    const commentIcon = document.createElement("i");
    commentIcon.classList.add("fa-regular", "fa-comment");
    videoCommentEl.appendChild(commentIcon);
    videoCommentEl.appendChild(document.createTextNode(` ${videoObject.statistics.commentCount}`));
    videoLink.appendChild(videoCommentEl);

    // Upload date
    const uploadDateEl = document.createElement("p");
    const calendarIcon = document.createElement("i");
    calendarIcon.classList.add("fa-regular", "fa-calendar");
    uploadDateEl.appendChild(calendarIcon);
    const formattedDate = new Date(videoObject.snippet.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    uploadDateEl.appendChild(document.createTextNode(` ${formattedDate}`));
    videoLink.appendChild(uploadDateEl);
}
});