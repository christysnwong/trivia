import React, {useEffect, useState} from "react";
import UserContext from "./UserContext";

const demoUser = {
  id: 1,
  username: "testuser",
  first_name: "Test",
  last_name: "User",
  email: "test@test.com",
  stats: {
    level: 14,
    title: "Pro",
    "quizzes completed": 34,
    points: 3440,
    remainingPts: 60,
    levelPts: 300,
  },
};

const UserProvider = ({
  children,
  currUser = demoUser
}) => {
  
  const [currentUser, setCurrUser] = useState();

  return (
    // <UserContext.Provider value={{ currUser }}>
    <UserContext.Provider value={{ currUser, setCurrUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
