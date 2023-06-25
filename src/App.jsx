import React from 'react';
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import Appbar from './components/Appbar';
import Home from './pages/Home';
import MainApp from './pages/MainApp';
import About from './pages/About';


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/deepERV" element={<Appbar />}>
      <Route index element={<Home />} />
      <Route path="app" element={<MainApp />} />
      <Route path="about" element={<About />} />
    </Route>
  )
)

function App({ routes }) {

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;