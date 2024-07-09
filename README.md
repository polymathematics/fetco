# fetco
a new kind of radio that brings seredipity back to music and podcast discovery. simply scan the airwaves to get dropped into wonderful music or conversations. connects to your spotify so that every station is always perfectly suited for you. uses listen notes api for fetching podcasts. 
<img width="663" alt="Screenshot 2024-07-09 at 8 24 34 AM" src="https://github.com/polymathematics/fetco/assets/58536863/64a2724f-8ec2-49fa-9978-91bd7af6c61e">
# roadmap
- automatically reauthorize after an hour instead of requiring user to refresh browser
- RSS support for keeping podcasts up to date
- info cards for getting more info about what you are hearing
- add ads
- magic rewind button to go back to the start of a song or podcast if you really love it
- options for people who don't use Spotify
- pause button
# documentation

1. **Initialization and Authentication**

   - **isAuthed**: Checks if the user is authenticated by fetching a flag from local storage.

   - **authorize()**: Initiates the Spotify authorization flow, including generating a code challenge and redirecting the user to Spotify for approval.

   - **handleRedirect()**: Handles the redirection after Spotify authorization, retrieves the authorization code, exchanges it for an access token, and fetches the user's profile.

   - **getProfile(accessToken)**: Retrieves the authenticated user's profile information from Spotify.

2. **Playback Control**

   - **initializePlayer(accessToken)**: Initializes the Spotify Web Playback SDK player and connects it. This is what makes Fetco available as a connected device within Spotify. We then select it as the device by calling transferPlaybackToDevice.

   - **playMusic(player)**: Plays a track using the Spotify API, adjusts volume, and seeks to a random start time before playing. Due to Spotify limitations, this currently utilizes the listener's existing Spotify queue.

   - **playPodcast(player)**: Plays a random podcast episode fetched from the podcast JSON file using the Listen Notes API and seeks to a random start time (less than or equal to 16 mins into ep).

   - **transferPlaybackToDevice(accessToken, deviceId)**: Transfers playback to Fetco automatically, using the Spotify API.

3. **Content Decision and Playback Execution**

   - **contentDecision(player)**: Randomly selects between playing music or a podcast and triggers either playMusic or playPodcast.

   - **scan()**: Triggers when a listener selects the scan knob. Initiates content decision and playback.

   - **powerButton(player)**: Toggles the application on or off based on a local storage flag, initiates content decision and playback when turned on.

4. **Utility Functions**

   - **generateRandomString(length)**: Generates a random alphanumeric string of a specified length.

   - **generateCodeChallenge(codeVerifier)**: Generates a code challenge for OAuth authorization using SHA-256 hashing.

5. **Event Handling**

   - **Player event listeners**: Fetco utilizes event listeners throughout for events such as Spotify player readiness.


### Notes

- The application primarily utilizes the Spotify API for music playback and OAuth authorization.
- It integrates with the Listen Notes API for fetching and playing podcast episodes.
- Local storage is used for maintaining authentication state and application settings.

