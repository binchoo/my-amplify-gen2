import { HashRouter, BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useEffect, useRef, useState } from 'react';
import { USE_BROWSER_ROUTER } from "./common/constants.ts";
import GlobalHeader from "./components/global-header.tsx";
import HomePage from "./pages/home.tsx";
import "./styles/app.scss";
import NotFound from "./pages/not-found.tsx";
import ProfilePage from './pages/profile.tsx';
import Catalog from "./pages/catalog.tsx";

import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { Schema } from '../amplify/data/resource';
import outputs from '../amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css'

Amplify.configure(outputs);
const client = generateClient<Schema>();

function AuthenticatedApp({ signOut, user }) {
  const Router = USE_BROWSER_ROUTER ? BrowserRouter : HashRouter;

  useEffect(() => {
    const createOrUpdateProfile = async () => {
      try {
        
        const { data: existingProfile } = await client.models.Profile.get({ 
          id: user.username 
        });

        if (!existingProfile) {
          
          await client.models.Profile.create({
            id: user.username,
            userId: user.username,
            name: user.attributes?.name || user.signInDetails?.loginId,
            organization: user.attributes?.['custom:organization'] || 'AWS',
            point: 0
          });
          console.log('New profile created');
        }
      } catch (error) {
        console.error('Error handling profile:', error);
      }
    };

    if (user) {
      createOrUpdateProfile();
    }
  }, [user]);

  return (
    <div style={{ height: "100%" }}>
      <Router>
        <GlobalHeader 
          user={user?.signInDetails?.loginId} 
          signOut={signOut} 
        />
        <div style={{ height: "56px", backgroundColor: "#000716" }}>&nbsp;</div>
        <div>
          <Routes>
            <Route index path="/" element={<HomePage />} />
            <Route 
              path="/profile" 
              element={
                <ProfilePage 
                  user={user?.username}
                  email={user?.signInDetails?.loginId}
                  attributes={user?.attributes}
                />
              } 
            />
            <Route path="/absproxy/5173" element={<HomePage />} />
            <Route path="/proxy/5173/absproxy/5173" element={<HomePage />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/catalog" element={<Catalog />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default function App() {
  return (
    <Authenticator>
      {(props) => <AuthenticatedApp {...props} />}
    </Authenticator>
  );
}