if (!localStorage.getItem("isFirstTime")){
 isFirstTime = localStorage.setItem("isFirstTime", "true");
}
let player;
let podcast = document.getElementById("podcast");
let childName = localStorage.getItem('childName');
let parentName = localStorage.getItem('parentName');
let superName = localStorage.getItem('superName');
let isOn = localStorage.setItem('isOn', false)
// Check if user is authenticated
const isAuthed = localStorage.getItem('auth');
//spotify auth stuff
const generateRandomString = length => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
const generateCodeChallenge = async codeVerifier => {
  const base64encode = arrayBuffer => {
    return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64encode(digest);
};
const redirectUrl = 'https://fetco.replit.app';
const clientId = 'e13ab6159fc1495a8a04998c30a68d61';
async function authorize() {
  const codeVerifier = generateRandomString(128);
  localStorage.setItem('code_verifier', codeVerifier);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const scope = 'user-read-private user-read-email user-top-read user-library-read streaming user-read-playback-state user-modify-playback-state user-read-currently-playing';

  const args = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUrl,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });
  localStorage.setItem('auth', true);
  // Launch Spotify authorization window
  window.location = 'https://accounts.spotify.com/authorize?' + args;
}
if (!localStorage.getItem('code_verifier') || isAuthed === null || isAuthed === 'false' || isAuthed === undefined) {
  console.log('Need to authorize');
  localStorage.setItem('auth', 'false');
  authorize();
} else {
  // Handle the case where the user is already authenticated
  handleRedirect();
}
//spotify redirect handling after user auth
async function handleRedirect() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  if (code) {
    console.log('Authorization code:', code);
    const codeVerifier = localStorage.getItem('code_verifier');
    if (!codeVerifier) {
      console.error('Code verifier not found in local storage.');
      authorize();
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUrl,
      client_id: clientId,
      code_verifier: codeVerifier
    });

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
      });

      if (!response.ok) {
        throw new Error('HTTP status ' + response.status);
      }

      const data = await response.json();
      console.log('Token data:', data);
      localStorage.setItem('access_token', data.access_token);
      console.log('Access token stored:', localStorage.getItem('access_token'));

      // Set authentication status to true
      localStorage.setItem('auth', 'true');

      // Now you can call your function to fetch the user's profile and other actions
      await getProfile(data.access_token);
    } catch (error) {
      console.error('Error:', error);
    }
  }
  initializePlayer(localStorage.getItem('access_token'));
}

// getProfile function for spotify user
async function getProfile(accessToken) {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('HTTP status ' + response.status);
    }

    const profile = await response.json();
    console.log('User profile:', profile);
    // Display user profile information on your app
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
}
// automatically select our app for device on their spotify
async function transferPlaybackToDevice(accessToken, deviceId) {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        device_ids: [deviceId],
        play: true
      })
    });

    if (response.ok) {
      console.log(`Playback transferred to device ID: ${deviceId}`);
    } else {
      const errorData = await response.json();
      console.error('Error transferring playback:', errorData);
    }
  } catch (error) {
    console.error('Error transferring playback:', error);
  }
}
////////////////////////////////////////////////////
function initializePlayer(accessToken){
 player = new Spotify.Player({
    name: 'Fetco Radio',
    getOAuthToken: cb => { cb(accessToken); }
  });
player.addListener('ready', async ({ device_id }) => {
    deviceId = device_id;
    console.log('Player ready with Device ID', device_id);
    // Transfer playback to the Web Playback SDK device
    await transferPlaybackToDevice(accessToken, deviceId);
  });
 player.connect();
console.log('Player connected');
}
function playMusic(player){
podcast.pause();
const accessToken = localStorage.getItem('access_token');
const randomStart = Math.floor(Math.random() * 180000);
  player.setVolume(0.0).then(() => {
    console.log('muted anything playing');
  });
  // Skip to the next track
  player.nextTrack().then(() => {
    console.log('Skipped to the next track');

    // Set volume to 0 with a delay
    setTimeout(() => {
      player.setVolume(0.0).then(() => {
        console.log('Volume set to 0');

        // Seek to the random start time with a delay
        setTimeout(() => {
          let track = localStorage.getItem('childName');
          player.seek(randomStart).then(() => {
          console.log(`Seeked to ${randomStart}ms`);
        document.getElementById('scan-noise').play();
            // Set volume back to 0.5 with a delay
            setTimeout(() => {
              player.setVolume(0.5).then(() => {
                getSongInfo();
              }).catch(error => {
                console.error('Error setting volume to 0.5:', error);
              });
            }, 500); // Delay before setting volume to 0.5

          }).catch(error => {
            console.error('Error seeking:', error);
          });
        }, 500); // Delay before seeking

      }).catch(error => {
        console.error('Error setting volume to 0:', error);
      });
    }, 500); // Delay before setting volume to 0
  }).catch(error => {
    console.error('Error skipping to next track:', error);
  });

}
async function getSongInfo(){
  const accessToken = localStorage.getItem('access_token');
  // fetch song info
  fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Currently Playing:', data.item.name);
    console.log('Currently Playing:', data.item.artists[0].name);
    console.log('Currently Playing:', data.item.album.name);
    childName = data.item.name;
    parentName = data.item.artists[0].name;
    superName = data.item.album.name;
    localStorage.setItem('childName', childName);
    localStorage.setItem('parentName', parentName);
    localStorage.setItem('superName', superName);
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
    authorize();
  });
}
async function playPodcast(player){
  player.pause();
  const apiKey = 'ed6a33d6c41549a9ac0436d45af06b0b';
  try {
      // Fetch episodes.json file
      const response = await fetch('podcasts.json');
      if (!response.ok) {
        throw new Error('Failed to load episodes.json');
      }

      // Parse episodes.json file
      const episodes = await response.json();

      // Select a random episode
      const randomEp = episodes[Math.floor(Math.random() * episodes.length)];
      const episodeId = randomEp.episodeId;
      childName = randomEp.episodeTitle;
      parentName = randomEp.podcastName;
      superName = '';
      localStorage.setItem('childName', childName);
      localStorage.setItem('parentName', parentName);
      localStorage.setItem('superName', superName);
      // Fetch episode details using Listen API
      const episodeResponse = await fetch(`https://listen-api.listennotes.com/api/v2/episodes/${episodeId}?show_transcript=0`, {
        method: 'GET',
        headers: {
          'X-ListenAPI-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!episodeResponse.ok) {
        throw new Error(`HTTP error! status: ${episodeResponse.status}`);
      }

      const episodeData = await episodeResponse.json();
      console.log(episodeData.title, episodeData.audio);

      // Play the audio
      const podcast = document.getElementById('podcast');
      podcast.src = episodeData.audio;
      const static = document.getElementById('scan-noise');
      static.play();
      setTimeout(() => {
        podcast.play();
        podcast.volume = 0;
        const randomTime = Math.floor(Math.random() * 960);
        podcast.currentTime = randomTime;
        podcast.volume = 0.5;
      }, 500)
      
    } catch (error) {
      console.error('Error fetching and playing episode:', error);
    }
  }
function contentDecision(player){
  const contentType = ['music', 'podcast'];
  const contentDecision = contentType[Math.floor(Math.random() * contentType.length)];
  console.log(contentDecision);
  if (contentDecision === 'music'){
    playMusic(player);
  }
  if (contentDecision === 'podcast'){
    playPodcast(player);
  }
  if (contentDecision === 'ad'){
    playAd();
  }
}
function scan(){
contentDecision(player);
}
function turnOff(){
const podcastPlaying = document.getElementById('podcast');
player.pause();
podcastPlaying.pause();
}
function powerButton() {
  console.log("Power button clicked");
  let isOn = localStorage.getItem('isOn');
  console.log(isOn);
  // Assume the radio is off if 'isOn' is null
  if (isOn === null) {
    isOn = "false";
  }
  if (isOn === "false") {
    localStorage.setItem('isOn', true);
    console.log('Radio turned on! Finding station...');
    //findContent();
    contentDecision(player);
  } else {
    localStorage.setItem('isOn', false);
    turnOff();
    }
}
function changeStation(){
  console.log("Station changed");
  //findContent();
}
function tokenRefresh(){
  localStorage.setItem('auth', false);
  location.reload();
}
setTimeout(tokenRefresh, 3540000);
async function getInfo(){
  await getSongInfo();
  const childNameElement = document.getElementById('childName');
  const parentNameElement = document.getElementById('parentName');
  const superNameElement = document.getElementById('superName');
  const unexpandedInfo = document.getElementById('unexpanded-info');
  const expandedInfo = document.getElementById('expanded-info');
  childNameElement.innerHTML = childName;
  parentNameElement.innerHTML = parentName;
  superNameElement.innerHTML = superName;
  unexpandedInfo.style.display = 'none';
  expandedInfo.style.display = 'flex';
}
function hideInfo(){
  const childNameElement = document.getElementById('childName');
  const parentNameElement = document.getElementById('parentName');
  const superNameElement = document.getElementById('superName');
  const unexpandedInfo = document.getElementById('unexpanded-info');
  const expandedInfo = document.getElementById('expanded-info');
  childNameElement.innerHTML = '';
  parentNameElement.innerHTML = '';
  superNameElement.innerHTML = '';
  unexpandedInfo.style.display = 'flex';
  expandedInfo.style.display = 'none';
}
setInterval(getSongInfo, 60000);
// before user exits, clear cache
window.addEventListener('beforeunload', function(event) {
  event.preventDefault();
  if (isAuthed === "true"){
  localStorage.setItem('auth', false);
  console.log('closing window');
  }
});
