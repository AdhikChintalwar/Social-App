import React, { createContext, useContext, useEffect, useState } from 'react';
import { getLocalStorageItem } from '../services/localstorage';
import axios from 'axios';
const baseURL = 'http://localhost:8082'
const MyContext = createContext();

export const useMyContext = () => {
  return useContext(MyContext);
};

export const MyProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([])
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([])
  const secret = getLocalStorageItem();

  useEffect(() => {
    updateGroups()
    updateUsers()
    updatePosts();

  }, [])

  async function updatePosts() {
    try {
      if (!secret || !secret.userName) {
        return;
      }
      const response = await axios.get(`${baseURL}/post/getAllPosts`, {
        userName: secret.userName,
        password: secret.password,
      });
      let posts = response.data.data;
      posts = posts.sort((a, b) => b.createdOn - a.createdOn);
      setPosts(posts);
    } catch (error) {
      console.log(error)
    }
  }
  async function updateGroups() {
    try {
      if (!secret || !secret.userName) {
        return;
      }
      const response = await axios.get(`${baseURL}/group/getAllGroups`, {
        params: {
          userName: secret.userName,
          password: secret.password // replace with actual password
        }
      });
      setGroups(response.data.data);
      const g = response.data.data;
      setUserGroups(g.filter(obj => obj.members?.includes(secret.id)));
    } catch (error) {
      console.error('Error fetching groups:', error);

    }
  }
  async function updateUsers() {
    try {
      const response = await axios.get('http://localhost:8082/user/getAllUsers');
      setUsers(Object.values(response.data.data));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }



  return (
    <MyContext.Provider value={{ groups, setGroups, users, setUsers, updateUsers, updateGroups, userGroups, posts, updatePosts }}>
      {children}
    </MyContext.Provider>
  );
};
