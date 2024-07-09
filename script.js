if (!localStorage.getItem("isFirstTime")){
let isFirstTime = localStorage.setItem("isFirstTime", "true");
}
let player;
let podcast = document.getElementById("podcast");
// Check if user is authenticated
const isAuthed = localStorage.getItem('auth');
console.log(isAuthed);
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
const redirectUrl = 'https://43e6f216-7d25-4b81-b48d-2e1a1569c597-00-1iyblkb115r3i.riker.replit.dev/';
const clientId = '';
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
  const isAuthed = localStorage.setItem('auth', true);
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
      return;
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

  // Skip to the next track
  player.nextTrack().then(() => {
    console.log('Skipped to the next track');

    // Set volume to 0 with a delay
    setTimeout(() => {
      player.setVolume(0.0).then(() => {
        console.log('Volume set to 0');

        // Seek to the random start time with a delay
        setTimeout(() => {
          player.seek(randomStart).then(() => {
          console.log(`Seeked to ${randomStart}ms`);
        document.getElementById('scan-noise').play();
            // Set volume back to 0.5 with a delay
            setTimeout(() => {
              player.setVolume(0.5).then(() => {
                console.log(`Playing track: ${track.uri} from ${randomStart}ms`);
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
async function playPodcast(player){
  player.pause();
  const apiKey = '';
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
function turnOff(player){
const podcastPlaying = document.getElementById('podcast');
player.pause();
podcastPlaying.pause();
}
function powerButton() {
  console.log("Power button clicked");
  let isOn = localStorage.getItem('isOn');
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
    turnOff(player);

    }
}
function changeStation(){
  console.log("Station changed");
  //findContent();
}



