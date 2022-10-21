
import { Route, Switch, Redirect } from "react-router-dom";

import Home from "../home/Home.js";

import Quiz from "../quizzes/Quiz"
import Leaderboard from "../userInfo/Leaderboard"


import LoginForm from "../usersForms/LoginForm";
import SignUpForm from "../usersForms/SignUpForm";
import ProfileEditForm from "../usersForms/ProfileEditForm";

import Profile from "../userInfo/Profile";
import Stats from "../userInfo/Stats";
import PersonalBest from "../userInfo/PersonalBest";
import Sessions from "../userInfo/Sessions";

import PrivateRoute from "./PrivateRoute";

import Favourite from "../userFavs/Favourite.js";



const Routes = ({ login, signup }) => {

  // console.debug(
  //   "Routes",
  //   `login=${typeof login}`,
  //   // `register=${typeof register}`
  // );

  return (
    <div className="pt-5">
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>

        <Route exact path="/quizzes">
          <Quiz />
        </Route>

        <Route exact path="/leaderboard">
          <Leaderboard />
        </Route>

        <Route exact path="/favourites">
          <Favourite />
        </Route>

        <PrivateRoute exact path="/profile">
          <Profile />
        </PrivateRoute>

        <PrivateRoute exact path="/profile/edit">
          <ProfileEditForm />
        </PrivateRoute>

        <PrivateRoute exact path="/stats">
          <Stats />
        </PrivateRoute>

        <PrivateRoute exact path="/personalbest">
          <PersonalBest />
        </PrivateRoute>

        <PrivateRoute exact path="/sessions">
          <Sessions />
        </PrivateRoute>

        <Route exact path="/login">
          <LoginForm login={login} />
        </Route>
        <Route exact path="/signup">
          <SignUpForm signup={signup} />
        </Route>
        <Route exact path="/logout">
          <Redirect to="/" />
        </Route>

        <Redirect to="/" />
      </Switch>
    </div>
  );
};


export default Routes;
