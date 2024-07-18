import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Layout } from './layout';
import { Outlet } from 'react-router-dom';

export const App = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
