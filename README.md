# fetco
a new kind of radio that brings seredipity back to music and podcast discovery. simply scan the airwaves to get dropped into wonderful music or conversations. connects to your spotify so that every station is always perfectly suited for you. uses listen notes api for fetching podcasts. 
<img width="663" alt="Screenshot 2024-07-09 at 8 24 34 AM" src="https://github.com/polymathematics/fetco/assets/58536863/64a2724f-8ec2-49fa-9978-91bd7af6c61e">
# roadmap
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

   - **initializePlayer(accessToken)**: Initializes the Spotify Web Playback SDK player and connects it to the user's device.

   - **playMusic(player)**: Plays a random music track using the Spotify API, skips to the next track, adjusts volume, and seeks to a random start time.

   - **playPodcast(player)**: Plays a random podcast episode fetched from a JSON file using the Listen Notes API.

   - **transferPlaybackToDevice(accessToken, deviceId)**: Transfers playback to a specified device using the Spotify API.

3. **Content Decision and Playback Execution**

   - **contentDecision(player)**: Randomly selects between playing music or a podcast based on predefined content types.

   - **scan()**: Initiates content decision and playback.

   - **powerButton(player)**: Toggles the application on or off based on a local storage flag, initiates content decision and playback when turned on.

4. **Utility Functions**

   - **generateRandomString(length)**: Generates a random alphanumeric string of a specified length.

   - **generateCodeChallenge(codeVerifier)**: Generates a code challenge for OAuth authorization using SHA-256 hashing.

5. **Event Handling and Initialization**

   - **Player event listeners**: Listens for events such as player readiness and handles playback initiation and device connection.

   - **Handling user interactions**: Manages user interactions like starting playback, changing stations, and turning the app on or off.

### Notes

- The application primarily utilizes the Spotify API for music playback and OAuth authorization.
- It integrates with the Listen Notes API for fetching and playing podcast episodes.
- Local storage is used for maintaining authentication state and application settings.

This documentation should provide a clear overview of how each function contributes to the overall functionality of your application. Adjust as needed to reflect any specific nuances or additional details in your implementation.
