import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

/** API Class.
 *
 * Static class tying together methods used to get/send to to the API.
 * There shouldn't be any frontend-specific stuff here, and there shouldn't
 * be any API-aware stuff elsewhere in the frontend.
 *
 */

class TriviaApi {
  // the token for interactive with the API will be stored here.
  static token;

  static async request(endpoint, data = {}, method = "get") {
    console.debug("API Call:", endpoint, data, method);

    const url = `${BASE_URL}/${endpoint}`;

    const headers = { Authorization: `Bearer ${TriviaApi.token}` };
    const params = method === "get" ? data : {};

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (err) {
      console.error("API Error:", err.response);
      let message = err.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }

  // Get and set token to TriviaApi from local storage if it exists
  static getLocalStorageToken() {
    const token = JSON.parse(localStorage.getItem("trivia-token"));
    if (token) {
      this.token = token;
    }
  }

  // Get the logged in user's info
  static async getUser(username) {
    let res = await this.request(`users/${username}`);
    return res.user;
  }

  // Patch user's info
  static async patchUser(username, revData) {
    let res = await this.request(`users/${username}`, revData, "patch");
    return res.user;
  }

  // Delete a user
  static async removeUser(username) {
    let res = await this.request(`users/${username}`, username, "delete");
    return res;
  }

  // Log in user and get token
  static async login(user) {
    let res = await this.request(`auth/token`, user, "post");
    if (res.token) {
      this.token = res.token;
    }
    delete res.user.isAdmin;
    return { user: res.user, token: res.token };
  }

  // Register new user and gets token
  static async signup(newUser) {
    let res = await this.request(`auth/register`, newUser, "post");
    if (res.token) {
      this.token = res.token;
    }
    delete res.user.isAdmin;
    return { user: res.user, token: res.token };
  }

  /** QUIZZES ========================================================================================== */

  // Get Quiz questions and answers
  static async getQuizzes(quizQuery) {
    let res = await this.request(`quizzes`, quizQuery);

    return res.quizData;
  }

  /** FOLDERS ========================================================================================== */

  // Get user's folders
  static async getAllFolders(username) {
    let res = await this.request(`users/${username}/folders`);
    return res.folders;
  }

  // Create a new folder
  // data includes { userId, folderName }
  static async createFolder(username, data) {
    let res = await this.request(`users/${username}/folders`, data, "post");
    return res;
  }

  // Get trivia from user's selected folder
  static async getFolderTrivia(username, folderId) {
    let res = await this.request(`users/${username}/folders/${folderId}`);

    return res.folder;
  }

  // Rename a user's folder
  static async renameFolder(username, folderId, newFolderName) {
    let res = await this.request(
      `users/${username}/folders/${folderId}`,
      newFolderName,
      "patch"
    );

    return res;
  }

  // Remove a user's folder
  static async removeFolder(username, folderId) {
    let res = await this.request(
      `users/${username}/folders/${folderId}`,
      folderId,
      "delete"
    );

    return res;
  }

  /** FAV TRIVIAS ======================================================================================= */

  // Get all favourited trivia for that user
  static async getAllFav(username) {
    let res = await this.request(`users/${username}/fav`);
    return res.trivias;
  }

  // Add trivia to favourites
  // data includes { userId, question, answer, folderName }
  static async addToFav(username, data) {
    let res = await this.request(`users/${username}/fav`, data, "post");
    return res;
  }

  // Move a trivia to another folder
  // data includes { userId, folderName }
  static async moveTrivia(username, triviaId, data) {
    let res = await this.request(
      `users/${username}/fav/${triviaId}`,
      data,
      "patch"
    );

    return res;
  }

  // Remove a trivia from user's folder
  static async removeTrivia(username, triviaId) {
    let res = await this.request(
      `users/${username}/fav/${triviaId}`,
      triviaId,
      "delete"
    );

    return res;
  }

  /** STATS ========================================================================================== */

  // Get a user's stats
  static async getStats(username) {
    let res = await this.request(`users/${username}/stats`);
    delete res.stats.userId;
    return res.stats;
  }

  // Update a user's points / level
  // data includes user id and new points
  static async updatePoints(username, data) {
    let res = await this.request(`users/${username}/stats`, data, "post");
    return res;
  }

  // Get a user's list of badges
  static async getBadges(username) {
    let res = await this.request(`users/${username}/badges`);
    return res.badges;
  }

  // Post a badge to user's profile
  // data includes userId and badge name
  static async postBadge(username, data) {
    let res = await this.request(`users/${username}/badges`, data, "post");
    return res;
  }

  /** SCORES ========================================================================================== */

  // Get user's personal best scores
  // score query includes category and difficulty
  static async getScores(username, scoreQuery) {
    let res = await this.request(`users/${username}/scores`, scoreQuery);
    return res.topScores;
  }

  // Update user's score in a specified category / difficulty
  // data includes { userId, category, difficulty, score, points }

  static async updateScore(username, data) {
    let res = await this.request(`users/${username}/scores`, data, "post");
    return res;
  }

  // Get leaderboard top score(s)
  // score query includes category and difficulty

  static async getLeaderboardScores(scoreQuery) {
    let res = await this.request(`leaderboard`, scoreQuery);
    return res.topLeaderboardScores;
  }

  // Update user's leaderboard score in a specified category / difficulty
  // data includes { userId, category, difficulty, score, points }
  static async updateLeaderboardScore(scoreData) {
    let res = await this.request(`leaderboard`, scoreData, "post");
    return res;
  }

  /** SESSIONS ========================================================================================= */

  // Get user's played sessions
  static async getSessions(username, limitQuery) {
    let res = await this.request(`users/${username}/sessions`, limitQuery);
    for (let session of res.sessions) {
      delete session.id;
    }
    return res.sessions;
  }

  // Add a played session
  // data includes { userId, category, difficulty, score, points }
  static async addSession(username, data) {
    let res = await this.request(`users/${username}/sessions`, data, "post");
    return res;
  }

  // Get user's played counts in all or queried category / difficulty
  // query includes category and fficulty
  static async getPlayedCounts(username, query) {
    let res = await this.request(`users/${username}/playedcounts`, query);
    return res.playedCounts;
  }

  // Update a user's played counts
  // data includes { userId, category, difficulty }

  static async updatePlayedCounts(username, data) {
    let res = await this.request(
      `users/${username}/playedcounts`,
      data,
      "post"
    );

    return res;
  }
}

export default TriviaApi;
