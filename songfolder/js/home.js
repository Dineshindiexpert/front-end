
  const API_KEY = "AIzaSyDv01jowSSiUUlui1U2LzDUnJtuBbH-xEw";
  let player;

  function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
      height: '0',
      width: '0',
      events: {
        onStateChange: (e) => {
          document.getElementById('playBtn').innerText =
            e.data === 1 ? "Pause" : "Play";
        }
      }
    });
  }

  async function searchMusic() {
    const q = document.getElementById('query').value || "New Hindi Songs";
    const grid = document.getElementById('video-grid');

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(q)}&type=video&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        grid.innerHTML = `<h3>Error: ${data.error.message}</h3>`;
        return;
      }

      grid.innerHTML = "";

      data.items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => {
          player.loadVideoById(item.id.videoId);
          document.getElementById('bar').style.display = 'flex';
          document.getElementById('now-playing').innerText = item.snippet.title;
        };

        card.innerHTML = `
          <img src="${item.snippet.thumbnails.high.url}">
          <div class="card-info">
            <div class="card-title">${item.snippet.title}</div>
            <div style="font-size:12px;color:#888">
              ${item.snippet.channelTitle}
            </div>
          </div>
        `;

        grid.appendChild(card);
      });

    } catch (err) {
      grid.innerHTML = "<h3>Network Error! Check Internet.</h3>";
      console.error(err);
    }
  }

  function togglePlay() {
    if (!player) return;
    if (player.getPlayerState() === 1) player.pauseVideo();
    else player.playVideo();
  }

  window.onload = () => setTimeout(searchMusic, 1000);
