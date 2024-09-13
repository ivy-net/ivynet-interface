import React from 'react';
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
