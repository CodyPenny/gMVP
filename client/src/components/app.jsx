// Dependencies
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

// Chakra + Forms
import { Flex } from '@chakra-ui/react';

// Componenets 
import Login from './landingPage/Login.jsx';
import Register from './landingPage/Register.jsx';
import ForgotPassword from './password/ForgotPw.jsx';
import ResetConfirmation from './password/ResetConfirmation.jsx';
import LandingPage from './landingPage/LandingPage.jsx';

// User Pages
import UserPage from './userPage/userPage.jsx';
import EditProfile from './userPage/EditProfile.jsx';
import FriendsListHelper from './friends/FriendsListHelper.jsx';
import ChallengeStatus from './userPage/ChallengeStatus.jsx';
import BuildChallenge from './BuildChallenge/BuildAChallenge.jsx';
import RequireAuth from './auth/RequireAuth.jsx';

// Styles
import {
  StyledPopoverContent,
  StyledButton
} from '../styledComponents/userPageStyles.js';
import ChallengeProvider from '../providers/ChallengeProvider.jsx';

const App = () => {
  

  return (
     <Flex direction="column" align="center" >
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage/>} /> 
            <Route path="login" element={<Login/>} />
            <Route path="register" element={<Register/>} />
            <Route path="reset" element={<ForgotPassword/>} />
            <Route path="reset_confirmation" element={<ResetConfirmation/>}/>
            <Route path="profile" element={<UserPage />} />
            {/* <Route path="/profile" element={
              <RequireAuth>
                <UserPage />
              </RequireAuth>
            } /> */}
              {/* <Route path="/friends" element={<FriendsListHelper/>} />  */}
              {/* <Route path="/edit" element={<EditProfile/>} />
              <Route path="/challenge" element={<ChallengeStatus/>} />
                  <Route path="/create" element={<BuildChallenge/>} />
                  <Route path="/(invite|view)">
                  <ChallengeProvider>
                      <Route
                      path="/invite/*"
                      element={<FriendsListHelper/>}
                      />
                      <Route
                      path="/view/*"
                      element={<ChallengeStatus/>}
                      />
                  </ChallengeProvider>
                  </Route> */}
        </Routes>
      </Router>
     </Flex>
  );
};

export default App;
