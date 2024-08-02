import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUp from './components/Auth/SignUp';
import SignIn from './components/Auth/SignIn';
import Profile from './components/Profile/Profile';
import Home from './components/Home/Home';
import Search from './components/Search/Search';
import Group from './components/Group/group';
import User from "./components/User";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/home" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/group" element={< Group />} />
      <Route path="/user" element={<User />} />
      <Route path="/" element={<SignIn />} />
    </Routes>
  </Router>
);

export default AppRoutes;
